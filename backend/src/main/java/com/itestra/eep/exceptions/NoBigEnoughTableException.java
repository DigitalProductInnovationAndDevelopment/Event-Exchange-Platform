package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class NoBigEnoughTableException extends RuntimeException {

    private final String message = "Largest employee and visitor group exceeds the largest table's capacity.";

}