import {call,put} from 'redux-saga/effects';
import axios from '../../api/axios';
import { checkMyReportRequest,checkMyReportSuccess,checkMyReportFailure,
        createMyReportRequest,createMyReportSuccess,createMyReportFailure,
        resetWeekState
} from "../../reducers/week/weekReducer";

import { checkMyReport, createMyReport } from "../week/weekSaga";

jest.mock('../../api/axios');
describe("weekSaga", () => {
    afterEach(() => { jest.clearAllMocks(); });

    // === 개인 주간보고서 생성 가능 여부 확인 ===
    it('checkMyReport success', () => {
        const generator = checkMyReport(checkMyReportRequest());
        expect(generator.next().value.type).toBe('CALL');
        const mockData = { data: true };
        const putStep = generator.next(mockData).value;
        expect(putStep).toEqual( put(checkMyReportSuccess(true)) );
    });
    it('checkMyReport failure', () => {
        const generator = checkMyReport(checkMyReportRequest());
        expect(generator.next().value.type).toBe('CALL');
        const error = {
            response: {
                data: { message: '주간보고서 확인 실패' } }, 
                message: 'Request failed' };
        const putStep = generator.throw(error).value;
        expect(putStep).toEqual( put( checkMyReportFailure( '주간보고서 확인 실패' )));
    });

    // === 개인 주간보고서 PDF 생성 ===
    it('createMyReport success', () => {
        const generator = createMyReport(createMyReportRequest());
        expect(generator.next().value.type).toBe('CALL');
        const mockData = { data: true };
        const putStep = generator.next(mockData).value;
        expect(putStep).toEqual( put(createMyReportSuccess(true)) );
    });
    it('createMyReport failure', () => {
        const generator = createMyReport(createMyReportRequest());
        expect(generator.next().value.type).toBe('CALL');
        const error = {
            response: { data: { message: 'PDF 생성 실패' } }, 
            message: 'Request failed' };
        const putStep = generator.throw(error).value;
        expect(putStep).toEqual( put( createMyReportFailure( 'PDF 생성 실패' ) ) );
    });
});

// npx jest sagas/__tests__/weekSaga.test.js