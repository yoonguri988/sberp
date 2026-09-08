package com.sb.erp.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.sb.erp.com.entity.Company;

/**
 * 권한 Entity (authority 테이블)
 *
 * ── 설계 포인트 ──
 *
 * 1. 기존 AuthPermDto에 있던 autCount(부여 사원 수)는 Entity에 없음.
 *    - autCount는 DB 컬럼이 아니라 COUNT 쿼리 결과.
 *    - Repository에서 JPQL로 조회하거나 ResponseDto 생성 시 별도 카운트.
 *
 * 2. emp_auth 중간 테이블과의 관계:
 *    - @ManyToMany 대신 EmpAuth Entity로 명시적 매핑 (중간 테이블에 emp_aut_id PK가 있으므로).
 *    - Authority 쪽에서 양방향은 필요 시 추가 (현재는 단방향으로 충분).
 */
@Entity
@Table(name = "authority")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Authority {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_authority")
    @SequenceGenerator(name = "seq_authority", sequenceName = "SEQ_AUTHORITY", allocationSize = 1)
    @Column(name = "aut_id")
    private Long autId;

    @Column(name = "aut_name", length = 50, nullable = false)
    private String autName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "com_id", nullable = false)
    private Company company;

}
