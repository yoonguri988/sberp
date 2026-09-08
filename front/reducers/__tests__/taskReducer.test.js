import { current } from 'immer';
import taskReducer,{
            fetchTaskDetailRequest,fetchTaskDetailSuccess,fetchTaskDetailFailure,
            createTaskRequest,createTaskSuccess,createTaskFailure,
            createTaskContextRequest,createTaskContextSuccess,createTaskContextFailure,
            updateTaskRequest,updateTaskSuccess,updateTaskFailure,
            updateTaskContextRequest,updateTaskContextSuccess,updateTaskContextFailure,
            deleteTaskRequest,deleteTaskSuccess,deleteTaskFailure,
            fetchMyTasksRequest,fetchMyTasksSuccess,fetchMyTasksFailure,
            fetchGanttRequest,fetchGanttSuccess,fetchGanttFailure,
            resetTaskState
}from '../task/taskReducer';

describe('task',()=>{
    const initialState={
        tasks:[],
        currentTask:null,
        createContext:{ memberList:[], taskList:[] },   // 등록 폼 참고 데이터
        editContext:{ task:null, memberList:[], taskList:[] }, // 수정 폼 참고 데이터
        myTasks:[],
        myTasksPaging:null,
        myTasksTotalCnt:0,
        ganttTasks:[],
        loading:false,
        error:null,
        success:false 
    };

    // === 상세 조회 ===
    it('fetchTaskDetailRequest&fetchTaskDetailSuccess',()=>{
        let state = taskReducer(initialState,fetchTaskDetailRequest());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);

        const payload = {
            task: {taskId:1, title:'태스크1'},
            proId: 10,
            parentTask: null,
            impactTasks: [],
            isDelayed: false
        };
        state = taskReducer(initialState,fetchTaskDetailSuccess(payload));
        expect(state.loading).toBe(false); 
        expect(state.currentTask).toEqual(payload);
        expect(state.success).toBe(true);
    });
    it('fetchTaskDetailFailure', () => {
        const state = taskReducer(initialState, fetchTaskDetailFailure("단건 게시글 조회 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("단건 게시글 조회 실패");
    });

    // === 태스크 등록 
    it('createTaskRequest & createTaskSuccess', () => {
        let state = taskReducer(initialState, createTaskRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
        const prev = {
            ...initialState,
            tasks: [{taskId:1, title:'태스크1'}],
            loading: true,
        };
        const newTask = {taskId:2, title:'태스크2'};
        state = taskReducer(prev, createTaskSuccess({task:newTask}) );
        expect(state.loading).toBe(false);
        expect(state.tasks).toEqual([newTask, ...prev.tasks]);
        expect(state.success).toBe(true);
    });
    it('createTaskFailure', () => {
        const state = taskReducer(initialState, createTaskFailure("태스크 등록 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("태스크 등록 실패");
    });

    // === 태스크 등록 참고 데이터 (memberList, taskList) ===
    it('createTaskContextRequest & createTaskContextSuccess', ()=>{
        let state = taskReducer(initialState,createTaskContextRequest());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();

        const payload = {
            memberList: [{pmId:1, empId:1}, {pmId:2, empId:2}],
            taskList: [{taskId:1, title:'선행작업1'}]
        };
        state = taskReducer(initialState,createTaskContextSuccess(payload));
        expect(state.loading).toBe(false);
        expect(state.createContext).toEqual(payload);
    });
    it('createTaskContextFailure', () => {
        const state = taskReducer(initialState, createTaskContextFailure("등록 참고 데이터 조회 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("등록 참고 데이터 조회 실패");
    });

    // === 태스크 수정 ===
    it('updateTaskRequest & updateTaskSuccess', () => {
        let state = taskReducer(initialState, updateTaskRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);

        const prev = {
            ...initialState,
            tasks: [{taskId:1, title:'태스크1'}],
            currentTask: {
            task: {taskId:1, title:'수정 전'},
            proId: 10,
            parentTask: null,
            impactTasks: [],
            isDelayed: false
        },
            loading: true,
        };
        const updatedTask = {taskId:1, title:'태스크 수정'};
        state = taskReducer(prev, updateTaskSuccess({task:updatedTask}) );
        expect(state.loading).toBe(false);
        expect(state.tasks).toEqual([updatedTask]);
        expect(state.currentTask.task).toEqual(updatedTask);
        expect(state.success).toBe(true);
    });
    it('updateProjFailure', () => {
        const state = taskReducer(initialState, updateTaskFailure("태스크 수정 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("태스크 수정 실패");
    });

    // === 태스크 수정 참고 데이터 (task, memberList, taskList) ===
    it('updateTaskContextRequest & updateTaskContextSuccess', ()=>{
        let state = taskReducer(initialState,updateTaskContextRequest());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();

        const payload = {
            task: {taskId:1, title:'태스크1', taskStatus:'TODO'},
            taskList: [{taskId:2, title:'선행작업1'}],
            memberList: [{pmId:1, empId:1}]
        };
        state = taskReducer(initialState,updateTaskContextSuccess(payload));
        expect(state.loading).toBe(false);
        expect(state.editContext).toEqual(payload);
    });
    it('updateTaskContextFailure', () => {
        const state = taskReducer(initialState, updateTaskContextFailure("수정 참고 데이터 조회 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("수정 참고 데이터 조회 실패");
    });

    // === 태스크 삭제 ===
    it('deleteTaskSuccess',()=>{
        const prev = {...initialState, tasks:[{taskId:1, title:'태스크1'}]};
        const state = taskReducer(prev, deleteTaskSuccess(1));
        expect(state.tasks).toHaveLength(0);
        expect(state.tasks.length).toBe(0);
        expect(state.success).toEqual(true);
    });
    it('deleteTaskRequest', ()=> {
        let state = taskReducer(initialState, deleteTaskRequest() );
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
    });
    it('deleteTaskFailure', () => {
        const state = taskReducer(initialState, deleteTaskFailure("태스크 삭제 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("태스크 삭제 실패");
    });

    // === 내 태스크 목록 ===
    it('fetchMyTasksRequest & fetchMyTasksSuccess', ()=>{
        let state = taskReducer(initialState,fetchMyTasksRequest());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();

        const payload = { 
        tasks: [
            {taskId:1, title:'태스크1'},
            {taskId:2, title:'태스크2'}
        ], 
        paging: {
            pstartno:1,
            totalPage:1
            }, 
        totalCnt:2
        }; 
        
        state = taskReducer(initialState,fetchMyTasksSuccess(payload));
        expect(state.loading).toBe(false);
        expect(state.myTaskstasks).toEqual(payload.task);
        expect(state.myTasksPaging).toEqual(payload.paging);
         expect(state.myTasksTotalCnt).toEqual(payload.totalCnt);
    });
    it('fetchMyTasksFailure', () => {
        const state = taskReducer(initialState, fetchMyTasksFailure("전체 목록 조회 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("전체 목록 조회 실패");
    });

    // === 간트차트 ===
    it('fetchGanttRequest & fetchGanttSuccess', ()=>{
        let state = taskReducer(initialState,fetchGanttRequest());
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();

        const ganttTasks = [
            {taskId:1, title:'태스크1'},
            {taskId:2, title:'태스크2'}
        ];
        state = taskReducer(initialState,fetchGanttSuccess(ganttTasks));
        expect(state.loading).toBe(false);
        expect(state.ganttTasks).toEqual(ganttTasks);
    });
    it('fetchGanttFailure', () => {
        const state = taskReducer(initialState, fetchGanttFailure("간트차트 조회 실패") );
        expect(state.loading).toBe(false);
        expect(state.error).toBe("간트차트 조회 실패");
    });

    // === 초기화 ===
    it('resetTaskState', () => {
        const prev = {...initialState, loading: true, error:'error', success: true};
        const state = taskReducer(prev, resetTaskState() );
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
    });

});
// npx jest reducers/__tests__/task.test.js