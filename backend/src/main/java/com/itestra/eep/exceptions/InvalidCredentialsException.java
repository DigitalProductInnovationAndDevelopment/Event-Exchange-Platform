package com.itestra.eep.exceptions;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class InvalidCredentialsException extends RuntimeException {

    private final String message = "Invalid credentials";

}
