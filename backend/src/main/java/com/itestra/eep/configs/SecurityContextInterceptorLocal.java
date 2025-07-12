package com.itestra.eep.configs;

import com.itestra.eep.enums.Role;
import com.itestra.eep.models.Profile;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
@Primary
@org.springframework.context.annotation.Profile("local")
public class SecurityContextInterceptorLocal extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String userEmail = "testuser@itestra.com";
        String userName = "testuser";
        UUID userId = UUID.fromString("12345678-1234-1234-1234-123456789012");

        Set<Role> roles = Set.of(Role.ADMIN);

        Profile profile = Profile.builder()
                .id(userId)
                .fullName(userName)
                .email(userEmail)
                .authorities(roles).build();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(profile, null, roles);

        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}
