package com.itestra.eep.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.test.web.reactive.server.WebTestClient;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class TestConfig {

    @Bean
    public WebTestClient webTestClient() {
        return WebTestClient.bindToServer()
                .baseUrl("http://localhost:8080")
                .build();
    }
}
