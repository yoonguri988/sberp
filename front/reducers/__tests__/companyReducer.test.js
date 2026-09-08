// reducers/__tests__/companyReducer.test.js
import companyReducer, {
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
  clearSuggestList,

  fetchCompanyStatsRequest,
  fetchCompanyStatsSuccess,
  fetchCompanyStatsFailure,

  fetchMyCompanyRequest,
  fetchMyCompanySuccess,
  fetchMyCompanyFailure,

  resetCompanyState,
} from '../com/companyReducer';

// -----------------------------------------------------------
// 초기 상태 (companyReducer.js 의 initialState 와 동일해야 함)
// -----------------------------------------------------------
const initialState = {
  list: [],
  listTotal: 0,
  paging: null,

  detail: null,
  myCompany: null,

  stats: null,

  suggestList: [],

  bizNoCheck: {
    checked: false,
    duplicate: false,
  },

  loading: false,
  error: null,
  success: false,
  message: null,
};

describe('companyReducer', () => {
  test('초기 상태를 반환한다', () => {
    expect(companyReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // ---------------------------------------------------------
  // 1) 회사 등록 (add)
  // ---------------------------------------------------------
  describe('addCompany', () => {
    test('addCompanyRequest: loading true, error/success 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true };
      const state = companyReducer(prevState, addCompanyRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('addCompanySuccess: loading false, success true, message 반영', () => {
      const prevState = { ...initialState, loading: true };
      const payload = { message: '회사 등록에 성공하였습니다.' };
      const state = companyReducer(prevState, addCompanySuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('회사 등록에 성공하였습니다.');
    });

    test('addCompanySuccess: payload 없어도 기본 메시지를 사용한다', () => {
      const state = companyReducer(initialState, addCompanySuccess());

      expect(state.success).toBe(true);
      expect(state.message).toBe('회사 등록에 성공하였습니다.');
    });

    test('addCompanyFailure: loading false, success false, error 반영', () => {
      const prevState = { ...initialState, loading: true };
      const error = '사업자등록번호가 중복됩니다.';
      const state = companyReducer(prevState, addCompanyFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 2) 회사 목록 조회 (list)
  // ---------------------------------------------------------
  describe('fetchCompanyList', () => {
    test('fetchCompanyListRequest: loading true, error 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러' };
      const state = companyReducer(prevState, fetchCompanyListRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchCompanyListSuccess: list/paging/listTotal 반영', () => {
      const payload = {
        items: [
          { comId: 1, comName: '회사A' },
          { comId: 2, comName: '회사B' },
        ],
        paging: { listTotal: 2, curPage: 1 },
      };
      const state = companyReducer(initialState, fetchCompanyListSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.list).toEqual(payload.items);
      expect(state.paging).toEqual(payload.paging);
      expect(state.listTotal).toBe(2);
    });

    test('fetchCompanyListSuccess: items/paging 없으면 안전한 기본값을 사용한다', () => {
      const state = companyReducer(initialState, fetchCompanyListSuccess({}));

      expect(state.list).toEqual([]);
      expect(state.paging).toBeNull();
      expect(state.listTotal).toBe(0);
    });

    test('fetchCompanyListFailure: error 반영', () => {
      const prevState = { ...initialState, loading: true };
      const error = '목록 조회 실패';
      const state = companyReducer(prevState, fetchCompanyListFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 3) 회사 상세 조회 (detail)
  // ---------------------------------------------------------
  describe('fetchCompanyDetail', () => {
    test('fetchCompanyDetailRequest: loading true, detail 초기화', () => {
      const prevState = { ...initialState, detail: { com: { comId: 1 } } };
      const state = companyReducer(prevState, fetchCompanyDetailRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.detail).toBeNull();
    });

    test('fetchCompanyDetailSuccess: detail 반영', () => {
      const payload = {
        com: { comId: 1, comName: '회사A' },
        deptStats: { deptCount: 3 },
        deptList: [{ deptId: 1, deptName: '개발팀' }],
      };
      const state = companyReducer(initialState, fetchCompanyDetailSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.detail).toEqual(payload);
    });

    test('fetchCompanyDetailFailure: error 반영', () => {
      const error = '존재하지 않는 회사입니다.';
      const state = companyReducer(
        { ...initialState, loading: true },
        fetchCompanyDetailFailure(error)
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 4) 회사 수정 (update)
  // ---------------------------------------------------------
  describe('updateCompany', () => {
    test('updateCompanyRequest: loading true, error/success 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true };
      const state = companyReducer(prevState, updateCompanyRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('updateCompanySuccess: success true, message 반영', () => {
      const payload = { message: '회사 정보 수정에 성공하였습니다.' };
      const state = companyReducer(
        { ...initialState, loading: true },
        updateCompanySuccess(payload)
      );

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('회사 정보 수정에 성공하였습니다.');
    });

    test('updateCompanyFailure: error 반영', () => {
      const error = '수정 권한이 없습니다.';
      const state = companyReducer(
        { ...initialState, loading: true },
        updateCompanyFailure(error)
      );

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 5) 회사 삭제 (delete)
  // ---------------------------------------------------------
  describe('deleteCompany', () => {
    test('deleteCompanyRequest: loading true, error/success 초기화', () => {
      const state = companyReducer(initialState, deleteCompanyRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('deleteCompanySuccess: 성공 시 목록에서 해당 comId를 제거한다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        list: [
          { comId: 1, comName: '회사A' },
          { comId: 2, comName: '회사B' },
        ],
      };
      const payload = { message: '회사가 삭제되었습니다.', comId: 1 };
      const state = companyReducer(prevState, deleteCompanySuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('회사가 삭제되었습니다.');
      expect(state.list).toEqual([{ comId: 2, comName: '회사B' }]);
    });

    test('deleteCompanySuccess: comId가 없으면 목록을 그대로 둔다', () => {
      const prevState = {
        ...initialState,
        list: [{ comId: 1, comName: '회사A' }],
      };
      const state = companyReducer(prevState, deleteCompanySuccess({}));

      expect(state.list).toEqual(prevState.list);
    });

    test('deleteCompanyFailure: error 반영', () => {
      const error = '비밀번호가 올바르지 않습니다.';
      const state = companyReducer(
        { ...initialState, loading: true },
        deleteCompanyFailure(error)
      );

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 6) 사업자번호 중복확인 (check-bizno)
  // ---------------------------------------------------------
  describe('checkBizNo', () => {
    test('checkBizNoRequest: loading true, bizNoCheck 초기화', () => {
      const prevState = {
        ...initialState,
        bizNoCheck: { checked: true, duplicate: true },
      };
      const state = companyReducer(prevState, checkBizNoRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.bizNoCheck).toEqual({ checked: false, duplicate: false });
    });

    test('checkBizNoSuccess: duplicate true 반영', () => {
      const state = companyReducer(
        { ...initialState, loading: true },
        checkBizNoSuccess({ duplicate: true })
      );

      expect(state.loading).toBe(false);
      expect(state.bizNoCheck).toEqual({ checked: true, duplicate: true });
    });

    test('checkBizNoSuccess: duplicate false 반영', () => {
      const state = companyReducer(
        { ...initialState, loading: true },
        checkBizNoSuccess({ duplicate: false })
      );

      expect(state.bizNoCheck).toEqual({ checked: true, duplicate: false });
    });

    test('checkBizNoFailure: error 반영', () => {
      const error = '중복확인 실패';
      const state = companyReducer(
        { ...initialState, loading: true },
        checkBizNoFailure(error)
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 7) 회사명 자동완성 (suggest)
  // ---------------------------------------------------------
  describe('suggestCompany', () => {
    test('suggestCompanyRequest: error 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러' };
      const state = companyReducer(prevState, suggestCompanyRequest());

      expect(state.error).toBeNull();
    });

    test('suggestCompanySuccess: suggestList 반영', () => {
      const payload = [
        { comId: 1, comName: '위세아이텍' },
        { comId: 2, comName: '위세정보' },
      ];
      const state = companyReducer(initialState, suggestCompanySuccess(payload));

      expect(state.suggestList).toEqual(payload);
    });

    test('suggestCompanySuccess: payload 없으면 빈 배열', () => {
      const state = companyReducer(initialState, suggestCompanySuccess());

      expect(state.suggestList).toEqual([]);
    });

    test('suggestCompanyFailure: error 반영', () => {
      const error = '자동완성 조회 실패';
      const state = companyReducer(initialState, suggestCompanyFailure(error));

      expect(state.error).toBe(error);
    });

    test('clearSuggestList: suggestList 초기화', () => {
      const prevState = {
        ...initialState,
        suggestList: [{ comId: 1, comName: '회사A' }],
      };
      const state = companyReducer(prevState, clearSuggestList());

      expect(state.suggestList).toEqual([]);
    });
  });

  // ---------------------------------------------------------
  // 8) 회사 통계 조회 (stats)
  // ---------------------------------------------------------
  describe('fetchCompanyStats', () => {
    test('fetchCompanyStatsRequest: loading true', () => {
      const state = companyReducer(initialState, fetchCompanyStatsRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchCompanyStatsSuccess: stats 반영', () => {
      const payload = { totalComCount: 10, totalEmpCount: 120, totalIndustryCount: 5 };
      const state = companyReducer(
        { ...initialState, loading: true },
        fetchCompanyStatsSuccess(payload)
      );

      expect(state.loading).toBe(false);
      expect(state.stats).toEqual(payload);
    });

    test('fetchCompanyStatsFailure: error 반영', () => {
      const error = '통계 조회 실패';
      const state = companyReducer(
        { ...initialState, loading: true },
        fetchCompanyStatsFailure(error)
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 9) 내 회사 정보 조회 (my)
  // ---------------------------------------------------------
  describe('fetchMyCompany', () => {
    test('fetchMyCompanyRequest: loading true', () => {
      const state = companyReducer(initialState, fetchMyCompanyRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchMyCompanySuccess: myCompany 반영', () => {
      const payload = {
        com: { comId: 1, comName: '회사A' },
        deptStats: { deptCount: 3 },
        deptList: [],
      };
      const state = companyReducer(
        { ...initialState, loading: true },
        fetchMyCompanySuccess(payload)
      );

      expect(state.loading).toBe(false);
      expect(state.myCompany).toEqual(payload);
    });

    test('fetchMyCompanyFailure: error 반영', () => {
      const error = '내 회사 조회 실패';
      const state = companyReducer(
        { ...initialState, loading: true },
        fetchMyCompanyFailure(error)
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 10) 공통 상태 초기화
  // ---------------------------------------------------------
  describe('resetCompanyState', () => {
    test('loading/error/success/message 를 초기값으로 되돌린다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        error: '에러 발생',
        success: true,
        message: '회사 등록에 성공하였습니다.',
        // 아래 값들은 리셋 대상이 아니므로 그대로 유지되어야 한다
        list: [{ comId: 1, comName: '회사A' }],
      };
      const state = companyReducer(prevState, resetCompanyState());

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.message).toBeNull();
      expect(state.list).toEqual(prevState.list);
    });
  });
});