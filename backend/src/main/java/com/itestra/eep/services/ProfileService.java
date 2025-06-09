package com.itestra.eep.services;

import com.itestra.eep.models.Profile;

public interface ProfileService {

    Profile findByGitlabUsername(String gitlabUsername);

    Profile initiateUserProfile(Profile user);

}
