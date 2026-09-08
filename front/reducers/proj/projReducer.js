import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
    success:false,
    deleteSuccess:false
}
const projReducer = createSlice({
    name:"project",
    initialState,
    reducers:{
        // 전체 목록
        fetchProjRequest:(state)=>{
            state.loading=true;
            state.error=null;
        },
        fetchProjSuccess:(state,action)=>{
            state.loading=false;
            state.projects=action.payload.list;
            state.projectsPaging=action.payload.paging;
        },
        fetchProjFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },

        // 상세 조회
        fetchProjDetailRequest:(state)=>{
            state.loading=true;
            state.error=null;
            state.success=false;
        },
        fetchProjDetailSuccess:(state,action)=>{
            state.loading=false;
            state.currentProject={
                dto: action.payload.dto,
                taskList: action.payload.list,
                taskPaging: action.payload.paging,
                memberList: action.payload.memberList
            };
           // state.success=true;
        },
        fetchProjDetailFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.success=false;
        },

        // 프로젝트 등록
        createProjRequest:(state)=>{
            state.loading=true;
            state.error=null;
            state.success=false;
        },
        createProjSuccess:(state,action)=>{
            state.loading=false;
            state.projects.unshift(action.payload.project);
            state.success=true;
        },
        createProjFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.success=false;
        },

        // 프로젝트 수정
        updateProjRequest:(state)=>{
            state.loading=true;
            state.error=null;
            state.success=false;
        },
        updateProjSuccess:(state,action)=>{
            state.loading=false;
            const updatedProject = action.payload.project;   // 응답 구조: {success, message, project}
            state.projects = state.projects.map(project =>
                project.proId === updatedProject.proId ? updatedProject : project
            );
            // taskList/taskPaging/memberList는 유지하고 dto만 최신값으로 교체
            state.currentProject.dto = updatedProject;
            state.success = true;
        },
        updateProjFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.success=false;
        },

        // 프로젝트 삭제
        deleteProjRequest:(state)=>{
            state.loading=true;
            state.error=null;
            state.success=false;
            state.deleteSuccess=false;
        },
        deleteProjSuccess:(state,action)=>{
            state.loading=false;
            state.projects=state.projects.filter(project=>project.proId!==action.payload);
            state.success=true;
            state.deleteSuccess=true;
        },
        deleteProjFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.success=false;
            state.deleteSuccess=false;
          
        },

        // 초기화
        resetProjState:(state)=>{
            state.loading=false;
            state.error=null;
            state.success=false;
            state.deleteSuccess=false;
        },

        // 사원 검색
        searchEmpRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        searchEmpSuccess: (state, action) => {
            state.loading = false;
            state.empList = action.payload;
        },
        searchEmpFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // AI 분석
        analyzeProjRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        analyzeProjSuccess: (state, action) => {
            state.loading = false;
            state.analysis = action.payload;
        },
        analyzeProjFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const {fetchProjRequest,fetchProjSuccess,fetchProjFailure,
              fetchProjDetailRequest,fetchProjDetailSuccess,fetchProjDetailFailure,
              createProjRequest,createProjSuccess,createProjFailure,
              updateProjRequest,updateProjSuccess,updateProjFailure,
              deleteProjRequest,deleteProjSuccess,deleteProjFailure,
              searchEmpRequest,searchEmpSuccess,searchEmpFailure,
              analyzeProjRequest,analyzeProjSuccess,analyzeProjFailure,
              resetProjState
}= projReducer.actions;

export default projReducer.reducer;