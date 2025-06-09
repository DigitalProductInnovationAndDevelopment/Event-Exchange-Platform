package com.itestra.eep.dtos;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.lang.Nullable;

@Getter
@Setter
@AllArgsConstructor
public class ProjectUpdateDTO {

    @Nullable
    @Size(max = 100, message = "Project name must be at most 100 characters")
    private String projectName;

    @Nullable
    @Size(max = 10, message = "Abbreviation must be at most 10 characters")
    private String abbreviation;


}
