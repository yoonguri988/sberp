// i18n/languageStorage.js
// 사용자가 선택한 언어를 쿠키에 저장/조회하는 헬퍼.
// (js-cookie는 이미 프로젝트 의존성으로 설치되어 있습니다.)
import Cookies from "js-cookie";
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE_KEY, SUPPORTED_LANGUAGES } from "./index";

export function getStoredLanguage() {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const stored = Cookies.get(LANGUAGE_COOKIE_KEY);
  return SUPPORTED_LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE;
}

export function setStoredLanguage(lang) {
  if (typeof window === "undefined") return;
  Cookies.set(LANGUAGE_COOKIE_KEY, lang, { expires: 365, path: "/" });
}
