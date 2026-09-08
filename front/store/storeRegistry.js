// store/storeRegistry.js
// redux store 인스턴스를 컴포넌트 트리 밖(api/axios.js 인터셉터 등)에서도
// dispatch 할 수 있도록 등록/조회하는 아주 단순한 레지스트리.
// next-redux-wrapper 는 store 를 컴포넌트 props 로 내려주기 때문에
// axios 인터셉터처럼 React 트리 밖에 있는 모듈에서는 store 를 직접 import 할 수 없다.
// 그래서 makeStore() 에서 생성된(브라우저용) 인스턴스를 여기에 등록해두고 꺼내 쓴다.

let storeInstance = null;

export const setStore = (store) => {
  storeInstance = store;
};

export const getStore = () => storeInstance;
