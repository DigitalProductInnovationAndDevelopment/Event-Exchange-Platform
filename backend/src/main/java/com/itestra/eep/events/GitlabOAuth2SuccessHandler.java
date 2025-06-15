package com.itestra.eep.events;

import com.itestra.eep.configs.JwtUtil;
import com.itestra.eep.enums.Role;
import com.itestra.eep.exceptions.UserProfileNotFoundException;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Profile;
import com.itestra.eep.models.UserRole;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.services.ProfileService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class GitlabOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtService;
    private final ProfileService profileService;
    private final EmployeeRepository employeeRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${application.security.jwt.expiration}")
    private long expiration;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;

        String gitlabUsername = oauthToken.getPrincipal().getAttribute("username");
        String email = oauthToken.getPrincipal().getAttribute("email");
        String name = oauthToken.getPrincipal().getAttribute("name");

        Profile userProfile;
        try {
            userProfile = profileService.findByGitlabUsername(gitlabUsername);
        } catch (UserProfileNotFoundException e) {

            Employee newEmployeeRecord = new Employee();
            UserRole userRole = new UserRole();
            // since we handle GitLab authentication here, we assume that the new profile belongs to an employee.
            userRole.setRole(Role.EMPLOYEE);

            userProfile = Profile.builder()
                    .gitlabUsername(gitlabUsername)
                    .email(email)
                    .name(name)
                    .build();

            userRole.setProfile(userProfile);

            userProfile.setAuthorities(Set.of(userRole));
            newEmployeeRecord.setProfile(userProfile);
            employeeRepository.saveAndFlush(newEmployeeRecord);

        }

        String jwt = jwtService.generateToken(userProfile);

        Cookie cookie = new Cookie("Authorization", jwt);
        cookie.setHttpOnly(false);
        //TODO make true for production and https
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge((int) expiration);
        response.addCookie(cookie);

        response.sendRedirect("http://localhost:5173/login_success");
        eventPublisher.publishEvent(new UserLoginSuccessEvent(this, userProfile, request.getRemoteAddr()));

    }
}
