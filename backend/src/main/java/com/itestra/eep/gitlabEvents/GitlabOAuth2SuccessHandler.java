package com.itestra.eep.gitlabEvents;

import com.itestra.eep.configs.JwtUtil;
import com.itestra.eep.models.Profile;
import com.itestra.eep.services.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class GitlabOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final ProfileService profileService;
    private final ApplicationEventPublisher eventPublisher;
    private final Environment environment;

    @Value("${client.instance.address}")
    private String clientAddress;

    @Value("${server.ssl.enabled}")
    private boolean isSSLEnabled;

    @Value("${application.security.jwt.expiration}")
    private long expiration;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;

        String gitlabUsername = oauthToken.getPrincipal().getAttribute("username");
        String location = oauthToken.getPrincipal().getAttribute("location");
        String email = oauthToken.getPrincipal().getAttribute("email");
        String name = oauthToken.getPrincipal().getAttribute("name");
        String lastName = oauthToken.getPrincipal().getAttribute("lastName");

        Profile userProfile = profileService.findOrCreateProfile(gitlabUsername, email, name, lastName, location);

        String jwt = jwtUtil.generateToken(userProfile);

        handleAuthorizationCookie(response, jwt, expiration);

        handleRedirect(response, "/login_success");
        eventPublisher.publishEvent(new UserLoginSuccessEvent(this, userProfile, request.getRemoteAddr()));

    }

    public void handleAuthorizationCookie(HttpServletResponse response, String jwt, long expiration) {
        // we had to manually set it up like this because otherwise Safari and Firefox were not recognizing the cookie.
        String cookieValue = "Authorization=" + jwt +
                "; Path=/; Max-Age=" + expiration;

        if (isSSLEnabled || environment.acceptsProfiles(Profiles.of("prod"))) {
            cookieValue += "; HttpOnly; Secure; SameSite=None";
        } else {
            cookieValue += "; SameSite=Lax";
        }

        response.setHeader("Set-Cookie", cookieValue);
    }

    public void handleRedirect(HttpServletResponse response, String redirectUrl) throws IOException {
        response.sendRedirect("%s/Event-Exchange-Platform%s".formatted(clientAddress, redirectUrl));
    }
}
