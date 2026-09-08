package com.sb.erp.global.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.exception.NurigoMessageNotReceivedException;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import net.nurigo.sdk.message.service.DefaultMessageService;

@Component
public class ApiCoolSms {

	@Value("${coolsms.apikey}")
	private String apiKey;

	@Value("${coolsms.apisecret}")
	private String apiSecret;

	// 사전 등록된 발신번호. 미설정 시 기존 동작(수신번호를 발신번호로도 사용)으로 폴백.
	@Value("${coolsms.sender}")
	private String senderNo;

	// 한국어 SMS 1건 기준 바이트 제한 (EUC-KR 기준 90byte = 한글 약 45자)
	private static final int SMS_BYTE_LIMIT = 90;

	private DefaultMessageService messageService;

	@PostConstruct
	private void init() {
		this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr");
	}

	/**
	 * 임의의 메시지 텍스트를 지정 수신번호로 발송한다.
	 * 노쇼/반납지연 자동 경고 봇 등 발송 문구를 상황별로 다르게 생성해야 하는 경우 사용.
	 */
	public String sendMessage(String to, String text) throws NurigoMessageNotReceivedException {
		// 1. 메시지 만들기
		String safeText = enforceSmsByteLimit(text);

		// 2. 메시지 보내기
		Message message = new Message();
		message.setTo(to); // 수신번호
		message.setFrom((senderNo != null && !senderNo.isBlank()) ? senderNo : to); // 발신번호
		message.setText(safeText);

		SingleMessageSentResponse response =
				messageService.sendOne(new SingleMessageSendingRequest(message));
		// 필요 시 response.getStatusCode() 등으로 발송 결과 로깅 가능

		return safeText;
	}

	/**
	 * EUC-KR 기준으로 90byte를 넘지 않도록 안전하게 잘라준다.
	 */
	private String enforceSmsByteLimit(String text) {
		if (text == null) return "";
		try {
			byte[] full = text.getBytes("EUC-KR");
			if (full.length <= SMS_BYTE_LIMIT) {
				return text;
			}

			int reserved = 2; // 말줄임표(..) 자리
			int byteCount = 0;
			int cutIndex = 0;

			for (int i = 0; i < text.length(); i++) {
				int charBytes = String.valueOf(text.charAt(i)).getBytes("EUC-KR").length;
				if (byteCount + charBytes > SMS_BYTE_LIMIT - reserved) {
					break;
				}
				byteCount += charBytes;
				cutIndex = i + 1;
			}
			return text.substring(0, cutIndex) + "..";

		} catch (Exception e) {
			return text.length() > 40 ? text.substring(0, 40) + ".." : text;
		}
	}
}