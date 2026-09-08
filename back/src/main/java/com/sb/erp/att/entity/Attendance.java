package com.sb.erp.att.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.sb.erp.emp.entity.Employee;

@Entity
@Table(name = "attendance",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_attendance_daily",
           columnNames = {"emp_id", "att_date"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Attendance { // 사원 근태 확인

    // 근태 PK
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_attendance")
    @SequenceGenerator(name = "seq_attendance", sequenceName = "SEQ_ATTENDANCE", allocationSize = 1)
    @Column(name = "att_id")
    private Long attId;

    // 사원 FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Employee employee;
    
    // 근무일자
    @Column(name = "att_date", nullable = false)
    private LocalDate attDate;
    
    //출근 시각
    @Column(name = "check_in")
    private LocalDateTime checkIn;

    //퇴근 시각
    @Column(name = "check_out")
    private LocalDateTime checkOut;
    
    //실 근로시간
    @Column(name = "work_minutes")
    @Builder.Default
    private Integer workMinutes = 0;

    //연장 근로시간
    @Column(name = "overtime_minutes")
    @Builder.Default
    private Integer overtimeMinutes = 0;
    
    //야간 근로시간
    @Column(name = "night_minutes")
    @Builder.Default
    private Integer nightMinutes = 0;

    //근무 상태 표시(출근/지각/조퇴/휴가 등)
    @Column(name = "att_status", length = 20)
    @Builder.Default
    private String attStatus = "ABSENT";

    // 레코드 생성  시각
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 최종 수정 시각
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
