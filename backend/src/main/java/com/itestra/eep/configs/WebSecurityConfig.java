package com.itestra.eep.configs;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.CorsConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {

    private final AuthenticationSuccessHandler gitlabOAuth2SuccessHandler;
    private final OncePerRequestFilter securityContextInterceptor;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        String profiles = System.getProperty("spring.profiles.active");

        if (profiles != null && Arrays.asList(profiles.split(",")).contains("local")) {
            //  we disable auth
            http
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                    .csrf(AbstractHttpConfigurer::disable)
                    .cors(getCorsConfigurerCustomizer());
        } else {
            http
                    .csrf(AbstractHttpConfigurer::disable)
                    .cors(getCorsConfigurerCustomizer())
                    .oauth2Login(oauth -> oauth
                            .successHandler(gitlabOAuth2SuccessHandler)
                    )
                    .sessionManagement(session -> session
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    )
                    .addFilterBefore(securityContextInterceptor, UsernamePasswordAuthenticationFilter.class);
        }
        return http.build();
    }

    private static Customizer<CorsConfigurer<HttpSecurity>> getCorsConfigurerCustomizer() {
        return cors -> cors.configurationSource(request -> {
            CorsConfiguration configuration = new CorsConfiguration();
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "DELETE", "PUT"));
            configuration.setAllowCredentials(true);
            // TODO fix for production

            configuration.addAllowedOrigin("http://localhost:3000");
            configuration.addAllowedOrigin("http://localhost:5173");

            configuration.addAllowedHeader("Content-Type");
            configuration.addAllowedHeader("Authorization");
            configuration.addAllowedHeader("X-Requested-With");
            configuration.addAllowedHeader("Accept");

            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", configuration);

            return source.getCorsConfiguration(request);
        });
    }
}
