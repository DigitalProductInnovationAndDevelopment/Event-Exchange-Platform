package com.itestra.eep.configs;

import com.itestra.eep.enums.Role;
import com.itestra.eep.models.FileEntity;
import com.itestra.eep.models.Profile;
import com.itestra.eep.services.EventService;
import com.itestra.eep.services.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component("fileSecurity")
@RequiredArgsConstructor
@SuppressWarnings("unused")
public class FileSecurity {

    private final FileService fileService;
    private final EventService eventService;

    public boolean canDownloadFile(UUID fileId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Profile user = (Profile) authentication.getPrincipal();

        // admins can always download
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> Role.ADMIN.name().equals(auth.getAuthority()));

        if (isAdmin) {
            return true;
        }

        // allow visitors or employees to download if they are participants of the event
        Optional<FileEntity> fileOpt = fileService.getFile(fileId);
        return fileOpt.isPresent() &&
                eventService.isParticipant(fileOpt.get().getEvent().getId(), ((Profile) authentication.getPrincipal()).getId());
    }
}

