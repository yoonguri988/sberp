"""
급여 분석 대시보드 — 요약 API 1개로 카드 4개를 한 번에 채운다.

의도적으로 엔드포인트를 쪼개지 않았다: 화면은 "부서별 평균급여 / 월별 지급추이 /
수당·공제 항목 구성비 / 지급상태 분포" 4개 카드를 한 화면에서 같이 보여주므로,
프론트 saga 1번 호출로 끝내는 게 로딩 상태 관리가 단순해진다. 도메인이 늘어나서
카드가 늘어나면 그때 별도 엔드포인트로 쪼개면 된다.

전부 SELECT 집계 쿼리만 사용한다 — 이 서비스는 급여 데이터에 쓰기를 절대 하지 않는다.

pandas 사용: DB에서는 필요한 원본 행(row)만 값 그대로 가져오고, 부서별/월별 집계·정렬은
DB가 아니라 pandas DataFrame에서 수행한다(groupby/agg). Django ORM의 annotate/aggregate로도
같은 결과를 낼 수 있지만, 이 서비스는 pandas로 집계하는 걸 의도적으로 선택했다.
"""

import pandas as pd
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SalPay, SalPayItem
from .permissions import IsSalaryAdmin

# back의 SalaryItemCode enum(displayName)과 반드시 같은 값을 유지해야 한다.
# 항목이 늘어나면 여기도 같이 추가할 것 (한쪽만 업데이트되면 대시보드에 코드값이 그대로 노출된다).
ITEM_CODE_LABELS = {
    "MEAL_ALLOWANCE": "식대",
    "POSITION_ALLOWANCE": "직책수당",
    "ANNUAL_LEAVE_ALLOWANCE": "연차수당",
    "OVERTIME_ALLOWANCE": "고정연장수당",
    "NATIONAL_PENSION": "국민연금",
    "HEALTH_INSURANCE": "건강보험",
    "LONG_TERM_CARE_INSURANCE": "장기요양보험료",
    "EMPLOYMENT_INSURANCE": "고용보험",
    "INCOME_TAX": "소득세",
    "LOCAL_INCOME_TAX": "지방소득세",
}

STATUS_LABELS = {
    "PENDING": "대기",
    "APPROVED": "승인",
    "PAID": "지급완료",
    "REJECTED": "반려",
}


class SalarySummaryView(APIView):
    permission_classes = [IsAuthenticated, IsSalaryAdmin]

    def get(self, request):
        months = int(request.query_params.get("months", 6))
        months = max(1, min(months, 24))  # 방어: 너무 큰 범위 요청 방지

        latest_month = (
            SalPay.objects.order_by("-pay_month").values_list("pay_month", flat=True).first()
        )

        if latest_month is None:
            return Response(
                {
                    "latestMonth": None,
                    "deptAverage": [],
                    "monthlyTrend": [],
                    "itemBreakdown": [],
                    "statusDistribution": [],
                }
            )

        # ── 1) 부서별 평균 급여 (최신 지급월 기준) ──
        # DB에는 GROUP BY 없이 원본 행만 요청하고, 집계는 pandas가 한다.
        dept_rows = list(
            SalPay.objects.filter(pay_month=latest_month, emp__dept__is_deleted=0).values(
                "emp__dept__dept_id", "emp__dept__dept_name", "emp_id", "base_sal", "net_pay"
            )
        )
        if dept_rows:
            df = pd.DataFrame(dept_rows)
            grouped = df.groupby(
                ["emp__dept__dept_id", "emp__dept__dept_name"], as_index=False
            ).agg(
                emp_count=("emp_id", "nunique"),
                avg_base_sal=("base_sal", "mean"),
                avg_net_pay=("net_pay", "mean"),
            ).sort_values("avg_net_pay", ascending=False)
            dept_average = [
                {
                    "deptId": int(row["emp__dept__dept_id"]),
                    "deptName": row["emp__dept__dept_name"],
                    "empCount": int(row["emp_count"]),
                    "avgBaseSal": round(float(row["avg_base_sal"])),
                    "avgNetPay": round(float(row["avg_net_pay"])),
                }
                for _, row in grouped.iterrows()
            ]
        else:
            dept_average = []

        # ── 2) 월별 지급 추이 (최근 N개월) ──
        recent_months = list(
            SalPay.objects.order_by("-pay_month")
            .values_list("pay_month", flat=True)
            .distinct()[:months]
        )
        recent_months.reverse()  # 오래된 달 -> 최신 달 순으로 차트에 표시

        trend_rows = list(
            SalPay.objects.filter(pay_month__in=recent_months).values(
                "pay_month", "base_sal", "allow_total", "dedt_total", "net_pay", "pay_id"
            )
        )
        if trend_rows:
            df = pd.DataFrame(trend_rows)
            grouped = df.groupby("pay_month", as_index=False).agg(
                total_base_sal=("base_sal", "sum"),
                total_allow=("allow_total", "sum"),
                total_dedt=("dedt_total", "sum"),
                total_net_pay=("net_pay", "sum"),
                pay_count=("pay_id", "count"),
            ).sort_values("pay_month")
            monthly_trend = [
                {
                    "payMonth": row["pay_month"].isoformat(),
                    "totalBaseSal": int(row["total_base_sal"]),
                    "totalAllow": int(row["total_allow"]),
                    "totalDedt": int(row["total_dedt"]),
                    "totalNetPay": int(row["total_net_pay"]),
                    "payCount": int(row["pay_count"]),
                }
                for _, row in grouped.iterrows()
            ]
        else:
            monthly_trend = []

        # ── 3) 수당/공제 항목 구성비 (최신 지급월 기준) ──
        item_rows = list(
            SalPayItem.objects.filter(pay__pay_month=latest_month).values("item_code", "amt")
        )
        if item_rows:
            df = pd.DataFrame(item_rows)
            grouped = (
                df.groupby("item_code", as_index=False)["amt"]
                .sum()
                .sort_values("amt", ascending=False)
            )
            item_breakdown = [
                {
                    "itemCode": row["item_code"],
                    "itemLabel": ITEM_CODE_LABELS.get(row["item_code"], row["item_code"]),
                    "totalAmt": int(row["amt"]),
                }
                for _, row in grouped.iterrows()
            ]
        else:
            item_breakdown = []

        # ── 4) 지급 상태 분포 (전체 누적 기준 — 대기/반려 건이 지금 얼마나 밀려있는지 보려면
        #        최신월로 좁히지 않는 게 더 유용하다) ──
        status_rows = list(SalPay.objects.values("stat", "pay_id"))
        if status_rows:
            df = pd.DataFrame(status_rows)
            grouped = (
                df.groupby("stat", as_index=False)["pay_id"]
                .count()
                .rename(columns={"pay_id": "count"})
                .sort_values("stat")
            )
            status_distribution = [
                {
                    "status": row["stat"],
                    "statusLabel": STATUS_LABELS.get(row["stat"], row["stat"]),
                    "count": int(row["count"]),
                }
                for _, row in grouped.iterrows()
            ]
        else:
            status_distribution = []

        return Response(
            {
                "latestMonth": latest_month.isoformat() if latest_month else None,
                "deptAverage": dept_average,
                "monthlyTrend": monthly_trend,
                "itemBreakdown": item_breakdown,
                "statusDistribution": status_distribution,
            }
        )
