package com.itestra.eep.services.impl;

import com.itestra.eep.exceptions.UserProfileNotFoundException;
import com.itestra.eep.exceptions.VisitorLinkInvalidException;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Profile;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.repositories.ProfileRepository;
import com.itestra.eep.repositories.VisitorParticipationRepository;
import com.itestra.eep.services.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

import static com.itestra.eep.enums.Role.EMPLOYEE;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final EmployeeRepository employeeRepository;
    private final VisitorParticipationRepository visitorParticipationRepository;

    @Override
    public Profile findVisitorProfileByAccessLink(String accessLink) {
        return visitorParticipationRepository.findByAccessLink(accessLink, LocalDateTime.now()).orElseThrow(VisitorLinkInvalidException::new);
    }

    @Override
    public Profile findOrCreateProfile(String gitlabUsername, String email, String name, String lastName, String location) {
        try {
            return profileRepository.findByGitlabUsername(gitlabUsername).orElseThrow(UserProfileNotFoundException::new);
        } catch (UserProfileNotFoundException e) {
            try {
                Profile userProfile = profileRepository.findUserProfileByEmail(email).orElseThrow(UserProfileNotFoundException::new);
                userProfile.setGitlabUsername(gitlabUsername);
                return userProfile;
            } catch (UserProfileNotFoundException ex) {
                return createNewProfile(gitlabUsername, email, name, lastName, location);
            }
        }
    }

    private Profile createNewProfile(String gitlabUsername, String email, String name, String lastName, String location) {
        Employee newEmployeeRecord = new Employee();

        Profile userProfile = Profile.builder()
                .gitlabUsername(gitlabUsername)
                .email(email)
                .name(name)
                .lastName(lastName)
                .build();

        userProfile.setAuthorities(Collections.singleton(EMPLOYEE));
        newEmployeeRecord.setProfile(userProfile);
        newEmployeeRecord.setLocation(location);

        return employeeRepository.saveAndFlush(newEmployeeRecord).getProfile();
    }


}
