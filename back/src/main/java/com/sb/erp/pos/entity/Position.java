package com.sb.erp.pos.entity;

import jakarta.persistence.*;
import com.sb.erp.com.entity.Company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 직급 Entity (emp_position 테이블)
@Entity
@Table(name = "emp_position")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_position")
    @SequenceGenerator(name = "seq_position", sequenceName = "SEQ_POSITION", allocationSize = 1)
    @Column(name = "pos_id")
    private Long posId;

    @Column(name = "pos_code", length = 20, nullable = false)
    private String posCode;

    @Column(name = "pos_name", length = 50, nullable = false)
    private String posName;

    @Column(name = "pos_order", nullable = false)
    private int posOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "com_id", nullable = false)
    private Company company;
}