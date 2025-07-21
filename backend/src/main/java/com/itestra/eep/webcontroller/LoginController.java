package com.itestra.eep.webcontroller;

import com.itestra.eep.configs.JwtUtil;
import com.itestra.eep.gitlabEvents.GitlabOAuth2SuccessHandler;
import com.itestra.eep.gitlabEvents.UserLoginSuccessEvent;
import com.itestra.eep.models.Profile;
import com.itestra.eep.services.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


@CrossOrigin
@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping
public class LoginController {

    private final GitlabOAuth2SuccessHandler authenticationSuccessHandler;
    private final ProfileService profileService;
    private final JwtUtil jwtUtil;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${application.security.jwt.expiration}")
    private long expiration;

    @Value("${client.instance.address}")
    private String clientAddress;

    @GetMapping("/login/oauth2/code/gitlab")
    public ResponseEntity<Object> loginRequest() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/login/visitor/{accessLink}")
    public ResponseEntity<Boolean> visitorLogin(HttpServletRequest request,
                                                HttpServletResponse response, @PathVariable String accessLink) {

        Profile visitorProfile = profileService.findVisitorProfileByAccessLink(accessLink);

        String jwt = jwtUtil.generateToken(visitorProfile);

        authenticationSuccessHandler.handleAuthorizationCookie(response, jwt, expiration);

        eventPublisher.publishEvent(new UserLoginSuccessEvent(this, visitorProfile, request.getRemoteAddr()));
        return ResponseEntity.ok(true);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Boolean> logout(HttpServletResponse response) {
        authenticationSuccessHandler.handleAuthorizationCookie(response, "", 0);
        return ResponseEntity.ok(true);
    }
}
