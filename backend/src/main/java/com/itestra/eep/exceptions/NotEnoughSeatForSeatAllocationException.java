package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class NotEnoughSeatForSeatAllocationException extends RuntimeException {

    private final String message = "There are not enough seats for every participant";

}