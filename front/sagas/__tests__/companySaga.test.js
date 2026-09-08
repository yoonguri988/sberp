// sagas/__tests__/companySaga.test.js

import { call, put } from "redux-saga/effects";
import Cookies from "js-cookie";
import api from "../../api/axios";

import {
    addCompany,
    fetchCompanyList,
    fetchCompanyDetail,
    updateCompany,
    deleteCompany,
    checkBizNo,
    suggestCompany,
    fetchCompanyStats,
    fetchMyCompany,
} from "../com/companySaga";

import {
  addCompanyRequest,
  addCompanySuccess,
  addCompanyFailure,

  fetchCompanyListRequest,
  fetchCompanyListSuccess,
  fetchCompanyListFailure,

  fetchCompanyDetailRequest,
  fetchCompanyDetailSuccess,
  fetchCompanyDetailFailure,

  updateCompanyRequest,
  updateCompanySuccess,
  updateCompanyFailure,

  deleteCompanyRequest,
  deleteCompanySuccess,
  deleteCompanyFailure,

  checkBizNoRequest,
  checkBizNoSuccess,
  checkBizNoFailure,

  suggestCompanyRequest,
  suggestCompanySuccess,
  suggestCompanyFailure,

  fetchCompanyStatsRequest,
  fetchCompanyStatsSuccess,
  fetchCompanyStatsFailure,

  fetchMyCompanyRequest,
  fetchMyCompanySuccess,
  fetchMyCompanyFailure,
} from '../../reducers/com/companyReducer';

describe("company saga", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
 
  // --- 회사 등록 ---
  it("add company success", () => {
    const payload = {
      dto: { comName: "위세아이텍", bizNo: "123-45-67890" },
      logoFile: { name: "logo.png" },
    };
    const generator = addCompany(addCompanyRequest(payload));
 
    // 1단계: API 호출 (call)
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");
 
    // 2단계: API 성공했다는 가정하에 결과값 전달
    const mockResponse = { data: { message: "회사 등록에 성공하였습니다." } };
    const putStep = generator.next(mockResponse).value;
 
    // 3단계: 성공 액션 디스패치 확인
    expect(putStep).toEqual(put(addCompanySuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true); // 제너레이터 완전종료
  });
 
  it("add company fail", () => {
    const payload = { dto: { comName: "위세아이텍" }, logoFile: null };
    const generator = addCompany(addCompanyRequest(payload));
 
    generator.next(); // call 단계 통과
 
    const mockError = { response: { data: { message: "사업자등록번호가 중복됩니다." } } };
    const putStep = generator.throw(mockError).value;
 
    expect(putStep).toEqual(put(addCompanyFailure("사업자등록번호가 중복됩니다.")));
    expect(generator.next().done).toBe(true);
  });
 
  // --- 회사 목록 조회 ---
  it("fetch company list success", () => {
    const payload = { keyword: "위세", pstartno: 1, onepagelist: 10 };
    const generator = fetchCompanyList(fetchCompanyListRequest(payload));
 
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");
 
    const mockResponse = { data: { items: [{ comId: 1, comName: "위세아이텍" }], paging: { listTotal: 1 } } };
    const putStep = generator.next(mockResponse).value;
 
    expect(putStep).toEqual(put(fetchCompanyListSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });
 
  it("fetch company list fail", () => {
    const generator = fetchCompanyList(fetchCompanyListRequest({}));
    generator.next();
 
    const mockError = { response: { data: { message: "목록 조회 실패" } } };
    const putStep = generator.throw(mockError).value;
 
    expect(putStep).toEqual(put(fetchCompanyListFailure("목록 조회 실패")));
    expect(generator.next().done).toBe(true);
  });
 
  // --- 회사 상세 조회 ---
  it("fetch company detail success", () => {
    const generator = fetchCompanyDetail(fetchCompanyDetailRequest(1));
 
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");
 
    const mockResponse = { data: { com: { comId: 1 }, deptStats: {}, deptList: [] } };
    const putStep = generator.next(mockResponse).value;
 
    expect(putStep).toEqual(put(fetchCompanyDetailSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });
 
  it("fetch company detail fail", () => {
    const generator = fetchCompanyDetail(fetchCompanyDetailRequest(999));
    generator.next();
 
    const mockError = { response: { data: { message: "존재하지 않는 회사입니다." } } };
    const putStep = generator.throw(mockError).value;
 
    expect(putStep).toEqual(put(fetchCompanyDetailFailure("존재하지 않는 회사입니다.")));
    expect(generator.next().done).toBe(true);
  });
 
  // --- 회사 수정 ---
  it("update company success", () => {
    const payload = { comId: 1, dto: { comName: "위세아이텍(수정)" }, logoFile: null };
    const generator = updateCompany(updateCompanyRequest(payload));
 
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");
 
    const mockResponse = { data: { message: "회사 정보 수정에 성공하였습니다." } };
    const putStep = generator.next(mockResponse).value;
 
    expect(putStep).toEqual(put(updateCompanySuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });
 
  it("update company fail", () => {
    const payload = { comId: 1, dto: {}, logoFile: null };
    const generator = updateCompany(updateCompanyRequest(payload));
    generator.next();
 
    const mockError = { response: { data: { message: "수정 권한이 없습니다." } } };
    const putStep = generator.throw(mockError).value;
 
    expect(putStep).toEqual(put(updateCompanyFailure("수정 권한이 없습니다.")));
    expect(generator.next().done).toBe(true);
  });
 
  // --- 회사 삭제 ---
  it("delete company success", () => {
    const payload = { comId: 1, password: "1234" };
    const generator = deleteCompany(deleteCompanyRequest(payload));
 
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");
 
    const mockResponse = { data: { message: "회사가 삭제되었습니다." } };
    const putStep = generator.next(mockResponse).value;
 
    // 응답 데이터에 comId 가 합쳐져서 dispatch 되는지 확인 (목록에서 제거용)
    expect(putStep).toEqual(
      put(deleteCompanySuccess({ message: "회사가 삭제되었습니다.", comId: 1 }))
    );
    expect(generator.next().done).toBe(true);
  });
 
  it("delete company fail", () => {
    const payload = { comId: 1, password: "wrong" };
    const generator = deleteCompany(deleteCompanyRequest(payload));
    generator.next();
 
    const mockError = { response: { data: { message: "비밀번호가 올바르지 않습니다." } } };
    const putStep = generator.throw(mockError).value;
 
    expect(putStep).toEqual(put(deleteCompanyFailure("비밀번호가 올바르지 않습니다.")));
    expect(generator.next().done).toBe(true);
  });
 
  // --- 사업자번호 중복확인 ---
  it("check bizNo success", () => {
    const generator = checkBizNo(checkBizNoRequest("123-45-67890"));
 
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");
 
    const mockResponse = { data: { duplicate: true } };
    const putStep = generator.next(mockResponse).value;
 
    expect(putStep).toEqual(put(checkBizNoSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });
 
  it("check bizNo fail", () => {
    const generator = checkBizNo(checkBizNoRequest("123-45-67890"));
    generator.next();
 
    const mockError = { response: { data: { message: "중복확인 실패" } } };
    const putStep = generator.throw(mockError).value;
 
    expect(putStep).toEqual(put(checkBizNoFailure("중복확인 실패")));
    expect(generator.next().done).toBe(true);
  });
 
  // --- 회사명 자동완성 ---
  it("suggest company success", () => {
    const generator = suggestCompany(suggestCompanyRequest("위세"));
 
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");
 
    const mockResponse = { data: [{ comId: 1, comName: "위세아이텍" }] };
    const putStep = generator.next(mockResponse).value;
 
    expect(putStep).toEqual(put(suggestCompanySuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });
 
  it("suggest company with empty keyword skips API call", () => {
    const generator = suggestCompany(suggestCompanyRequest("   "));
 
    // keyword 가 비어있으면 call 없이 바로 put
    const putStep = generator.next().value;
    expect(putStep).toEqual(put(suggestCompanySuccess([])));
    expect(generator.next().done).toBe(true);
  });
 
  it("suggest company fail", () => {
    const generator = suggestCompany(suggestCompanyRequest("위세"));
    generator.next();
 
    const mockError = { response: { data: { message: "자동완성 조회 실패" } } };
    const putStep = generator.throw(mockError).value;
 
    expect(putStep).toEqual(put(suggestCompanyFailure("자동완성 조회 실패")));
    expect(generator.next().done).toBe(true);
  });
 
  // --- 회사 통계 조회 ---
  it("fetch company stats success", () => {
    const generator = fetchCompanyStats(fetchCompanyStatsRequest());
 
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");
 
    const mockResponse = { data: { totalComCount: 10, totalEmpCount: 120, totalIndustryCount: 5 } };
    const putStep = generator.next(mockResponse).value;
 
    expect(putStep).toEqual(put(fetchCompanyStatsSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });
 
  it("fetch company stats fail", () => {
    const generator = fetchCompanyStats(fetchCompanyStatsRequest());
    generator.next();
 
    const mockError = { response: { data: { message: "통계 조회 실패" } } };
    const putStep = generator.throw(mockError).value;
 
    expect(putStep).toEqual(put(fetchCompanyStatsFailure("통계 조회 실패")));
    expect(generator.next().done).toBe(true);
  });
 
  // --- 내 회사 정보 조회 ---
  it("fetch my company success", () => {
    const generator = fetchMyCompany(fetchMyCompanyRequest());
 
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");
 
    const mockResponse = { data: { com: { comId: 1 }, deptStats: {}, deptList: [] } };
    const putStep = generator.next(mockResponse).value;
 
    expect(putStep).toEqual(put(fetchMyCompanySuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });
 
  it("fetch my company fail", () => {
    const generator = fetchMyCompany(fetchMyCompanyRequest());
    generator.next();
 
    const mockError = { response: { data: { message: "내 회사 조회 실패" } } };
    const putStep = generator.throw(mockError).value;
 
    expect(putStep).toEqual(put(fetchMyCompanyFailure("내 회사 조회 실패")));
    expect(generator.next().done).toBe(true);
  });
});