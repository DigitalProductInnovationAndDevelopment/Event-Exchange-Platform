package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class UserProfileNotFoundException extends RuntimeException {

    private final String message = "User Not Found";

}