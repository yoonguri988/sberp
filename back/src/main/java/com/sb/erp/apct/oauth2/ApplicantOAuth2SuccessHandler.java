package com.sb.erp.apct.oauth2;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import com.sb.erp.global.security.JwtProvider;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ApplicantOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;

    @Value("${app.oauth2.redirect-url}") private String redirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res,
                                         Authentication authentication) throws IOException {
        ApplicantOAuth2User user = (ApplicantOAuth2User) authentication.getPrincipal();

        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "APPLICANT");
        claims.put("provider", user.getProvider());
        claims.put("email", user.getEmail());

        String accessToken = jwtProvider.createAccessToken(user.getProviderId(), claims);

        res.sendRedirect(redirectUrl + "?token=" + accessToken);
        
    }
}