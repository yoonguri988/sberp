// reducers/__tests__/resvReducer.test.js
import resvReducer, {
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

  resetResvState,
} from '../resv/resvReducer';

// -----------------------------------------------------------
// 초기 상태 (resvReducer.js 의 initialState 와 동일해야 함)
// -----------------------------------------------------------
const initialState = {
  myList: [],
  myListCount: 0,
  detail: null,
  availableQty: null,
  addReason: null,

  loading: false,
  error: null,
  success: false,
  message: null,
};

describe('resvReducer', () => {
  test('초기 상태를 반환한다', () => {
    expect(resvReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // ---------------------------------------------------------
  // 1) 내 예약 목록 조회 (my)
  // ---------------------------------------------------------
  describe('fetchMyResvList', () => {
    test('fetchMyResvListRequest: loading true, error 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러' };
      const state = resvReducer(prevState, fetchMyResvListRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchMyResvListSuccess: myList 반영', () => {
      const payload = [
        { revId: 1, resName: '대회의실', status: 'WAI' },
        { revId: 2, resName: '노트북 A', status: 'APP' },
      ];
      const state = resvReducer(initialState, fetchMyResvListSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.myList).toEqual(payload);
    });

    test('fetchMyResvListSuccess: payload 없으면 빈 배열', () => {
      const state = resvReducer(initialState, fetchMyResvListSuccess());

      expect(state.myList).toEqual([]);
    });

    test('fetchMyResvListFailure: error 반영', () => {
      const error = '내 예약 목록 조회 실패';
      const state = resvReducer({ ...initialState, loading: true }, fetchMyResvListFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 2) 내 예약 개수 조회 (my/count)
  // ---------------------------------------------------------
  describe('fetchMyResvCount', () => {
    test('fetchMyResvCountRequest: loading true', () => {
      const state = resvReducer(initialState, fetchMyResvCountRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchMyResvCountSuccess: myListCount 반영', () => {
      const state = resvReducer({ ...initialState, loading: true }, fetchMyResvCountSuccess(7));

      expect(state.loading).toBe(false);
      expect(state.myListCount).toBe(7);
    });

    test('fetchMyResvCountSuccess: payload 없으면 0', () => {
      const state = resvReducer(initialState, fetchMyResvCountSuccess());

      expect(state.myListCount).toBe(0);
    });

    test('fetchMyResvCountFailure: error 반영', () => {
      const error = '내 예약 개수 조회 실패';
      const state = resvReducer({ ...initialState, loading: true }, fetchMyResvCountFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 3) 예약 단건 조회 (detail)
  // ---------------------------------------------------------
  describe('fetchResvDetail', () => {
    test('fetchResvDetailRequest: loading true, detail 초기화', () => {
      const prevState = { ...initialState, detail: { revId: 1 } };
      const state = resvReducer(prevState, fetchResvDetailRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.detail).toBeNull();
    });

    test('fetchResvDetailSuccess: detail 반영', () => {
      const payload = { revId: 1, resName: '대회의실', status: 'WAI' };
      const state = resvReducer(initialState, fetchResvDetailSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.detail).toEqual(payload);
    });

    test('fetchResvDetailFailure: error 반영', () => {
      const error = '해당 예약을 찾을 수 없습니다.';
      const state = resvReducer({ ...initialState, loading: true }, fetchResvDetailFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 4) 자원 예약 등록 (add)
  // ---------------------------------------------------------
  describe('addResv', () => {
    test('addResvRequest: loading true, error/success/addReason 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true, addReason: 'PREV' };
      const state = resvReducer(prevState, addResvRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.addReason).toBeNull();
    });

    test('addResvSuccess: success true, message 반영', () => {
      const payload = { success: true, message: '예약이 신청되었습니다.' };
      const state = resvReducer({ ...initialState, loading: true }, addResvSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('예약이 신청되었습니다.');
    });

    test('addResvFailure: message/reason 을 분리해서 반영한다 (수량 부족)', () => {
      const payload = {
        message: '해당 기간에 예약 가능한 수량이 부족합니다. (남은 수량: 2개)',
        reason: 'notEnoughQuantity',
      };
      const state = resvReducer({ ...initialState, loading: true }, addResvFailure(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(payload.message);
      expect(state.addReason).toBe('notEnoughQuantity');
    });

    test('addResvFailure: reason 없으면 addReason 은 null', () => {
      const payload = { message: '예약 신청 실패' };
      const state = resvReducer(initialState, addResvFailure(payload));

      expect(state.error).toBe('예약 신청 실패');
      expect(state.addReason).toBeNull();
    });
  });

  // ---------------------------------------------------------
  // 5) 자원 예약 수정 (update)
  // ---------------------------------------------------------
  describe('updateResv', () => {
    test('updateResvRequest: loading true, error/success 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true };
      const state = resvReducer(prevState, updateResvRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('updateResvSuccess: success true, message 반영', () => {
      const payload = { success: true, message: '예약 수정 성공' };
      const state = resvReducer({ ...initialState, loading: true }, updateResvSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('예약 수정 성공');
    });

    test('updateResvFailure: error 반영', () => {
      const error = '본인 예약만 수정할 수 있습니다.';
      const state = resvReducer({ ...initialState, loading: true }, updateResvFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 6) 자원 예약 취소 (cancel)
  // ---------------------------------------------------------
  describe('cancelResv', () => {
    test('cancelResvRequest: loading true, error/success 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true };
      const state = resvReducer(prevState, cancelResvRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('cancelResvSuccess: 성공 시 myList 에서 해당 revId 를 제거한다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        myList: [
          { revId: 1, resName: '대회의실' },
          { revId: 2, resName: '노트북 A' },
        ],
      };
      const payload = { success: true, message: '예약이 취소되었습니다.', revId: 1 };
      const state = resvReducer(prevState, cancelResvSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('예약이 취소되었습니다.');
      expect(state.myList).toEqual([{ revId: 2, resName: '노트북 A' }]);
    });

    test('cancelResvFailure: error 반영', () => {
      const error = '본인 예약이거나 관리자만 취소할 수 있습니다.';
      const state = resvReducer({ ...initialState, loading: true }, cancelResvFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 7) 자원 반납 처리 (return)
  // ---------------------------------------------------------
  describe('returnResv', () => {
    test('returnResvRequest: loading true, error/success 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true };
      const state = resvReducer(prevState, returnResvRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('returnResvSuccess: myList/detail 의 해당 건에 returnDt 를 반영하고 상태를 APP 으로 정리한다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        myList: [
          { revId: 1, resName: '노트북 A', status: 'APP', returnDt: null },
          { revId: 2, resName: '빔프로젝터', status: 'NORET', returnDt: null },
        ],
        detail: { revId: 1, resName: '노트북 A', status: 'APP', returnDt: null },
      };
      const payload = {
        success: true,
        message: '반납 처리되었습니다.',
        revId: 1,
        returnDt: '2026-08-19T10:00:00',
      };
      const state = resvReducer(prevState, returnResvSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('반납 처리되었습니다.');
      expect(state.myList[0].returnDt).toBe('2026-08-19T10:00:00');
      expect(state.myList[0].status).toBe('APP');
      expect(state.myList[1].returnDt).toBeNull();
      expect(state.detail.returnDt).toBe('2026-08-19T10:00:00');
      expect(state.detail.status).toBe('APP');
    });

    test('returnResvSuccess: NORET(미반납) 상태였던 건도 반납 처리되면 APP 으로 바뀐다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        myList: [{ revId: 2, resName: '빔프로젝터', status: 'NORET', returnDt: null }],
        detail: { revId: 2, resName: '빔프로젝터', status: 'NORET', returnDt: null },
      };
      const payload = {
        success: true,
        message: '반납 처리되었습니다.',
        revId: 2,
        returnDt: '2026-08-19T11:00:00',
      };
      const state = resvReducer(prevState, returnResvSuccess(payload));

      expect(state.myList[0].status).toBe('APP');
      expect(state.myList[0].returnDt).toBe('2026-08-19T11:00:00');
      expect(state.detail.status).toBe('APP');
    });

    test('returnResvFailure: error 반영', () => {
      const error = '본인이 예약한 자원만 반납할 수 있습니다.';
      const state = resvReducer({ ...initialState, loading: true }, returnResvFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 8) 실시간 잔여수량 조회 (available)
  // ---------------------------------------------------------
  describe('fetchAvailableQty', () => {
    test('fetchAvailableQtyRequest: loading true, availableQty 초기화', () => {
      const prevState = { ...initialState, availableQty: { availableQty: 3 } };
      const state = resvReducer(prevState, fetchAvailableQtyRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.availableQty).toBeNull();
    });

    test('fetchAvailableQtySuccess: availableQty 반영', () => {
      const payload = { totalQuantity: 5, reservedQty: 2, availableQty: 3, resStatus: 'AVAILABLE' };
      const state = resvReducer(initialState, fetchAvailableQtySuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.availableQty).toEqual(payload);
    });

    test('fetchAvailableQtyFailure: error 반영', () => {
      const error = '잘못된 자원 요청입니다.';
      const state = resvReducer({ ...initialState, loading: true }, fetchAvailableQtyFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 8) 공통 상태 초기화
  // ---------------------------------------------------------
  describe('resetResvState', () => {
    test('loading/error/success/message/addReason 을 초기값으로 되돌린다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        error: '에러 발생',
        success: true,
        message: '예약이 신청되었습니다.',
        addReason: 'notEnoughQuantity',
        // 리셋 대상이 아닌 값은 유지되어야 한다
        myList: [{ revId: 1 }],
      };
      const state = resvReducer(prevState, resetResvState());

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.message).toBeNull();
      expect(state.addReason).toBeNull();
      expect(state.myList).toEqual(prevState.myList);
    });
  });
});