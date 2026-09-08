package com.sb.erp.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

@Configuration // 여기서 Bean을 만들 거라는 표시
public class OpenAiConfig {
	
	// application.properties의 값을 읽어 필드에 넣기
    @Value("${jsj.openai.api.baseurl}") private String baseUrl;
    @Value("${jsj.openai.api.key}")     private String apiKey;
    
    /* OpenAI 통신 전용 RestClient.
     Bean 이름을 "openAiRestClient"로 명시:
      - 다른 RestClient Bean이 있을 수도 있어서 (네이버 책 API용 등)
      - 주입 시 @Qualifier("openAiRestClient")로 정확히 지정 가능
     */
    
    // @Bean(name = "openAiRestClient")
    // 메서드가 리턴하는 객체(RestClient)를 openAiRestClient라는 이름의 Bean으로 등록하여 공유
    @Bean(name = "openAiRestClient")
    public RestClient openAiRestClient() {

        return RestClient.builder() // 빌더 패턴. 필요한 설정을 체이닝으로
            .baseUrl(baseUrl) // 이후 모든 요청에서 이 URL 뒤에 붙는 형태로 처리됨
            .defaultHeader("Authorization", "Bearer " + apiKey)
            // Authorization: Bearer <API키> 형태. OpenAI뿐 아니라 대부분의 API가 이 방식.
            .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
            //요청 바디로 JSON을 보낸다는 선언
            .build();
        	//실제 RestClient 인스턴스 생성
    }		
}

/*

### OpenAI Chat Completions API용 RestClient 설정.
 - 이 클래스가 하는 일:
application.properties에서 API 키, baseurl 읽기
baseUrl과 Authorization/Content-Type 헤더가 미리 세팅된 RestClient 하나 생성
"openAiRestClient" 라는 이름으로 Bean 등록 → 다른 곳에서 주입받아 사용

- 왜 여기서 헤더까지? :
매 요청마다 .header("Authorization", ...) 붙이면 코드 중복
API 키 관리가 여러 곳에 흩어짐 → 유출 위험
이 파일 한 곳만 보면 "OpenAI 통신은 이렇게 세팅되어 있다"가 명확해짐

*/


/*
### 왜 @Component가 아니라 @Bean?
: RestClient는 Spring이 제공하는 클래스라 코드에 @Component를 붙일 수 없다. 
그래서 "내가 이렇게 만들어서 등록할게" 하는 방식이 @Bean.

@Component		  			|		@Bean
클래스 위에 붙임					|	메서드 위에 붙임
Spring이 내가 만든 클래스의		|	이미 존재하는 클래스(외부 라이브러리 등)의
인스턴스를 자동 생성				|	인스턴스를 내가 손수 만듦
MyService 같은 우리 클래스에 씀 	| 	RestClient 같은 남의 클래스에 씀

*/