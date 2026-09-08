// sagas/__tests__/projSaga.test.js

import {call,put} from 'redux-saga/effects';
import axios from '../../api/axios';
import   { fetchProjRequest,fetchProjSuccess,fetchProjFailure,
              fetchProjDetailRequest,fetchProjDetailSuccess,fetchProjDetailFailure,
              createProjRequest,createProjSuccess,createProjFailure,
              updateProjRequest,updateProjSuccess,updateProjFailure,
              deleteProjRequest,deleteProjSuccess,deleteProjFailure,
              searchEmpRequest,searchEmpSuccess,searchEmpFailure,
              analyzeProjRequest,analyzeProjSuccess,analyzeProjFailure,
} from '../../reducers/proj/projReducer';
import { fetchProj,fetchProjDetail,createProj,updateProj,deleteProj,searchEmp,analyzeProj } from '../proj/projSaga';

jest.mock('../../api/axios');
describe('proj saga',()=>{
    afterEach(()=>{jest.clearAllMocks()}); // afterEach

    // === 전체 목록 ===
    it('fetchProj success',()=>{
        const generator = fetchProj(fetchProjRequest());
        expect(generator.next().value.type).toBe('CALL');

        const mockData = { list:[{proId:1, title:'프로젝트1'}], paging:{pstartno:1} };
        const putStep = generator.next({data:mockData}).value;
        expect(putStep).toEqual(put(fetchProjSuccess(mockData)));
    });

    // === 상세 조회 ===
    it('fetchProjDetail success', () => {
        const payload = {proId:1, pstartno:1};
        const generator = fetchProjDetail(fetchProjDetailRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { dto:{proId:1, title:'프로젝트1'}, list:[], paging:{}, memberList:[] };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(fetchProjDetailSuccess(mockData)));
    });

    // === 등록 ===
    it('createProj success', () => {
        const payload = { title: '새 프로젝트' };
        const generator = createProj(createProjRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { success:true, message:'프로젝트 등록 성공', project:{proId:10, title:'새 프로젝트'} };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(createProjSuccess(mockData)));
    });

    // === 수정 ===
    it('updateProj success', () => {
        const payload = { proId: 10, dto:{ title: '수정된 프로젝트' } };
        const generator = updateProj(updateProjRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { success:true, message:'프로젝트 수정 성공', project:{proId:10, title:'수정된 프로젝트'} };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(updateProjSuccess(mockData)));
    });

    // === 삭제 ===
    it('deleteProj success', () => {
        const generator = deleteProj(deleteProjRequest(10));
        expect(generator.next().value.type).toBe('CALL');

        const putStep = generator.next().value;
        expect(putStep).toEqual(put(deleteProjSuccess(10)));
    });

    // === 사원 검색 ===
    it('searchEmp success', () => {
        const generator = searchEmp(searchEmpRequest('홍길동'));
        expect(generator.next().value.type).toBe('CALL');

        const mockData = [{empId:1, empName:'홍길동'}];
        const putStep = generator.next({ data: mockData }).value;
        expect(putStep).toEqual(put(searchEmpSuccess(mockData)));
    });

    // === AI 분석 ===
    it('analyzeProj success', () => {
        const generator = analyzeProj(analyzeProjRequest(10));
        expect(generator.next().value.type).toBe('CALL');

        const mockData = { risk:'HIGH', reason:'일정 지연' };
        const putStep = generator.next({ data: mockData }).value;
        expect(putStep).toEqual(put(analyzeProjSuccess(mockData)));
    });
});

// npx jest sagas/__tests__/proj.test.js