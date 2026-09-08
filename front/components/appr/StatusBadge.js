import { useTranslation } from "react-i18next";

// 도메인별 상태코드 sb-badge 색상
const COLOR_MAP = {
    doc: { ING: "blue", APP: "green", REJ: "red" },
    line: { WAI: "amber", NOT: "gray", APP: "green", REJ: "red" },
    delegReq: { REQ: "amber", APP: "green", REJ: "red" },
};

// i18n 키가 아직 없는 도메인용 로컬 라벨맵 (필요시 여기 추가)
const LOCAL_LABEL_MAP = {};

// i18n 키가 있는 도메인의 키 프리픽스
const I18N_PREFIX = {
    doc: "docs.detail.docStatusBadge",
    line: "docs.detail.lineStatusBadge",
    delegReq: "admin.delegations.statusBadge",
};

/**
 * 결재 도메인 공용 상태 뱃지
 * @param {string} domain - "doc" | "line" | "delegReq"
 * @param {string} status - 상태 코드 (예: "WAI", "APP", "REJ" ...)
 * @param {string} [label] - 라벨 직접 지정 (있으면 domain 매핑보다 우선)
 */
export default function StatusBadge({ domain, status, label, i18nKeyPrefix }) {
     const { t } = useTranslation("appr");

    const color = COLOR_MAP[domain]?.[status] || "gray";

    // i18nKeyPrefix가 넘어오면 그 경로 우선 사용, 없으면 도메인 기본 경로(I18N_PREFIX) 사용
    const prefix = i18nKeyPrefix ?? I18N_PREFIX[domain];

    const text =
        label ??
        LOCAL_LABEL_MAP[domain]?.[status] ??
        (prefix ? t(`${prefix}.${status?.toLowerCase()}`, { defaultValue: status }) : status);

    return (
        <span className={`sb-badge sb-badge--${color}`}>
            <span className="pip" />
            {text}
        </span>
    );
}