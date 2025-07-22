package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class VisitorLinkInvalidException extends RuntimeException {

    private final String message = "The visitor link is no longer valid. It may have expired if the event you were invited to has ended.";

}