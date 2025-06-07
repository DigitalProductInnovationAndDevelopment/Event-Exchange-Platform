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
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.util.Strings;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;
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

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        for (String pattern : WHITELIST) {
            if (pathMatcher.match(pattern, path)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        String jwt = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (Objects.isNull(jwt)) {
            throw new UnauthorizedException();
        }

        try {

            Claims claims = jwtUtil.extractClaims(jwt);

            String userEmail = claims.getSubject();
            String userName = claims.get("name", String.class);
            UUID userId = UUID.fromString(claims.get("id", String.class));
            String userRoles = claims.get("roles", List.class).toString();

            List<String> fetchedRoles = Strings.isEmpty(userRoles) || userRoles.length() < 2 ?
                    List.of() :
                    Arrays.asList(userRoles
                            .replaceAll("[\\[\\]]", "")
                            .split(",\\s*"));

            Set<UserRole> roles = fetchedRoles.stream().map(role -> new UserRole(null, null, Role.valueOf(role))).collect(Collectors.toSet());

            Profile profile = Profile.builder().id(userId).name(userName).email(userEmail).authorities(roles).build();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(profile, null, roles);

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (ExpiredJwtException | SecurityException e) {
            throw new UnauthorizedException();
        }

        filterChain.doFilter(request, response);
    }
}



