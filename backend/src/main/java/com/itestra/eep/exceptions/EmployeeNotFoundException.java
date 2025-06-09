package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class EmployeeNotFoundException extends RuntimeException {

    private final String message = "Employee Not Found";

}