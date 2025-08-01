package com.itestra.eep.models;

import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.Role;
import com.itestra.eep.serializers.DietaryPreferenceArrayConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;


@Entity
@Getter
@Setter
@Table(schema = "organization", name = "profile")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name")
    private String name;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "gender")
    private String gender;

    @Column(name = "gitlab_username")
    private String gitlabUsername;

    @Column(name = "email", unique = true)
    private String email;

    public void setEmail(String email) {
        this.email = email.toLowerCase();
    }

    @Column(name = "notes")
    private String notes;

    @ElementCollection(targetClass = Role.class, fetch = FetchType.LAZY)
    @CollectionTable(
            schema = "organization",
            name = "user_roles",
            joinColumns = @JoinColumn(name = "profile_id")
    )
    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private Set<Role> authorities = new HashSet<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "diet_types")
    @Convert(converter = DietaryPreferenceArrayConverter.class)
    private DietaryPreference[] dietTypes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Transient
    public String getFullName() {
        return "%s %s".formatted(getName(), getLastName());
    }

}

