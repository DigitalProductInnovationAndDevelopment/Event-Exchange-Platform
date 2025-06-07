package com.itestra.eep.dtos;

import com.itestra.eep.enums.EventType;
import com.itestra.eep.models.Address;
import com.itestra.eep.models.Event;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.lang.Nullable;

import java.io.Serializable;

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

    @NotNull
    @Nullable
    EventUpdateDTO.AddressCreateDTO address;

    /**
     * DTO for {@link Address}
     */
    @Getter
    @Setter
    public static class AddressCreateDTO implements Serializable {
        @Nullable
        @PositiveOrZero
        int postalCode;

        @Nullable
        @Size(message = "Country field should be shorter than 255 characters", max = 255)
        String country;

        @Nullable
        @Size(message = "City field should be shorter than 255 characters", max = 255)
        String city;

        @Nullable
        double latitude;

        @Nullable
        double longitude;

        @Nullable
        String addressLine1;

        @Nullable
        String addressLine2;
    }
}