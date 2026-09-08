import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { createWrapper } from "next-redux-wrapper";
import reducer from "../reducers";
import rootSaga from "../sagas";
import { setStore } from "./storeRegistry";

export const makeStore = () => {
  // saga 미들웨어 생성
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer, // reducer
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false, // thunk 미들웨어 사용 x
        serializableCheck: false, // 에러방지목적 - 직렬화검사 비활성
      }).concat(sagaMiddleware), //saga 미들웨어 연결
    devTools: process.env.NODE_ENV !== "production",
  });
  // saga 미들웨어 실행 및 rootSaga연결
  store.sagaTask = sagaMiddleware.run(rootSaga);

  // 브라우저에서 생성된 store 인스턴스만 레지스트리에 등록
  // (axios 인터셉터 등 React 트리 밖 코드에서 dispatch 하기 위함)
  if (typeof window !== "undefined") {
    setStore(store);
  }

  return store;
};
// next.js 에서 redux를 사용할수 있도록 wrapper 생성
export const wrapper = createWrapper(makeStore, {
  debug: false,
  //debug: process.env.NODE_ENV !== "production",
});
