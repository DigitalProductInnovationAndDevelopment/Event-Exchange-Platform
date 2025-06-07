package com.itestra.eep.enums;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;

@Getter
public enum Role implements GrantedAuthority {
    ADMIN("ADMIN"),
    VISITOR("VISITOR");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    @Override
    public String getAuthority() {
        return name();
    }
}

