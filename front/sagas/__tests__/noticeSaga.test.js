import {call,put} from 'redux-saga/effects';
import axios from '../../api/axios';
import   {  fetchNoticeRequest, fetchNoticeSuccess, fetchNoticeFailure,
            fetchNoticeDetailRequest, fetchNoticeDetailSuccess, fetchNoticeDetailFailure,
            createNoticeRequest, createNoticeSuccess, createNoticeFailure,
            updateNoticeRequest, updateNoticeSuccess, updateNoticeFailure,
            deleteNoticeRequest, deleteNoticeSuccess, deleteNoticeFailure,
            resetNoticeState
} from '../../reducers/notice/noticeReducer';
import { fetchNotice,fetchNoticeDetail,createNotice,updateNotice,deleteNotice} from '../notice/noticeSaga';

jest.mock('../../api/axios');
describe('notice saga',()=>{
     afterEach(()=>{jest.clearAllMocks()});

    // 전체 목록
    it('fetchNotice success',()=>{
        const generator = fetchNotice(fetchNoticeRequest());
        expect(generator.next().value.type).toBe('CALL');

        const mockData = { list:[{bno:1, title:'공지1'}], paging:{pstartno:1} };
        const putStep = generator.next({data:mockData}).value;
        expect(putStep).toEqual(put(fetchNoticeSuccess(mockData)));
    });
    // 상세 조회
    it('fetchNoticeDetail success', () => {
        const bno = 1;
        const generator = fetchNoticeDetail(fetchNoticeDetailRequest(bno));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { bno:1, title:'공지1', content:'내용' };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(fetchNoticeDetailSuccess(mockData)));
    });
    // 공지 등록
    it('createNotice success', () => {
        const payload = { dto:{title:'새 공지', content:'내용'}, file:null };
        const generator = createNotice(createNoticeRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { success:true, message:'공지 등록 성공', bno:1, notice:{bno:1, title:'새 공지'} };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(createNoticeSuccess(mockData)));
    });
    // 공지 수정
    it('updateNotice success', () => {
        const payload = { bno:1, dto:{title:'수정된 공지'}, file:null };
        const generator = updateNotice(updateNoticeRequest(payload));

        expect(generator.next().value.type).toBe('CALL');

        const mockData = { success:true, message:'공지 수정 성공', notice:{bno:1, title:'수정된 공지'} };
        const putStep = generator.next({ data: mockData }).value;

        expect(putStep).toEqual(put(updateNoticeSuccess(mockData)));
    });
    // 공지 삭제
    it('deleteNotice success', () => {
        const bno = 1;
        const generator = deleteNotice(deleteNoticeRequest(bno));

        expect(generator.next().value.type).toBe('CALL');

        const putStep = generator.next().value;
        expect(putStep).toEqual(put(deleteNoticeSuccess(bno)));
    });
});
// npx jest sagas/__tests__/notice.test.js