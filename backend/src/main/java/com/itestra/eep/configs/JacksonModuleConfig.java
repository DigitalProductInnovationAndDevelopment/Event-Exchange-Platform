package com.itestra.eep.configs;

import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.itestra.eep.enums.Gender;
import com.itestra.eep.serializers.GenderDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonModuleConfig {

    @Bean
    public Module customJacksonModule() {
        SimpleModule module = new SimpleModule();
        module.addDeserializer(Gender.class, new GenderDeserializer());
        return module;
    }
}