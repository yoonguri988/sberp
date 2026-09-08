import {call,put} from 'redux-saga/effects';
import axios from '../../api/axios';
import   {  fetchTaskDetailRequest,fetchTaskDetailSuccess,fetchTaskDetailFailure,
            createTaskRequest,createTaskSuccess,createTaskFailure,
            createTaskContextRequest,createTaskContextSuccess,createTaskContextFailure,
            updateTaskRequest,updateTaskSuccess,updateTaskFailure,
            updateTaskContextRequest,updateTaskContextSuccess,updateTaskContextFailure,
            deleteTaskRequest,deleteTaskSuccess,deleteTaskFailure,
            fetchMyTasksRequest,fetchMyTasksSuccess,fetchMyTasksFailure,
            fetchGanttRequest,fetchGanttSuccess,fetchGanttFailure,
            resetTaskState
} from '../../reducers/task/taskReducer';
import { fetchTaskDetail,createTask,createTaskContext,updateTask
        ,updateTaskContext,deleteTask,fetchMyTasks,fetchGantt
        } from '../task/taskSaga';

jest.mock('../../api/axios');
describe('task saga',()=>{
     afterEach(()=>{jest.clearAllMocks()});

    // 상세 조회
    it('fetchTaskDetail success', () => {
        const taskId = 1;
        const generator = fetchTaskDetail(fetchTaskDetailRequest(taskId));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = {  
            task: {taskId:1, title:'태스크1'},
            proId: 10,
            parentTask: null,
            impactTasks: [],
            isDelayed: false
        };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(fetchTaskDetailSuccess(mockData)));
    });

    // 태스크 등록
    it('createTask success', () => {
        const payload = { proId:10, pmId:1, title:'새 태스크' };
        const generator = createTask(createTaskRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { success:true, message:'태스크 등록 성공', task:{taskId:5, title:'새 태스크'} };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(createTaskSuccess(mockData)));
    });

    // 태스크 등록 참고 데이터
    it('createTaskContext success', () => {
        const projectProId = 10;
        const generator = createTaskContext(createTaskContextRequest(projectProId));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { memberList:[{pmId:1}], taskList:[{taskId:1}] };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(createTaskContextSuccess(mockData)));
    });

    // 태스크 수정
    it('updateTask success', () => {
        const payload = { taskId:1, dto:{ title:'태스크 수정' } };
        const generator = updateTask(updateTaskRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { success:true, message:'태스크 수정 성공', task:{taskId:1, title:'태스크 수정'} };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(updateTaskSuccess(mockData)));
    });

    // 태스크 수정 참고 데이터
    it('updateTaskContext success', () => {
        const payload = { taskId:1, projectProId:10 };
        const generator = updateTaskContext(updateTaskContextRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { task:{taskId:1, title:'태스크1'}, taskList:[], memberList:[] };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(updateTaskContextSuccess(mockData)));
    });

    // 태스크 삭제
    it('deleteTask success', () => {
        const payload = { taskId:1, proId:10 };
        const generator = deleteTask(deleteTaskRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const putStep = generator.next().value;
        expect(putStep).toEqual(put(deleteTaskSuccess(payload.taskId)));
    });

    // 내 태스크 목록
    it('fetchMyTasks success', () => {
        const searchParams = { keyword:'', pstartno:1 };
        const generator = fetchMyTasks(fetchMyTasksRequest(searchParams));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { tasks:[{taskId:1, title:'태스크1'}], paging:{pstartno:1}, totalCnt:1 };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(fetchMyTasksSuccess(mockData)));
    });

    // 간트차트
    it('fetchGantt success', () => {
        const params = { proId:10 };
        const generator = fetchGantt(fetchGanttRequest(params));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = [{taskId:1, title:'태스크1'}, {taskId:2, title:'태스크2'}];
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(fetchGanttSuccess(mockData)));
    });

});

// npx jest sagas/__tests__/taskSaga.test.js