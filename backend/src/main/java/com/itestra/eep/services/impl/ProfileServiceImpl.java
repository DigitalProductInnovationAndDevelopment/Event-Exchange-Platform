package com.itestra.eep.services.impl;

import com.itestra.eep.exceptions.UserProfileNotFoundException;
import com.itestra.eep.models.Profile;
import com.itestra.eep.repositories.ProfileRepository;
import com.itestra.eep.services.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;

    @Override
    public Profile findByGitlabUsername(String gitlabUsername) {
        return profileRepository.findByGitlabUsername(gitlabUsername).orElseThrow(UserProfileNotFoundException::new);
    }

    @Override
    public Profile initiateUserProfile(Profile profile) {
        return profileRepository.save(profile);
    }

}
