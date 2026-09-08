// sagas/api/apiUtilSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios"; // 프로젝트 공통 axios 인스턴스 (JWT 인터셉터 적용) - 경로는 실제 프로젝트에 맞게 수정

import {
  verifyBizNoRequest,
  verifyBizNoSuccess,
  verifyBizNoFailure,

  processOcrRequest,
  processOcrSuccess,
  processOcrFailure,
} from "../../reducers/api/apiUtilReducer";

const API_UTIL_BASE = "/api/util";

// =========================================================
// 1) 사업자등록번호 진위확인 POST /api/util/bizno/verify
// action.payload: BizNoVerifyRequest { bizNo, startDt, ceoName }
// =========================================================
export const verifyBizNoApi = (payload) =>
  api.post(`${API_UTIL_BASE}/bizno/verify`, payload);

export function* verifyBizNo(action) {
  try {
    const payload = action.payload;
    const res = yield call(verifyBizNoApi, payload);

    yield put(verifyBizNoSuccess(res.data));
  } catch (err) {
    yield put(
      verifyBizNoFailure(err.response?.data?.message || "사업자번호 진위확인 중 오류가 발생했습니다.")
    );
  }
}

// =========================================================
// 2) 명함/사업자등록증 OCR POST /api/util/ocr (multipart/form-data)
// action.payload: file (File)
// =========================================================
export const processOcrApi = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(`${API_UTIL_BASE}/ocr`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export function* processOcr(action) {
  try {
    const file = action.payload;
    const res = yield call(processOcrApi, file);

    yield put(processOcrSuccess(res.data));
  } catch (err) {
    yield put(processOcrFailure(err.response?.data?.message || "OCR 처리 중 오류가 발생했습니다."));
  }
}

// =========================================================
// Watcher
// =========================================================
function* watchVerifyBizNo() { yield takeLatest(verifyBizNoRequest.type, verifyBizNo); }
function* watchProcessOcr() { yield takeLatest(processOcrRequest.type, processOcr); }

export default function* apiUtilSaga() {
  yield all([
    call(watchVerifyBizNo),
    call(watchProcessOcr),
  ]);
}