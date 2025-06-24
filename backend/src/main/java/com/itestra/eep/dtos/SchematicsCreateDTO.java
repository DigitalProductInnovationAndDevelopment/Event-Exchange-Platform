package com.itestra.eep.dtos;

import com.itestra.eep.validators.ValidJson;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

import java.io.Serializable;
import java.util.UUID;


@Value
public class SchematicsCreateDTO implements Serializable {

    @NotNull(message = "Schematics must be connected to an event.")
    UUID eventId;

    @NotBlank(message = "Schematics state cannot be empty.")
    @ValidJson
    String state;

}