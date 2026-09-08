// sagas/sal/salAiDocSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  listSalAiDocRequest,
  listSalAiDocSuccess,
  listSalAiDocFailure,
  uploadSalAiDocRequest,
  uploadSalAiDocSuccess,
  uploadSalAiDocFailure,
} from "../../reducers/sal/salAiDocReducer";

const SALAI_DOC_API_BASE = "/api/salai/docs";

// listSalAiDoc  - GET /api/salai/docs 급여 규정 문서 전체 조회(개정 이력 포함)
export const listSalAiDocApi = () => api.get(SALAI_DOC_API_BASE);

export function* listSalAiDoc() {
  try {
    const result = yield call(listSalAiDocApi);
    yield put(listSalAiDocSuccess(result.data));
  } catch (err) {
    yield put(
      listSalAiDocFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// uploadSalAiDoc  - POST /api/salai/docs 급여 규정 문서 업로드(개정)
//   payload: { file, title }  ※ file은 <Upload> beforeUpload에서 받은 File 객체
export const uploadSalAiDocApi = ({ file, title }) => {
  const formData = new FormData();
  formData.append("file", file);
  if (title) {
    formData.append("title", title);
  }
  return api.post(SALAI_DOC_API_BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export function* uploadSalAiDoc(action) {
  try {
    const result = yield call(uploadSalAiDocApi, action.payload);
    yield put(uploadSalAiDocSuccess(result.data));
  } catch (err) {
    yield put(
      uploadSalAiDocFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

function* watchListSalAiDoc() {
  yield takeLatest(listSalAiDocRequest.type, listSalAiDoc);
}
function* watchUploadSalAiDoc() {
  yield takeLatest(uploadSalAiDocRequest.type, uploadSalAiDoc);
}

export default function* salAiDocSaga() {
  yield all([call(watchListSalAiDoc), call(watchUploadSalAiDoc)]);
}
