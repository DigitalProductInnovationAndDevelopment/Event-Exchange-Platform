package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class ParticipationNotFoundException extends RuntimeException {

    private final String message = "Participation Not Found";

}