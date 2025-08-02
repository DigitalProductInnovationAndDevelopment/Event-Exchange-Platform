package com.itestra.eep.validators;


import com.itestra.eep.enums.Gender;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;


public class GenderValidator implements ConstraintValidator<ValidGender, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return false;
        }

        return Gender.fromStringOrNull(value) != null;
    }
}