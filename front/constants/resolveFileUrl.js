const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function resolveFileUrl(path) {
  if (!path) return "";
  // 이미 절대 URL이거나(다른 서버/CDN) 방금 선택한 파일의 미리보기(data: URI)는 그대로 사용
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}