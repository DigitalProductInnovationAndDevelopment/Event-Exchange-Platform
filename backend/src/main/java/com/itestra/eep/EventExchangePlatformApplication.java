package com.itestra.eep;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry
public class EventExchangePlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventExchangePlatformApplication.class, args);
    }

}
