// sagas/pos/__tests__/posSaga.test.js
import { call, put } from 'redux-saga/effects';
import axios from 'axios';

import {
    listPosRequest, listPosSuccess, listPosFailure,
    detailPosRequest, detailPosSuccess, detailPosFailure,
    createPosRequest, createPosSuccess, createPosFailure,
    updatePosRequest, updatePosSuccess, updatePosFailure,
    deletePosRequest, deletePosSuccess, deletePosFailure,
} from '../../reducers/pos/posReducer';

import { listPos, detailPos, createPos, updatePos, deletePos } from '../posSaga';

jest.mock('axios');

describe('pos saga', () => {
    afterEach(() => { jest.clearAllMocks() });

    // --- 목록 조회 ---
    it('listPos success', () => {
        const generator = listPos(listPosRequest());

        // 1. 첫 번째 yield → call(listPosApi)
        expect(generator.next().value.type).toBe('CALL');

        // 2. API 결과를 넣어주고 → put(listPosSuccess(data))
        const mockData = [
            { posId: 1, posName: '사원' },
            { posId: 2, posName: '대리' },
        ];
        const putStep = generator.next({ data: mockData }).value;
        expect(putStep).toEqual(put(listPosSuccess(mockData)));
    });

    it('listPos failure', () => {
        const generator = listPos(listPosRequest());

        // 1. call 단계
        generator.next();

        // 2. 에러를 throw → catch 블록으로 진입
        const error = { response: { data: { message: '서버 오류' } } };
        const putStep = generator.throw(error).value;
        expect(putStep).toEqual(put(listPosFailure('서버 오류')));
    });

    // --- 상세 조회 ---
    it('detailPos success', () => {
        const generator = detailPos(detailPosRequest(1));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { posId: 1, posName: '사원', posCode: 'P01' };
        const putStep = generator.next({ data: mockData }).value;
        expect(putStep).toEqual(put(detailPosSuccess(mockData)));
    });

    // --- 등록 ---
    it('createPos success', () => {
        const payload = { posCode: 'P03', posName: '과장' };
        const generator = createPos(createPosRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { posId: 3, posCode: 'P03', posName: '과장' };
        const putStep = generator.next({ data: mockData }).value;
        expect(putStep).toEqual(put(createPosSuccess(mockData)));
    });

    // --- 수정 ---
    it('updatePos success', () => {
        const payload = { posId: 1, posName: '수정된 직급' };
        const generator = updatePos(updatePosRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const putStep = generator.next({ data: payload }).value;
        expect(putStep).toEqual(put(updatePosSuccess(payload)));
    });

    // --- 삭제 ---
    it('deletePos success', () => {
        const generator = deletePos(deletePosRequest(1));

        // 1. call → API 호출
        expect(generator.next().value.type).toBe('CALL');

        // 2. 삭제는 result.data를 안 쓰고 payload(posId)를 그대로 돌려줌
        const putStep = generator.next().value;
        expect(putStep).toEqual(put(deletePosSuccess(1)));
    });
});

// npm test posSaga
