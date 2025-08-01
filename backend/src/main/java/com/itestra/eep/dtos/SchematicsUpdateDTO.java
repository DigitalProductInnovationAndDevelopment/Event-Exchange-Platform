package com.itestra.eep.dtos;

import com.itestra.eep.validators.ValidJson;
import jakarta.validation.constraints.NotBlank;
import lombok.Value;

import java.io.Serializable;
import java.util.UUID;


@Value
public class SchematicsUpdateDTO implements Serializable {

    UUID eventId;

    @NotBlank(message = "Schematics state cannot be empty.")
    @ValidJson
    String state;

}