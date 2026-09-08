// reducers/__tests__/resourceReducer.test.js
import resourceReducer, {
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

  resetResourceState,
} from '../res/resourceReducer';

// -----------------------------------------------------------
// 초기 상태 (resourceReducer.js 의 initialState 와 동일해야 함)
// -----------------------------------------------------------
const initialState = {
  list: [],
  listCount: 0,
  detail: null,
  reservableList: [],
  resCodeCheck: {
    checked: false,
    duplicate: false,
  },
  addReason: null,
  deleteReason: null,

  loading: false,
  error: null,
  success: false,
  message: null,
};

describe('resourceReducer', () => {
  test('초기 상태를 반환한다', () => {
    expect(resourceReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // ---------------------------------------------------------
  // 1) 자원 목록 조회 (list)
  // ---------------------------------------------------------
  describe('fetchResourceList', () => {
    test('fetchResourceListRequest: loading true, error 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러' };
      const state = resourceReducer(prevState, fetchResourceListRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchResourceListSuccess: list 반영', () => {
      const payload = [
        { resId: 1, resName: '대회의실', resCode: 'RES-001' },
        { resId: 2, resName: '노트북 A', resCode: 'RES-002' },
      ];
      const state = resourceReducer(initialState, fetchResourceListSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.list).toEqual(payload);
    });

    test('fetchResourceListSuccess: payload 없으면 빈 배열', () => {
      const state = resourceReducer(initialState, fetchResourceListSuccess());

      expect(state.list).toEqual([]);
    });

    test('fetchResourceListFailure: error 반영', () => {
      const error = '목록 조회 실패';
      const state = resourceReducer({ ...initialState, loading: true }, fetchResourceListFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 2) 자원 전체 개수 조회 (count)
  // ---------------------------------------------------------
  describe('fetchResourceCount', () => {
    test('fetchResourceCountRequest: loading true', () => {
      const state = resourceReducer(initialState, fetchResourceCountRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchResourceCountSuccess: listCount 반영', () => {
      const state = resourceReducer({ ...initialState, loading: true }, fetchResourceCountSuccess(15));

      expect(state.loading).toBe(false);
      expect(state.listCount).toBe(15);
    });

    test('fetchResourceCountSuccess: payload 없으면 0', () => {
      const state = resourceReducer(initialState, fetchResourceCountSuccess());

      expect(state.listCount).toBe(0);
    });

    test('fetchResourceCountFailure: error 반영', () => {
      const error = '개수 조회 실패';
      const state = resourceReducer({ ...initialState, loading: true }, fetchResourceCountFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 3) 자원 단건 조회 (detail)
  // ---------------------------------------------------------
  describe('fetchResourceDetail', () => {
    test('fetchResourceDetailRequest: loading true, detail 초기화', () => {
      const prevState = { ...initialState, detail: { resId: 1 } };
      const state = resourceReducer(prevState, fetchResourceDetailRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.detail).toBeNull();
    });

    test('fetchResourceDetailSuccess: detail 반영', () => {
      const payload = { resId: 1, resName: '대회의실', resCode: 'RES-001' };
      const state = resourceReducer(initialState, fetchResourceDetailSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.detail).toEqual(payload);
    });

    test('fetchResourceDetailFailure: error 반영', () => {
      const error = '해당 자원을 찾을 수 없습니다.';
      const state = resourceReducer({ ...initialState, loading: true }, fetchResourceDetailFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 4) 자원 등록 (add)
  // ---------------------------------------------------------
  describe('addResource', () => {
    test('addResourceRequest: loading true, error/success/addReason 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true, addReason: 'PREV' };
      const state = resourceReducer(prevState, addResourceRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.addReason).toBeNull();
    });

    test('addResourceSuccess: success true, message 반영', () => {
      const payload = { success: true, message: '자원 등록 성공', resource: { resId: 1 } };
      const state = resourceReducer({ ...initialState, loading: true }, addResourceSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('자원 등록 성공');
    });

    test('addResourceFailure: message/reason 을 분리해서 반영한다', () => {
      const payload = { message: '이미 등록된 자원코드입니다.', reason: 'duplicateResCode' };
      const state = resourceReducer({ ...initialState, loading: true }, addResourceFailure(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe('이미 등록된 자원코드입니다.');
      expect(state.addReason).toBe('duplicateResCode');
    });

    test('addResourceFailure: reason 없으면 addReason 은 null', () => {
      const payload = { message: '자원 등록 실패' };
      const state = resourceReducer(initialState, addResourceFailure(payload));

      expect(state.error).toBe('자원 등록 실패');
      expect(state.addReason).toBeNull();
    });
  });

  // ---------------------------------------------------------
  // 5) 자원 수정 (update)
  // ---------------------------------------------------------
  describe('updateResource', () => {
    test('updateResourceRequest: loading true, error/success 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true };
      const state = resourceReducer(prevState, updateResourceRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('updateResourceSuccess: success true, message 반영', () => {
      const payload = { success: true, message: '자원 수정 성공' };
      const state = resourceReducer({ ...initialState, loading: true }, updateResourceSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('자원 수정 성공');
    });

    test('updateResourceFailure: error 반영', () => {
      const error = '자원 수정 실패';
      const state = resourceReducer({ ...initialState, loading: true }, updateResourceFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 6) 자원 삭제 (delete)
  // ---------------------------------------------------------
  describe('deleteResource', () => {
    test('deleteResourceRequest: loading true, error/success/deleteReason 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true, deleteReason: 'PREV' };
      const state = resourceReducer(prevState, deleteResourceRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.deleteReason).toBeNull();
    });

    test('deleteResourceSuccess: 성공 시 목록에서 해당 resId 를 제거한다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        list: [
          { resId: 1, resName: '대회의실' },
          { resId: 2, resName: '노트북 A' },
        ],
      };
      const payload = { success: true, message: '자원 삭제 성공', resId: 1 };
      const state = resourceReducer(prevState, deleteResourceSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('자원 삭제 성공');
      expect(state.list).toEqual([{ resId: 2, resName: '노트북 A' }]);
    });

    test('deleteResourceFailure: message/reason 을 분리해서 반영한다 (예약 존재)', () => {
      const payload = {
        message: '이 자원에는 진행 중인 예약이 2건 있습니다. 예약을 먼저 취소하거나 완료한 뒤 다시 시도해주세요.',
        reason: 'hasReservations',
      };
      const state = resourceReducer({ ...initialState, loading: true }, deleteResourceFailure(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(payload.message);
      expect(state.deleteReason).toBe('hasReservations');
    });

    test('deleteResourceFailure: 비밀번호 불일치 사유 반영', () => {
      const payload = { message: '비밀번호가 올바르지 않습니다.', reason: 'passwordMismatch' };
      const state = resourceReducer(initialState, deleteResourceFailure(payload));

      expect(state.error).toBe('비밀번호가 올바르지 않습니다.');
      expect(state.deleteReason).toBe('passwordMismatch');
    });
  });

  // ---------------------------------------------------------
  // 7) 자원코드 중복 체크 (check-rescode)
  // ---------------------------------------------------------
  describe('checkResCode', () => {
    test('checkResCodeRequest: loading true, resCodeCheck 초기화', () => {
      const prevState = { ...initialState, resCodeCheck: { checked: true, duplicate: true } };
      const state = resourceReducer(prevState, checkResCodeRequest());

      expect(state.loading).toBe(true);
      expect(state.resCodeCheck).toEqual({ checked: false, duplicate: false });
    });

    test('checkResCodeSuccess: duplicate true 반영', () => {
      const state = resourceReducer(
        { ...initialState, loading: true },
        checkResCodeSuccess({ duplicate: true })
      );

      expect(state.loading).toBe(false);
      expect(state.resCodeCheck).toEqual({ checked: true, duplicate: true });
    });

    test('checkResCodeFailure: error 반영', () => {
      const error = '자원코드 중복확인 실패';
      const state = resourceReducer({ ...initialState, loading: true }, checkResCodeFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 8) 예약 가능 자원 목록 조회 (reservable)
  // ---------------------------------------------------------
  describe('fetchReservableResources', () => {
    test('fetchReservableResourcesRequest: loading true', () => {
      const state = resourceReducer(initialState, fetchReservableResourcesRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchReservableResourcesSuccess: reservableList 반영', () => {
      const payload = [{ resId: 1, resName: '대회의실', resStatus: 'AVAILABLE' }];
      const state = resourceReducer(initialState, fetchReservableResourcesSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.reservableList).toEqual(payload);
    });

    test('fetchReservableResourcesSuccess: payload 없으면 빈 배열', () => {
      const state = resourceReducer(initialState, fetchReservableResourcesSuccess());

      expect(state.reservableList).toEqual([]);
    });

    test('fetchReservableResourcesFailure: error 반영', () => {
      const error = '예약 가능 자원 조회 실패';
      const state = resourceReducer(
        { ...initialState, loading: true },
        fetchReservableResourcesFailure(error)
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 9) 공통 상태 초기화
  // ---------------------------------------------------------
  describe('resetResourceState', () => {
    test('loading/error/success/message/addReason/deleteReason 을 초기값으로 되돌린다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        error: '에러 발생',
        success: true,
        message: '자원 등록 성공',
        addReason: 'duplicateResCode',
        deleteReason: 'hasReservations',
        // 리셋 대상이 아닌 값은 유지되어야 한다
        list: [{ resId: 1 }],
      };
      const state = resourceReducer(prevState, resetResourceState());

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.message).toBeNull();
      expect(state.addReason).toBeNull();
      expect(state.deleteReason).toBeNull();
      expect(state.list).toEqual(prevState.list);
    });
  });
});