package com.itestra.eep.dtos;

import com.itestra.eep.validators.ValidJson;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;

import java.io.Serializable;
import java.util.UUID;


@Value
public class SchematicsCreateDTO implements Serializable {

    @Size(max = 255, message = "Schematics name cannot be longer than 255 characters.")
    @NotBlank(message = "Schematics name cannot be empty.")
    String name;

    @NotNull(message = "Schematics must be connected to an event.")
    UUID eventId;

    @NotBlank(message = "Schematics state cannot be empty.")
    @ValidJson
    String state;

}