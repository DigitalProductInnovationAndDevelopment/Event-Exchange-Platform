package com.itestra.eep.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.itestra.eep.enums.EventType;
import com.itestra.eep.models.Event;
import com.itestra.eep.serializers.LocalDateTimeDeserializer;
import com.itestra.eep.serializers.LocalDateTimeSerializer;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO for {@link Event}
 */
@Getter
@Setter
public class EventUpdateDTO implements Serializable {

    @Size(message = "Event name should be shorter than 255 characters", max = 255)
    String name;

    EventType eventType;

    @Size(message = "Event address should be shorter than 1000 characters", max = 1000)
    String address;

    @Size(message = "Event description should be shorter than 10000 characters", max = 10000)
    String description;

    @Size(message = "Notes cannot be more than 10000 characters", max = 10000)
    String notes;

    Integer capacity;

    @FutureOrPresent(message = "You cannot create or edit events in the past.")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime date;

}