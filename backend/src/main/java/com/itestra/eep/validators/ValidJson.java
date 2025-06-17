package com.itestra.eep.validators;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = JsonStringValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidJson {
    String message() default "Invalid JSON format";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}