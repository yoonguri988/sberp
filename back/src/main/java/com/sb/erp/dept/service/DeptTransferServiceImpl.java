package com.sb.erp.dept.service;

import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.api.dto.response.AiRecomResponse;
import com.sb.erp.appr.dto.response.ApprDocImpactResponse;
import com.sb.erp.appr.dto.response.ApprLineImpactResponse;
import com.sb.erp.dept.dto.request.DeptTransferExecuteFormRequest;
import com.sb.erp.dept.dto.request.DeptTransferLogRequest;
import com.sb.erp.dept.dto.request.DeptTransferLogSearchRequest;
import com.sb.erp.dept.dto.response.DeptResponse;
import com.sb.erp.dept.dto.response.DeptTransferImpactResponse;
import com.sb.erp.dept.dto.response.DeptTransferLogResponse;
import com.sb.erp.dept.dto.response.PendingDeptResponse;
import com.sb.erp.dept.repository.DeptTransferLogMapper;
import com.sb.erp.dept.repository.DeptTransferMapper;
import com.sb.erp.emp.dto.response.EmpTransferResponse;
import com.sb.erp.emp.dto.response.EmployeeTransferItemFormReponse;
import com.sb.erp.global.exception.DeptTransferException;
import com.sb.erp.global.integration.OpenAiRecomClient;
import com.sb.erp.resv.dto.response.ResvImpactResponse;

@Service
public class DeptTransferServiceImpl implements DeptTransferService {
	
	@Autowired DeptTransferMapper dao;
	@Autowired DeptTransferLogMapper logDao;
	@Autowired OpenAiRecomClient aiClient;
	
	/** 멀티테넌시 격리 가드 — deptId가 실제로 comId 소속이 아니면 즉시 차단
	 * @throws AccessDeniedException */
    private void assertDeptBelongsToCompany(long deptId, long comId) throws IllegalAccessException, AccessDeniedException {
        if (comId == 0L || dao.countDeptInCompany(deptId, comId) == 0) {
            throw new AccessDeniedException("다른 회사의 부서에는 접근할 수 없습니다.");
        }
    }
	
	@Override
	public DeptTransferImpactResponse getImpact(long comId, long deptId) throws IllegalAccessException, AccessDeniedException {
		// 해당 회사에 해당 부서가 없으면 throws
		assertDeptBelongsToCompany(deptId, comId);
		
		// 부서 존재 여부 확인
		DeptResponse dept = dao.selectOneById(deptId);
		if(dept == null) {
			throw new IllegalArgumentException("존재하지 않는 부서입니다.");
		}
		
		DeptTransferImpactResponse result = new DeptTransferImpactResponse();
		result.setDeptId(deptId); result.setDeptName(dept.getDeptName()); result.setDeptCode(dept.getDeptCode());
		// 이관 대상 사원
		List<EmpTransferResponse> empDtos = dao.findEmployeesByDept(deptId);
		result.setEmployees(empDtos);
		// 사원 기준 미처리 예약
		List<ResvImpactResponse> resvDtos = dao.findPendingResvByDept(deptId);
		result.setReservations(resvDtos);
		// 사원 기준 미완료 결재라인
		List<ApprLineImpactResponse> apprLineDtos = dao.findPendingApprLineByDept(deptId);
		result.setApprLines(apprLineDtos);
		// 사원이 기안한 진행중 결재문서
		List<ApprDocImpactResponse> apprDocsDtos = dao.findPendingApprDocsByDept(deptId);
		result.setApprDocs(apprDocsDtos);
		
		// 사원이 기안한 진행중 결재문서 제목 요약
		String snapshotText = dao.findPendingApprDocTitles(deptId);
		result.setSnapshotText(snapshotText);
		
		// 부서 후보 뽑기: (1) 동일 상위조직(형제 부서) OR (2) 해체 대상 부서의 상위 부서 자체
        List<DeptResponse> candidates = dao.findCandidateDepartments(deptId, comId);
        if (candidates.isEmpty()) {
            // 부서 후보가 하나도 없으면 전체 활성 부서로 폴백 (관리자가 아예 못 고르는 상황 방지)
            candidates = dao.findActiveDeptsExcluding(deptId, comId);
        }
        result.setCandidates(candidates);
 
        // 부서 추천 AI
        if (result.getEmployeeCount() > 0) {
        	AiRecomResponse aiRec = aiClient.recommend(dept.getDeptName(), snapshotText, candidates);
            result.setAiRecom(aiRec);
        }
		
		return result;
	}

	@Override
	public int cancelTransfer(long comId, long deptId) throws IllegalAccessException, AccessDeniedException {
		assertDeptBelongsToCompany(deptId, comId);
        return dao.updateActiveById(deptId);
	}

	@Override
	@Transactional
	public void executeTransfer(DeptTransferExecuteFormRequest form, long empId) throws IllegalAccessException, AccessDeniedException {
		long oldDeptId = form.getDeptId();
        assertDeptBelongsToCompany(oldDeptId, form.getComId());
 
        if (form.getItems() == null || form.getItems().isEmpty()) {
            throw new DeptTransferException(
                    "NO_TRANSFER_ITEMS", "이관할 사원 정보가 없습니다. 각 사원의 이관 부서를 선택해주세요.");
        }
 
        for (EmployeeTransferItemFormReponse item : form.getItems()) {
            if (item.getEmpId() == null || item.getNewDeptId() == null) {
                throw new DeptTransferException(
                        "INVALID_TRANSFER_ITEM", "사원 또는 이관할 부서 정보가 누락되었습니다.");
            }
            // 이관 대상 부서가 실제로 같은 회사 소속인지 검증 (다른 회사 부서로의 이관 차단)
            if (dao.countDeptInCompany(item.getNewDeptId(), form.getComId()) == 0) {
                throw new DeptTransferException(
                        "INVALID_TARGET_DEPT",
                        "사원(emp_id: " + item.getEmpId() + ")의 이관 대상 부서(dept_id: " + item.getNewDeptId()
                                + ")가 본인 회사 소속이 아닙니다. 전체 이관이 취소되었습니다.");
            }
            try {
                int updated = dao.updateEmployeeDept(item.getEmpId(), item.getNewDeptId());
                if (updated != 1) {
                    throw new DeptTransferException(
                            "EMPLOYEE_TRANSFER_FAIL",
                            "사원(emp_id: " + item.getEmpId() + ") 이관 중 오류가 발생했습니다. 전체 이관이 취소되었습니다.");
                }
                
                DeptTransferLogRequest logDto = new DeptTransferLogRequest();
                logDto.setComId(form.getComId());
                logDto.setOriginDeptId(oldDeptId);
                logDto.setTargetDeptId(item.getNewDeptId());
                logDto.setEmpId(item.getEmpId());
                logDto.setAiRecommended(item.getAiRecommended());
                logDto.setAiReason(form.getAiReason());
                logDto.setHandoverSnapshot(form.getSnapshotText());
                logDto.setCreatedBy(empId);
                
                int result = logDao.insertTransferLog(logDto);
                if (result < 1) {
                    throw new DeptTransferException(
                            "EMPLOYEE_TRANSFER_FAIL",
                            "insertTransferLog=사원(emp_id: " + item.getEmpId() + ") 이관 중 오류가 발생했습니다. 전체 이관이 취소되었습니다.");
                }
            } catch (DeptTransferException e) {
                throw e;
            } catch (Exception e) {
                throw new DeptTransferException(
                        "EMPLOYEE_TRANSFER_FAIL",
                        "사원(emp_id: " + item.getEmpId() + ") 이관 중 오류가 발생했습니다. 전체 이관이 취소되었습니다.", e);
            }
        }
 
        // 이관 완료 후 남은 사원이 없으면 부서를 최종(소프트) 삭제 처리
        int remaining = dao.findEmployeesByDept(oldDeptId).size();
        if (remaining == 0) {
            dao.markDeleted(oldDeptId);
        }		
	}

	@Override
	public List<PendingDeptResponse> getPendingTransferDepts(long comId, String keyword) {
		return dao.findPendingTransferDepts(comId, keyword);
	}

	@Override
	public List<DeptTransferLogResponse> searchTransferLogs(long comId, DeptTransferLogSearchRequest search) {
		search.setPstartno((search.getPstartno() - 1) * search.getOnepagelist());
		return logDao.searchTransferLogs(comId, search);
	}

	@Override
	public int listTotal(long comId, DeptTransferLogSearchRequest search) {
		return logDao.listTotal(comId, search);
	}
}