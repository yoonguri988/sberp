import api from "../axios"

const BASE = "/api/appr";

// 양식 코드 중복 확인
export const checkCode = (forCode, comId, forId) => {
    // axios에서 forId가 null값이 있으면 파라미터를 빈 문자열 그대로 보내서 오류발생
    // forId가 있을때만 파라미터에 실어서 보내게 수정
    const params = forId ? {forCode, comId, forId} : {forCode, comId};
    return api.get(`${BASE}/check-code`, {params}).then((res) => res.data);
}
// 회사 검색
export const searchCompany = (keyword) =>
    api.get(`${BASE}/companies`, {params: {keyword}}).then((res) => res.data);

// AI 스키마 생성
export const generateAiSchema = (prompt) =>
    api.post(`${BASE}/ai-schema`, {prompt}).then((res) => res.data);