// sagas/rsm/resumePublicSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import apctApi from "../../api/apctAxios";
import {
  uploadResumeRequest,
  uploadResumeSuccess,
  uploadResumeFailure,
} from "../../reducers/rsm/resumePublicReducer";

const RESUME_PUBLIC_API_BASE = "/api/public/resume";

// uploadResume  - POST /api/public/resume
//   백엔드가 @RequestPart("request") ResumeRequest(JSON) + @RequestPart("file") MultipartFile
//   두 파트를 따로 받으므로, JSON 파트는 Blob(application/json)으로 감싸서 append해야 한다.
//   payload: { apctId, file }  ※ file은 <Upload> beforeUpload에서 받은 File 객체(PDF)
export const uploadResumeApi = ({ apctId, file }) => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify({ apctId })], { type: "application/json" }),
  );
  formData.append("file", file);
  return apctApi.post(RESUME_PUBLIC_API_BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export function* uploadResume(action) {
  try {
    const result = yield call(uploadResumeApi, action.payload);
    yield put(uploadResumeSuccess(result.data));
  } catch (err) {
    yield put(
      uploadResumeFailure(
        err.response?.data?.message || err.response?.data?.error || err.message,
      ),
    );
  }
}

function* watchUploadResume() {
  yield takeLatest(uploadResumeRequest.type, uploadResume);
}

export default function* resumePublicSaga() {
  yield all([call(watchUploadResume)]);
}
