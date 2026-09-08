import { useEffect, useState } from "react";

/**
 * 서버 페이지네이션 + 필터 변경 감지 훅
 *
 * @param {boolean} active - 현재 이 훅이 활성 탭인지 (false면 fetch 안 함)
 * @param {object} cond - 필터 조건 객체, 도메인마다 필드가 달라도 그대로 onFetch에 전달됨
 * @param {(page, size) => void} onFetch - 실제 dispatch 호출부 (page는 0-base로 넘겨줌)
 * @param {Array} deps - cond를 구성하는 값들. 바뀌면 1페이지로 리셋 + 재조회
 * @param {number} [pageSize=10]
 */
export function useServerTable({ active, cond, onFetch, deps = [], pageSize = 10 }) {
    const [page, setPage] = useState(1);

    // 필터 바뀌면 1페이지로 리셋
    useEffect(() => {
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    // active/page/필터 바뀔 때마다 조회 (Spring Pageable 0-base라 -1)
    useEffect(() => {
        if (!active) return;
        onFetch(page - 1, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, page, ...deps]);

    return { page, setPage, pageSize };
}