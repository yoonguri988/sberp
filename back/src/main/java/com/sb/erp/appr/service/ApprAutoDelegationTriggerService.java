package com.sb.erp.appr.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.appr.entity.ApprAutoDelegation;
import com.sb.erp.appr.entity.ApprDoc;
import com.sb.erp.appr.entity.ApprFormDelegationConfig;
import com.sb.erp.appr.entity.ApprLine;
import com.sb.erp.appr.entity.ApprLog;
import com.sb.erp.appr.repository.ApprAutoDelegationRepository;
import com.sb.erp.appr.repository.ApprFormDelegationConfigRepository;
import com.sb.erp.appr.repository.ApprLineRepository;
import com.sb.erp.appr.repository.ApprLogRepository;
import com.sb.erp.emp.entity.Employee;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * 스코프 제외 - 위임전결 자동화
 * 미구현으로 배포 대상에서 제외됨. 인가 모델(ROOT → comId 스코프 ADMIN) 마이그레이션도
 * 적용 안 된 상태로 코드만 보존. 재개 시 ApprFormController와 동일한 패턴으로 맞출 것.
 *
 * tryTrigger()는 ApprDocServiceImpl의 최종승인 로직에서 여전히 호출되지만,
 * ApprFormDelegationConfig가 설정된 양식이 없어 항상 조기 return되는 사실상 no-op 상태.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApprAutoDelegationTriggerService {
	
	private final ApprFormDelegationConfigRepository cfgDao;
	private final ApprAutoDelegationRepository autoDao;
	private final ApprLineRepository lineDao;
	private final ApprLogRepository logDao;
	private final EntityManager em;
	private final ObjectMapper objMapper;
	
	// 최종승인 확정 직후 호출
	@Transactional
	public void tryTrigger(Long docId, Long forId, Long forVersion, Long delEmpId, String docContent) {

		// 이 양식이 위임전결 트리거 대상인지 확인
		ApprFormDelegationConfig cfg = cfgDao
				.findByApprForm_ForIdAndApprForm_ForVersion(forId, forVersion)
				.orElse(null);
		
		// 트리거 대상이 아닐경우 종료
		if (cfg == null || !cfg.isEnabled()) {
			return; 
		}
		
		// 맞을경우 필드값 파싱
		LocalDate startDate;
		LocalDate endDate;
		Long newEmpId;
		
		try {
			JsonNode root = objMapper.readTree(docContent);
			startDate = LocalDate.parse(root.path(cfg.getStartFieldId()).asText());
			endDate = LocalDate.parse(root.path(cfg.getEndFieldId()).asText());
			newEmpId = root.path(cfg.getEndFieldId()).asLong();
		} catch (Exception e) {
			log.warn("위임전결 필드 파싱 실패 - docId={}, cfgId={}", docId, cfg.getCfgId());
			return;
			// 파싱 실패해도 문서 승인 자체는 그대로 유지, 위임전결만 미적용
		}
		
		// 수임자 미지정 발동 X
		if (newEmpId == null || newEmpId == 0L) {
			return;
		}
		
		// 최소 적용일수 미달이면 발동 X
		long spanDays = ChronoUnit.DAYS.between(startDate, endDate) +1;
		if (spanDays < cfg.getMinTriggerDays()) {
			return;
		}
		
		// 순환 위임 방지 ( A <-> B 만 우선체크 )
		boolean circular = autoDao
				.findByDelEmp_EmpIdAndDelegStatus(newEmpId, "ACT")
				.map(d -> d.getNewEmp().getEmpId().equals(delEmpId))
				.orElse(false);
		
		if (circular) {
			log.warn("순환위임 감지로 위임전결 미적용 - delEmpId={}, newEmpId={}", delEmpId, newEmpId);
			return;
		}
		
		ApprDoc doc = em.getReference(ApprDoc.class, docId);
		Employee delEmp = em.getReference(Employee.class, delEmpId);
		Employee newEmp = em.getReference(Employee.class, newEmpId);
		
		// 기존 활성 위임과 겹치는지 확인
		boolean alreadyActive = autoDao
				.findByDelEmp_EmpIdAndDelegStatus(delEmpId, "ACT")
				.isPresent();
		
		if (alreadyActive) {
			ApprAutoDelegation skipped = ApprAutoDelegation.builder()
					.apprDoc(doc)
					.delEmp(delEmp)
					.newEmp(newEmp)
					.startDate(startDate)
					.endDate(endDate)
					.delegStatus("SKIP")
					.cancReason("이미 활성화된 위임전결이 존재하여 미적용")
					.build();
			autoDao.save(skipped);
		}
		
		// 위임 전결 생성
		ApprAutoDelegation deleg = ApprAutoDelegation.builder()
				.apprDoc(doc)
				.delEmp(delEmp)
				.newEmp(newEmp)
				.startDate(startDate)
				.endDate(endDate)
				.delegStatus("ACT")
				.build();
		autoDao.save(deleg);
		
		// 기존 대기중 라인 일괄 위임
		List<ApprLine> waitingLines = lineDao.findWaitingLinesForAutoDelegation(delEmpId);
		
		for (ApprLine line : waitingLines) {
			Employee oriEmp = line.getEmployee();
			// 더티체킹
			line.setEmployee(newEmp);
			
			ApprLog log = ApprLog.builder()
					.apprDoc(line.getApprDoc())
					.oriEmp(oriEmp)
					.actEmp(newEmp)
					.perEmp(delEmp) // 관리자 승인이 없는 자동발동이라 위임자 본인으로
					.autoDeleg(deleg) // 위임전결 추적용 (복귀시 이값으로 조회)
					.build();
			logDao.save(log);
		}
				
	}
}
