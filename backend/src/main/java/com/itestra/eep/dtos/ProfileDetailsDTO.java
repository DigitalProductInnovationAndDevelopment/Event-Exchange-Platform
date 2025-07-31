package com.itestra.eep.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.Serializable;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class ProfileDetailsDTO implements Serializable {

    UUID id;

    String name;

    String lastName;

    String gender;

    String gitlabUsername;

    @JsonIgnore
    String notes;

    String email;

    DietaryPreference[] dietTypes;

    @Enumerated(EnumType.STRING)
    Set<Role> authorities;

    @JsonProperty
    public String getNotes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().contains(Role.ADMIN);
        return isAdmin ? this.notes : null;
    }

}
