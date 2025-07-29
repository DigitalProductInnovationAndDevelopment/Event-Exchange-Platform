package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class NotEnoughSeatForSeatAllocationException extends RuntimeException {

    public NotEnoughSeatForSeatAllocationException(int requiredSeats, int totalAvailableSeats) {
        super(String.format("There are not enough seats for every participant: required: %d, available: %d",
                requiredSeats, totalAvailableSeats));
    }

}