import { call, put } from "redux-saga/effects";
import {
    fetchFormList, fetchFormListApi,
    insertForm, insertFormApi,
    deleteForm, deleteFormApi,
} from "../appr/apprFormSaga";
import {
    fetchFormListSuccess, fetchFormListFailure,
    insertFormSuccess, insertFormFailure,
    deleteFormSuccess, deleteFormFailure,
} from "../../reducers/appr/apprFormReducer";

describe("apprFormSaga", () => {
    
    // 목록 조회
    describe("fetchFormList", () => {
        it("fetchFormListApi 호출 -> fetchFormListSuccess", () => {
            const action = {payload: {comId: 1, page: 1}};
            const gen = fetchFormList(action);

            // 1. api 호출
            expect(gen.next().value).toEqual(call(fetchFormListApi, action.payload));

            // 2. api 응답
            const mockResponse = {data: {content: [], totalCount: 0}};
            expect(gen.next(mockResponse).value).toEqual(put(fetchFormListSuccess(mockResponse.data)));

            // 3. 제너레이터 끄기
            expect(gen.next().done).toBe(true);
        });

        it("실패시 fetchFormListFailure", () => {
            const action = {payload: {}};
            const gen = fetchFormList(action);

            gen.next();

            const mockError = {response: {data: {error: "실패"}}};
            expect(gen.throw(mockError).value).toEqual(put(fetchFormListFailure("실패")));
        });

        it("실패시 응답 body가 없으면 err.message", () => {
            const action = {payload: {}};
            const gen = fetchFormList(action);

            gen.next();

            const mockError = new Error("오류");
            expect(gen.throw(mockError).value).toEqual(put(fetchFormListFailure("오류")));
        });
    });

    // 등록
    describe("insertForm", () => {
        it("insertFormApi -> insertFormSuccess", () => {
            const action = {payload: {forTitle: "테스트"}}
            const gen = insertForm(action);

            expect(gen.next().value).toEqual(call(insertFormApi, action.payload));
            expect(gen.next({data: {}}).value).toEqual(put(insertFormSuccess()));
            expect(gen.next().done).toBe(true);
        });

        it("실패 -> insertFormFailure", () => {
            const action = {payload: {}};
            const gen = insertForm(action);

            gen.next();
            const mockError = {response: {data: {error: "중복 테스트"}}};
            expect(gen.throw(mockError).value).toEqual(put(insertFormFailure("중복 테스트")));
        });
    });

    // 삭제
    describe("deleteForm", () => {
        it("deleteFormApi -> deleteFormSuccess", () => {
            const action = {payload: {forId: 5, forVersions: 2}};
            const gen = deleteForm(action);

            expect(gen.next().value).toEqual(call(deleteFormApi, action.payload));
            expect(gen.next().value).toEqual(put(deleteFormSuccess(5)));
        });

        it("실패 -> deleteFormFailure", () => {
            const action = {payload: {forId: 5, forVersions: 2}};
            const gen = deleteForm(action);

            gen.next();
            const mockError = {response: {data: {error: "실패 테스트"}}};
            expect(gen.throw(mockError).value).toEqual(put(deleteFormFailure("실패 테스트")));
        });
    });
});