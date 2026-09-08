import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tasks:[],
    currentTask:null,
    createContext:{ memberList:[], taskList:[] },   // 등록 폼 참고 데이터
    editContext:{ task:null, memberList:[], taskList:[] }, // 수정 폼 참고 데이터
    myTasks:[],
    myTasksPaging:null,
    myTasksTotalCnt:0,
    ganttTasks:[],
    criticalPathTasks:[], // 병목
    loading:false,
    error:null,
    success:false,
    deleteSuccess:false
}
const taskReducer = createSlice({
    name:"task",
    initialState,
    reducers:{

        // 상세 조회
        fetchTaskDetailRequest:(state)=>{
            state.loading=true;
            state.error=null;
            state.success=false;
        },
        fetchTaskDetailSuccess:(state,action)=>{
            state.loading=false;
            state.currentTask = {
                task: action.payload.task,
                proId: action.payload.proId,
                parentTask: action.payload.parentTask ?? null,
                impactTasks: action.payload.impactTasks,
                isDelayed: action.payload.isDelayed
            };
           // state.success=true;
        },
        fetchTaskDetailFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.success=false;
        },

        // 태스크 등록
        createTaskRequest:(state)=>{
            state.loading=true;
            state.error=null;
            state.success=false;
        },
        createTaskSuccess:(state,action)=>{
            state.loading=false;
            state.tasks.unshift(action.payload.task);
            state.success=true;
        },
        createTaskFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.success=false;
        },

        // 태스크 등록 참고 데이터 (memberList, taskList)
        createTaskContextRequest:(state)=>{
            state.loading=true;
            state.error=null;
        },
        createTaskContextSuccess:(state,action)=>{
            state.loading=false;
            state.createContext=action.payload;
        },
        createTaskContextFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },

        // 태스크 수정
        updateTaskRequest:(state)=>{
            state.loading=true;
            state.error=null;
            state.success=false;
        },
        updateTaskSuccess:(state,action)=>{
            state.loading=false;
            const updatedTask = action.payload.task;   // 응답: {success, message, task}
            state.tasks = state.tasks.map(task =>
                task.taskId === updatedTask.taskId ? updatedTask : task
            );
            if (state.currentTask) {
                state.currentTask.task = updatedTask; // task 필드만 교체, impactTasks/isDelayed 등은 유지
            }
            state.success = true;
        },
        updateTaskFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.success=false;
        },

        // 태스크 수정 참고 데이터 (task, memberList, taskList)
        updateTaskContextRequest:(state)=>{
            state.loading=true;
            state.error=null;
        },
        updateTaskContextSuccess:(state,action)=>{
            state.loading=false;
            state.editContext=action.payload;
        },
        updateTaskContextFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },

        // 태스크 삭제
        deleteTaskRequest:(state)=>{
            state.loading=true;
            state.error=null;
            state.deleteSuccess=false;
        },
        deleteTaskSuccess:(state,action)=>{
            state.loading=false;
            state.tasks=state.tasks.filter(task=>task.taskId!==action.payload);
            state.deleteSuccess=true;
        },
        deleteTaskFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.deleteSuccess=false;
        },

        // 내 태스크 목록
        fetchMyTasksRequest:(state)=>{
            state.loading=true;
            state.error=null;
        },
        fetchMyTasksSuccess:(state,action)=>{
            state.loading=false;
            state.myTasks=action.payload.tasks;
            state.myTasksPaging=action.payload.paging;
            state.myTasksTotalCnt=action.payload.totalCnt;
        },
        fetchMyTasksFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },

        // 간트차트
        fetchGanttRequest:(state)=>{
            state.loading=true;
            state.error=null;
        },
        fetchGanttSuccess:(state,action)=>{
            state.loading=false;
            state.ganttTasks=action.payload;
        },
        fetchGanttFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },

        // 핵심 병목(Critical Path) 조회
        fetchCriticalPathRequest:(state)=>{
            state.loading=true;
            state.error=null;
        },
        fetchCriticalPathSuccess:(state,action)=>{
            state.loading=false;
            state.criticalPathTasks=action.payload;
        },
        fetchCriticalPathFailure:(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        },

        // 초기화
        resetTaskState:(state)=>{
            state.loading=false;
            state.error=null;
            state.success=false;
            state.deleteSuccess=false;
        },
    }
});
export const {
    fetchTaskDetailRequest,fetchTaskDetailSuccess,fetchTaskDetailFailure,
    createTaskRequest,createTaskSuccess,createTaskFailure,
    createTaskContextRequest,createTaskContextSuccess,createTaskContextFailure,
    updateTaskRequest,updateTaskSuccess,updateTaskFailure,
    updateTaskContextRequest,updateTaskContextSuccess,updateTaskContextFailure,
    deleteTaskRequest,deleteTaskSuccess,deleteTaskFailure,
    fetchMyTasksRequest,fetchMyTasksSuccess,fetchMyTasksFailure,
    fetchGanttRequest,fetchGanttSuccess,fetchGanttFailure,
    fetchCriticalPathRequest,fetchCriticalPathSuccess,fetchCriticalPathFailure,
    resetTaskState
} = taskReducer.actions;

export default taskReducer.reducer;