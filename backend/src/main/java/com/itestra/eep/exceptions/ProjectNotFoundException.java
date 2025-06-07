package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class ProjectNotFoundException extends RuntimeException {

    private final String message = "Project Not Found";

}