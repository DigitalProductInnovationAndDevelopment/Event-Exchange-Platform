package com.itestra.eep.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.itestra.eep.enums.Role;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import org.springframework.security.core.GrantedAuthority;

import java.io.Serializable;
import java.util.UUID;


@Entity
@Table(schema = "organization", name = "user_roles")
public class UserRole implements GrantedAuthority {

    @EmbeddedId
    private UserRoleKey key;

    @Embeddable
    @EqualsAndHashCode
    public static class UserRoleKey implements Serializable {

        @Column(name = "profile_id", nullable = false)
        @JsonIgnore
        private UUID id;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private Role role;
    }

    @Override
    public String getAuthority() {
        return key.role.getAuthority();
    }

    @Override
    public boolean equals(Object obj) {
        if (obj.getClass().isAssignableFrom(Role.class)) {
            return this.key.role.equals(obj);
        }
        return super.equals(obj);
    }
}
