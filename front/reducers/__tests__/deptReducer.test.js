// reducers/__tests__/deptReducer.test.js
import deptReducer, {
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
  clearAncestorDepts,

  fetchDeptEmpListRequest,
  fetchDeptEmpListSuccess,
  fetchDeptEmpListFailure,

  resetDeptState,
} from '../dept/deptReducer';

// -----------------------------------------------------------
// 초기 상태 (deptReducer.js 의 initialState 와 동일해야 함)
// -----------------------------------------------------------
const initialState = {
  comId: null,
  stats: null,
  orgTree: [],

  flatList: [],

  detail: null,
  myDept: null,

  deptEmpList: [],

  deptCodeCheck: {
    checked: false,
    duplicate: false,
  },

  ancestorDepts: [],

  pendingTransfer: false,

  loading: false,
  error: null,
  success: false,
  message: null,
};

describe('deptReducer', () => {
  test('초기 상태를 반환한다', () => {
    expect(deptReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // ---------------------------------------------------------
  // 1) 부서 조직도 조회 (list)
  // ---------------------------------------------------------
  describe('fetchDeptList', () => {
    test('fetchDeptListRequest: loading true, error 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러' };
      const state = deptReducer(prevState, fetchDeptListRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchDeptListSuccess: comId/stats/orgTree 반영', () => {
      const payload = {
        comId: 1,
        stats: { deptCount: 5 },
        items: [{ deptId: 1, deptName: '경영지원본부', depth: 0 }],
      };
      const state = deptReducer(initialState, fetchDeptListSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.comId).toBe(1);
      expect(state.stats).toEqual(payload.stats);
      expect(state.orgTree).toEqual(payload.items);
    });

    test('fetchDeptListSuccess: comId/stats/items 없으면 안전한 기본값을 사용한다', () => {
      const state = deptReducer(initialState, fetchDeptListSuccess({}));

      expect(state.comId).toBeNull();
      expect(state.stats).toBeNull();
      expect(state.orgTree).toEqual([]);
    });

    test('fetchDeptListFailure: error 반영', () => {
      const error = '조직도 조회 실패';
      const state = deptReducer({ ...initialState, loading: true }, fetchDeptListFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 2) 부서 목록 평탄화 조회 (flat)
  // ---------------------------------------------------------
  describe('fetchDeptFlat', () => {
    test('fetchDeptFlatRequest: loading true', () => {
      const state = deptReducer(initialState, fetchDeptFlatRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchDeptFlatSuccess: flatList 반영', () => {
      const payload = [
        { deptId: 1, deptName: '경영지원본부', depth: 0 },
        { deptId: 2, deptName: '인사팀', depth: 1 },
      ];
      const state = deptReducer(initialState, fetchDeptFlatSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.flatList).toEqual(payload);
    });

    test('fetchDeptFlatSuccess: payload 없으면 빈 배열', () => {
      const state = deptReducer(initialState, fetchDeptFlatSuccess());

      expect(state.flatList).toEqual([]);
    });

    test('fetchDeptFlatFailure: error 반영', () => {
      const error = '평탄화 목록 조회 실패';
      const state = deptReducer({ ...initialState, loading: true }, fetchDeptFlatFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 3) 부서 등록 (add)
  // ---------------------------------------------------------
  describe('addDept', () => {
    test('addDeptRequest: loading true, error/success 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true };
      const state = deptReducer(prevState, addDeptRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('addDeptSuccess: success true, message 반영', () => {
      const payload = { message: '부서 등록에 성공하였습니다.' };
      const state = deptReducer({ ...initialState, loading: true }, addDeptSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('부서 등록에 성공하였습니다.');
    });

    test('addDeptSuccess: payload 없어도 기본 메시지를 사용한다', () => {
      const state = deptReducer(initialState, addDeptSuccess());

      expect(state.message).toBe('부서 등록에 성공하였습니다.');
    });

    test('addDeptFailure: error 반영', () => {
      const error = '존재하지 않는 상위부서입니다.';
      const state = deptReducer({ ...initialState, loading: true }, addDeptFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 4) 부서 상세 조회 (detail)
  // ---------------------------------------------------------
  describe('fetchDeptDetail', () => {
    test('fetchDeptDetailRequest: loading true, detail 초기화', () => {
      const prevState = { ...initialState, detail: { dept: { deptId: 1 } } };
      const state = deptReducer(prevState, fetchDeptDetailRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.detail).toBeNull();
    });

    test('fetchDeptDetailSuccess: detail 반영', () => {
      const payload = {
        dept: { deptId: 1, deptName: '인사팀' },
        ancestorChain: ['경영지원본부', '인사팀'],
      };
      const state = deptReducer(initialState, fetchDeptDetailSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.detail).toEqual(payload);
    });

    test('fetchDeptDetailFailure: error 반영', () => {
      const error = '존재하지 않는 부서입니다.';
      const state = deptReducer({ ...initialState, loading: true }, fetchDeptDetailFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 5) 내 부서 상세 조회 (my)
  // ---------------------------------------------------------
  describe('fetchMyDept', () => {
    test('fetchMyDeptRequest: loading true', () => {
      const state = deptReducer(initialState, fetchMyDeptRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchMyDeptSuccess: myDept 반영', () => {
      const payload = { dept: { deptId: 2, deptName: '인사팀' }, ancestorChain: ['인사팀'] };
      const state = deptReducer({ ...initialState, loading: true }, fetchMyDeptSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.myDept).toEqual(payload);
    });

    test('fetchMyDeptFailure: error 반영', () => {
      const error = '내 부서 조회 실패';
      const state = deptReducer({ ...initialState, loading: true }, fetchMyDeptFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 6) 부서 수정 (update)
  // ---------------------------------------------------------
  describe('updateDept', () => {
    test('updateDeptRequest: loading true, error/success 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true };
      const state = deptReducer(prevState, updateDeptRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
    });

    test('updateDeptSuccess: success true, message 반영', () => {
      const payload = { message: '부서 수정에 성공하였습니다.' };
      const state = deptReducer({ ...initialState, loading: true }, updateDeptSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('부서 수정에 성공하였습니다.');
    });

    test('updateDeptFailure: error 반영', () => {
      const error = '순환참조가 발생하여 이동할 수 없습니다.';
      const state = deptReducer({ ...initialState, loading: true }, updateDeptFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 7) 부서 삭제 (delete)
  // ---------------------------------------------------------
  describe('deleteDept', () => {
    test('deleteDeptRequest: loading true, error/success/pendingTransfer 초기화', () => {
      const prevState = { ...initialState, error: '이전 에러', success: true, pendingTransfer: true };
      const state = deptReducer(prevState, deleteDeptRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.pendingTransfer).toBe(false);
    });

    test('deleteDeptSuccess: 완전 삭제 시 flatList 에서 제거되고 pendingTransfer 는 false', () => {
      const prevState = {
        ...initialState,
        loading: true,
        flatList: [
          { deptId: 1, deptName: '경영지원본부' },
          { deptId: 2, deptName: '인사팀' },
        ],
      };
      const payload = { message: '부서 삭제에 성공하였습니다.', deptId: 2 };
      const state = deptReducer(prevState, deleteDeptSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
      expect(state.message).toBe('부서 삭제에 성공하였습니다.');
      expect(state.pendingTransfer).toBe(false);
      expect(state.flatList).toEqual([{ deptId: 1, deptName: '경영지원본부' }]);
    });

    test('deleteDeptSuccess: 이관대기 전환 시 flatList 는 유지되고 pendingTransfer 는 true', () => {
      const prevState = {
        ...initialState,
        loading: true,
        flatList: [{ deptId: 2, deptName: '인사팀' }],
      };
      const payload = {
        message: '사원이 존재해 삭제 대신 이관 대기 상태로 전환되었습니다.',
        pendingTransfer: true,
        deptId: 2,
      };
      const state = deptReducer(prevState, deleteDeptSuccess(payload));

      expect(state.pendingTransfer).toBe(true);
      expect(state.message).toBe('사원이 존재해 삭제 대신 이관 대기 상태로 전환되었습니다.');
      // 이관 대기 상태에서는 목록에서 제거하지 않는다
      expect(state.flatList).toEqual(prevState.flatList);
    });

    test('deleteDeptFailure: error 반영', () => {
      const error = '하위 부서가 존재하여 삭제할 수 없습니다.';
      const state = deptReducer({ ...initialState, loading: true }, deleteDeptFailure(error));

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 8) 부서코드 중복확인 (check-deptcode)
  // ---------------------------------------------------------
  describe('checkDeptCode', () => {
    test('checkDeptCodeRequest: loading true, deptCodeCheck 초기화', () => {
      const prevState = { ...initialState, deptCodeCheck: { checked: true, duplicate: true } };
      const state = deptReducer(prevState, checkDeptCodeRequest());

      expect(state.loading).toBe(true);
      expect(state.deptCodeCheck).toEqual({ checked: false, duplicate: false });
    });

    test('checkDeptCodeSuccess: duplicate true 반영', () => {
      const state = deptReducer(
        { ...initialState, loading: true },
        checkDeptCodeSuccess({ duplicate: true })
      );

      expect(state.loading).toBe(false);
      expect(state.deptCodeCheck).toEqual({ checked: true, duplicate: true });
    });

    test('checkDeptCodeFailure: error 반영', () => {
      const error = '부서코드 중복확인 실패';
      const state = deptReducer({ ...initialState, loading: true }, checkDeptCodeFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 9) 상위 계층 부서 목록 (ancestors)
  // ---------------------------------------------------------
  describe('fetchAncestorDepts', () => {
    test('fetchAncestorDeptsRequest: loading true', () => {
      const state = deptReducer(initialState, fetchAncestorDeptsRequest());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fetchAncestorDeptsSuccess: ancestorDepts 반영', () => {
      const payload = [{ deptId: 1, deptName: '경영지원본부' }];
      const state = deptReducer(initialState, fetchAncestorDeptsSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.ancestorDepts).toEqual(payload);
    });

    test('fetchAncestorDeptsSuccess: payload 없으면 빈 배열', () => {
      const state = deptReducer(initialState, fetchAncestorDeptsSuccess());

      expect(state.ancestorDepts).toEqual([]);
    });

    test('fetchAncestorDeptsFailure: error 반영', () => {
      const error = '상위 계층 조회 실패';
      const state = deptReducer({ ...initialState, loading: true }, fetchAncestorDeptsFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });

    test('clearAncestorDepts: ancestorDepts 초기화', () => {
      const prevState = { ...initialState, ancestorDepts: [{ deptId: 1 }] };
      const state = deptReducer(prevState, clearAncestorDepts());

      expect(state.ancestorDepts).toEqual([]);
    });
  });

  // ---------------------------------------------------------
  // 10) 부서(+하위부서) 소속 사원 목록 (deptEmpList)
  // ---------------------------------------------------------
  describe('fetchDeptEmpList', () => {
    test('fetchDeptEmpListRequest: loading true, error/deptEmpList 초기화', () => {
      const prevState = {
        ...initialState,
        error: '이전 에러',
        deptEmpList: [{ empId: 1, empName: '홍길동' }],
      };
      const state = deptReducer(prevState, fetchDeptEmpListRequest(2));

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      // 다른 부서로 이동 시 이전 부서의 목록이 잠깐 남아있지 않도록 즉시 비운다
      expect(state.deptEmpList).toEqual([]);
    });

    test('fetchDeptEmpListSuccess: deptEmpList 반영', () => {
      const payload = [
        { empId: 10, empName: '홍길동', deptId: 2 },
        { empId: 11, empName: '김철수', deptId: 2 },
      ];
      const state = deptReducer({ ...initialState, loading: true }, fetchDeptEmpListSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.deptEmpList).toEqual(payload);
    });

    test('fetchDeptEmpListSuccess: payload 없으면 빈 배열', () => {
      const state = deptReducer(
        { ...initialState, loading: true, deptEmpList: [{ empId: 1 }] },
        fetchDeptEmpListSuccess()
      );

      expect(state.deptEmpList).toEqual([]);
    });

    test('fetchDeptEmpListFailure: error 반영', () => {
      const error = '본인 소속 회사의 부서만 조회할 수 있습니다.';
      const state = deptReducer({ ...initialState, loading: true }, fetchDeptEmpListFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  // ---------------------------------------------------------
  // 11) 공통 상태 초기화
  // ---------------------------------------------------------
  describe('resetDeptState', () => {
    test('loading/error/success/message/pendingTransfer 를 초기값으로 되돌린다', () => {
      const prevState = {
        ...initialState,
        loading: true,
        error: '에러 발생',
        success: true,
        message: '부서 등록에 성공하였습니다.',
        pendingTransfer: true,
        // 리셋 대상이 아닌 값은 그대로 유지되어야 한다
        orgTree: [{ deptId: 1 }],
      };
      const state = deptReducer(prevState, resetDeptState());

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.success).toBe(false);
      expect(state.message).toBeNull();
      expect(state.pendingTransfer).toBe(false);
      expect(state.orgTree).toEqual(prevState.orgTree);
    });
  });
});