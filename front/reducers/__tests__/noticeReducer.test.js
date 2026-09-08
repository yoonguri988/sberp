import { current } from 'immer';
import noticeReducer,{
        fetchNoticeRequest, fetchNoticeSuccess, fetchNoticeFailure,
        fetchNoticeDetailRequest, fetchNoticeDetailSuccess, fetchNoticeDetailFailure,
        createNoticeRequest, createNoticeSuccess, createNoticeFailure,
        updateNoticeRequest, updateNoticeSuccess, updateNoticeFailure,
        deleteNoticeRequest, deleteNoticeSuccess, deleteNoticeFailure,
        resetNoticeState
}from '../notice/noticeReducer';

describe('notice',()=>{
    const initialState = {
    notices: [],
    noticesPaging: null,
    totalCnt: 0,          // 뱃지용 전체 건수 (긴급공지 제외 전체)
    currentNotice: null,
    loading: false,
    error: null,
    success: false
};
    // === 전체 목록 ===
    it('fetchNoticeRequest & fetchNoticeSuccess', ()=>{
        let state = noticeReducer(initialState,fetchNoticeRequest());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();

        const payload = {
            list: [{bno:1, title:'첫 번째 공지'}],
            paging: {pstartno:1, totalPage:1},
            totalCnt:2
        };
        state = noticeReducer(initialState,fetchNoticeSuccess(payload));
        expect(state.loading).toBe(false);
        expect(state.notices).toEqual(payload.notices);
        expect(state.noticesPaging).toEqual(payload.paging);
        expect(state.totalCnt).toEqual(payload.totalCnt);
    });
    it('fetchNoticeFailure', () => {
        const state = noticeReducer(initialState, fetchNoticeFailure("전체 목록 조회 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("전체 목록 조회 실패");
    });

    // === 상세 조회 ===
    it('fetchNoticeDetailRequest & fetchNoticeDetailSuccess',()=>{
        let state = noticeReducer(initialState,fetchNoticeDetailRequest());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);

        const payload = {bno:1, title:'첫 번째 공지'};
        state = noticeReducer(initialState,fetchNoticeDetailSuccess(payload));
        expect(state.loading).toBe(false); 
        expect(state.currentNotice).toEqual(payload);
        expect(state.success).toBe(true);
    });
    it('fetchNoticeDetailFailure', () => {
        const state = noticeReducer(initialState, fetchNoticeDetailFailure("상세 조회 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("상세 조회 실패");
    });

    // === 공지 등록 ===
    it('createNoticeRequest & createNoticeSuccess', () => {
        let state = noticeReducer(initialState, createNoticeRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);

        const prev = {
            ...initialState,
            notices:[{bno:1, title:'첫 번째 공지'}],
            loading: true,
        };
        const newNotice = {bno:2, title:'두 번째 공지'};
        state = noticeReducer(prev, createNoticeSuccess({notice:newNotice}) );
        expect(state.loading).toBe(false);
        expect(state.notices).toEqual([newNotice, ...prev.notices]);
        expect(state.success).toBe(true);
    });
    it('createNoticeFailure', () => {
        const state = noticeReducer(initialState, createNoticeFailure("공지 등록 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("공지 등록 실패");
    });

    // === 공지 수정 ===
    it('updateNoticeRequest & updateNoticeSuccess', () => {
        let state = noticeReducer(initialState, updateNoticeRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);

        const prev = {
            ...initialState,
            notices:[{bno:1, title:'첫 번째 공지'}],
            currentNotice:{
                notice:{bno:1, title:'첫 번째 공지'}
            },
            loading: true,
        };
        const updatedNotice = {bno:1, title:'첫 번째 공지 수정'};
        state = noticeReducer(prev, updateNoticeSuccess({notice:updatedNotice}) );
        expect(state.loading).toBe(false);
        expect(state.notices).toEqual([updatedNotice]);
        expect(state.currentNotice).toEqual(updatedNotice);
        expect(state.success).toBe(true);
    });
    it('updateNoticeFailure', () => {
        const state = noticeReducer(initialState, updateNoticeFailure("공지 수정 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("공지 수정 실패");
    });

    // === 공지 삭제 ===
    it('deleteNoticeSuccess',()=>{
        const prev = {...initialState, notices:[{bno:1, title:'첫 번째 공지'}]};
        const state = noticeReducer(prev, deleteNoticeSuccess(1));
        expect(state.notices).toHaveLength(0);
        expect(state.notices.length).toBe(0);
        expect(state.success).toEqual(true);
    });
    it('deleteNoticeRequest', ()=> {
        let state = noticeReducer(initialState, deleteNoticeRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
    });
    it('deleteNoticeFailure', () => {
        const state = noticeReducer(initialState, deleteNoticeFailure("공지 삭제 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("공지 삭제 실패");
    });

    // === 공지 초기화 ===
    it('resetNoticeState', () => {
        const prev = {...initialState, loading: true, error:'error', success: true};
        const state = noticeReducer(prev, resetNoticeState() );
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
    });

});
// npx jest reducers/__tests__/notice.test.js