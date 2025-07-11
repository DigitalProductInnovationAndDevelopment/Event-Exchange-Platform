package com.itestra.eep.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.EventType;
import com.itestra.eep.serializers.LocalDateTimeDeserializer;
import com.itestra.eep.serializers.LocalDateTimeSerializer;
import lombok.Builder;
import lombok.Value;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Value
@Builder
public class ParticipationDetailsDTO implements Serializable {

    UUID id;

    UUID employeeId;

    UUID eventId;

    int guestCount;

    boolean confirmed;

    String eventName;

    EventType eventType;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    LocalDateTime eventDate;

    String eventAddress;

    String fullName;

    String gitlabUsername;

    String email;

    DietaryPreference[] dietTypes;
}