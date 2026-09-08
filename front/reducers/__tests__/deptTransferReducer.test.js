// reducers/__tests__/deptTransferReducer.test.js
import deptTransferReducer, {
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

  resetDeptTransferState,
} from '../dept/deptTransferReducer';

// -----------------------------------------------------------
// 초기 상태 (deptTransferReducer.js 의 initialState 와 동일해야 함)
// -----------------------------------------------------------
const initialState = {
  impact: null,
  pendingList: [],
  logs: [],
  logTotal: 0,
  deptOptions: [],
  executeReason: null,

  loading: false,
  error: null,
  success: false,
  message: null,
};

describe('deptTransferReducer', () => {
  test('초기 상태를 반환한다', () => {
    expect(deptTransferReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // ---------------------------------------------------------
  // 1) 부서 이관 영향도 조회 (impact)
  // ---------------------------------------------------------
  describe('fetchImpact', () => {
    test('fetchImpactRequest: loading true, impact 초기화', () => {
      const prevState = { ...initialState, impact: { pendingEmpCount: 3 } };
      const state = deptTransferReducer(prevState, fetchImpactRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.impact).toBeNull();
    });

    test('fetchImpactSuccess: impact 반영', () => {
      const payload = {
        pendingEmpCount: 3,
        candidateDepts: [{ deptId: 2, deptName: '인사팀' }],
        aiSuggestion: { deptId: 2, reason: '업무 유사도가 높음' },
      };
      const state = deptTransferReducer(initialState, fetchImpactSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.impact).toEqual(payload);
    });

    test('fetchImpactFailure: error 반영', () => {
      const error = '존재하지 않는 부서입니다.';
      const state = deptTransferReducer({ ...initialState, loading: true }, fetchImpactFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 2) 이관 취소 (cancel)
  // ---------------------------------------------------------
  describe('cancelTransfer', () => {
    test('cancelTransferRequest: loading true, error/success 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true };
      const state = deptTransferReducer(prevState, cancelTransferRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('cancelTransferSuccess: success true, pendingList 에서 해당 deptId 제거', () => {
      const prevState = {
        ...initialState,
        loading: true,
        pendingList: [
          { deptId: 5, deptName: '개발팀' },
          { deptId: 6, deptName: '영업팀' },
        ],
      };
      const payload = { success: true, message: '부서 삭제를 취소했습니다.', deptId: 5 };
      const state = deptTransferReducer(prevState, cancelTransferSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('부서 삭제를 취소했습니다.');
      expect(state.pendingList).toEqual([{ deptId: 6, deptName: '영업팀' }]);
    });

    test('cancelTransferSuccess: payload 없어도 기본 메시지를 사용한다', () => {
      const state = deptTransferReducer(initialState, cancelTransferSuccess());

      expect(state.success).toBe(true);
      expect(state.message).toBe('부서 삭제를 취소했습니다.');
    });

    test('cancelTransferFailure: error 반영', () => {
      const error = '본인 소속 회사의 부서만 취소할 수 있습니다.';
      const state = deptTransferReducer({ ...initialState, loading: true }, cancelTransferFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 3) 이관 최종 실행 (execute)
  // ---------------------------------------------------------
  describe('executeTransfer', () => {
    test('executeTransferRequest: loading true, error/success/executeReason 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true, executeReason: 'PREV_REASON' };
      const state = deptTransferReducer(prevState, executeTransferRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.executeReason).toBeNull();
    });

    test('executeTransferSuccess: success true, message 반영', () => {
      const payload = { success: true, message: '사원 이관이 완료되었습니다.' };
      const state = deptTransferReducer({ ...initialState, loading: true }, executeTransferSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('사원 이관이 완료되었습니다.');
    });

    test('executeTransferFailure: message/reason 을 분리해서 반영한다', () => {
      const payload = { message: '이관 대상 사원이 남아있습니다.', reason: 'REMAINING_EMPLOYEES' };
      const state = deptTransferReducer({ ...initialState, loading: true }, executeTransferFailure(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe('이관 대상 사원이 남아있습니다.');
      expect(state.executeReason).toBe('REMAINING_EMPLOYEES');
    });

    test('executeTransferFailure: reason 이 없으면 executeReason 은 null', () => {
      const payload = { message: '이관 처리 중 오류가 발생했습니다.' };
      const state = deptTransferReducer({ ...initialState, loading: true }, executeTransferFailure(payload));

      expect(state.error).toBe('이관 처리 중 오류가 발생했습니다.');
      expect(state.executeReason).toBeNull();
    });
  });

  // ---------------------------------------------------------
  // 4) 이관 대기 부서 목록 조회 (pending)
  // ---------------------------------------------------------
  describe('fetchPendingList', () => {
    test('fetchPendingListRequest: loading true', () => {
      const state = deptTransferReducer(initialState, fetchPendingListRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchPendingListSuccess: pendingList 반영', () => {
      const payload = [
        { deptId: 5, deptName: '개발팀', empCount: 3 },
        { deptId: 6, deptName: '영업팀', empCount: 1 },
      ];
      const state = deptTransferReducer(initialState, fetchPendingListSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.pendingList).toEqual(payload);
    });

    test('fetchPendingListSuccess: payload 없으면 빈 배열', () => {
      const state = deptTransferReducer(initialState, fetchPendingListSuccess());

      expect(state.pendingList).toEqual([]);
    });

    test('fetchPendingListFailure: error 반영', () => {
      const error = '이관 대기 목록 조회 실패';
      const state = deptTransferReducer({ ...initialState, loading: true }, fetchPendingListFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 5) 부서 이관 이력 조회 (log)
  // ---------------------------------------------------------
  describe('fetchTransferLog', () => {
    test('fetchTransferLogRequest: loading true', () => {
      const state = deptTransferReducer(initialState, fetchTransferLogRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchTransferLogSuccess: logs/logTotal/deptOptions 반영', () => {
      const payload = {
        total: 2,
        logs: [
          { logId: 1, fromDeptName: '개발팀', toDeptName: '인사팀' },
          { logId: 2, fromDeptName: '영업팀', toDeptName: '마케팅팀' },
        ],
        deptOptions: [{ deptId: 1, deptName: '경영지원본부' }],
      };
      const state = deptTransferReducer(initialState, fetchTransferLogSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.logs).toEqual(payload.logs);
      expect(state.logTotal).toBe(2);
      expect(state.deptOptions).toEqual(payload.deptOptions);
    });

    test('fetchTransferLogSuccess: 필드 없으면 안전한 기본값을 사용한다', () => {
      const state = deptTransferReducer(initialState, fetchTransferLogSuccess({}));

      expect(state.logs).toEqual([]);
      expect(state.logTotal).toBe(0);
      expect(state.deptOptions).toEqual([]);
    });

    test('fetchTransferLogFailure: error 반영', () => {
      const error = '이관 이력 조회 실패';
      const state = deptTransferReducer({ ...initialState, loading: true }, fetchTransferLogFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 6) 공통 상태 초기화
  // ---------------------------------------------------------
  describe('resetDeptTransferState', () => {
    test('loading/error/success/message/executeReason 을 초기값으로 되돌린다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        error: '에러 발생',
        success: true,
        message: '사원 이관이 완료되었습니다.',
        executeReason: 'REMAINING_EMPLOYEES',
        // 리셋 대상이 아닌 값은 유지되어야 한다
        pendingList: [{ deptId: 5 }],
      };
      const state = deptTransferReducer(prevState, resetDeptTransferState());

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.message).toBeNull();
      expect(state.executeReason).toBeNull();
      expect(state.pendingList).toEqual(prevState.pendingList);
    });
  });
});