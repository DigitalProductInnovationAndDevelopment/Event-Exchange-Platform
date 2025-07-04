package com.itestra.eep.exceptions;

import lombok.Getter;

@Getter
public class EventCapacityExceededException extends RuntimeException {

    public EventCapacityExceededException() {
        super("Event capacity exceeded. There are more participants than event capacity.");
    }

    public EventCapacityExceededException(int emptySlots) {
        super("Event capacity exceeded. Number of available slots for the event: %d".formatted(emptySlots));
    }

}