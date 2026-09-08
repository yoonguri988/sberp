import {call,put} from 'redux-saga/effects';
import axios from '../../api/axios';
import   { fetchProjMemRequest,fetchProjMemSuccess,fetchProjMemFailure,
              createProjMemRequest,createProjMemSuccess,createProjMemFailure,
              deleteProjMemRequest,deleteProjMemSuccess,deleteProjMemFailure,
              resetProjMemState
} from '../../reducers/proj/projMemReducer';
import { fetchProjMem,createProjMem,deleteProjMem } from '../proj/projMemSaga';

jest.mock('../../api/axios');
describe('projMem saga',()=>{
    afterEach(()=>{jest.clearAllMocks()}); // afterEach

    // === 전체 목록 ===
    it('fetchProjMem success',()=>{
        const generator = fetchProjMem(fetchProjMemRequest());
        expect(generator.next().value.type).toBe('CALL');

        const mockData = { list:[{pmId:1, empId:1}, {pmId:2, empId:2}]};
        const putStep = generator.next({data:mockData}).value;
        expect(putStep).toEqual(put(fetchProjMemSuccess(mockData)));
    });

    // === 멤버 등록 ===
    it('createProjMem success', () => {
        const payload = { title: '멤버 등록' };
        const generator = createProjMem(createProjMemRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { success:true, message:'멤버 등록 성공', project_member:{pmId:1, empId:1}};
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(createProjMemSuccess(mockData)));
    });

    // === 멤버 삭제 ===
    it('deleteProjMem success', () => {
        const payload = {
        pmId: 10,
        proId: 1
        };
        const generator = deleteProjMem(deleteProjMemRequest(payload));
        expect(generator.next().value.type).toBe('CALL');

        const putStep = generator.next().value;
        expect(putStep).toEqual(put(deleteProjMemSuccess(10)));
    });

});

// npx jest sagas/__tests__/projMem.test.js