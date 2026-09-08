// sagas/__tests__/resourceSaga.test.js
import { put } from "redux-saga/effects";

import {
  fetchResourceList,
  fetchResourceCount,
  fetchResourceDetail,
  addResource,
  updateResource,
  deleteResource,
  checkResCode,
  fetchReservableResources,
} from "../res/resourceSaga";

import {
  fetchResourceListRequest,
  fetchResourceListSuccess,
  fetchResourceListFailure,

  fetchResourceCountRequest,
  fetchResourceCountSuccess,
  fetchResourceCountFailure,

  fetchResourceDetailRequest,
  fetchResourceDetailSuccess,
  fetchResourceDetailFailure,

  addResourceRequest,
  addResourceSuccess,
  addResourceFailure,

  updateResourceRequest,
  updateResourceSuccess,
  updateResourceFailure,

  deleteResourceRequest,
  deleteResourceSuccess,
  deleteResourceFailure,

  checkResCodeRequest,
  checkResCodeSuccess,
  checkResCodeFailure,

  fetchReservableResourcesRequest,
  fetchReservableResourcesSuccess,
  fetchReservableResourcesFailure,
} from "../../reducers/res/resourceReducer";

describe("resource saga", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- 자원 목록 조회 ---
  it("fetch resource list success", () => {
    const search = { keyword: "회의실" };
    const generator = fetchResourceList(fetchResourceListRequest(search));

    // 1단계: API 호출 (call)
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    // 2단계: API 성공했다는 가정하에 결과값 전달
    const mockResponse = { data: [{ resId: 1, resName: "대회의실", resCode: "RES-001" }] };
    const putStep = generator.next(mockResponse).value;

    // 3단계: 성공 액션 디스패치 확인
    expect(putStep).toEqual(put(fetchResourceListSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true); // 제너레이터 완전종료
  });

  it("fetch resource list fail", () => {
    const generator = fetchResourceList(fetchResourceListRequest({}));
    generator.next();

    const mockError = { response: { data: { message: "자원 목록 조회에 실패하였습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchResourceListFailure("자원 목록 조회에 실패하였습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 자원 전체 개수 조회 ---
  it("fetch resource count success", () => {
    const generator = fetchResourceCount(fetchResourceCountRequest({}));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: 12 };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchResourceCountSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch resource count fail", () => {
    const generator = fetchResourceCount(fetchResourceCountRequest({}));
    generator.next();

    const mockError = { response: { data: { message: "자원 개수 조회에 실패하였습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchResourceCountFailure("자원 개수 조회에 실패하였습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 자원 단건 조회 ---
  it("fetch resource detail success", () => {
    const generator = fetchResourceDetail(fetchResourceDetailRequest(1));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { resId: 1, resName: "대회의실", resCode: "RES-001" } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchResourceDetailSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch resource detail fail", () => {
    const generator = fetchResourceDetail(fetchResourceDetailRequest(999));
    generator.next();

    const mockError = { response: { data: { message: "해당 자원을 찾을 수 없습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchResourceDetailFailure("해당 자원을 찾을 수 없습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 자원 등록 ---
  it("add resource success", () => {
    const payload = { resName: "노트북 B", resCode: "RES-003" };
    const generator = addResource(addResourceRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = {
      data: { success: true, message: "자원 등록 성공", resource: { resId: 3, resCode: "RES-003" } },
    };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(addResourceSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("add resource fail (자원코드 중복)", () => {
    const payload = { resName: "노트북 B", resCode: "RES-001" };
    const generator = addResource(addResourceRequest(payload));
    generator.next();

    const mockError = {
      response: {
        data: { success: false, reason: "duplicateResCode", message: "이미 등록된 자원코드입니다." },
      },
    };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(
      put(addResourceFailure({ message: "이미 등록된 자원코드입니다.", reason: "duplicateResCode" }))
    );
    expect(generator.next().done).toBe(true);
  });

  // --- 자원 수정 ---
  it("update resource success", () => {
    const payload = { resId: 1, dto: { resName: "대회의실(수정)" } };
    const generator = updateResource(updateResourceRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { success: true, message: "자원 수정 성공" } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(updateResourceSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("update resource fail", () => {
    const payload = { resId: 1, dto: {} };
    const generator = updateResource(updateResourceRequest(payload));
    generator.next();

    const mockError = { response: { data: { message: "자원 수정 실패" } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(updateResourceFailure("자원 수정 실패")));
    expect(generator.next().done).toBe(true);
  });

  // --- 자원 삭제 ---
  it("delete resource success", () => {
    const payload = { resId: 1, password: "1234" };
    const generator = deleteResource(deleteResourceRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { success: true, message: "자원 삭제 성공" } };
    const putStep = generator.next(mockResponse).value;

    // 응답에 resId 가 없더라도 saga 가 항상 resId 를 합쳐서 dispatch 하는지 확인
    expect(putStep).toEqual(
      put(deleteResourceSuccess({ success: true, message: "자원 삭제 성공", resId: 1 }))
    );
    expect(generator.next().done).toBe(true);
  });

  it("delete resource fail (비밀번호 불일치)", () => {
    const payload = { resId: 1, password: "wrong" };
    const generator = deleteResource(deleteResourceRequest(payload));
    generator.next();

    const mockError = {
      response: {
        data: { success: false, reason: "passwordMismatch", message: "비밀번호가 올바르지 않습니다." },
      },
    };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(
      put(deleteResourceFailure({ message: "비밀번호가 올바르지 않습니다.", reason: "passwordMismatch" }))
    );
    expect(generator.next().done).toBe(true);
  });

  it("delete resource fail (진행 중인 예약 존재)", () => {
    const payload = { resId: 1, password: "1234" };
    const generator = deleteResource(deleteResourceRequest(payload));
    generator.next();

    const mockError = {
      response: {
        data: {
          success: false,
          reason: "hasReservations",
          message: "이 자원에는 진행 중인 예약이 2건 있습니다. 예약을 먼저 취소하거나 완료한 뒤 다시 시도해주세요.",
        },
      },
    };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(
      put(
        deleteResourceFailure({
          message: "이 자원에는 진행 중인 예약이 2건 있습니다. 예약을 먼저 취소하거나 완료한 뒤 다시 시도해주세요.",
          reason: "hasReservations",
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  // --- 자원코드 중복 체크 ---
  it("check resCode success", () => {
    const generator = checkResCode(checkResCodeRequest("RES-001"));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { duplicate: true } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(checkResCodeSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("check resCode fail", () => {
    const generator = checkResCode(checkResCodeRequest("RES-001"));
    generator.next();

    const mockError = { response: { data: { message: "자원코드 중복확인 실패" } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(checkResCodeFailure("자원코드 중복확인 실패")));
    expect(generator.next().done).toBe(true);
  });

  // --- 예약 가능 자원 목록 조회 ---
  it("fetch reservable resources success", () => {
    const generator = fetchReservableResources(fetchReservableResourcesRequest({}));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: [{ resId: 1, resName: "대회의실", resStatus: "AVAILABLE" }] };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchReservableResourcesSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch reservable resources fail", () => {
    const generator = fetchReservableResources(fetchReservableResourcesRequest({}));
    generator.next();

    const mockError = { response: { data: { message: "예약 가능 자원 조회에 실패하였습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchReservableResourcesFailure("예약 가능 자원 조회에 실패하였습니다.")));
    expect(generator.next().done).toBe(true);
  });
});