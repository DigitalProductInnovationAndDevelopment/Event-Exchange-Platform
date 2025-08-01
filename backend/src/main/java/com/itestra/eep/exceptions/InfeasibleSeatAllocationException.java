package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class InfeasibleSeatAllocationException extends RuntimeException {

    private final String message = "No feasible seat allocation is found!";

}