import { Fragment } from "react";
import { useRouter } from "next/router";

/**
 * 공용 페이지 헤더 (브레드크럼 + 타이틀 + 부제 + 우측 액션 버튼)
 *
 * @param {Array<{label: string, href?: string}>} breadcrumb
 *   - href가 있으면 클릭 가능한 링크, 없으면 현재 위치(마지막 항목은 보통 href 생략)
 * @param {string} title
 * @param {string} [subtitle]
 * @param {ReactNode} [actions] - 우측 버튼 영역 (없으면 렌더링 안 함)
 */
export default function PageHeader({ breadcrumb = [], title, subtitle, actions }) {
    const router = useRouter();

    return (
        <div className="sb-page-head">
            <div className="sb-page-head__txt">
                {breadcrumb.length > 0 && (
                    <div className="sb-breadcrumb">
                        {breadcrumb.map((item, i) => (
                            <Fragment key={i}>
                                {item.href ? (
                                    <a onClick={() => router.push(item.href)} style={{ cursor: "pointer" }}>
                                        {item.label}
                                    </a>
                                ) : (
                                    <span>{item.label}</span>
                                )}
                                {i < breadcrumb.length - 1 && <i className="bi bi-chevron-right" />}
                            </Fragment>
                        ))}
                    </div>
                )}
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {actions && <div className="sb-page-head__actions">{actions}</div>}
        </div>
    );
}