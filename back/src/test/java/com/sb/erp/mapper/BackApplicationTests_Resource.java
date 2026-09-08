package com.sb.erp.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.repository.CompanyMapper;
import com.sb.erp.res.dto.request.ResRequest;
import com.sb.erp.res.dto.request.ResSearchRequest;
import com.sb.erp.res.dto.response.ResResponse;
import com.sb.erp.res.repository.ResourceMapper;

@SpringBootTest
@Transactional
class BackApplicationTests_Resource {

	@Autowired CompanyMapper mapper;
	@Autowired ResourceMapper resMapper;

	// 여러 테스트에서 공통으로 재사용할 등록된 회사의 PK
	private long savedComId1;

	@BeforeEach
	void setUp() {
		// 매 테스트 실행 전, 조회/수정/삭제 테스트에서 사용할 기준 데이터를 하나 등록해둔다.
		ComRequest dto1 = ComRequest.builder()
				.industryGrpCode("G")
				.industryCode("12345")
				.comName("test")
				.comCeo("도훈")
				.bizNo("152-45-12345")
				.build();

		int res1 = mapper.insert(dto1);
		assertThat(res1).isEqualTo(1);

		savedComId1 = dto1.getComId();
		assertThat(savedComId1).isNotNull();
	}

	// 테스트용 자원 등록 후, res_code로 재조회하여 채번된 resId를 가진 응답을 반환한다.
	// (insertResource는 useGeneratedKeys를 사용하지 않으므로 insert 직후 resId를 바로 알 수 없다.)
	private ResResponse insertAndGetResource(String resCode) {
		ResRequest req = ResRequest.builder()
				.comId(savedComId1)
				.resCode(resCode)
				.resName("빔프로젝터")
				.resType("EQUIPMENT")
				.quantity(5L)
				.location("3층 회의실")
				.capacity(10L)
				.resStatus("AVAILABLE")
				.remark("테스트 자원")
				.build();

		int res = resMapper.insertResource(req);
		assertThat(res).isEqualTo(1);

		ResResponse saved = resMapper.selectByResCode(req);
		assertThat(saved).isNotNull();
		assertThat(saved.getResId()).isNotNull();

		return saved;
	}

	@Test
	@DisplayName("자원 목록 조회 (검색/페이징)")
	void testSelectResourceList() {
		insertAndGetResource("RES-001");
		insertAndGetResource("RES-002");
		insertAndGetResource("RES-003");

		ResSearchRequest search = ResSearchRequest.builder()
				.comId(savedComId1)
				.pstartno(0)
				.onepagelist(10)
				.build();

		List<ResResponse> list = resMapper.selectResourceList(search);

		assertThat(list).isNotEmpty();
		assertThat(list).hasSize(3);
		assertThat(list).allMatch(r -> r.getComId().equals(savedComId1));

		// 키워드 검색 조건 테스트
		ResSearchRequest keywordSearch = ResSearchRequest.builder()
				.comId(savedComId1)
				.keyword("RES-002")
				.pstartno(0)
				.onepagelist(10)
				.build();

		List<ResResponse> keywordResult = resMapper.selectResourceList(keywordSearch);
		assertThat(keywordResult).hasSize(1);
		assertThat(keywordResult.get(0).getResCode()).isEqualTo("RES-002");
	}

	@Test
	@DisplayName("자원 전체 개수")
	void testSelectResourceCount() {
		insertAndGetResource("RES-101");
		insertAndGetResource("RES-102");

		ResSearchRequest search = ResSearchRequest.builder()
				.comId(savedComId1)
				.build();

		int count = resMapper.selectResourceCount(search);
		assertThat(count).isEqualTo(2);
	}

	@Test
	@DisplayName("자원 상세")
	void testSelectResourceDetail() {
		ResResponse saved = insertAndGetResource("RES-201");

		ResResponse detail = resMapper.selectResourceDetail(saved.getResId().intValue());

		assertThat(detail).isNotNull();
		assertThat(detail.getResId()).isEqualTo(saved.getResId());
		assertThat(detail.getResCode()).isEqualTo("RES-201");
		assertThat(detail.getResName()).isEqualTo("빔프로젝터");
		assertThat(detail.getComId()).isEqualTo(savedComId1);
	}

	@Test
	@DisplayName("자원 등록")
	void testInsertResource() {
		ResRequest req = ResRequest.builder()
				.comId(savedComId1)
				.resCode("RES-301")
				.resName("노트북")
				.resType("EQUIPMENT")
				.quantity(3L)
				.location("2층 창고")
				.capacity(3L)
				.resStatus("AVAILABLE")
				.remark("신규 등록")
				.build();

		int result = resMapper.insertResource(req);
		assertThat(result).isEqualTo(1);

		ResResponse saved = resMapper.selectByResCode(req);
		assertThat(saved).isNotNull();
		assertThat(saved.getResId()).isNotNull();
		assertThat(saved.getResName()).isEqualTo("노트북");
		assertThat(saved.getQuantity()).isEqualTo(3L);
	}

	@Test
	@DisplayName("자원 수정")
	void testUpdateResource() {
		ResResponse saved = insertAndGetResource("RES-401");

		ResRequest updateReq = ResRequest.builder()
				.resId(saved.getResId())
				.resName("수정된 자원명")
				.quantity(20L)
				.resStatus("MAINTENANCE")
				.build();

		int result = resMapper.updateResource(updateReq);
		assertThat(result).isEqualTo(1);

		ResResponse updated = resMapper.selectResourceDetail(saved.getResId().intValue());
		assertThat(updated.getResName()).isEqualTo("수정된 자원명");
		assertThat(updated.getQuantity()).isEqualTo(20L);
		assertThat(updated.getResStatus()).isEqualTo("MAINTENANCE");
		// null로 넘기지 않은 필드는 그대로 유지되어야 한다
		assertThat(updated.getResCode()).isEqualTo("RES-401");
	}

	@Test
	@DisplayName("자원삭제")
	void testDeleteResource() {
		ResResponse saved = insertAndGetResource("RES-501");

		int result = resMapper.deleteResource(saved.getResId().intValue());
		assertThat(result).isEqualTo(1);

		ResResponse deleted = resMapper.selectResourceDetail(saved.getResId().intValue());
		assertThat(deleted).isNull();
	}

	@Test
	@DisplayName("자원코드 중복 체크")
	void testSelectByResCode() {
		insertAndGetResource("RES-601");

		ResRequest checkReq = ResRequest.builder()
				.comId(savedComId1)
				.resCode("RES-601")
				.build();

		ResResponse existing = resMapper.selectByResCode(checkReq);
		assertThat(existing).isNotNull();
		assertThat(existing.getResCode()).isEqualTo("RES-601");

		// 존재하지 않는 코드는 null이어야 한다
		ResRequest notExistReq = ResRequest.builder()
				.comId(savedComId1)
				.resCode("NOT-EXIST-CODE")
				.build();

		ResResponse notExisting = resMapper.selectByResCode(notExistReq);
		assertThat(notExisting).isNull();
	}

	@Test
	@DisplayName("예약 할 수 있는 회사의 자원 정보")
	void testSelectResListForResv() {
		// 예약 가능 자원 (AVAILABLE + 수량 > 0)
		insertAndGetResource("RES-701");

		// 예약 불가 자원 (수량 0)
		// 주의: insertResource의 #{location}에는 jdbcType이 지정되어 있지 않아
		// Oracle 드라이버가 null 바인딩 시 타입을 추론하지 못해 ORA-17004가 발생한다.
		// (location, capacity 등 nullable 컬럼도 마찬가지) -> 테스트에서는 항상 값을 채워서 회피한다.
		ResRequest zeroQtyReq = ResRequest.builder()
				.comId(savedComId1)
				.resCode("RES-702")
				.resName("재고없는자원")
				.resType("EQUIPMENT")
				.quantity(0L)
				.location("3층 창고")
				.capacity(10L)
				.resStatus("AVAILABLE")
				.build();
		resMapper.insertResource(zeroQtyReq);

		// 예약 불가 자원 (상태가 AVAILABLE 아님 - 점검중)
		ResRequest unavailableReq = ResRequest.builder()
				.comId(savedComId1)
				.resCode("RES-703")
				.resName("점검중자원")
				.resType("EQUIPMENT")
				.quantity(5L)
				.location("3층 창고")
				.capacity(10L)
				.resStatus("MAINTENANCE")
				.build();
		resMapper.insertResource(unavailableReq);

		ResSearchRequest search = ResSearchRequest.builder()
				.comId(savedComId1)
				.build();

		List<ResResponse> result = resMapper.selectResListForResv(search);

		assertThat(result).hasSize(1);
		assertThat(result.get(0).getResCode()).isEqualTo("RES-701");
	}

}