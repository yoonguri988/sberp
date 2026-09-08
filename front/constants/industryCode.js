// constants/industryCode.js
// 업종 대분류(industryGrpCode) <-> 세부업종(industryCode) 공용 매핑.
// 원본: styles/js/industry-code.js (com/form.html, com/edit.html, com-ocr.js 공용 스크립트)를
// React 컴포넌트에서 import 해서 쓸 수 있도록 그대로 이식한 모듈입니다.
//
// [참고] DB(company 테이블)에는 industry_code에 대한 별도 마스터 테이블이 없어
// 여기 있는 목록은 프론트에서 예시로 구성한 참고용입니다.
//
// [i18n] label/name은 한국표준산업분류 기준 한글 표기, labelEn/nameEn은 그에 대응하는
// 영문 표기입니다. UI에서 언어에 따라 어떤 필드를 쓸지는 getCodeOptions(grpCode, lang),
// getGrpLabel(grpCode, lang), getCodeLabel(code, lang) 로 조회하세요.

export const GRP_OPTIONS = [
  { value: "C", label: "제조업", labelEn: "Manufacturing" },
  { value: "F", label: "건설업", labelEn: "Construction" },
  { value: "G", label: "도매 및 소매업", labelEn: "Wholesale and Retail Trade" },
  { value: "H", label: "운수 및 창고업", labelEn: "Transportation and Storage" },
  {
    value: "I",
    label: "숙박 및 음식점업",
    labelEn: "Accommodation and Food Service Activities",
  },
  { value: "J", label: "정보통신업", labelEn: "Information and Communication" },
  { value: "K", label: "금융 및 보험업", labelEn: "Financial and Insurance Activities" },
  {
    value: "M",
    label: "전문, 과학 및 기술 서비스업",
    labelEn: "Professional, Scientific and Technical Activities",
  },
  {
    value: "N",
    label: "사업시설관리, 사업지원 및 임대 서비스업",
    labelEn: "Business Facilities Management and Business Support Services",
  },
  {
    value: "S",
    label: "협회 및 단체, 수리 및 기타 개인 서비스업",
    labelEn: "Associations and Repair and Other Personal Services",
  },
];

export const GRP_LABEL_MAP = GRP_OPTIONS.reduce((acc, cur) => {
  acc[cur.value] = cur.label;
  return acc;
}, {});

export const GRP_LABEL_MAP_EN = GRP_OPTIONS.reduce((acc, cur) => {
  acc[cur.value] = cur.labelEn;
  return acc;
}, {});

// 업종 대분류 한글 라벨 -> 코드 (OCR 인식 텍스트 매칭용)
export const GRP_TEXT_MAP = GRP_OPTIONS.reduce((acc, cur) => {
  acc[cur.label] = cur.value;
  return acc;
}, {});

// 업종 대분류 -> 세부업종(코드/이름) 목록
export const CODE_MAP = {
  C: [
    { code: "10120", name: "육류 가공 및 저장 처리업", nameEn: "Meat Processing and Preservation" },
    { code: "20421", name: "계면활성제 제조업", nameEn: "Surfactant Manufacturing" },
    { code: "26290", name: "기타 전자부품 제조업", nameEn: "Other Electronic Component Manufacturing" },
  ],
  F: [
    { code: "41221", name: "단독주택 건설업", nameEn: "Detached House Construction" },
    { code: "42111", name: "도로 건설업", nameEn: "Road Construction" },
  ],
  G: [
    { code: "45111", name: "국산 승용차 판매업", nameEn: "Domestic Passenger Car Sales" },
    { code: "46900", name: "상품 종합 도매업", nameEn: "General Merchandise Wholesale" },
    { code: "47190", name: "기타 종합 소매업", nameEn: "Other General Merchandise Retail" },
  ],
  H: [
    { code: "49110", name: "철도 운송업", nameEn: "Railway Transport" },
    { code: "52941", name: "소화물 전문 운송업(택배)", nameEn: "Parcel Delivery Service (Courier)" },
  ],
  I: [
    { code: "55101", name: "호텔업", nameEn: "Hotels" },
    { code: "56111", name: "한식 음식점업", nameEn: "Korean Restaurants" },
  ],
  J: [
    {
      code: "58222",
      name: "응용 소프트웨어 개발 및 공급업",
      nameEn: "Application Software Development and Supply",
    },
    { code: "62010", name: "컴퓨터 프로그래밍 서비스업", nameEn: "Computer Programming Services" },
    { code: "63910", name: "뉴스 제공업", nameEn: "News Syndicate Services" },
  ],
  K: [
    { code: "64121", name: "은행업", nameEn: "Banking" },
    { code: "64992", name: "신탁업 및 집합투자업", nameEn: "Trust and Collective Investment Services" },
  ],
  M: [
    { code: "70112", name: "지주회사", nameEn: "Holding Companies" },
    { code: "71531", name: "기타 엔지니어링서비스업", nameEn: "Other Engineering Services" },
    { code: "72911", name: "사업시설 유지관리 서비스업", nameEn: "Facility Maintenance Services" },
  ],
  N: [
    {
      code: "74110",
      name: "인력 공급 및 고용 알선업",
      nameEn: "Labor Supply and Employment Placement Services",
    },
    { code: "75291", name: "여행사업", nameEn: "Travel Agency Services" },
  ],
  S: [
    { code: "94120", name: "산업 및 전문가 단체", nameEn: "Industrial and Professional Organizations" },
    {
      code: "95120",
      name: "컴퓨터 및 주변기기 수리업",
      nameEn: "Computer and Peripheral Equipment Repair",
    },
  ],
};

export const CODE_LABEL_MAP = Object.values(CODE_MAP)
  .flat()
  .reduce((acc, cur) => {
    acc[cur.code] = cur.name;
    return acc;
  }, {});

export const CODE_LABEL_MAP_EN = Object.values(CODE_MAP)
  .flat()
  .reduce((acc, cur) => {
    acc[cur.code] = cur.nameEn;
    return acc;
  }, {});

// 업종 대분류 라벨 조회 (lang: "ko" | "en")
export function getGrpLabel(grpCode, lang = "ko") {
  return lang === "en" ? GRP_LABEL_MAP_EN[grpCode] : GRP_LABEL_MAP[grpCode];
}

// 세부업종 이름 조회 (lang: "ko" | "en")
export function getCodeLabel(code, lang = "ko") {
  return lang === "en" ? CODE_LABEL_MAP_EN[code] : CODE_LABEL_MAP[code];
}

// 세부업종 select 옵션 목록 (대분류 코드 기준, lang: "ko" | "en")
export function getCodeOptions(grpCode, lang = "ko") {
  return (CODE_MAP[grpCode] || []).map((item) => ({
    value: item.code,
    label: `${item.code} · ${lang === "en" ? item.nameEn : item.name}`,
  }));
}

// OCR 등에서 인식한 업종 대분류 텍스트 -> 코드(C/F/G ...)
// (한글 OCR 인식 결과 매칭 전용이므로 번역 대상이 아닙니다.)
export function matchGrpFromText(text) {
  if (!text) return "";
  if (GRP_TEXT_MAP[text]) return GRP_TEXT_MAP[text];
  const key = Object.keys(GRP_TEXT_MAP).find(
    (k) => text.includes(k) || k.includes(text),
  );
  return key ? GRP_TEXT_MAP[key] : "";
}

// OCR 등에서 인식한 세부업종(종목) 텍스트 -> grp에 해당하는 코드
// (한글 OCR 인식 결과 매칭 전용이므로 번역 대상이 아닙니다.)
export function matchCodeFromText(grp, text) {
  if (!grp || !text) return "";
  const list = CODE_MAP[grp] || [];
  const found = list.find(
    (item) => text.includes(item.name) || item.name.includes(text),
  );
  return found ? found.code : "";
}
