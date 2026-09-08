import { call, put } from "redux-saga/effects";
import {
    fetchDocList, fetchDocListApi,
    writeDoc, writeDocApi,
    approveDoc, approveDocApi,
    rejectDoc, rejectDocApi,
    fetchDeptTree, fetchDeptTreeApi,
    fetchDeptEmps, fetchDeptEmpsApi,
} from "../appr/apprDocSaga";
import {
    fetchDocListSuccess, fetchDocListFailure,
    writeDocSuccess, writeDocFailure,
    approveDocSuccess, approveDocFailure,
    rejectDocSuccess, rejectDocFailure,
    fetchDeptTreeSuccess, fetchDeptTreeFailure,
    fetchDeptEmpsSuccess, fetchDeptEmpsFailure,
} from "../../reducers/appr/apprDocReducer";

describe("apprDocSaga", () => {

    // 문서 목록 조회
    describe("fetchDocList", () => {
        it("fetchDocListApi -> fetchDocListSuccess", () => {
            const action = {payload: {tab: "history", empId: 1, page: 1}};
            const gen = fetchDocList(action);

            expect(gen.next().value).toEqual(call(fetchDocListApi, action.payload));

            const mockResponse = {data: {hisDocs: [], todoDocs: []}};
            expect(gen.next(mockResponse).value).toEqual(put(fetchDocListSuccess(mockResponse.data)));

            expect(gen.next().done).toBe(true);
        });

        it("실패 -> fetchDocListFailure", () => {
            const gen = fetchDocList({payload: {}});
            gen.next();

            const mockError = {response: {data: {error: "실패 테스트"}}};
            expect(gen.throw(mockError).value).toEqual(put(fetchDocListFailure("실패 테스트")));
        });
    });

    // 문서 작성
    describe("writeDoc", () => {
        it("writeDocApi -> writeDocSuccess", () => {
            const action = {payload: {empId: 1, comId: 1, data: {docTitle: "문서이름"}}};
            const gen = writeDoc(action);

            expect(gen.next().value).toEqual(call(writeDocApi, action.payload));
            expect(gen.next({data: {}}).value).toEqual(put(writeDocSuccess()));
        });

        it("실패 -> writeDocFailure", () => {
            const gen = writeDoc({ payload: {}});
            gen.next();

            const mockError = {response: {data: {error: "실패 테스트"}}};
            expect(gen.throw(mockError).value).toEqual(put(writeDocFailure("실패 테스트")));
        });
    });

    // 결재 승인
    describe("approveDoc", () => {
        it("approveDocApi -> approveDocSuccess", () => {
            const action = {payload: {docId: 1, empId: 1}};
            const gen = approveDoc(action);

            expect(gen.next().value).toEqual(call(approveDocApi, action.payload));
            expect(gen.next({data: null}).value).toEqual(put(approveDocSuccess()));
        });

        it("실패 -> approveDocFailiure", () => {
            const gen = approveDoc({payload: {docId: 1, empId: 1}});
            gen.next();

            const mockError = {response: {data: {error: "실패 테스트"}}};
            expect(gen.throw(mockError).value).toEqual(put(approveDocFailure("실패 테스트")));
        });
    });

    // 결재 반려
    describe("rejectDoc", () => {
        it("docId/empId 을 넘겨줌 -> rejectDocApi", () => {
            const action = {payload: {docId: 7, empId: 3}};
            const gen = rejectDoc(action);

            expect(gen.next().value).toEqual(call(rejectDocApi, action.payload));
            expect(gen.next({data: null}).value).toEqual(put(rejectDocSuccess()));
        });

        it("실패 -> rejectDocFailure", () => {
            const gen = rejectDoc({payload: {docId: 7, empId: 3}});
            gen.next();

            const mockError = new Error("에러 테스트");
            expect(gen.throw(mockError).value).toEqual(put(rejectDocFailure("에러 테스트")));
        });
    });

    // 부서 체인 조회
    describe("fetchDeptTree", () => {
        it("deptId/empId 포함하여 호출 -> fetchDeptTreeApi", () => {
            const action = {payload: {deptId: 2, empId: 1}};
            const gen = fetchDeptTree(action);

            expect(gen.next().value).toEqual(call(fetchDeptTreeApi, action.payload));
            expect(gen.next({data: []}).value).toEqual(put(fetchDeptTreeSuccess([])));
        });

        it("실패 -> fetchDeptTreeFailure", () => {
            const gen = fetchDeptTree({payload: {deptId: 2, empId: 1}});
            gen.next();

            const mockError = {response: {data: {error: "실패 테스트"}}};
            expect(gen.throw(mockError).value).toEqual(put(fetchDeptTreeFailure("실패 테스트")));
        });
    });

    // 부서 사원 목록 조회
    describe("fetchDeptEmps", () => {
        it("fetchDeptEmpsApi를 호출", () => {
            const action = {payload: 2};
            const gen = fetchDeptEmps(action);

            expect(gen.next().value).toEqual(call(fetchDeptEmpsApi, action.payload));
            expect(gen.next({data: []}).value).toEqual(put(fetchDeptEmpsSuccess([])));
        })
    })
});