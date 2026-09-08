// sagas/index.js
import { all, fork } from "redux-saga/effects";

import authSaga from "./auth/authSaga";
import companySaga from "./com/companySaga";
import deptSaga from "./dept/deptSaga";
import deptTransferSaga from "./dept/deptTransferSaga";
import apiUtilSaga from "./api/apiUtilSaga";
import resourceSaga from "./res/resourceSaga";
import resvSaga from "./resv/resvSaga";
import adminResvSaga from "./resv/adminResvSaga";
import apprFormSaga from "./appr/apprFormSaga";
import apprDocSaga from "./appr/apprDocSaga";
import apprLineDelegationSaga from "./appr/apprLineDelegationSaga";
import apprLogSaga from "./appr/apprLogSaga";
import empSaga from "./emp/empSaga";
import posSaga from "./pos/posSaga";
import evalSaga from "./eval/evalSaga";
import evalPeriodSaga from "./eval/evalPeriodSaga";
import evalReportSaga from "./eval/evalReportSaga";
import permSaga from "./perm/permSaga";
import projSaga from "./proj/projSaga";
import projMemSaga from "./proj/projMemSaga";
import taskSaga from "./task/taskSaga";
import noticeSaga from "./notice/noticeSaga";
import weekSaga from "./week/weekSaga";
import loginHistorySaga from "./auth/loginHistorySaga";
// 급여 관련 사가
import salStdSaga from "./sal/salStdSaga";
import salPaySaga from "./sal/salPaySaga";
import salAcctSaga from "./sal/salAcctSaga";
import salHistSaga from "./sal/salHistSaga";
import salPolicySaga from "./sal/salPolicySaga";
import salAiChatSaga from "./sal/salAiChatSaga";
import salAiDocSaga from "./sal/salAiDocSaga";
// 근태, 연차
import attSaga from "./att/attSaga";
import leaveBalanceSaga from "./att/leaveBalanceSaga"
import hrAiChatSaga from "./emp/hrAiChatSaga";
import hrAiDocSaga from "./emp/hrAiDocSaga";
// 채용관리
import recruitSaga from "./rec/recruitSaga";
import recruitPublicSaga from "./rec/recruitPublicSaga";
import applicantSaga from "./apct/applicantSaga";
import applicantPublicSaga from "./apct/applicantPublicSaga";
import apctAuthSaga from "./apct/apctAuthSaga";
import resumeSaga from "./rsm/resumeSaga";
import resumePublicSaga from "./rsm/resumePublicSaga";

// 메인 화면 - 대시보드
import adminDashboardSaga from "./dashboard/adminDashboardSaga";
import memberDashboardSaga from "./dashboard/memberDashboardSaga";

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(companySaga),
    fork(deptSaga),
    fork(deptTransferSaga),
    fork(apiUtilSaga),
    fork(resourceSaga),
    fork(resvSaga),
    fork(adminResvSaga),
    fork(apprFormSaga),
    fork(apprDocSaga),
    fork(apprLineDelegationSaga),
    fork(apprLogSaga),
    fork(empSaga),
    fork(posSaga),
    fork(permSaga),
    fork(evalSaga),
    fork(evalPeriodSaga),
    fork(evalReportSaga),
    fork(projSaga),
    fork(projMemSaga),
    fork(taskSaga),
    fork(noticeSaga),
    fork(weekSaga),
    fork(loginHistorySaga),
    // 급여 관련 사가
    fork(salStdSaga),
    fork(salPaySaga),
    fork(salAcctSaga),
    fork(salHistSaga),
    fork(salPolicySaga),
    fork(salAiChatSaga),
    fork(salAiDocSaga),
    // 근태, 연차
    fork(attSaga),
    fork(leaveBalanceSaga),
    fork(hrAiChatSaga),
    fork(hrAiDocSaga),
    // 채용관리 관련 사가
    fork(recruitSaga),
    fork(recruitPublicSaga),
    fork(applicantSaga),
    fork(applicantPublicSaga),
    fork(apctAuthSaga),
    fork(resumeSaga),
    fork(resumePublicSaga),
    // 메인 화면 - 대시보드
    fork(adminDashboardSaga),
    fork(memberDashboardSaga),
  ]);
}
