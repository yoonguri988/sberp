package com.sb.erp.apct.oauth2;

import java.util.Map;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class ApplicantOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest req) {
        OAuth2User oAuth2User = super.loadUser(req);
        String registrationId = req.getClientRegistration().getRegistrationId();
        Map<String, Object> attrs = oAuth2User.getAttributes();

        String provider;
        String providerId;
        String email;

        switch (registrationId) {
            case "kakao" -> {
                provider = "kakao";
                providerId = String.valueOf(attrs.get("id"));
                @SuppressWarnings("unchecked")
                Map<String, Object> kakaoAccount = (Map<String, Object>) attrs.get("kakao_account");
                email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
            }
            case "naver" -> {
                @SuppressWarnings("unchecked")
                Map<String, Object> response = (Map<String, Object>) attrs.get("response");
                provider = "naver";
                providerId = (String) response.get("id");
                email = (String) response.get("email");
            }
            case "google" -> {
                provider = "google";
                providerId = (String) attrs.get("sub");
                email = (String) attrs.get("email");
            }
            default -> throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        }

        return new ApplicantOAuth2User(provider, providerId, email, attrs);
    }
}