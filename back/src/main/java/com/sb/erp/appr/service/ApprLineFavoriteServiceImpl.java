package com.sb.erp.appr.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.appr.dto.request.ApprLineFavoriteRequest;
import com.sb.erp.appr.dto.response.ApprLineFavoriteResponse;
import com.sb.erp.appr.dto.response.ApprLineResponse;
import com.sb.erp.appr.entity.ApprLineFavorite;
import com.sb.erp.appr.repository.ApprDocMapper;
import com.sb.erp.appr.repository.ApprLineFavoriteRepository;
import com.sb.erp.dept.entity.Department;
import com.sb.erp.global.exception.ResourceNotFoundException;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprLineFavoriteServiceImpl implements ApprLineFavoriteService {
	
	private final ApprLineFavoriteRepository favDao;
	private final EntityManager em;
	private final ApprDocMapper docMapper;
	
	// 추천 결재선에 포함되어있는 empId 정리
	private List<Long> parseEmpIds(String csv){
		// 입력받은 문자열을 "," 기준으로 잘라 배열로 변환
		return Arrays.stream(csv.split(","))
				// 앞뒤 공백 제거
				.map(String::trim)
				// 빈 문자열인 항목 제외
				.filter(s -> !s.isEmpty())
				// 문자열을 Long 타입 객체로 변환 -> empId
				.map(Long::parseLong)
				// 변환된 숫자들을 리스트 형태로 반환
				.collect(Collectors.toList());
	}
	
	// 즐겨찾기 추천 목록 - 조회 시점 기준 재직상태/직급 재검증
	@Override
	public List<ApprLineFavoriteResponse> recommend(Long deptId, Long forId, Long empId) {
		
		List<ApprLineFavorite> favorites = favDao.findByDepartment_DeptIdAndForIdOrderByUseCountDesc(deptId, forId);
		
		// 현재 부서 기준 재직중인 사원 목록
		Map<Long, ApprLineResponse> activeMap = docMapper.selectDeptEmpsForLines(deptId, empId).stream()
				.collect(Collectors.toMap(ApprLineResponse::getEmpId, e -> e));
		
		List<ApprLineFavoriteResponse> result = new ArrayList<>();
		
		for (ApprLineFavorite fav : favorites) {
			List<Long> empIds = parseEmpIds(fav.getEmpIds());
			
			List<ApprLineResponse> approvers = new ArrayList<>();
			boolean allValid = true;
			
			for (Long candidateEmpId : empIds) {
				ApprLineResponse emp = activeMap.get(candidateEmpId);
				// 퇴사,부서이동,직급조건 등으로 유효하지 않은 결재선 추천에서 제외
				if (emp == null) {
					allValid = false;
					break;
				}
				approvers.add(emp);
			}
			
			if (allValid) {
				result.add(ApprLineFavoriteResponse.of(fav, approvers));
			}
		}
		
		return result;
	}

	// 동일한 결재선 조합이 있으면 횟수증가, 없으면 신규등록
	@Override
	@Transactional
	public Long saveOrIncrement(ApprLineFavoriteRequest req) {
		
		String empIdsCsv = req.getEmpIds().stream()
				.map(String::valueOf)
				.collect(Collectors.joining(","));
		
		return favDao.findByDepartment_DeptIdAndForIdAndEmpIds(req.getDeptId(), req.getForId(), empIdsCsv)
				.map(existing -> {
					existing.setUseCount(existing.getUseCount() + 1);
					return existing.getFavId();
				})
				.orElseGet(() -> {
					Department dept = em.getReference(Department.class, req.getDeptId());
					ApprLineFavorite fav = ApprLineFavorite.builder()
							.department(dept)
							.forId(req.getForId())
							.empIds(empIdsCsv)
							.build();
					favDao.save(fav);
					return fav.getFavId();
				});
	}

	@Override
	@Transactional
	public void delete(Long favId) {
		if (!favDao.existsById(favId)) {
			throw new ResourceNotFoundException("존재하지 않는 즐겨찾기입니다.");
		}
		favDao.deleteById(favId);
	}

}
