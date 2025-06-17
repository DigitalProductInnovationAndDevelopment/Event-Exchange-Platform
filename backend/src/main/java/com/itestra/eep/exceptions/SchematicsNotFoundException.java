package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class SchematicsNotFoundException extends RuntimeException {

    private final String message = "Schematics Not Found";

}