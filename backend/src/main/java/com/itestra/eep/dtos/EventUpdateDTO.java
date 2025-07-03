package com.itestra.eep.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.itestra.eep.enums.EventType;
import com.itestra.eep.models.Address;
import com.itestra.eep.models.Event;
import com.itestra.eep.serializers.LocalDateTimeDeserializer;
import com.itestra.eep.serializers.LocalDateTimeSerializer;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.lang.Nullable;

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

    @Nullable
    EventType eventType;

    @Nullable
    @Size(message = "Event address should be shorter than 1000 characters", max = 1000)
    String address;

    @Nullable
    @Size(message = "Event description should be shorter than 10000 characters", max = 10000)
    String description;

    @Nullable
    Integer capacity;

    @Nullable
    @FutureOrPresent(message = "Event cannot be in the past.")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime date;

    /**
     * DTO for {@link Address}
     */
    @Getter
    @Setter
    public static class AddressCreateDTO implements Serializable {
        @PositiveOrZero
        int postalCode;

        @Nullable
        @Size(message = "Country field should be shorter than 255 characters", max = 255)
        String country;

        @Nullable
        @Size(message = "City field should be shorter than 255 characters", max = 255)
        String city;

        double latitude;

        double longitude;

        @Nullable
        String addressLine1;

        @Nullable
        String addressLine2;
    }
}