package com.itestra.eep.services;

import com.itestra.eep.models.Profile;
import com.itestra.eep.repositories.ProfileRepository;
import com.itestra.eep.services.impl.ProfileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProfileServiceTest {
    @Mock private ProfileRepository profileRepository;
    @InjectMocks private ProfileServiceImpl profileService;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void testFindByGitlabUsername() {
        String username = "testuser";
        Profile profile = new Profile();
        when(profileRepository.findByGitlabUsername(username)).thenReturn(Optional.of(profile));
        assertEquals(profile, profileService.findByGitlabUsername(username));
    }

    @Test
    void testInitiateUserProfile() {
        Profile profile = new Profile();
        when(profileRepository.save(profile)).thenReturn(profile);
        assertEquals(profile, profileService.initiateUserProfile(profile));
    }
} 