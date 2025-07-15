package com.itestra.eep.services;

import com.itestra.eep.models.Profile;

public interface ProfileService {

    Profile findByGitlabUsername(String gitlabUsername);

    Profile findByEmail(String email);

    Profile initiateUserProfile(Profile user);

}
