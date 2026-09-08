package com.sb.erp.appr.entity;

import com.sb.erp.dept.entity.Department;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appr_line_favorite")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprLineFavorite {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "appr_line_fav_seq")
	@SequenceGenerator(name = "appr_line_fav_seq", sequenceName = "appr_line_fav_seq", allocationSize = 1)
	@Column(name = "fav_id")
	private Long favId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "dept_id", nullable = false)
	private Department department;
	
	// 양식 단위의 즐겨찾기를 찾는거라 for_id만 저장
	@Column(name = "for_id", nullable = false)
	private Long forId;
	
	@Column(name = "emp_ids", nullable = false, length = 4000)
	private String empIds;
	
	@Column(name = "use_count", nullable = false)
	@Builder.Default
	private Integer useCount = 1;
}
