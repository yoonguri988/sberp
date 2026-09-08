import { current } from 'immer';
import projReducer,{
              fetchProjRequest,fetchProjSuccess,fetchProjFailure,
              fetchProjDetailRequest,fetchProjDetailSuccess,fetchProjDetailFailure,
              createProjRequest,createProjSuccess,createProjFailure,
              updateProjRequest,updateProjSuccess,updateProjFailure,
              deleteProjRequest,deleteProjSuccess,deleteProjFailure,
              searchEmpRequest,searchEmpSuccess,searchEmpFailure,
              analyzeProjRequest,analyzeProjSuccess,analyzeProjFailure,
              resetProjState
}from '../proj/projReducer';

describe('project',()=>{
    const initialState={
        projects:[],
        projectsPaging:null,        // 목록 페이징
        currentProject:{
            dto:null,
            taskList:[],
            taskPaging:null,        // ← 태스크 목록 페이징
            memberList:[]
        },
        loading:false,
        empList: [],
        analysis: null,
        error:null,
        success:false
    };

    // === 전체 목록 ===
    it('fetchProjRequest & fetchProjSuccess', ()=>{
        let state = projReducer(initialState,fetchProjRequest());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();

        const payload = {
            list: [{proId:1, title:'첫 번째 프로젝트'}],
            paging: {pstartno:1, totalPage:1}
        };
        state = projReducer(initialState,fetchProjSuccess(payload));
        expect(state.loading).toBe(false);
        expect(state.projects).toEqual(payload.list);
        expect(state.projectsPaging).toEqual(payload.paging);
    });
    it('fetchProjFailure', () => {
        const state = projReducer(initialState, fetchProjFailure("전체 목록 조회 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("전체 목록 조회 실패");
    });

    // === 상세 조회 ===
    it('fetchProjDetailRequest & fetchProjDetailSuccess', () => {
        let state = projReducer(initialState, fetchProjDetailRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);

        const payload = {
            dto: {proId:1, title:'첫 번째 프로젝트'},
            list: [{taskId:1, title:'태스크1'}],
            paging: {pstartno:1, totalPage:1},
            memberList: [{pmId:1, empId:1}]
        };
        state = projReducer(initialState, fetchProjDetailSuccess(payload) );
        expect(state.loading).toBe(false);
        expect(state.currentProject).toEqual({
            dto: payload.dto,
            taskList: payload.list,
            taskPaging: payload.paging,
            memberList: payload.memberList
        });
        expect(state.success).toBe(true);
    });
    it('fetchProjDetailFailure', () => {
        const state = projReducer(initialState, fetchProjDetailFailure("상세 조회 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("상세 조회 실패");
    });

    // === 프로젝트 등록 ===
    it('createProjRequest & createProjSuccess', () => {
        let state = projReducer(initialState, createProjRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);

        const prev = {
            ...initialState,
            projects: [{proId:1, title:'첫 번째 프로젝트'}],
            loading: true,
        };
        const newProject = {proId:2, title:'두 번째 프로젝트'};
        state = projReducer(prev, createProjSuccess({project:newProject}) );
        expect(state.loading).toBe(false);
        expect(state.projects).toEqual([newProject, ...prev.projects]);
        expect(state.success).toBe(true);
    });
    it('createProjFailure', () => {
        const state = projReducer(initialState, createProjFailure("프로젝트 등록 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("프로젝트 등록 실패");
    });

    // === 프로젝트 수정 ===
    it('updateProjRequest & updateProjSuccess', () => {
        let state = projReducer(initialState, updateProjRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);

        const prev = {
            ...initialState,
            projects: [{proId:1, title:'수정 전'}],
            currentProject: {
                dto: {proId:1, title:'수정 전'},
                taskList: [{taskId:1}],
                taskPaging: {pstartno:1},
                memberList: [{pmId:1}]
            },
            loading: true,
        };
        const updatedProject = {proId:1, title:'수정 후'};
        state = projReducer(prev, updateProjSuccess({project:updatedProject}) );
        expect(state.loading).toBe(false);
        expect(state.projects).toEqual([updatedProject]);
        // dto만 교체되고 나머지(taskList/taskPaging/memberList)는 유지
        expect(state.currentProject.dto).toEqual(updatedProject);
        expect(state.currentProject.taskList).toEqual(prev.currentProject.taskList);
        expect(state.currentProject.memberList).toEqual(prev.currentProject.memberList);
        expect(state.success).toBe(true);
    });
    it('updateProjFailure', () => {
        const state = projReducer(initialState, updateProjFailure("프로젝트 수정 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("프로젝트 수정 실패");
    });

    // === 프로젝트 삭제 ===
    it('deleteProjSuccess',()=>{
        const prev = {...initialState, projects:[{proId:1, title:'삭제될 프로젝트'}]};
        const state = projReducer(prev, deleteProjSuccess(1));
        expect(state.projects).toHaveLength(0);
        expect(state.projects.length).toBe(0);
        expect(state.success).toEqual(true);
    });
    it('deleteProjRequest', ()=> {
        let state = projReducer(initialState, deleteProjRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
    });
    it('deleteProjFailure', () => {
        const state = projReducer(initialState, deleteProjFailure("프로젝트 삭제 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("프로젝트 삭제 실패");
    });

    // === 사원 검색 ===
    it('searchEmpRequest & searchEmpSuccess', () => {
        let state = projReducer(initialState, searchEmpRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();

        const empList = [{empId:1, empName:'홍길동'}];
        state = projReducer(initialState, searchEmpSuccess(empList) );
        expect(state.loading).toBe(false);
        expect(state.empList).toEqual(empList);
    });
    it('searchEmpFailure', () => {
        const state = projReducer(initialState, searchEmpFailure("사원 검색 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("사원 검색 실패");
    });

    // === AI 분석 ===
    it('analyzeProjRequest & analyzeProjSuccess', () => {
        let state = projReducer(initialState, analyzeProjRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();

        const analysis = {risk:'HIGH', reason:'일정 지연'};
        state = projReducer(initialState, analyzeProjSuccess(analysis) );
        expect(state.loading).toBe(false);
        expect(state.analysis).toEqual(analysis);
    });
    it('analyzeProjFailure', () => {
        const state = projReducer(initialState, analyzeProjFailure("AI 분석 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("AI 분석 실패");
    });

    // === 초기화 ===
    it('resetProjState', () => {
        const prev = {...initialState, loading: true, error:'error', success: true};
        const state = projReducer(prev, resetProjState() );
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
    });
});
// npx jest reducers/__tests__/proj.test.js