package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class TokenInvalidException extends RuntimeException {

    private final String message = "Token Invalid";
}
