package com.itestra.eep.services;

import com.itestra.eep.models.Profile;
import com.itestra.eep.repositories.ProfileRepository;
import com.itestra.utils.RandomEntityGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.DirtiesContext;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@Import(value = RandomEntityGenerator.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ProfileServiceTest {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private RandomEntityGenerator randomEntityGenerator;

    @Test
    void testFindByGitlabUsername() {
        Profile profile = randomEntityGenerator.generate(Profile.class);
        profile = profileRepository.save(profile);

        Profile fetchedProfile = profileService.findByGitlabUsername(profile.getGitlabUsername());

        assertEquals(profile.getFullName(), fetchedProfile.getFullName());
        assertEquals(profile.getEmail(), fetchedProfile.getEmail());
        assertEquals(profile.getId(), fetchedProfile.getId());
        assertEquals(profile.getGitlabUsername(), fetchedProfile.getGitlabUsername());
        assertEquals(profile.getGender(), fetchedProfile.getGender());
        assertArrayEquals(profile.getDietTypes(), fetchedProfile.getDietTypes());
    }

} 