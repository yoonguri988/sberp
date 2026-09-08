package com.sb.erp.global.config;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.task.DelegatingSecurityContextAsyncTaskExecutor;

/**
 * 비동기 이메일 발송 스레드 풀 + @Scheduled 활성화.
 * 기본 SimpleAsyncTaskExecutor는 요청마다 스레드를 새로 생성 → SMTP 폭주 위험
 * ThreadPoolTaskExecutor로 상한 걸어 안정화
 */

@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {

    /* 메일 발송 전용 스레드 풀.
     * - core 5 / max 10 / queue 500
     * - 큐가 가득 차면 CallerRunsPolicy로 호출 스레드가 직접 실행 → 유실 방지
     * - @Async("mailExecutor") 로 지정해서 사용
     */
	
    @Bean(name = "mailExecutor")
    public Executor mailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("MailAsync-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
    

    /**
	AI 리포트 배치 실행 전용 스레드 풀
	DelegatingSecurityContextAsyncTaskExecutor로 감싸는 이유:
	배치 안에서 호출되는 EvalReportService의 여러 DAO가 SecurityUtil을 사용
	async 스레드에는 원래 SecurityContext가 없어서 comId=0 반환
	이 래퍼가 작업 제출 시점의 SecurityContext를 async 스레드에 전파
	*/
    @Bean(name = "reportExecutor")
    public Executor reportExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(10);
        executor.setThreadNamePrefix("ReportBatch-");
        /* ★ mailExecutor와 달리 여기서는 CallerRunsPolicy를 사용하면 안 된다
        	호출 스레드 = afterCommit이 실행되는 HTTP 요청 스레드이므로
        	AI 배치 전체가 요청 스레드에서 동기 실행되어 타임아웃 발생
        	거부 시 예외를 던지고 EvalPeriodServiceImpl이 REPORTING_FAILED로 복구 */
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        
        // ⭐ SecurityContext 전파 래퍼로 감싸기
        return new DelegatingSecurityContextAsyncTaskExecutor(executor);
    }
    
}
