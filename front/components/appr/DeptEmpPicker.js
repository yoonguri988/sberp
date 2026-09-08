import { List, Card, Tag, Spin } from "antd";
import { useTranslation } from "react-i18next";

/**
 * 부서 트리 + 부서 소속 사원 선택 UI
 * - 순수 controlled 컴포넌트: 데이터/선택 상태는 전부 부모(페이지)가 들고 있고,
 *   이 컴포넌트는 렌더링 + 이벤트 콜백만 담당
 *
 * @param {Array} deptTree - 부서 목록 [{deptId, deptName, empCount}, ...]
 * @param {boolean} deptTreeLoading
 * @param {number|string} selectedDeptId
 * @param {(deptId) => void} onSelectDept
 * @param {Array} deptEmps - 선택된 부서의 사원 목록 [{empId, empName, posName, empStatus}, ...]
 * @param {boolean} deptEmpsLoading
 * @param {object} selectedEmployee - 선택된 사원 (없으면 null)
 * @param {(emp|null) => void} onSelectEmployee
 * @param {string} [pickerLabel] - 사원 목록 카드 타이틀 (기본: "대결자 선택")
 */
export default function DeptEmpPicker({
    deptTree,
    deptTreeLoading,
    selectedDeptId,
    onSelectDept,
    deptEmps,
    deptEmpsLoading,
    selectedEmployee,
    onSelectEmployee,
    pickerLabel,
}) {
    const { t } = useTranslation("appr");

    return (
        <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: "0 0 42%" }}>
                <Card size="small" title={t("deptEmpPicker.deptCardTitle")} bodyStyle={{ padding: 8 }}>
                    <div style={{ maxHeight: 240, overflowY: "auto" }}>
                        <List
                            size="small"
                            loading={deptTreeLoading}
                            dataSource={deptTree}
                            locale={{ emptyText: t("deptEmpPicker.deptLoadingEmptyText") }}
                            renderItem={(d) => (
                                <List.Item
                                    style={{
                                        cursor: "pointer",
                                        background: selectedDeptId === d.deptId ? "#e6f6ff" : "transparent",
                                    }}
                                    onClick={() => onSelectDept(d.deptId)}
                                >
                                    {d.deptName} <Tag style={{ marginLeft: 8 }}>{d.empCount}{t("deptEmpPicker.empCountUnit")}</Tag>
                                </List.Item>
                            )}
                        />
                    </div>
                </Card>
            </div>

            <div style={{ flex: "1 1 58%" }}>
                <Card size="small" title={pickerLabel || t("deptEmpPicker.empCardTitleDefault")} bodyStyle={{ padding: 8 }}>
                    {deptEmpsLoading ? (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <Spin size="small" />
                        </div>
                    ) : (
                        <div className="appr-emp-box">
                            {deptEmps.length === 0 ? (
                                <div className="text-muted text-center py-4 small">
                                    {t("deptEmpPicker.selectDeptFirst")}
                                </div>
                            ) : (
                                deptEmps.map((e) => {
                                    const isSelected = selectedEmployee?.empId === e.empId;
                                    return (
                                        <div
                                            key={e.empId}
                                            className={"appr-emp-row" + (isSelected ? " selected" : "")}
                                            onClick={() => onSelectEmployee(isSelected ? null : e)}
                                        >
                                            <span>
                                                {e.empName}
                                                {e.empStatus === "휴직" && (
                                                    <Tag color="orange" style={{ marginLeft: 6 }}>
                                                        {t("deptEmpPicker.onLeaveTag")}
                                                    </Tag>
                                                )}
                                            </span>
                                            <span className="pos-chip">{e.posName}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

/**
 * "선택된 대결자" 요약 뱃지 — 선택 완료 후 표시되는 별도 블록
 * 모달 등에서 DeptEmpPicker 아래에 이어붙여 쓰는 용도
 */
export function SelectedEmployeeSummary({ employee, onClear, label }) {
    const { t } = useTranslation("appr");

    if (!employee) return null;

    return (
        <div
            style={{
                marginTop: 12,
                marginBottom: 4,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#e6f4ff",
                border: "1px solid #91caff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#8a93a3", fontSize: 13 }}>{label || t("deptEmpPicker.selectedSummaryLabelDefault")}</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{employee.empName}</span>
                <span className="pos-chip">{employee.posName}</span>
            </div>
            <button
                type="button"
                onClick={onClear}
                style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4 }}
            >
                <i className="bi bi-x-lg" />
            </button>
        </div>
    );
}