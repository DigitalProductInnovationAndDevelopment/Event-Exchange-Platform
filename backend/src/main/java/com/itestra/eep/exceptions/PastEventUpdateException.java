package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class PastEventUpdateException extends RuntimeException {

    private final String message = "You cannot edit past events.";

}