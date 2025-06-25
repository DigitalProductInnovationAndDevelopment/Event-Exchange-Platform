package com.itestra.eep.dtos;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ProjectCreateDTO {

    @NotBlank(message = "Project name is required")
    @Size(max = 255, message = "Project name must be at most 100 characters")
    private String projectName;

    @Size(max = 10, message = "Abbreviation must be at most 10 characters")
    private String abbreviation;

}
