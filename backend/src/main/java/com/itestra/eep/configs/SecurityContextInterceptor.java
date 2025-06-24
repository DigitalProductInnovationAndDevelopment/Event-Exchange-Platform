package com.itestra.eep.configs;

import com.itestra.eep.enums.Role;
import com.itestra.eep.exceptions.UnauthorizedException;
import com.itestra.eep.models.Profile;
import com.itestra.eep.models.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SecurityException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;


@Configuration
@RequiredArgsConstructor
@Primary
@org.springframework.context.annotation.Profile("!local")
public class SecurityContextInterceptor extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private static final String[] WHITELIST = {
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/swagger-ui/**"
    };

    private boolean isPathWhitelisted(String path) {
        for (String pattern : WHITELIST) {
            if (pathMatcher.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (isPathWhitelisted(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            UsernamePasswordAuthenticationToken authentication = attemptAuthenticationFromJwt(request);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (UnauthorizedException e) {
            response.setContentType("application/json");
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Access Denied, You are logged out!");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private UsernamePasswordAuthenticationToken attemptAuthenticationFromJwt(HttpServletRequest request) {
        String jwt = null;

        // we try to get JWT from cookie first
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("Authorization".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }

        // a fallback to Authorization header if no cookie found
        if (jwt == null) {
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader != null) {
                jwt = authHeader;
            }
        }

        if (jwt == null || jwt.isEmpty()) {
            return createAnonymousAuthentication();
        }

        try {

            Claims claims = jwtUtil.extractClaims(jwt);
            return createAuthenticationFromClaims(claims);

        } catch (ExpiredJwtException | SecurityException e) {
            throw new UnauthorizedException();
        }
    }

    private UsernamePasswordAuthenticationToken createAnonymousAuthentication() {
        Set<UserRole> roles = Set.of(new UserRole(null, null, Role.VISITOR));
        Profile profile = Profile.builder().fullName("Visitor").authorities(roles).build();
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(profile, null, roles);
        authentication.setAuthenticated(false);
        return authentication;
    }

    private UsernamePasswordAuthenticationToken createAuthenticationFromClaims(Claims claims) {
        String userEmail = claims.getSubject();
        String userName = claims.get("name", String.class);
        UUID userId = UUID.fromString(claims.get("id", String.class));

        @SuppressWarnings("unchecked")
        List<String> userRoles = (List<String>) claims.getOrDefault("roles", Collections.emptyList());

        Set<UserRole> roles = userRoles.stream()
                .map(role -> new UserRole(null, null, Role.valueOf(role)))
                .collect(Collectors.toSet());

        Profile profile = Profile.builder()
                .id(userId)
                .fullName(userName)
                .email(userEmail)
                .authorities(roles)
                .build();

        return new UsernamePasswordAuthenticationToken(profile, null, roles);
    }

}



