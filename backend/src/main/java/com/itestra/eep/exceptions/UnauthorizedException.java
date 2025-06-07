package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class UnauthorizedException extends RuntimeException {

    private final String message = "Unauthorized";

}