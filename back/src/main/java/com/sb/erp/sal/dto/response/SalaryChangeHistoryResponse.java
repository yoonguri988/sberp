package com.sb.erp.sal.dto.response;

import java.time.LocalDateTime;

import com.sb.erp.sal.entity.SalHist;
import com.sb.erp.sal.entity.type.ChangeDomainType;
import com.sb.erp.sal.entity.type.ChangeType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryChangeHistoryResponse {

    private Long histId;
    private Long actorEmpId;
    private String actorName;
    private Long trgtEmpId;
    private Long comId;
    private ChangeDomainType domType;
    private Long trgtId;
    private ChangeType chgType;
    private String bfrVal;
    private String aftVal;
    private String descr;
    private LocalDateTime createdAt;

    public static SalaryChangeHistoryResponse from(SalHist entity) {
        return SalaryChangeHistoryResponse.builder()
                .histId(entity.getHistId())
                .actorEmpId(entity.getActorEmpId())
                .actorName(entity.getActorName())
                .trgtEmpId(entity.getTrgtEmpId())
                .comId(entity.getComId())
                .domType(entity.getDomType())
                .trgtId(entity.getTrgtId())
                .chgType(entity.getChgType())
                .bfrVal(entity.getBfrVal())
                .aftVal(entity.getAftVal())
                .descr(entity.getDescr())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
