package com.sb.erp.notice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/* Notice 게시글을 표현하는 DTO
 * DB 컬럼과 매핑되는 필드 정의
 */
@Getter @Setter @NoArgsConstructor
public class NoticeRequest {

	@Schema(hidden = true)
    private Long bno; 

    @Schema(hidden = true)
    //@NotNull(message = "회사 정보는 필수입니다.")
    private Long comId;

    @Schema(hidden = true)
    //@NotNull(message = "사원 정보는 필수입니다.")
    private Long empId;

    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다.")
    private String btitle;

    @NotBlank(message = "내용은 필수입니다.")
    @Size(max = 1000, message = "내용은 1000자를 초과할 수 없습니다.")
    private String bcontent;

    //@Size(max = 500, message = "첨부파일 경로는 500자를 초과할 수 없습니다.")
    private String bfile;
}

/*
  	private Integer bno;         
	private String btitle;    
	private String bcontent;  
	private Integer bhit;         
	private String bfile;    
	private LocalDate createdAt; 
	private LocalDate updatedAt; 
	private Integer empId;
	private Integer comId;
	private String empName;
	public boolean isUrgent() {return bcontent!=null && bcontent.contains("긴급");} //외부에서 호출할것이기 때문에 public으로 

DESC sb_erp_db.notice;
+------------+---------------+------+-----+-------------------+-----------------------------------------------+
| Field      | Type          | Null | Key | Default           | Extra                                         |
+------------+---------------+------+-----+-------------------+-----------------------------------------------+
| bno        | int           | NO   | PRI | NULL              | auto_increment                                |
| btitle     | varchar(200)  | NO   |     | NULL              |                                               |
| bcontent   | varchar(1000) | NO   |     | NULL              |                                               |
| bhit       | int           | NO   |     | 0                 |                                               |
| bfile      | varchar(500)  | YES  |     | NULL              |                                               |
| created_at | datetime      | NO   |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| updated_at | datetime      | NO   |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| emp_id     | int           | NO   | MUL | NULL              | => bwriter                                    |
| com_id     | int           | NO   | MUL | NULL              | => 회사ID                                      |
+------------+---------------+------+-----+-------------------+-----------------------------------------------+
9 rows in set (0.00 sec)

| ★7.  전사 공지 관리 | 사용자 | 관리자 |
1page
1) 페이징-select
2) 검색  -select

2page
| CREATE 			| X | 공지 등록  |
  	insert into notice (com_id, btitle, bcontent, emp_id, bhit, bfile)
  	VALUES (1, 'ERP 시스템 점검 안내', '6월 20일 22시~24시 ERP 시스템 점검 예정입니다.', 1, 12, NULL),
		   (1, '인사관리 규정 개정', '직급/재직 상태 관련 규정이 개정되었습니다.', 2, 34, 'insa_rule.pdf');
		   
| READ | 전체 공지(페이징) ,  공지 상세보기, 검색 |  |
 	select * from sb_erp_db.notice  order by bno desc
 	select * from sb_erp_db.notice  where  bno= #{bno}
 3page	
 4) 상세페이지-select / update(조회수)
 	
| UPDATE | X | 공지 수정 |
	update  sb_erp_db.notice  set  btitle=#{btitle}  , bcontent=#{bcontent}  where bno= #{bno}

| DELETE | X | 공지 삭제 |
 	delete  from   sb_erp_db.notice  where bno= #{bno} 

*/