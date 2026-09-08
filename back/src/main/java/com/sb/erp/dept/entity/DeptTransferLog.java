package com.sb.erp.dept.entity;

import java.time.LocalDateTime;

import com.sb.erp.com.entity.Company;
import com.sb.erp.emp.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "DEPT_TRANSFER_LOG")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeptTransferLog {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_dept_tranfer_log")
    @SequenceGenerator(name = "seq_dept_tranfer_log", sequenceName = "SEQ_DEPT_TRANSFER_LOG", allocationSize = 1)
	@Column(name = "LOG_ID")
    private Long logId;
	
    // 회사
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COM_ID", nullable = false,
            foreignKey = @ForeignKey(name = "FK_DTL_COM"))
    private Company company;

    // 이동 전 부서
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORIGIN_DEPT_ID", nullable = false,
            foreignKey = @ForeignKey(name = "FK_DTL_ORIGIN_DEPT"))
    private Department originDept;

    // 이동 후 부서
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TARGET_DEPT_ID", nullable = false,
            foreignKey = @ForeignKey(name = "FK_DTL_TARGET_DEPT"))
    private Department targetDept;

    // 이동 대상 직원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EMP_ID", nullable = false,
            foreignKey = @ForeignKey(name = "FK_DTL_EMP"))
    private Employee employee;

    // AI 추천 여부 (Y/N)
    @Column(name = "AI_RECOMMENDED", length = 1, nullable = false)
    private String aiRecommended;

    // AI 추천 사유
    @Column(name = "AI_REASON", length = 1000)
    private String aiReason;

    // 인수인계 스냅샷
    @Lob
    @Column(name = "HANDOVER_SNAPSHOT")
    private String handoverSnapshot;

    // 등록자(처리자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CREATED_BY", nullable = false,
            foreignKey = @ForeignKey(name = "FK_DTL_CREATED_BY"))
    private Employee createdBy;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
	
}
