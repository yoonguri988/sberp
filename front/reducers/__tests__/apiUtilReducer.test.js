// reducers/__tests__/apiUtilReducer.test.js
import apiUtilReducer, {
  verifyBizNoRequest,
  verifyBizNoSuccess,
  verifyBizNoFailure,

  processOcrRequest,
  processOcrSuccess,
  processOcrFailure,

  resetApiUtilState,
} from '../api/apiUtilReducer';

// -----------------------------------------------------------
// 초기 상태 (apiUtilReducer.js 의 initialState 와 동일해야 함)
// -----------------------------------------------------------
const initialState = {
  bizNoVerifyResult: null,
  ocrResult: null,

  loading: false,
  error: null,
  success: false,
  message: null,
};

describe('apiUtilReducer', () => {
  test('초기 상태를 반환한다', () => {
    expect(apiUtilReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // ---------------------------------------------------------
  // 1) 사업자등록번호 진위확인 (verify)
  // ---------------------------------------------------------
  describe('verifyBizNo', () => {
    test('verifyBizNoRequest: loading true, error/success/bizNoVerifyResult 초기화', () => {
      const prevState = {
        ...initialState,
        error: '이전 에러',
        success: true,
        bizNoVerifyResult: { status: 'error' },
      };
      const state = apiUtilReducer(prevState, verifyBizNoRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.bizNoVerifyResult).toBeNull();
    });

    test('verifyBizNoSuccess: bizNoVerifyResult 반영', () => {
      const payload = {
        status_code: 'OK',
        data: [{ b_no: '1234567890', b_stt: '계속사업자', tax_type: '부가가치세 일반과세자' }],
      };
      const state = apiUtilReducer({ ...initialState, loading: true }, verifyBizNoSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.bizNoVerifyResult).toEqual(payload);
    });

    test('verifyBizNoFailure: error 반영', () => {
      const error = '사업자번호 진위확인 중 오류가 발생했습니다.';
      const state = apiUtilReducer({ ...initialState, loading: true }, verifyBizNoFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 2) 명함/사업자등록증 OCR (processOcr)
  // ---------------------------------------------------------
  describe('processOcr', () => {
    test('processOcrRequest: loading true, error/success/ocrResult 초기화', () => {
      const prevState = {
        ...initialState,
        error: '이전 에러',
        success: true,
        ocrResult: { comName: '위세아이텍' },
      };
      const state = apiUtilReducer(prevState, processOcrRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.ocrResult).toBeNull();
    });

    test('processOcrSuccess: payload.data 를 ocrResult 로 반영한다', () => {
      const payload = {
        status: 'success',
        data: { comName: '위세아이텍', bizNo: '123-45-67890', ceoName: '홍길동' },
      };
      const state = apiUtilReducer({ ...initialState, loading: true }, processOcrSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.ocrResult).toEqual(payload.data);
    });

    test('processOcrSuccess: data 가 없으면 ocrResult 는 null', () => {
      const state = apiUtilReducer(initialState, processOcrSuccess({ status: 'success' }));

      expect(state.ocrResult).toBeNull();
    });

    test('processOcrFailure: error 반영', () => {
      const error = 'OCR 처리 중 오류가 발생했습니다.';
      const state = apiUtilReducer({ ...initialState, loading: true }, processOcrFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 3) 공통 상태 초기화
  // ---------------------------------------------------------
  describe('resetApiUtilState', () => {
    test('loading/error/success/message 를 초기값으로 되돌린다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        error: '에러 발생',
        success: true,
        message: '완료',
        // 리셋 대상이 아닌 값은 유지되어야 한다
        ocrResult: { comName: '위세아이텍' },
      };
      const state = apiUtilReducer(prevState, resetApiUtilState());

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.message).toBeNull();
      expect(state.ocrResult).toEqual(prevState.ocrResult);
    });
  });
});