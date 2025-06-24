package com.itestra.eep.models;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.type.descriptor.jdbc.VarbinaryJdbcType;

import java.time.LocalDateTime;
import java.util.UUID;

import static jakarta.persistence.FetchType.LAZY;


@Entity
@Getter
@Setter
@Table(schema = "organization", name = "files")
public class FileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "file_id", nullable = false)
    private UUID fileId;

    @ManyToOne(optional = true)
    @JoinColumn(name = "event_id", nullable = true)
    private Event event;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Lob
    @Basic(fetch = LAZY)
    @Column(name = "content", nullable = false, columnDefinition = "bytea")
    @JdbcType(value = VarbinaryJdbcType.class)
    private byte[] content;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
