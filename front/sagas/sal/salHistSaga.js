// sagas/sal/salHistSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  searchSalHistRequest,
  searchSalHistSuccess,
  searchSalHistFailure,
} from "../../reducers/sal/salHistReducer";

const SALHIST_API_BASE = "/api/salhist";

// searchSalHist  - GET /api/salhist 급여 변경이력 조회
//   params: { actorEmpId, changeType, from, to, page(0-based), size }
export const searchSalHistApi = ({
  actorEmpId,
  changeType,
  from,
  to,
  page = 0,
  size = 10,
} = {}) =>
  api.get(SALHIST_API_BASE, {
    params: {
      ...(actorEmpId ? { actorEmpId } : {}),
      ...(changeType ? { changeType } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      page,
      size,
    },
  });

export function* searchSalHist(action) {
  try {
    const result = yield call(searchSalHistApi, action.payload);
    yield put(searchSalHistSuccess(result.data));
  } catch (err) {
    yield put(searchSalHistFailure(err.response?.data?.error || err.response?.data?.message || err.message));
  }
}

function* watchSearchSalHist() {
  yield takeLatest(searchSalHistRequest.type, searchSalHist);
}

export default function* salHistSaga() {
  yield all([call(watchSearchSalHist)]);
}
