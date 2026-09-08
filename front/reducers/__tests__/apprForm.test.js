import apprFormReducer, {
    fetchFormListRequest, fetchFormListSuccess, fetchFormListFailure,
    fetchFormDetailRequest, fetchFormDetailSuccess, fetchFormDetailFailure,
    fetchFormVersionsRequest, fetchFormVersionsSuccess, fetchFormVersionsFailure,
    insertFormRequest, insertFormSuccess, insertFormFailure,
    updateFormRequest, updateFormSuccess, updateFormFailure,
    deleteFormRequest, deleteFormSuccess, deleteFormFailure,
    resetFormState
} from "../appr/apprFormReducer";

describe("apprFormReducer", () => {
    const initialState = apprFormReducer(undefined, {type: "@@INIT"});

    it("초기값 확인", () => {
        expect(initialState.list).toEqual([]);
        expect(initialState.loading).toBe(false);
        expect(initialState.success).toBe(false);
    });

    // 목록 조회
    describe("목록 조회", () => {
        it("목록 조회 요청", () => {
            const state = apprFormReducer(initialState, fetchFormListRequest({comId: 1}));
            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it("목록 조회 성공", () => {
            const payload = {
                content: [{forId: 1, forCode: "A"}],
                page: 1,
                pageSize: 10,
                totalCount: 1,
                totalPages: 1,
            };

            const requested = apprFormReducer(initialState, fetchFormListRequest());
            const state = apprFormReducer(requested, fetchFormListSuccess(payload));

            expect(state.loading).toBe(false);
            expect(state.list).toEqual(payload.content);
            expect(state.totalCount).toBe(1);
            expect(state.totalPages).toBe(1);
        });

        it("목록 조회 실패", () => {
            const requested = apprFormReducer(initialState, fetchFormListRequest());
            const state = apprFormReducer(requested, fetchFormListFailure("실패 테스트"));

            expect(state.loading).toBe(false);
            expect(state.error).toBe("실패 테스트");
        });
    });

    // 버전 이력 조회
    describe("버전 이력 조회 실패", () => {
        it("버전이력 조회 실패", () => {
            const state = apprFormReducer(initialState, fetchFormVersionsFailure("실패 테스트"));
            expect(state.versionsLoading).toBe(false);
            expect(state.versionsError).toBe("실패 테스트");
        });
    });

    // 양식 등록
    describe("양식 등록", () => {
        it("양식 등록 요청", () => {
            const state = apprFormReducer(initialState, insertFormRequest({forTitle: "테스트"}));
            expect(state.submitting).toBe(true);
            expect(state.success).toBe(false);
        });

        it("양식 등록 성공", () => {
            const requested = apprFormReducer(initialState, insertFormRequest());
            const state = apprFormReducer(requested, insertFormSuccess());

            expect(state.submitting).toBe(false);
            expect(state.success).toBe(true);
        });

        it("양식 등록 실패", () => {
            const requested = apprFormReducer(initialState, insertFormRequest());
            const state = apprFormReducer(requested, insertFormFailure("실패 테스트"));

            expect(state.submitting).toBe(false);
            expect(state.submitError).toBe("실패 테스트");
            expect(state.success).toBe(false);
        });
    });

    // 삭제
    describe("양식 삭제", () => {
        it("양식 삭제 성공", () => {
            const stateWithList = {
                ...initialState,
                list: [
                    {forId: 1, forCode: "A"},
                    {forId: 2, forCode: "B"},
                ],
            };
            const requested = apprFormReducer(stateWithList, deleteFormRequest({forId: 1, forVersion: 1}));
            const state = apprFormReducer(requested, deleteFormSuccess(1));

            expect(state.list).toEqual([{forId: 2, forCode: "B"}]);
            expect(state.submitting).toBe(false);
        });
    });

    // 리셋
    describe("상태값 초기화", () => {
        it("상태값 초기화", () => {
            const dirtyState = {
                ...initialState,
                submitting: true,
                submitError: "초기화테스트",
                success: true,
            };
            const state = apprFormReducer(dirtyState, resetFormState());

            expect(state.submitting).toBe(false);
            expect(state.submitError).toBeNull();
            expect(state.success).toBe(false);
        });
    });
});