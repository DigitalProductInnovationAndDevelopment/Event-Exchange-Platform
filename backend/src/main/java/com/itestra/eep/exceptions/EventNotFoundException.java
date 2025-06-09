package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class EventNotFoundException extends RuntimeException {

    private final String message = "Event Not Found";

}