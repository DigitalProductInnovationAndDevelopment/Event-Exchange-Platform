package com.itestra.eep.dtos;

import com.itestra.eep.enums.EventType;
import com.itestra.eep.models.Address;
import com.itestra.eep.models.Event;
import jakarta.validation.constraints.NotBlank;
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
public class EventCreateDTO implements Serializable {

    @Size(message = "Event name should be shorter than 255 characters", max = 255)
    @NotBlank(message = "Event name cannot be empty.")
    String name;

    @NotNull
    EventType eventType;

    @NotNull
    EventCreateDTO.AddressCreateDTO address;

    /**
     * DTO for {@link Address}
     */
    @Getter
    @Setter
    public static class AddressCreateDTO implements Serializable {
        @PositiveOrZero
        int postalCode;

        @NotBlank
        String country;

        @NotBlank
        String city;

        @Nullable
        Double latitude;

        @Nullable
        Double longitude;

        @Nullable
        @Size(message = "Address Line 1 should be shorter than 255 characters", max = 255)
        String addressLine1;

        @Nullable
        @Size(message = "Address Line 2 should be shorter than 255 characters", max = 255)
        String addressLine2;
    }
}