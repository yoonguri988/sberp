// utils/apctJwt.js
// 지원자(APPLICANT) accessToken 전용 디코드 유틸.
// 사원 토큰(utils/jwt.js)과 클레임 구조가 다르므로(comId/empNo/roles 없음, provider/providerId/email/type) 분리했다.
import { jwtDecode } from "jwt-decode";

// JWT payload → 화면에서 쓰는 apctUser 객체로 변환
// 클레임: { sub: providerId, type: "APPLICANT", provider, email, exp, iat, iss }
export function decodeApctUser(accessToken) {
  if (!accessToken) return null;
  try {
    const claims = jwtDecode(accessToken);
    if (claims.type !== "APPLICANT") return null;
    return {
      providerId: claims.sub,
      provider: claims.provider,
      email: claims.email,
    };
  } catch (e) {
    return null;
  }
}

// accessToken이 만료되었는지(또는 파싱 불가) 여부
export function isApctTokenExpired(accessToken) {
  if (!accessToken) return true;
  try {
    const { exp } = jwtDecode(accessToken);
    return !exp || Date.now() >= exp * 1000;
  } catch (e) {
    return true;
  }
}
