// utils/empStatus.js
// 백엔드는 사원 재직 상태(empStatus)를 한글 문자열("재직"/"휴직"/"퇴직") 그대로 내려줍니다.
// 필터/비교 로직은 이 원본 값을 그대로 사용해야 하므로 값 자체는 바꾸지 않고,
// 화면에 "표시"할 때만 현재 언어에 맞는 라벨로 변환합니다.
// (common.json 의 empStatus.* 키 재사용 — emp/dept/perm 모듈 공통)
const EMP_STATUS_I18N_KEY = {
  재직: "active",
  휴직: "leave",
  퇴직: "retired",
};

export function empStatusLabel(t, status) {
  const key = EMP_STATUS_I18N_KEY[status];
  if (!key) return status; // 매핑에 없는 값은 원본 그대로 표시
  return t(`common:empStatus.${key}`, { defaultValue: status });
}
