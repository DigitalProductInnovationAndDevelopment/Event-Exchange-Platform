package com.itestra.eep.configs;

import com.itestra.eep.enums.Role;
import com.itestra.eep.models.UserRole;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;


@Configuration
@RequiredArgsConstructor
public class SecurityContextInterceptor extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        UsernamePasswordAuthenticationToken authentication =
                (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();

        Set<UserRole> roles = authentication.getAuthorities().stream()
                .map(role -> new UserRole(null, null, Role.valueOf(role.toString())))
                .collect(Collectors.toSet());

        com.itestra.eep.models.Profile authenticatedTestUserProfile = com.itestra.eep.models.Profile.builder()
                .fullName(((User) authentication.getPrincipal()).getUsername())
                .authorities(roles)
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(authenticatedTestUserProfile, null, roles)
        );

        filterChain.doFilter(request, response);
    }
}



