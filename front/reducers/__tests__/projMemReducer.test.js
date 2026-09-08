import { current } from 'immer';
import projMemReducer,{
            fetchProjMemRequest,fetchProjMemSuccess,fetchProjMemFailure,
            createProjMemRequest,createProjMemSuccess,createProjMemFailure,
            deleteProjMemRequest,deleteProjMemSuccess,deleteProjMemFailure,
            resetProjMemState
}from '../proj/projMemReducer';

describe('project_member',()=>{
    const initialState={
        projectMems:[],
        loading:false,
        error:null,
        success:false
    };

    // ==== 전체 목록 ====
    it('fetchProjMemRequest&fetchProjMemSuccess',()=>{
        let state = projMemReducer(initialState,fetchProjMemRequest());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();

        const payload = [{pmId:1, empId:1}, {pmId:2, empId:2}];

        state=projMemReducer(initialState,fetchProjMemSuccess(payload));
        expect(state.loading).toBe(false);
        expect(state.projectMems).toEqual(payload);
    });
    it('fetchProjMemFailure',()=>{
        const state = projMemReducer(initialState,fetchProjMemFailure("목록 조회 실패"));
        expect(state.loading).toBe(false);
        expect(state.error).toBe("목록 조회 실패");
    });

    // === 멤버 등록 ====
    it('createProjMemRequest & createProjMemSuccess', () => {
        let state = projMemReducer(initialState, createProjMemRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);

        const prev = {
            ...initialState,
            projectMems: [{pmId:1, empId:1}],
            loading: true,
        };
        const newProjectMems = {pmId:2, empId:2};
        state = projMemReducer(prev, createProjMemSuccess({ProjectMember:newProjectMems}) );
        expect(state.loading).toBe(false);
        expect(state.projectMems).toEqual([newProjectMems, ...prev.projectMems]);
        expect(state.success).toBe(true);
    });
    it('createProjMemFailure', () => {
        const state = projMemReducer(initialState, createProjMemFailure("멤버 등록 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("멤버 등록 실패");
    });

    // === 멤버 삭제 ===
    it('deleteProjMemSuccess',()=>{
        const prev = {...initialState, projectMems:[{pmId:1, empId:1}]};
        const state = projMemReducer(prev, deleteProjMemSuccess(1));
        expect(state.projectMems).toHaveLength(0);
        expect(state.projectMems.length).toBe(0);
        expect(state.success).toEqual(true);
    });
    it('deleteProjMemRequest', ()=> {
        let state = projMemReducer(initialState, deleteProjMemRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
    });
    it('deleteProjMemFailure', () => {
        const state = projMemReducer(initialState, deleteProjMemFailure("멤버 삭제 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("멤버 삭제 실패");
    });

    // === 초기화 ===
    it('resetProjMemState', () => {
        const prev = {...initialState, loading: true, error:'error', success: true};
        const state = projMemReducer(prev, resetProjMemState() );
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
    });
});
//// npx jest reducers/__tests__/projMem.test.js