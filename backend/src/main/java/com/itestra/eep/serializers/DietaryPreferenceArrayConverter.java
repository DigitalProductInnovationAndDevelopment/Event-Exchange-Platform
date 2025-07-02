package com.itestra.eep.serializers;

import com.itestra.eep.enums.DietaryPreference;
import io.micrometer.common.util.StringUtils;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;
import java.util.stream.Collectors;

@Converter(autoApply = true)
public class DietaryPreferenceArrayConverter implements AttributeConverter<DietaryPreference[], String> {

    @Override
    public String convertToDatabaseColumn(DietaryPreference[] attribute) {
        if (attribute == null || attribute.length == 0) {
            return "{}";
        }
        return "{" + Arrays.stream(attribute)
                .map(Enum::name)
                .collect(Collectors.joining(",")) + "}";
    }

    @Override
    public DietaryPreference[] convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.length() < 2) {
            return new DietaryPreference[0];
        }

        String trimmed = dbData.substring(1, dbData.length() - 1);

        if (StringUtils.isBlank(trimmed)) {
            return new DietaryPreference[0];
        }

        return Arrays.stream(trimmed.split(","))
                .map(s -> s.replaceAll("^\"|\"$", "")) // remove starting and ending quotes
                .map(DietaryPreference::valueOf)
                .toArray(DietaryPreference[]::new);
    }
}
