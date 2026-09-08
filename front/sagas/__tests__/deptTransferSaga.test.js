// sagas/__tests__/deptTransferSaga.test.js
import { put } from "redux-saga/effects";

import {
  fetchImpact,
  cancelTransfer,
  executeTransfer,
  fetchPendingList,
  fetchTransferLog,
} from "../dept/deptTransferSaga";

import {
  fetchImpactRequest,
  fetchImpactSuccess,
  fetchImpactFailure,

  cancelTransferRequest,
  cancelTransferSuccess,
  cancelTransferFailure,

  executeTransferRequest,
  executeTransferSuccess,
  executeTransferFailure,

  fetchPendingListRequest,
  fetchPendingListSuccess,
  fetchPendingListFailure,

  fetchTransferLogRequest,
  fetchTransferLogSuccess,
  fetchTransferLogFailure,
} from "../../reducers/dept/deptTransferReducer";

describe("dept transfer saga", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- 부서 이관 영향도 조회 ---
  it("fetch impact success", () => {
    const generator = fetchImpact(fetchImpactRequest(5));

    // 1단계: API 호출 (call)
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    // 2단계: API 성공했다는 가정하에 결과값 전달
    const mockResponse = {
      data: {
        pendingEmpCount: 3,
        candidateDepts: [{ deptId: 2, deptName: "인사팀" }],
        aiSuggestion: { deptId: 2, reason: "업무 유사도가 높음" },
      },
    };
    const putStep = generator.next(mockResponse).value;

    // 3단계: 성공 액션 디스패치 확인
    expect(putStep).toEqual(put(fetchImpactSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true); // 제너레이터 완전종료
  });

  it("fetch impact fail", () => {
    const generator = fetchImpact(fetchImpactRequest(999));
    generator.next();

    const mockError = { response: { data: { message: "존재하지 않는 부서입니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchImpactFailure("존재하지 않는 부서입니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 이관 취소 ---
  it("cancel transfer success", () => {
    const generator = cancelTransfer(cancelTransferRequest(5));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { success: true, message: "부서 삭제를 취소했습니다." } };
    const putStep = generator.next(mockResponse).value;

    // 응답에 deptId 가 없더라도 saga 가 항상 deptId 를 합쳐서 dispatch 하는지 확인
    expect(putStep).toEqual(
      put(cancelTransferSuccess({ success: true, message: "부서 삭제를 취소했습니다.", deptId: 5 }))
    );
    expect(generator.next().done).toBe(true);
  });

  it("cancel transfer fail", () => {
    const generator = cancelTransfer(cancelTransferRequest(5));
    generator.next();

    const mockError = { response: { data: { message: "본인 소속 회사의 부서만 취소할 수 있습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(cancelTransferFailure("본인 소속 회사의 부서만 취소할 수 있습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 이관 최종 실행 ---
  it("execute transfer success", () => {
    const payload = {
      deptId: 5,
      transfers: [{ empId: 1, toDeptId: 2 }],
    };
    const generator = executeTransfer(executeTransferRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { success: true, message: "사원 이관이 완료되었습니다." } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(executeTransferSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("execute transfer fail (DeptTransferException, reason 포함)", () => {
    const payload = { deptId: 5, transfers: [] };
    const generator = executeTransfer(executeTransferRequest(payload));
    generator.next();

    const mockError = {
      response: {
        data: {
          success: false,
          reason: "REMAINING_EMPLOYEES",
          message: "이관 대상 사원이 남아있습니다.",
        },
      },
    };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(
      put(
        executeTransferFailure({
          message: "이관 대상 사원이 남아있습니다.",
          reason: "REMAINING_EMPLOYEES",
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it("execute transfer fail (reason 없는 일반 오류)", () => {
    const payload = { deptId: 5, transfers: [] };
    const generator = executeTransfer(executeTransferRequest(payload));
    generator.next();

    const mockError = {}; // 서버 응답 자체가 없는 네트워크 오류 등
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(
      put(
        executeTransferFailure({
          message: "이관 처리 중 오류가 발생했습니다.",
          reason: null,
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  // --- 이관 대기 부서 목록 조회 ---
  it("fetch pending list success", () => {
    const generator = fetchPendingList(fetchPendingListRequest("개발"));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: [{ deptId: 5, deptName: "개발팀", empCount: 3 }] };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchPendingListSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch pending list fail", () => {
    const generator = fetchPendingList(fetchPendingListRequest());
    generator.next();

    const mockError = { response: { data: { message: "이관 대기 목록 조회 실패" } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchPendingListFailure("이관 대기 목록 조회 실패")));
    expect(generator.next().done).toBe(true);
  });

  // --- 부서 이관 이력 조회 ---
  it("fetch transfer log success", () => {
    const search = { dateFrom: "2026-07-14", dateTo: "2026-08-13" };
    const generator = fetchTransferLog(fetchTransferLogRequest(search));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = {
      data: {
        total: 1,
        logs: [{ logId: 1, fromDeptName: "개발팀", toDeptName: "인사팀" }],
        deptOptions: [{ deptId: 1, deptName: "경영지원본부" }],
      },
    };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchTransferLogSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch transfer log fail", () => {
    const generator = fetchTransferLog(fetchTransferLogRequest({}));
    generator.next();

    const mockError = { response: { data: { message: "이관 이력 조회 실패" } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchTransferLogFailure("이관 이력 조회 실패")));
    expect(generator.next().done).toBe(true);
  });
});