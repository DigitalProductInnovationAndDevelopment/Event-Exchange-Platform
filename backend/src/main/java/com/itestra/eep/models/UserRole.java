package com.itestra.eep.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.itestra.eep.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(schema = "organization", name = "user_roles")
public class UserRole implements GrantedAuthority {

    @Id
    @Column(name = "profile_id", nullable = false)
    @JsonIgnore
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Override
    public String getAuthority() {
        return role.getAuthority();
    }

    @Override
    public boolean equals(Object obj) {
        if (obj.getClass().isAssignableFrom(Role.class)) {
            return this.role.equals(obj);
        }
        return super.equals(obj);
    }
}
