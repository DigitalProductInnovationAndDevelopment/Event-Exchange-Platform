package com.itestra.eep.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.itestra.eep.enums.Role;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(schema = "organization", name = "user_roles")
public class UserRole implements GrantedAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    @JsonIgnore
    private Profile profile;

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
