import apprDocReducer, {
    fetchWritableFormsRequest, fetchWritableFormsSuccess, fetchWritableFormsFailure,
    fetchWriterInfoRequest, fetchWriterInfoSuccess, fetchWriterInfoFailure,
    writeDocRequest, writeDocSuccess, writeDocFailure, resetWriteState,
    fetchDocListRequest, fetchDocListSuccess, fetchDocListFailure,
    fetchDocDetailRequest, fetchDocDetailSuccess, fetchDocDetailFailure,
    approveDocRequest, approveDocSuccess, approveDocFailure,
    rejectDocRequest, rejectDocSuccess, rejectDocFailure, resetProcessState,
    fetchApprLinesRequest, fetchApprLinesSuccess, fetchApprLinesFailure,
    fetchDeptTreeRequest, fetchDeptTreeSuccess, fetchDeptTreeFailure,
    fetchDeptEmpsRequest, fetchDeptEmpsSuccess, fetchDeptEmpsFailure,
} from "../appr/apprDocReducer";

describe("apprDocReducer", () => {
    const initialState = apprDocReducer(undefined, {type: "@@INIT"});

    it("초기값 확인", () => {
        expect(initialState.hisDocs).toEqual([]);
        expect(initialState.todoDocs).toEqual([]);
        expect(initialState.writeSuccess).toBe(false);
        expect(initialState.canProcess).toBe(false);
    });

    // 작성 가능한 양식 목록
    describe("작성 가능한 양식 목록 조회", () => {
        it("목록 조회 요청", () => {
            const state = apprDocReducer(initialState, fetchWritableFormsRequest(1));
            expect(state.writableFormsLoading).toBe(true);
            expect(state.writableFormsError).toBeNull();
        });

        it("목록 조회 성공", () => {
            const payload = [{ forId: 1, forCode: "A "}];
            const requested = apprDocReducer(initialState, fetchWritableFormsRequest(1));
            const state = apprDocReducer(requested, fetchWritableFormsSuccess(payload));

            expect(state.writableFormsLoading).toBe(false);
            expect(state.writableForms).toEqual(payload);
        });

        it("목록 조회 실패", () => {
            const requested = apprDocReducer(initialState, fetchWritableFormsRequest(1));
            const state = apprDocReducer(requested, fetchWritableFormsFailure("실패 테스트"));

            expect(state.writableFormsLoading).toBe(false);
            expect(state.writableFormsError).toBe("실패 테스트");
        });
    });

    // 작성자 인적사항
    describe("작성자 인적사항 조회", () => {
        it("조회 성공", () => {
            const payload = {empId: 1, empName: "홍길동", comId: 1};
            const requested = apprDocReducer(initialState, fetchWriterInfoRequest(1));
            const state = apprDocReducer(requested, fetchWriterInfoSuccess(payload));

            expect(state.writerInfoLoading).toBe(false);
            expect(state.writerInfo).toEqual(payload);
        });

        it("조회 실패", () => {
            const state = apprDocReducer(initialState, fetchWriterInfoFailure("실패 테스트"));
            expect(state.writerInfoError).toBe("실패 테스트")
        });

    });

    // 문서 작성
    describe("문서 작성", () => {
        it("문서 작성 요청", () => {
            const state = apprDocReducer(initialState, writeDocRequest({empId: 1, comId: 1, data: {}}));
            expect(state.writeSubmitting).toBe(true);
            expect(state.writeSuccess).toBe(false);
        });

        it("문서 작성 성공", () => {
            const requested = apprDocReducer(initialState, writeDocRequest());
            const state = apprDocReducer(requested, writeDocSuccess());

            expect(state.writeSubmitting).toBe(false);
            expect(state.writeSuccess).toBe(true);
        });

        it("문서 작성 실패", () => {
            const requested = apprDocReducer(initialState, writeDocRequest());
            const state = apprDocReducer(requested, writeDocFailure("실패 테스트"));

            expect(state.writeSubmitting).toBe(false);
            expect(state.writeError).toBe("실패 테스트");
        });

        it("상태 초기화", () => {
            const dirtyState = {
                ...initialState,
                writeSubmitting: true,
                writeError: "테스트",
                writeSuccess: true,
            };
            const state = apprDocReducer(dirtyState, resetWriteState());

            expect(state.writeSubmitting).toBe(false);
            expect(state.writeError).toBeNull();
            expect(state.writeSuccess).toBe(false);
        });

    });

    // 문서 목록 조회
    describe("문서 목록 조회", () => {
        it("문서 목록 조회 요청 / todo", () => {
            const state = apprDocReducer(initialState, fetchDocListRequest({tab: "todo"}));
            expect(state.listLoading).toBe(true);
            expect(state.activeTab).toBe("todo");
        });

        it("문서 목록 조회 요청 / history", () => {
            const state = apprDocReducer(initialState, fetchDocListRequest({}));
            expect(state.activeTab).toBe("history");
        });

        it("문서 목록 조회 성공", () => {
            const payload = {
                hisDocs: [{docId: 1, docTitle: "문서1"}],
                todoDocs: [],
                docCnts: {totalcnt: 1, appcnt: 0},
                myTodoCnt: 0,
                paging: {current: 1, pagetotal: 1},
                activeTab: "history",
            };
            const requested = apprDocReducer(initialState, fetchDocListRequest({tab: "history"}));
            const state = apprDocReducer(requested, fetchDocListSuccess(payload));

            expect(state.listLoading).toBe(false);
            expect(state.hisDocs).toEqual(payload.hisDocs);
            expect(state.docCnts).toEqual(payload.docCnts);
            expect(state.paging).toEqual(payload.paging);
        });

        it("문서 목록 조회 실패", () => {
            const state = apprDocReducer(initialState, fetchDocListFailure("실패 테스트"));
            expect(state.listLoading).toBe(false);
            expect(state.listError).toBe("실패 테스트");
        });
    });

    // 문서 상세 조회
    describe("문서 상세 조회", () => {
        it("상세 조회 성공 / doc/line/canProcess 각각 반영", () => {
            const payload = {
                doc: {docId:1 , docTitle: "문서이름"},
                lines: [{linId: 1, empId: 10, linStatus: "WAI"}],
                canProcess: true,
            };
            const requested = apprDocReducer(initialState, fetchDocDetailRequest());
            const state = apprDocReducer(requested, fetchDocDetailSuccess(payload));

            expect(state.detailLoading).toBe(false);
            expect(state.detailDoc).toEqual(payload.doc);
            expect(state.detailLines).toEqual(payload.lines);
            expect(state.canProcess).toBe(true);
        });

        it("상세 조회 실패", () => {
            const state = apprDocReducer(initialState, fetchDocDetailFailure("실패 테스트"));
            expect(state.detailError).toBe("실패 테스트");
        });
    });

    // 결재 승인/반려 처리
    describe("결재 승인/반려 처리", () => {
        it("처리 요청", () => {
            const state = apprDocReducer(initialState, approveDocRequest());
            expect(state.processSubmitting).toBe(true);
            expect(state.processSuccess).toBe(false);
        });

        it("승인 성공", () => {
            const requested = apprDocReducer(initialState, approveDocRequest());
            const state = apprDocReducer(requested, approveDocSuccess());
            expect(state.processSubmitting).toBe(false);
            expect(state.processSuccess).toBe(true);
        });

        it("반려 성공", () => {
            const requested = apprDocReducer(initialState, rejectDocRequest());
            const state = apprDocReducer(requested, rejectDocSuccess());
            expect(state.processSuccess).toBe(true);
        });

        it("승인/반려 실패", () => {
            const requested = apprDocReducer(initialState, approveDocRequest());
            const state = apprDocReducer(requested, approveDocFailure("실패 테스트"));
            expect(state.processError).toBe("실패 테스트");
        });

        it("처리후 상태 초기화", () => {
            const dirtyState = {
                ...initialState,
                processSubmitting: true,
                processError: "에러",
                processSuccess: true,
            };
            const state = apprDocReducer(dirtyState, resetProcessState());

            expect(state.processSubmitting).toBe(false);
            expect(state.processError).toBeNull();
            expect(state.processSuccess).toBe(false);
        });
    });

    // 결재선 지정
    describe("기안자 상사 목록 조회", () => {
        it("조회 성공", () => {
            const payload = [{empId: 1, empName: "김부장"}];
            const state = apprDocReducer(initialState, fetchApprLinesSuccess(payload));
            expect(state.apprLines).toEqual(payload);
        });
    });

    describe("부서 체인 + 지정 가능 인원수 조회", () => {
        it("부서 트리 성공", () => {
            const payload = [{deptId: 1, deptName: "테스트", empCount: 3}];
            const state = apprDocReducer(initialState, fetchDeptTreeSuccess(payload));
            expect(state.deptTree).toEqual(payload);
        });

        it("부서 트리 실패", () => {
            const requested = apprDocReducer(initialState, fetchDeptTreeRequest());
            const state = apprDocReducer(requested, fetchDeptTreeFailure());
            expect(state.deptTreeLoading).toBe(false);
        });
    });

    describe("특정 부서 소속 사원 목록 조회", () => {
        it("조회 성공", () => {
            const payload = [{empId: 5, empName: "이사원"}];
            const state = apprDocReducer(initialState, fetchDeptEmpsSuccess(payload));
            expect(state.deptEmps).toEqual(payload);
        });
    });
});