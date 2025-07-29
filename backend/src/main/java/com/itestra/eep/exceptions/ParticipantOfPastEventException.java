package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class ParticipantOfPastEventException extends RuntimeException {

    private final String message = "You cannot edit participants of past events.";

}