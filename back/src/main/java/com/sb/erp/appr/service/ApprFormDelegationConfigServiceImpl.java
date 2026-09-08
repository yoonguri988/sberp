package com.sb.erp.appr.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.appr.dto.request.ApprFormDelegationConfigRequest;
import com.sb.erp.appr.dto.response.ApprFormDelegationConfigResponse;
import com.sb.erp.appr.entity.ApprForm;
import com.sb.erp.appr.entity.ApprFormDelegationConfig;
import com.sb.erp.appr.entity.ApprFormId;
import com.sb.erp.appr.repository.ApprFormDelegationConfigRepository;
import com.sb.erp.appr.repository.ApprFormRepository;
import com.sb.erp.global.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;


/**
 * 스코프 제외 - 위임전결 자동화
 * 미구현으로 배포 대상에서 제외됨. 인가 모델(ROOT → comId 스코프 ADMIN) 마이그레이션도
 * 적용 안 된 상태로 코드만 보존. 재개 시 ApprFormController와 동일한 패턴으로 맞출 것.
 *
 * ApprFormController의 delegation-config 엔드포인트를 통해 여전히 호출 가능하지만,
 * 저장된 설정을 실제로 소비하는 ApprAutoDelegationTriggerService 쪽이 스코프 제외 상태라
 * 저장/조회는 되어도 실질적인 자동 위임 발동으로는 이어지지 않음.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprFormDelegationConfigServiceImpl implements ApprFormDelegationConfigService{

	private final ApprFormDelegationConfigRepository cfgDao;
	private final ApprFormRepository formDao;
	
	// 저장
	// id + version 유니크 기준으로 없으면 생성, 있으면 더티체킹으로 갱신
	@Override
	@Transactional
	public Long save(ApprFormDelegationConfigRequest req) {
		
		ApprForm form = formDao.findById(new ApprFormId(req.getForId(), req.getForVersion()))
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 양식입니다."));
		
		ApprFormDelegationConfig cfg = cfgDao
				.findByApprForm_ForIdAndApprForm_ForVersion(req.getForId(), req.getForVersion())
				.orElse(null);
		
		if (cfg == null) {
			cfg = ApprFormDelegationConfig.builder()
					.apprForm(form)
					.enabled(req.getEnabled())
					.startFieldId(req.getStartFieldId())
					.endFieldId(req.getEndFieldId())
					.delegateFieldId(req.getDelegateFieldId())
					.minTriggerDays(req.getMinTriggerDays())
					.build();
			cfgDao.save(cfg);
		}
		else {
			cfg.setEnabled(req.getEnabled());
			cfg.setStartFieldId(req.getStartFieldId());
			cfg.setEndFieldId(req.getEndFieldId());
			cfg.setDelegateFieldId(req.getDelegateFieldId());
			cfg.setMinTriggerDays(req.getMinTriggerDays());
		}
		
		return cfg.getCfgId();
	}

	@Override
	public ApprFormDelegationConfigResponse getByForm(Long forId, Long forVersion) {
		return cfgDao.findByApprForm_ForIdAndApprForm_ForVersion(forId, forVersion)
				.map(ApprFormDelegationConfigResponse::new)
				.orElse(null);
	}

}
