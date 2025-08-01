package com.itestra.eep.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.itestra.eep.enums.EventType;
import com.itestra.eep.models.Event;
import com.itestra.eep.serializers.LocalDateTimeDeserializer;
import com.itestra.eep.serializers.LocalDateTimeSerializer;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class EventCreateDTO implements Serializable {

    @Size(message = "Event name should be shorter than 255 characters", max = 255)
    @NotBlank(message = "Event name cannot be empty.")
    String name;

    @NotNull(message = "Event type cannot be empty.")
    @Enumerated(EnumType.STRING)
    EventType eventType;

    @Size(message = "Event description should be shorter than 10000 characters", max = 10000)
    @NotBlank(message = "Event description cannot be empty.")
    String description;

    @Size(message = "Notes cannot be more than 10000 characters", max = 10000)
    String notes;

    @NotNull(message = "Event capacity cannot be empty.")
    Integer capacity;

    @NotBlank(message = "Event address cannot be empty.")
    String address;

    @NotNull(message = "Event must have a specific date and time.")
    @FutureOrPresent(message = "Event cannot be in the past.")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime date;

}