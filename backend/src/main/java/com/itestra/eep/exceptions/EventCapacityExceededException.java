package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class EventCapacityExceededException extends RuntimeException {

    public EventCapacityExceededException() {
        super("Event has more participants than its capacity!");
    }

    public EventCapacityExceededException(int emptySlots) {
        super("Event capacity exceeded. Number of available slots for the event: %d".formatted(emptySlots));
    }

}