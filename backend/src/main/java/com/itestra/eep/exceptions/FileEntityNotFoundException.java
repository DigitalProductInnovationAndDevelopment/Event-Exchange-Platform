package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class FileEntityNotFoundException extends RuntimeException {

    private final String message = "File Not Found";

}