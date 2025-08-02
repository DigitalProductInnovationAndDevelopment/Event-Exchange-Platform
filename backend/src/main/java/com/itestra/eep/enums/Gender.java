package com.itestra.eep.enums;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

public enum Gender {

    MALE(new String[]{"MALE", "M"}),
    FEMALE(new String[]{"FEMALE", "F", "W"}),
    DIVERSE(new String[]{"DIVERSE", "D"});

    private final String[] values;
    private static final Map<String, Gender> LOOKUP_MAP;


    static {
        LOOKUP_MAP = Arrays.stream(Gender.values())
                .flatMap(gender -> Arrays.stream(gender.values)
                        .map(value -> Map.entry(value.toUpperCase(), gender)))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (existing, replacement) -> existing
                ));
    }

    Gender(String[] values) {
        this.values = values;
    }

    public static Gender fromStringOrNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return LOOKUP_MAP.get(value.trim().toUpperCase());
    }
}
