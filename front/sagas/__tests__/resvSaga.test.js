// sagas/__tests__/resvSaga.test.js
import { put } from "redux-saga/effects";

import {
  fetchMyResvList,
  fetchMyResvCount,
  fetchResvDetail,
  addResv,
  updateResv,
  cancelResv,
  returnResv,
  fetchAvailableQty,
} from "../resv/resvSaga";

import {
  fetchMyResvListRequest,
  fetchMyResvListSuccess,
  fetchMyResvListFailure,

  fetchMyResvCountRequest,
  fetchMyResvCountSuccess,
  fetchMyResvCountFailure,

  fetchResvDetailRequest,
  fetchResvDetailSuccess,
  fetchResvDetailFailure,

  addResvRequest,
  addResvSuccess,
  addResvFailure,

  updateResvRequest,
  updateResvSuccess,
  updateResvFailure,

  cancelResvRequest,
  cancelResvSuccess,
  cancelResvFailure,

  returnResvRequest,
  returnResvSuccess,
  returnResvFailure,

  fetchAvailableQtyRequest,
  fetchAvailableQtySuccess,
  fetchAvailableQtyFailure,
} from "../../reducers/resv/resvReducer";

describe("reservation saga", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- 내 예약 목록 조회 ---
  it("fetch my resv list success", () => {
    const search = { status: "WAI" };
    const generator = fetchMyResvList(fetchMyResvListRequest(search));

    // 1단계: API 호출 (call)
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    // 2단계: API 성공했다는 가정하에 결과값 전달
    const mockResponse = { data: [{ revId: 1, resName: "대회의실", status: "WAI" }] };
    const putStep = generator.next(mockResponse).value;

    // 3단계: 성공 액션 디스패치 확인
    expect(putStep).toEqual(put(fetchMyResvListSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true); // 제너레이터 완전종료
  });

  it("fetch my resv list fail", () => {
    const generator = fetchMyResvList(fetchMyResvListRequest({}));
    generator.next();

    const mockError = { response: { data: { message: "내 예약 목록 조회에 실패하였습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchMyResvListFailure("내 예약 목록 조회에 실패하였습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 내 예약 개수 조회 ---
  it("fetch my resv count success", () => {
    const generator = fetchMyResvCount(fetchMyResvCountRequest({}));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: 4 };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchMyResvCountSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch my resv count fail", () => {
    const generator = fetchMyResvCount(fetchMyResvCountRequest({}));
    generator.next();

    const mockError = { response: { data: { message: "내 예약 개수 조회에 실패하였습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchMyResvCountFailure("내 예약 개수 조회에 실패하였습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 예약 단건 조회 ---
  it("fetch resv detail success", () => {
    const generator = fetchResvDetail(fetchResvDetailRequest(1));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { revId: 1, resName: "대회의실", status: "WAI" } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchResvDetailSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch resv detail fail", () => {
    const generator = fetchResvDetail(fetchResvDetailRequest(999));
    generator.next();

    const mockError = { response: { data: { message: "해당 예약을 찾을 수 없습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchResvDetailFailure("해당 예약을 찾을 수 없습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 자원 예약 등록 ---
  it("add resv success", () => {
    const payload = { resId: 1, startDt: "2026-08-20T09:00:00", endDt: "2026-08-20T11:00:00", qty: 1 };
    const generator = addResv(addResvRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { success: true, message: "예약이 신청되었습니다." } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(addResvSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("add resv fail (수량 부족)", () => {
    const payload = { resId: 1, startDt: "2026-08-20T09:00:00", endDt: "2026-08-20T11:00:00", qty: 5 };
    const generator = addResv(addResvRequest(payload));
    generator.next();

    const mockError = {
      response: {
        data: {
          success: false,
          reason: "notEnoughQuantity",
          message: "해당 기간에 예약 가능한 수량이 부족합니다. (남은 수량: 2개)",
        },
      },
    };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(
      put(
        addResvFailure({
          message: "해당 기간에 예약 가능한 수량이 부족합니다. (남은 수량: 2개)",
          reason: "notEnoughQuantity",
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  // --- 자원 예약 수정 ---
  it("update resv success", () => {
    const payload = { revId: 1, dto: { qty: 2 } };
    const generator = updateResv(updateResvRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { success: true, message: "예약 수정 성공" } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(updateResvSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("update resv fail", () => {
    const payload = { revId: 1, dto: {} };
    const generator = updateResv(updateResvRequest(payload));
    generator.next();

    const mockError = { response: { data: { message: "본인 예약만 수정할 수 있습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(updateResvFailure("본인 예약만 수정할 수 있습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 자원 예약 취소 ---
  it("cancel resv success", () => {
    const generator = cancelResv(cancelResvRequest(1));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { success: true, message: "예약이 취소되었습니다." } };
    const putStep = generator.next(mockResponse).value;

    // 응답에 revId 가 없더라도 saga 가 항상 revId 를 합쳐서 dispatch 하는지 확인
    expect(putStep).toEqual(
      put(cancelResvSuccess({ success: true, message: "예약이 취소되었습니다.", revId: 1 }))
    );
    expect(generator.next().done).toBe(true);
  });

  it("cancel resv fail", () => {
    const generator = cancelResv(cancelResvRequest(1));
    generator.next();

    const mockError = { response: { data: { message: "본인 예약이거나 관리자만 취소할 수 있습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(cancelResvFailure("본인 예약이거나 관리자만 취소할 수 있습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 자원 반납 처리 ---
  it("return resv success", () => {
    const generator = returnResv(returnResvRequest(1));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = {
      data: { success: true, message: "반납 처리되었습니다.", returnDt: "2026-08-19T10:00:00" },
    };
    const putStep = generator.next(mockResponse).value;

    // 응답에 revId 가 없더라도 saga 가 항상 revId 를 합쳐서 dispatch 하는지 확인
    expect(putStep).toEqual(
      put(
        returnResvSuccess({
          success: true,
          message: "반납 처리되었습니다.",
          returnDt: "2026-08-19T10:00:00",
          revId: 1,
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it("return resv fail", () => {
    const generator = returnResv(returnResvRequest(1));
    generator.next();

    const mockError = { response: { data: { message: "본인이 예약한 자원만 반납할 수 있습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(returnResvFailure("본인이 예약한 자원만 반납할 수 있습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 실시간 잔여수량 조회 ---
  it("fetch available qty success", () => {
    const search = { resId: 1, startDt: "2026-08-20T09:00:00", endDt: "2026-08-20T11:00:00" };
    const generator = fetchAvailableQty(fetchAvailableQtyRequest(search));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = {
      data: { totalQuantity: 5, reservedQty: 2, availableQty: 3, resStatus: "AVAILABLE" },
    };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchAvailableQtySuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch available qty fail", () => {
    const generator = fetchAvailableQty(fetchAvailableQtyRequest({}));
    generator.next();

    const mockError = { response: { data: { message: "잘못된 자원 요청입니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchAvailableQtyFailure("잘못된 자원 요청입니다.")));
    expect(generator.next().done).toBe(true);
  });
});