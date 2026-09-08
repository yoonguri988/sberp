// reducers/pos/__tests__/posReducer.test.js
import posReducer, {
    resetPosState,
    listPosRequest, listPosSuccess, listPosFailure,
    detailPosRequest, detailPosSuccess, detailPosFailure,
    createPosRequest, createPosSuccess, createPosFailure,
    updatePosRequest, updatePosSuccess, updatePosFailure,
    deletePosRequest, deletePosSuccess, deletePosFailure,
} from '../posReducer';


describe('pos reducer', () => {
    const initialState = {
        posList: [],
        currentPos: null,
        loading: false,
        error: null,
        success: false,
    };

    // --- 목록 조회 ---
    it('listPosRequest & listPosSuccess', () => {
        // 1. Request → loading이 true로 바뀌는지
        let state = posReducer(initialState, listPosRequest());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();

        // 2. Success → 목록 데이터가 들어가고 loading이 false로 바뀌는지
        const posList = [
            { posId: 1, posName: '사원' },
            { posId: 2, posName: '대리' },
        ];
        state = posReducer(state, listPosSuccess(posList));
        expect(state.loading).toBe(false);
        expect(state.posList).toEqual(posList);
        expect(state.posList).toHaveLength(2);
    });

    it('listPosFailure', () => {
        const prev = { ...initialState, loading: true };
        const state = posReducer(prev, listPosFailure('서버 오류'));
        expect(state.loading).toBe(false);
        expect(state.error).toBe('서버 오류');
    });

    // --- 상세 조회 ---
    it('detailPosSuccess', () => {
        const pos = { posId: 1, posName: '사원', posCode: 'P01' };
        const state = posReducer(initialState, detailPosSuccess(pos));
        expect(state.loading).toBe(false);
        expect(state.currentPos).toEqual(pos);
    });

    // --- 등록 ---
    it('createPosSuccess', () => {
        const state = posReducer(initialState, createPosSuccess());
        expect(state.loading).toBe(false);
        expect(state.success).toBe(true);
    });

    // --- 수정 ---
    it('updatePosSuccess', () => {
        const updated = { posId: 1, posName: '수정된 직급' };
        const state = posReducer(initialState, updatePosSuccess(updated));
        expect(state.currentPos).toEqual(updated);
        expect(state.success).toBe(true);
    });

    // --- 삭제 ---
    it('deletePosSuccess', () => {
        // 기존 목록에 2건이 있는 상태에서 1건 삭제
        const prev = {
            ...initialState,
            posList: [
                { posId: 1, posName: '사원' },
                { posId: 2, posName: '대리' },
            ],
        };
        const state = posReducer(prev, deletePosSuccess(1));
        expect(state.posList).toHaveLength(1);
        expect(state.posList[0].posId).toBe(2);
        expect(state.success).toBe(true);
    });

    // --- 상태 초기화 ---
    it('resetPosState', () => {
        const prev = { ...initialState, loading: true, error: '에러', success: true };
        const state = posReducer(prev, resetPosState());
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
    });
});

// npm test posReducer
