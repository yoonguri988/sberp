// sagas/__tests__/apiUtilSaga.test.js
import { put } from "redux-saga/effects";

import { verifyBizNo, processOcr } from "../api/apiUtilSaga";

import {
  verifyBizNoRequest,
  verifyBizNoSuccess,
  verifyBizNoFailure,

  processOcrRequest,
  processOcrSuccess,
  processOcrFailure,
} from "../../reducers/api/apiUtilReducer";

describe("api util saga", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- 사업자등록번호 진위확인 ---
  it("verify bizNo success", () => {
    const payload = { bizNo: "123-45-67890", startDt: "2024-01-01", ceoName: "홍길동" };
    const generator = verifyBizNo(verifyBizNoRequest(payload));

    // 1단계: API 호출 (call)
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    // 2단계: API 성공했다는 가정하에 결과값 전달
    const mockResponse = {
      data: {
        status_code: "OK",
        data: [{ b_no: "1234567890", b_stt: "계속사업자" }],
      },
    };
    const putStep = generator.next(mockResponse).value;

    // 3단계: 성공 액션 디스패치 확인
    expect(putStep).toEqual(put(verifyBizNoSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true); // 제너레이터 완전종료
  });

  it("verify bizNo fail", () => {
    const payload = { bizNo: "123-45-67890", startDt: "2024-01-01", ceoName: "홍길동" };
    const generator = verifyBizNo(verifyBizNoRequest(payload));
    generator.next();

    const mockError = {
      response: { data: { status: "error", message: "사업자번호 진위확인 중 오류가 발생했습니다." } },
    };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(verifyBizNoFailure("사업자번호 진위확인 중 오류가 발생했습니다.")));
    expect(generator.next().done).toBe(true);
  });

  it("verify bizNo fail with no response (기본 메시지 사용)", () => {
    const payload = { bizNo: "123-45-67890" };
    const generator = verifyBizNo(verifyBizNoRequest(payload));
    generator.next();

    const mockError = {};
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(verifyBizNoFailure("사업자번호 진위확인 중 오류가 발생했습니다.")));
    expect(generator.next().done).toBe(true);
  });

  // --- 명함/사업자등록증 OCR ---
  it("process ocr success", () => {
    const file = { name: "card.png" };
    const generator = processOcr(processOcrRequest(file));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = {
      data: {
        status: "success",
        data: { comName: "위세아이텍", bizNo: "123-45-67890", ceoName: "홍길동" },
      },
    };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(processOcrSuccess(mockResponse.data)));
    expect(generator.next().done).toBe(true);
  });

  it("process ocr fail", () => {
    const file = { name: "card.png" };
    const generator = processOcr(processOcrRequest(file));
    generator.next();

    const mockError = { response: { data: { status: "error", message: "OCR 처리 중 오류가 발생했습니다." } } };
    const putStep = generator.throw(mockError).value;

    expect(putStep).toEqual(put(processOcrFailure("OCR 처리 중 오류가 발생했습니다.")));
    expect(generator.next().done).toBe(true);
  });
});