package com.sb.erp.global.integration;

import java.util.Properties;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class NaverEmailApi {
	
	// 1. 보내는 쪽
	@Value("${naver.email.host}")      private String host;      // smtp.naver.com
	@Value("${naver.email.user}")      private String user;      // cyjeong98@naver.com
	@Value("${naver.email.password}")  private String password;  // 네이버 앱 비밀번호

	// 2. 이메일 보내기
	public void sendMail(String subject, String content, String to) {
		Properties props = new Properties();
		props.put("mail.smtp.host", host); 
		props.put("mail.smtp.auth", "true"); 
		props.put("mail.smtp.port", "465"); // 네이버 포트 465
		props.put("mail.debug", "true");

		props.put("mail.smtp.ssl.enable", "true"); 
		props.put("mail.smtp.ssl.trust", "smtp.naver.com"); // 앞쪽 공백 제거
		props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
		
		Session session = Session.getInstance(props, new Authenticator() {
			@Override
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(user, password);
			}
		});
		
		MimeMessage message = new MimeMessage(session);
		try {
			message.setFrom(new InternetAddress(user)); 
			message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));
			message.setSubject(subject);
			message.setContent(content, "text/html; charset=UTF-8");
			Transport.send(message);
			log.info("....... successfully .......");
		} catch (Exception e) {
			log.error("메일 발송 실패", e);
			throw new RuntimeException("메일 발송 실패: " + e.getMessage(), e);
		}
	}
}
