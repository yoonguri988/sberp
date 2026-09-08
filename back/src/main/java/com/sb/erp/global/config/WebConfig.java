package com.sb.erp.global.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${upload.path}") private String uploadPath;      // upload/**
	@Value("${resource.path}") private String resourcePath;  // C:/upload
	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String pattern = uploadPath.endsWith("/") ? uploadPath + "**" : uploadPath + "/**";
        String location = resourcePath.endsWith("/")
            ? "file:///" + resourcePath
            : "file:///" + resourcePath + "/";
 
        registry.addResourceHandler(pattern)
                .addResourceLocations(location);
	}
	
	@Override
	public void addFormatters(FormatterRegistry registry) {
	    registry.addConverter(new Converter<String, LocalDateTime>() {
	        @Override
	        public LocalDateTime convert(String source) {
	            if (source == null || source.isBlank()) return null;
	            // "yyyy-MM-dd" 만 오면 그날 00:00:00 으로, 이미 시간 포함이면 그대로 파싱
	            return source.length() == 10
	                    ? LocalDate.parse(source).atStartOfDay()
	                    : LocalDateTime.parse(source);
	        }
	    });
	}
	
	// Cor - 외부에서 접근 가능하게 설정      
//    @Override
//    public void addCorsMappings(CorsRegistry registry) { 
//    		// 모든 경로에서 CORS 허용
//        registry.addMapping("/**")
//                .allowedOrigins("http://localhost:3000") // 필요 시 특정 도메인으로 제한 가능
//                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
//                .allowedHeaders("*")
//                .allowCredentials(true) // 세션/쿠기 연동하는 방법
//                .maxAge(3600);
//    }
}