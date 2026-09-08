import { createSlice } from "@reduxjs/toolkit";

const initialState ={
    projectMems:[],
    loading:false,
    error:null,
    createSuccess: false,   // 등록 성공 여부
    deleteSuccess: false,   // 삭제 성공 여부
}

const projMemReducer= createSlice({
    name:"project_member",
    initialState,
    reducers:{
        // 전체 목록
        fetchProjMemRequest:(state)=>{
            state.loading=true;
            state.error=null;
        },
        fetchProjMemSuccess:(state,action)=>{
            state.loading=false;
            state.projectMems=action.payload;
        },
        fetchProjMemFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },

        // 멤버 등록
        createProjMemRequest:(state)=>{
            state.loading=true;
            state.error=null;
            state.createSuccess=false;
        },
        createProjMemSuccess:(state,action)=>{
            state.loading=false;
            state.projectMems.unshift(action.payload.ProjectMember);
            state.createSuccess=true;
        },
        createProjMemFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.createSuccess=false;
        },

        // 멤버 삭제
        deleteProjMemRequest:(state)=>{
            state.loading=true;
            state.error=null;
            state.deleteSuccess=false;
        },
        deleteProjMemSuccess:(state,action)=>{
            state.loading=false;
            state.projectMems=state.projectMems.filter(project_member=>project_member.pmId!==action.payload);
            state.deleteSuccess=true;
        },
        deleteProjMemFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.deleteSuccess=false;
        },

        // 초기화
        resetProjMemState:(state)=>{
            state.loading=false;
            state.error=null;
            state.createSuccess=false;
            state.deleteSuccess=false;
        },
    }
});

export const {fetchProjMemRequest,fetchProjMemSuccess,fetchProjMemFailure,
              createProjMemRequest,createProjMemSuccess,createProjMemFailure,
              deleteProjMemRequest,deleteProjMemSuccess,deleteProjMemFailure,
              resetProjMemState
} =projMemReducer.actions;

export default projMemReducer.reducer;