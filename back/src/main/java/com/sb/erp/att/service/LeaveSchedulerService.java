package com.sb.erp.att.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveSchedulerService {

    private final LeaveBalanceService leaveBalanceService;

    /* 
     * 매년 1월 1일 00:00 전체 재직 사원 연차 자동 발생.
     * calculateAnnual 내부에서 중복 부여를 방지하므로 서버 재시작 등으로 중복 실행되어도 안전.
    */
    
    @Scheduled(cron = "0 0 0 1 1 *", zone = "Asia/Seoul")
    public void autoCalculateAnnual() {
        int year = LocalDate.now().getYear();
        log.info("[LeaveScheduler] {} 연차 일괄 발생 시작", year);
        int count = leaveBalanceService.calculateAllForYear(year);
        log.info("[LeaveScheduler] {} 연차 일괄 발생 완료 — {}명 처리", year, count);
    }
}