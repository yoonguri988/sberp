// utils/currency.js
// 급여 화면 등에서 공통으로 쓰는 원화 금액 표시/입력 헬퍼.
// 백엔드 sal 모듈의 금액 필드는 전부 Long(원 단위, 소수점 없음)이라 별도 소수 처리는 하지 않는다.

/** 숫자를 "1,234,567원" 형태 문자열로 변환. null/undefined는 "-"로 표시 */
export function formatWon(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return "-";
  }
  return `${Number(amount).toLocaleString("ko-KR")}원`;
}

/** antd InputNumber용 formatter (천단위 콤마) */
export function wonFormatter(value) {
  if (value === null || value === undefined || value === "") return "";
  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** antd InputNumber용 parser (콤마/원 제거) */
export function wonParser(value) {
  if (!value) return "";
  return value.replace(/원|,/g, "");
}
