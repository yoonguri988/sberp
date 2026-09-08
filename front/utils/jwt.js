// utils/jwt.js
// accessToken(JWT) 관련 공통 유틸
// - authSaga.js 와 api/axios.js 양쪽에서 동일한 로직을 쓰기 위해 분리
import { jwtDecode } from "jwt-decode";

// JWT payload → 화면에서 쓰는 user 객체로 변환
export function decodeUser(accessToken) {
  if (!accessToken) return null;
  try {
    const claims = jwtDecode(accessToken); // { sub, comId, empNo, empName, posName, comName, empEmail, roles, pwdChangeRequired, exp, iat ... }
    return {
      empId: Number(claims.sub),
      comId: claims.comId,
      empNo: claims.empNo,
      empName: claims.empName,
      posName: claims.posName,
      comName: claims.comName,
      empEmail: claims.empEmail,
      roles: claims.roles || [],
      // 비밀번호가 아직 사번(임시 비밀번호) 상태 → 비밀번호 변경 화면으로 강제 이동 필요
      pwdChangeRequired: Boolean(claims.pwdChangeRequired),
    };
  } catch (e) {
    return null;
  }
}

// accessToken 이 만료되었는지(또는 파싱 불가) 여부
export function isTokenExpired(accessToken) {
  if (!accessToken) return true;
  try {
    const { exp } = jwtDecode(accessToken);
    return !exp || Date.now() >= exp * 1000;
  } catch (e) {
    return true;
  }
}
