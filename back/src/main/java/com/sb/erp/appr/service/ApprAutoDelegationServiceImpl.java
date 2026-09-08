package com.sb.erp.appr.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.appr.dto.request.ApprAutoDelegationCancelRequest;
import com.sb.erp.appr.dto.response.ApprAutoDelegationResponse;
import com.sb.erp.appr.entity.ApprAutoDelegation;
import com.sb.erp.appr.entity.ApprLine;
import com.sb.erp.appr.entity.ApprLog;
import com.sb.erp.appr.repository.ApprAutoDelegationRepository;
import com.sb.erp.appr.repository.ApprLineRepository;
import com.sb.erp.appr.repository.ApprLogRepository;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.global.exception.ResourceNotFoundException;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

/**
 * 스코프 제외 - 위임전결 자동화
 * 미구현으로 배포 대상에서 제외됨. 인가 모델(ROOT → comId 스코프 ADMIN) 마이그레이션도
 * 적용 안 된 상태로 코드만 보존. 재개 시 ApprFormController와 동일한 패턴으로 맞출 것.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprAutoDelegationServiceImpl implements ApprAutoDelegationService {
	
	private final ApprAutoDelegationRepository autoDao;
	private final ApprLineRepository lineDao;
	private final ApprLogRepository logDao;
	private final EntityManager em;
	
	@Override
	public List<ApprAutoDelegationResponse> myDelegation(Long empId) {
		return autoDao.findByDelEmp_EmpIdOrderByCreatedAtDesc(empId).stream()
				.map(ApprAutoDelegationResponse::new)
				.collect(Collectors.toList());
	}

	@Override
	public List<ApprAutoDelegationResponse> listByStatus(String delegStatus) {
		return autoDao.findByDelegStatusOrderByCreatedAtDesc(delegStatus).stream()
				.map(ApprAutoDelegationResponse::new)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional
	public void requestCancel(Long autoDelegId, Long empId, ApprAutoDelegationCancelRequest req) {
		
		ApprAutoDelegation deleg = autoDao.findById(autoDelegId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 위임전결입니다."));
		
		if (!deleg.getDelEmp().getEmpId().equals(empId)) {
			throw new IllegalArgumentException("본인의 위임전결만 취소 요청할 수 있습니다.");
		}
		
		if (!"ACT".equals(deleg.getDelegStatus())) {
			throw new IllegalArgumentException("활성 상태의 위임전결만 취소 요청할 수 있습니다.");
		}
		
		deleg.setDelegStatus("CANC_REQ");
		deleg.setCancReason(req.getCancReason());
	}

	@Override
	@Transactional
	public void approveCancel(Long autoDelegId, Long adminEmpId) {
		
		ApprAutoDelegation deleg = autoDao.findById(autoDelegId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 위임전결입니다."));
		
		if (!"CANC_REQ".equals(deleg.getDelegStatus())) {		
			throw new IllegalStateException("취소 요청 상태가 아닙니다.");
		}
		
		Employee admin = em.getReference(Employee.class, adminEmpId);
		deleg.setDelegStatus("CANC");
		deleg.setProcEmp(admin);
		deleg.setProcessedAt(LocalDateTime.now());
		
		// 일괄 복귀
		/*
			이 위임전결이 건드린 로그중, 아직도 WAI 상태로 남아있는 라인만 되돌림
		 	이미 수임자가 처리해버린 라인은 그대로
		 	이미 벌어진 결재 행위를 취소하는 건 X
		 */
		List<ApprLog> logs = logDao.findByAutoDeleg_AutoDelegId(autoDelegId);
		for (ApprLog log : logs) {
			ApprLine line = lineDao.findByApprDoc_DocIdAndEmployee_EmpId(
					log.getApprDoc().getDocId(), log.getActEmp().getEmpId()
			).orElse(null);
			
			if (line != null && "WAI".equals(line.getLinStatus())) {
				line.setEmployee(log.getOriEmp());
			}
		}
	}

	@Override
	@Transactional
	public void rejectCancel(Long autoDelegId, Long adminEmpId) {
		
		ApprAutoDelegation deleg = autoDao.findById(autoDelegId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 위임전결입니다."));
		
		if (!"CANC_REQ".equals(deleg.getDelegStatus())) {
			throw new IllegalStateException("취소 요청 상태가 아닙니다.");
		}
		
		deleg.setDelegStatus("ACT");
		deleg.setCancReason(null);
	}

}
