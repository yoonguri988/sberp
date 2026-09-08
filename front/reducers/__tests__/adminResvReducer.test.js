// reducers/__tests__/adminResvReducer.test.js
import adminResvReducer, {
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

  resetAdminResvState,
} from '../resv/adminResvReducer';

// -----------------------------------------------------------
// 초기 상태 (adminResvReducer.js 의 initialState 와 동일해야 함)
// -----------------------------------------------------------
const initialState = {
  list: [],
  listCount: 0,
  stats: null,

  loading: false,
  error: null,
  success: false,
  message: null,
};

describe('adminResvReducer', () => {
  test('초기 상태를 반환한다', () => {
    expect(adminResvReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // ---------------------------------------------------------
  // 1) 예약 관리 목록 조회 (list)
  // ---------------------------------------------------------
  describe('fetchAdminResvList', () => {
    test('fetchAdminResvListRequest: loading true, error 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러' };
      const state = adminResvReducer(prevState, fetchAdminResvListRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchAdminResvListSuccess: list 반영', () => {
      const payload = [
        { revId: 1, resName: '대회의실', status: 'WAI' },
        { revId: 2, resName: '노트북 A', status: 'APP' },
      ];
      const state = adminResvReducer(initialState, fetchAdminResvListSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.list).toEqual(payload);
    });

    test('fetchAdminResvListSuccess: payload 없으면 빈 배열', () => {
      const state = adminResvReducer(initialState, fetchAdminResvListSuccess());

      expect(state.list).toEqual([]);
    });

    test('fetchAdminResvListFailure: error 반영', () => {
      const error = '예약 목록 조회 실패';
      const state = adminResvReducer({ ...initialState, loading: true }, fetchAdminResvListFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 2) 예약 관리 전체 개수 조회 (count)
  // ---------------------------------------------------------
  describe('fetchAdminResvCount', () => {
    test('fetchAdminResvCountRequest: loading true', () => {
      const state = adminResvReducer(initialState, fetchAdminResvCountRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchAdminResvCountSuccess: listCount 반영', () => {
      const state = adminResvReducer({ ...initialState, loading: true }, fetchAdminResvCountSuccess(23));

      expect(state.loading).toBe(false);
      expect(state.listCount).toBe(23);
    });

    test('fetchAdminResvCountSuccess: payload 없으면 0', () => {
      const state = adminResvReducer(initialState, fetchAdminResvCountSuccess());

      expect(state.listCount).toBe(0);
    });

    test('fetchAdminResvCountFailure: error 반영', () => {
      const error = '예약 개수 조회 실패';
      const state = adminResvReducer({ ...initialState, loading: true }, fetchAdminResvCountFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 3) 예약 통계 조회 (stats)
  // ---------------------------------------------------------
  describe('fetchAdminResvStats', () => {
    test('fetchAdminResvStatsRequest: loading true', () => {
      const state = adminResvReducer(initialState, fetchAdminResvStatsRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchAdminResvStatsSuccess: stats 반영', () => {
      const payload = { total: 20, approved: 12, waiting: 5, rejected: 3 };
      const state = adminResvReducer({ ...initialState, loading: true }, fetchAdminResvStatsSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.stats).toEqual(payload);
    });

    test('fetchAdminResvStatsFailure: error 반영', () => {
      const error = '예약 통계 조회 실패';
      const state = adminResvReducer({ ...initialState, loading: true }, fetchAdminResvStatsFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 4) 예약 승인 (approve)
  // ---------------------------------------------------------
  describe('approveResv', () => {
    test('approveResvRequest: loading true, error/success 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true };
      const state = adminResvReducer(prevState, approveResvRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('approveResvSuccess: 목록 내 해당 예약의 status 를 APP 로 즉시 반영한다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        list: [
          { revId: 1, resName: '대회의실', status: 'WAI' },
          { revId: 2, resName: '노트북 A', status: 'WAI' },
        ],
      };
      const payload = { success: true, message: '예약이 승인되었습니다.', revId: 1 };
      const state = adminResvReducer(prevState, approveResvSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('예약이 승인되었습니다.');
      expect(state.list[0].status).toBe('APP');
      expect(state.list[1].status).toBe('WAI'); // 다른 예약은 영향 없음
    });

    test('approveResvSuccess: 목록에 없는 revId 는 조용히 무시한다', () => {
      const prevState = {
        ...initialState,
        list: [{ revId: 1, resName: '대회의실', status: 'WAI' }],
      };
      const payload = { success: true, message: '예약이 승인되었습니다.', revId: 999 };
      const state = adminResvReducer(prevState, approveResvSuccess(payload));

      expect(state.list).toEqual(prevState.list);
    });

    test('approveResvFailure: error 반영', () => {
      const error = '본인 소속 회사의 예약만 승인할 수 있습니다.';
      const state = adminResvReducer({ ...initialState, loading: true }, approveResvFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 5) 예약 반려 (reject)
  // ---------------------------------------------------------
  describe('rejectResv', () => {
    test('rejectResvRequest: loading true, error/success 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true };
      const state = adminResvReducer(prevState, rejectResvRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('rejectResvSuccess: 목록 내 해당 예약의 status/rejectReason 을 즉시 반영한다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        list: [{ revId: 1, resName: '대회의실', status: 'WAI' }],
      };
      const payload = {
        success: true,
        message: '예약이 반려되었습니다.',
        revId: 1,
        rejectReason: '기간이 겹칩니다.',
      };
      const state = adminResvReducer(prevState, rejectResvSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('예약이 반려되었습니다.');
      expect(state.list[0].status).toBe('REJ');
      expect(state.list[0].rejectReason).toBe('기간이 겹칩니다.');
    });

    test('rejectResvFailure: error 반영', () => {
      const error = '본인 소속 회사의 예약만 반려할 수 있습니다.';
      const state = adminResvReducer({ ...initialState, loading: true }, rejectResvFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 6) 공통 상태 초기화
  // ---------------------------------------------------------
  describe('resetAdminResvState', () => {
    test('loading/error/success/message 를 초기값으로 되돌린다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        error: '에러 발생',
        success: true,
        message: '예약이 승인되었습니다.',
        // 리셋 대상이 아닌 값은 유지되어야 한다
        list: [{ revId: 1, status: 'APP' }],
      };
      const state = adminResvReducer(prevState, resetAdminResvState());

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.message).toBeNull();
      expect(state.list).toEqual(prevState.list);
    });
  });
});