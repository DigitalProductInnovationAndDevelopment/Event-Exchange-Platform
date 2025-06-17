package com.itestra.eep.dtos;

import com.itestra.eep.validators.ValidJson;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;
import org.springframework.lang.Nullable;

import java.io.Serializable;
import java.util.UUID;


@Value
public class SchematicsUpdateDTO implements Serializable {

    @Nullable
    @Size(max = 255, message = "Schematics name cannot be longer than 255 characters.")
    String name;

    @Nullable
    UUID eventId;

    @NotBlank(message = "Schematics state cannot be empty.")
    @ValidJson
    String state;

}