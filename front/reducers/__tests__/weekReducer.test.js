import weekReducer, {
    checkMyReportRequest, checkMyReportSuccess, checkMyReportFailure,
    createMyReportRequest, createMyReportSuccess, createMyReportFailure,
    resetWeekState
} from '../week/weekReducer';

describe('week', () => {

    const initialState = {
        available: false,
        loading: false,
        error: null,
        success: false
    };

    // === 개인 주간보고서 생성 가능 여부 확인 ===
    it('checkMyReportRequest & checkMyReportSuccess', () => {
        let state = weekReducer(initialState,checkMyReportRequest());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        const available = true;
        state = weekReducer(initialState,checkMyReportSuccess(available));
        expect(state.loading).toBe(false);
        expect(state.available).toBe(available);
    });
    it('checkMyReportFailure', () => {
        const state = weekReducer(initialState,checkMyReportFailure("주간보고서 생성 가능 여부 확인 실패"));
        expect(state.loading).toBe(false);
        expect(state.error).toBe("주간보고서 생성 가능 여부 확인 실패");
        expect(state.available).toBe(false);
    });

    // === 개인 주간보고서 PDF 생성 ===
    it('createMyReportRequest & createMyReportSuccess', () => {
        let state = weekReducer( initialState, createMyReportRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
        state = weekReducer({...initialState,loading: true}, createMyReportSuccess() );
        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);
    });
    it('createMyReportFailure', () => {
        const state = weekReducer( initialState, createMyReportFailure("주간보고서 PDF 생성 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("주간보고서 PDF 생성 실패");
        expect(state.success).toBe(false);
    });

    // === 초기화 ===
    it('resetWeekState', () => {
        const prev = {
            ...initialState,
            available: true,
            loading: true,
            error: 'error',
            success: true
        };
        const state = weekReducer( prev, resetWeekState() );
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
        expect(state.available).toBe(false);
    });

});

// npx jest reducers/__tests__/weekReducer.test.js