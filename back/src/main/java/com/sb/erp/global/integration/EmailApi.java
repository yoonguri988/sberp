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
public class EmailApi {

	// 1. 보내는 쪽
	@Value("${google.email.host}")      private String host;      // smtp.gmail.com
	@Value("${google.email.user}")      private String user;      // mdfy0308@gmail.com
	@Value("${google.email.password}")  private String password;  // 구글 앱 비밀번호

	// 2. 이메일 보내기
	public void sendMail(String subject, String content, String to) {
		Properties props = new Properties();
		props.put("mail.smtp.host", host); 
		props.put("mail.smtp.auth", "true"); 
		props.put("mail.smtp.port", "587"); // 네이버/구글 포트 587
		props.put("mail.debug", "true");

		props.put("mail.smtp.starttls.enable", "true"); // 이메일 전송시 보안 연결
		props.put("mail.smtp.ssl.trust", "smtp.gmail.com"); // 구글 SMTP 서버
		props.put("mail.smtp.ssl.protocols", "TLSv1.2");
		
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
