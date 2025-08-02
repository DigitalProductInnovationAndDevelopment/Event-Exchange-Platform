package com.itestra.eep.serializers;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.itestra.eep.enums.Gender;

import java.io.IOException;

public class GenderDeserializer extends JsonDeserializer<String> {

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        Gender gender = Gender.fromStringOrNull(value);
        return gender != null ? gender.name() : value;
    }
}
