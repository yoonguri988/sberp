// sagas/__tests__/deptSaga.test.js
import { put } from "redux-saga/effects";

import {
  fetchDeptList,
  fetchDeptFlat,
  addDept,
  fetchDeptDetail,
  fetchMyDept,
  updateDept,
  deleteDept,
  checkDeptCode,
  fetchAncestorDepts,
  fetchDeptEmpList,
} from "../dept/deptSaga";

import {
  fetchDeptListRequest,
  fetchDeptListSuccess,
  fetchDeptListFailure,

  fetchDeptFlatRequest,
  fetchDeptFlatSuccess,
  fetchDeptFlatFailure,

  addDeptRequest,
  addDeptSuccess,
  addDeptFailure,

  fetchDeptDetailRequest,
  fetchDeptDetailSuccess,
  fetchDeptDetailFailure,

  fetchMyDeptRequest,
  fetchMyDeptSuccess,
  fetchMyDeptFailure,

  updateDeptRequest,
  updateDeptSuccess,
  updateDeptFailure,

  deleteDeptRequest,
  deleteDeptSuccess,
  deleteDeptFailure,

  checkDeptCodeRequest,
  checkDeptCodeSuccess,
  checkDeptCodeFailure,

  fetchAncestorDeptsRequest,
  fetchAncestorDeptsSuccess,
  fetchAncestorDeptsFailure,

  fetchDeptEmpListRequest,
  fetchDeptEmpListSuccess,
  fetchDeptEmpListFailure,
} from "../../reducers/dept/deptReducer";

describe("dept saga", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- 부서 조직도 조회 ---
  it("fetch dept list success", () => {
    const generator = fetchDeptList(fetchDeptListRequest(1));

    // 1단계: API 호출 (call)
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    // 2단계: API 성공했다는 가정하에 결과값 전달
    const mockResponse = {
      data: { comId: 1, stats: { deptCount: 5 }, items: [{ deptId: 1, deptName: "경영지원본부" }] },
    };
    const putStep = generator.next(mockResponse).value;

    // 3단계: 성공 액션 디스패치 확인
    expect(putStep).toEqual(put(fetchDeptListSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true); // 제너레이터 완전종료
  });

  it("fetch dept list fail", () => {
    const generator = fetchDeptList(fetchDeptListRequest(1));
    generator.next();

    const mockError = { response: { data: { message: "본인 소속 회사만 조회할 수 있습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchDeptListFailure("본인 소속 회사만 조회할 수 있습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 부서 목록 평탄화 조회 ---
  it("fetch dept flat success", () => {
    const generator = fetchDeptFlat(fetchDeptFlatRequest(1));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: [{ deptId: 1, deptName: "경영지원본부", depth: 0 }] };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchDeptFlatSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch dept flat fail", () => {
    const generator = fetchDeptFlat(fetchDeptFlatRequest(1));
    generator.next();

    const mockError = { response: { data: { message: "본인 소속 회사만 조회할 수 있습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchDeptFlatFailure("본인 소속 회사만 조회할 수 있습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 부서 등록 ---
  it("add dept success", () => {
    const payload = { comId: 1, parentId: null, deptName: "개발팀", deptCode: "DEV" };
    const generator = addDept(addDeptRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { message: "부서 등록에 성공하였습니다." } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(addDeptSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("add dept fail", () => {
    const payload = { comId: 1, parentId: 999, deptName: "개발팀" };
    const generator = addDept(addDeptRequest(payload));
    generator.next();

    const mockError = { response: { data: { message: "존재하지 않는 상위부서입니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(addDeptFailure("존재하지 않는 상위부서입니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 부서 상세 조회 ---
  it("fetch dept detail success", () => {
    const generator = fetchDeptDetail(fetchDeptDetailRequest(1));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = {
      data: { dept: { deptId: 1, deptName: "인사팀" }, ancestorChain: ["경영지원본부", "인사팀"] },
    };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchDeptDetailSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch dept detail fail", () => {
    const generator = fetchDeptDetail(fetchDeptDetailRequest(999));
    generator.next();

    const mockError = { response: { data: { message: "존재하지 않는 부서입니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchDeptDetailFailure("존재하지 않는 부서입니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 내 부서 상세 조회 ---
  it("fetch my dept success", () => {
    const generator = fetchMyDept(fetchMyDeptRequest());

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { dept: { deptId: 2, deptName: "인사팀" }, ancestorChain: ["인사팀"] } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchMyDeptSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch my dept fail", () => {
    const generator = fetchMyDept(fetchMyDeptRequest());
    generator.next();

    const mockError = { response: { data: { message: "내 부서 조회 실패" } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchMyDeptFailure("내 부서 조회 실패")));
    expect(generator.next().done).toBe(true);
  });

  // --- 부서 수정 ---
  it("update dept success", () => {
    const payload = { deptId: 1, dto: { deptName: "인사팀(수정)" } };
    const generator = updateDept(updateDeptRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { message: "부서 수정에 성공하였습니다." } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(updateDeptSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("update dept fail", () => {
    const payload = { deptId: 1, dto: { parentId: 3 } };
    const generator = updateDept(updateDeptRequest(payload));
    generator.next();

    const mockError = { response: { data: { message: "순환참조가 발생하여 이동할 수 없습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(updateDeptFailure("순환참조가 발생하여 이동할 수 없습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 부서 삭제 ---
  it("delete dept success (완전 삭제)", () => {
    const generator = deleteDept(deleteDeptRequest(2));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { message: "부서 삭제에 성공하였습니다." } };
    const putStep = generator.next(mockResponse).value;

    // 응답에 deptId 가 없더라도 saga 가 항상 deptId 를 합쳐서 dispatch 하는지 확인
    expect(putStep).toEqual(
      put(deleteDeptSuccess({ message: "부서 삭제에 성공하였습니다.", deptId: 2 }))
    );
    expect(generator.next().done).toBe(true);
  });

  it("delete dept success (이관대기 전환)", () => {
    const generator = deleteDept(deleteDeptRequest(2));
    generator.next();

    const mockResponse = {
      data: {
        message: "사원이 존재해 삭제 대신 이관 대기 상태로 전환되었습니다.",
        pendingTransfer: true,
        deptId: 2,
      },
    };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(deleteDeptSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("delete dept fail", () => {
    const generator = deleteDept(deleteDeptRequest(2));
    generator.next();

    const mockError = { response: { data: { message: "하위 부서가 존재하여 삭제할 수 없습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(deleteDeptFailure("하위 부서가 존재하여 삭제할 수 없습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 부서코드 중복확인 ---
  it("check dept code success", () => {
    const generator = checkDeptCode(checkDeptCodeRequest({ deptCode: "DEV" }));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { duplicate: false } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(checkDeptCodeSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("check dept code fail", () => {
    const generator = checkDeptCode(checkDeptCodeRequest({ deptCode: "DEV" }));
    generator.next();

    const mockError = { response: { data: { message: "부서코드 중복확인 실패" } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(checkDeptCodeFailure("부서코드 중복확인 실패")));
    expect(generator.next().done).toBe(true);
  });

  // --- 상위 계층 부서 목록 ---
  it("fetch ancestor depts success", () => {
    const generator = fetchAncestorDepts(fetchAncestorDeptsRequest(5));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: [{ deptId: 1, deptName: "경영지원본부" }] };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchAncestorDeptsSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch ancestor depts fail", () => {
    const generator = fetchAncestorDepts(fetchAncestorDeptsRequest(5));
    generator.next();

    const mockError = { response: { data: { message: "본인 소속 회사의 부서만 조회할 수 있습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchAncestorDeptsFailure("본인 소속 회사의 부서만 조회할 수 있습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 부서(+하위부서) 소속 사원 목록 ---
  it("fetch dept emp list success", () => {
    const generator = fetchDeptEmpList(fetchDeptEmpListRequest(2));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = {
      data: {
        list: [
          { empId: 10, empName: "홍길동", deptId: 2 },
          { empId: 11, empName: "김철수", deptId: 2 },
        ],
      },
    };
    const putStep = generator.next(mockResponse).value;

    // saga 는 응답의 list 만 뽑아서 성공 액션에 담아야 한다
    expect(putStep).toEqual(put(fetchDeptEmpListSuccess(mockResponse.data.list)));
    expect(generator.next().done).toBe(true);
  });

  it("fetch dept emp list success: list 없으면 빈 배열로 처리한다", () => {
    const generator = fetchDeptEmpList(fetchDeptEmpListRequest(2));
    generator.next();

    const mockResponse = { data: {} };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(fetchDeptEmpListSuccess([])));
    expect(generator.next().done).toBe(true);
  });

  it("fetch dept emp list fail", () => {
    const generator = fetchDeptEmpList(fetchDeptEmpListRequest(2));
    generator.next();

    const mockError = { response: { data: { message: "본인 소속 회사의 부서만 조회할 수 있습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(fetchDeptEmpListFailure("본인 소속 회사의 부서만 조회할 수 있습니다.")));
    expect(generator.next().done).toBe(true);
  });
});