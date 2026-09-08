import {all,call,put,take,takeLatest} from 'redux-saga/effects';
import api from '../../api/axios';
import{     fetchTaskDetailRequest,fetchTaskDetailSuccess,fetchTaskDetailFailure,
            createTaskRequest,createTaskSuccess,createTaskFailure,
            createTaskContextRequest,createTaskContextSuccess,createTaskContextFailure,
            updateTaskRequest,updateTaskSuccess,updateTaskFailure,
            updateTaskContextRequest,updateTaskContextSuccess,updateTaskContextFailure,
            deleteTaskRequest,deleteTaskSuccess,deleteTaskFailure,
            fetchMyTasksRequest,fetchMyTasksSuccess,fetchMyTasksFailure,
            fetchGanttRequest,fetchGanttSuccess,fetchGanttFailure,
            fetchCriticalPathRequest,fetchCriticalPathSuccess,fetchCriticalPathFailure,
            resetTaskState
}from "../../reducers/task/taskReducer";

const TASK_API_BASE="/api/tasks";

    // 상세 조회
    export const fetchTaskDetailAPI=(taskId)=>api.get(`${TASK_API_BASE}/${taskId}`);
    export function* fetchTaskDetail(action){
        try{
            const result = yield call(fetchTaskDetailAPI,action.payload)
            yield put(fetchTaskDetailSuccess(result.data))
        }catch(err){
            yield put(fetchTaskDetailFailure(err.response?.data?.message || err.message));
        }
    }

    // 태스크 등록
    export const createTaskAPI = (dto) => api.post(TASK_API_BASE, dto);
    export function* createTask(action){
        try {
            const result = yield call(createTaskAPI, action.payload); 
            yield put(createTaskSuccess(result.data));
        } catch (err) {
            yield put(createTaskFailure(err.response?.data?.message || err.message));
        }
    }
    // 태스크 등록 참고 데이터
   export const createTaskContextAPI = (projectProId) => api.get(`${TASK_API_BASE}/create-context`, {params:{projectProId}});
    export function* createTaskContext(action){
        try {
            const result = yield call(createTaskContextAPI, action.payload); 
            yield put(createTaskContextSuccess(result.data));
        } catch (err) {
            yield put(createTaskContextFailure(err.response?.data?.message || err.message));
        }
    }
    // 태스크 수정
    export const updateTaskAPI=({taskId,dto})=>api.put(`${TASK_API_BASE}/${taskId}`,dto);
    export function* updateTask(action){
        try{
            const result = yield call(updateTaskAPI,action.payload);
            yield put(updateTaskSuccess(result.data))
        }catch(err){
            yield put(updateTaskFailure(err.response?.data?.message || err.message));
        }
    }
    // 태스크 수정 참고 데이터
   export const updateTaskContextAPI = ({taskId,projectProId})=>api.get(`${TASK_API_BASE}/${taskId}/edit-context`, {params:{projectProId}});
    export function* updateTaskContext(action){
        try {
            const result = yield call(updateTaskContextAPI, action.payload); 
            yield put(updateTaskContextSuccess(result.data));
        } catch (err) {
            yield put(updateTaskContextFailure(err.response?.data?.message || err.message));
        }
    }
    // 태스크 삭제
    export const deleteTaskAPI=({taskId,proId})=>api.delete(`${TASK_API_BASE}/${taskId}`,{params:{proId}});
    export function* deleteTask(action){
        try{
            yield call(deleteTaskAPI,action.payload)
            yield put(deleteTaskSuccess(action.payload.taskId))
        }catch(err){
            yield put(deleteTaskFailure(err.response?.data?.message || err.message));
        }
    }
    // 내 태스크 목록
    export const fetchMyTasksAPI=(params)=>api.get(`${TASK_API_BASE}/mine`,{params});
    export function* fetchMyTasks(action){
        try{
            const result = yield call(fetchMyTasksAPI,action.payload)
            yield put(fetchMyTasksSuccess(result.data))
        }catch(err){
            yield put(fetchMyTasksFailure(err.response?.data?.message || err.message));
        }
    }

    // 간트차트
    export const fetchGanttAPI = (params) => api.get(`${TASK_API_BASE}/gantt`,{params});
    export function* fetchGantt(action){
        try{
            const result = yield call(fetchGanttAPI, action.payload)
            yield put(fetchGanttSuccess(result.data))
        }catch(err){
            yield put(fetchGanttFailure(err.response?.data?.message || err.message));
        }
    }

    // 핵심 병목(Critical Path)
    export const fetchCriticalPathAPI = (params) => api.get(`${TASK_API_BASE}/critical-path`,{params});
    export function* fetchCriticalPath(action){
        try{
            const result = yield call(fetchCriticalPathAPI, action.payload)
            yield put(fetchCriticalPathSuccess(result.data))
        }catch(err){
            yield put(fetchCriticalPathFailure(err.response?.data?.message || err.message));
        }
    }
function* watchFetchTaskDetail(){yield takeLatest(fetchTaskDetailRequest.type,fetchTaskDetail);}
function* watchCreateTask(){yield takeLatest(createTaskRequest.type,createTask);}
function* watchCreateTaskContext(){yield takeLatest(createTaskContextRequest.type,createTaskContext);}
function* watchUpdateTask(){yield takeLatest(updateTaskRequest.type,updateTask);}
function* watchUpdateTaskContext(){yield takeLatest(updateTaskContextRequest.type,updateTaskContext);}
function* watchDeleteTask(){yield takeLatest(deleteTaskRequest.type,deleteTask);}
function* watchFetchMyTasks(){yield takeLatest(fetchMyTasksRequest.type,fetchMyTasks);}
function* watchFetchGantt(){yield takeLatest(fetchGanttRequest.type,fetchGantt);}
function* watchFetchCriticalPath(){yield takeLatest(fetchCriticalPathRequest.type,fetchCriticalPath);}

export default function* taskSaga(){
    yield all([
        call(watchFetchTaskDetail),
        call(watchCreateTask),
        call(watchCreateTaskContext),
        call(watchUpdateTask),
        call(watchUpdateTaskContext),
        call(watchDeleteTask),
        call(watchFetchMyTasks),
        call(watchFetchGantt),
        call(watchFetchCriticalPath)
    ]);
}