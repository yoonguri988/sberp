// sagas/__tests__/adminResvSaga.test.js
import { put } from "redux-saga/effects";

import {
  fetchAdminResvList,
  fetchAdminResvCount,
  fetchAdminResvStats,
  approveResv,
  rejectResv,
} from "../resv/adminResvSaga";

import {
  fetchAdminResvListRequest,
  fetchAdminResvListSuccess,
  fetchAdminResvListFailure,

  fetchAdminResvCountRequest,
  fetchAdminResvCountSuccess,
  fetchAdminResvCountFailure,

  fetchAdminResvStatsRequest,
  fetchAdminResvStatsSuccess,
  fetchAdminResvStatsFailure,

  approveResvRequest,
  approveResvSuccess,
  approveResvFailure,

  rejectResvRequest,
  rejectResvSuccess,
  rejectResvFailure,
} from "../../reducers/resv/adminResvReducer";

describe("admin reservation saga", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- 예약 관리 목록 조회 ---
  it("fetch admin resv list success", () => {
    const search = { status: "WAI" };
    const generator = fetchAdminResvList(fetchAdminResvListRequest(search));

    // 1단계: API 호출 (call)
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    // 2단계: API 성공했다는 가정하에 결과값 전달
    const mockResponse = { data: [{ revId: 1, resName: "대회의실", status: "WAI" }] };
    const putStep = generator.next(mockResponse).value;

    // 3단계: 성공 액션 디스패치 확인
    expect(putStep).toEqual(put(fetchAdminResvListSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true); // 제너레이터 완전종료
  });

  it("fetch admin resv list fail", () => {
    const generator = fetchAdminResvList(fetchAdminResvListRequest({}));
    generator.next();

    const mockError = { response: { data: { message: "예약 목록 조회에 실패하였습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchAdminResvListFailure("예약 목록 조회에 실패하였습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 예약 관리 전체 개수 조회 ---
  it("fetch admin resv count success", () => {
    const generator = fetchAdminResvCount(fetchAdminResvCountRequest({}));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: 23 };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchAdminResvCountSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch admin resv count fail", () => {
    const generator = fetchAdminResvCount(fetchAdminResvCountRequest({}));
    generator.next();

    const mockError = { response: { data: { message: "예약 개수 조회에 실패하였습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchAdminResvCountFailure("예약 개수 조회에 실패하였습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 예약 통계 조회 ---
  it("fetch admin resv stats success", () => {
    const generator = fetchAdminResvStats(fetchAdminResvStatsRequest({}));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { total: 20, approved: 12, waiting: 5, rejected: 3 } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchAdminResvStatsSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch admin resv stats fail", () => {
    const generator = fetchAdminResvStats(fetchAdminResvStatsRequest({}));
    generator.next();

    const mockError = { response: { data: { message: "예약 통계 조회에 실패하였습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchAdminResvStatsFailure("예약 통계 조회에 실패하였습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 예약 승인 ---
  it("approve resv success", () => {
    const generator = approveResv(approveResvRequest(1));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { success: true, message: "예약이 승인되었습니다." } };
    const putStep = generator.next(mockResponse).value;

    // 응답에 revId 가 없더라도 saga 가 항상 revId 를 합쳐서 dispatch 하는지 확인
    expect(putStep).toEqual(
      put(approveResvSuccess({ success: true, message: "예약이 승인되었습니다.", revId: 1 }))
    );
    expect(generator.next().done).toBe(true);
  });

  it("approve resv fail", () => {
    const generator = approveResv(approveResvRequest(1));
    generator.next();

    const mockError = { response: { data: { message: "본인 소속 회사의 예약만 승인할 수 있습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(approveResvFailure("본인 소속 회사의 예약만 승인할 수 있습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 예약 반려 ---
  it("reject resv success", () => {
    const payload = { revId: 1, rejectReason: "기간이 겹칩니다." };
    const generator = rejectResv(rejectResvRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { success: true, message: "예약이 반려되었습니다." } };
    const putStep = generator.next(mockResponse).value;

    // 응답에 revId/rejectReason 이 없더라도 saga 가 함께 합쳐서 dispatch 하는지 확인
    expect(putStep).toEqual(
      put(
        rejectResvSuccess({
          success: true,
          message: "예약이 반려되었습니다.",
          revId: 1,
          rejectReason: "기간이 겹칩니다.",
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it("reject resv fail", () => {
    const payload = { revId: 1, rejectReason: "기간이 겹칩니다." };
    const generator = rejectResv(rejectResvRequest(payload));
    generator.next();

    const mockError = { response: { data: { message: "본인 소속 회사의 예약만 반려할 수 있습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(rejectResvFailure("본인 소속 회사의 예약만 반려할 수 있습니다.")));
    expect(generator.next().done).toBe(true);
  });
});