package com.itestra.eep.dtos;

import com.itestra.eep.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Value;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Value
@AllArgsConstructor
public class ParticipationDetailsDTO implements Serializable {

    int guestCount;

    boolean confirmed;

    UUID eventId;

    String eventName;

    EventType eventType;

    LocalDateTime eventDate;

    String eventAddress;
}