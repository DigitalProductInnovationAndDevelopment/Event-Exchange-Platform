package com.itestra.eep.webcontroller;

import com.itestra.eep.gitlabEvents.GitlabOAuth2SuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/login/oauth2/code/gitlab")
    public ResponseEntity<Object> loginRequest() {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Boolean> logout(HttpServletResponse response) {
        authenticationSuccessHandler.handleAuthorizationCookie(response, "", 0);
        return ResponseEntity.ok(true);
    }
}
