package com.sb.erp.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class SwaggerConfig {
	@Bean
	public OpenAPI openAPI() {
	    return new OpenAPI()
	            .info(new Info()
	                    .title("SBerp API")
	                    .description("Spring Boot + JWT + Redis 인증 API 문서")
	                    .version("v1.0"))
	            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
	            // oauth2-google / oauth2-kakao / oauth2-naver 관련 3개 addSecurityItem, addSecuritySchemes 전부 삭제
	            .components(new io.swagger.v3.oas.models.Components()
	                    .addSecuritySchemes("bearerAuth",
	                            new SecurityScheme()
	                                    .name("Authorization")
	                                    .type(SecurityScheme.Type.HTTP)
	                                    .scheme("bearer")
	                                    .bearerFormat("JWT")));
    }
}