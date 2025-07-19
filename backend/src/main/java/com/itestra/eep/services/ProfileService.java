package com.itestra.eep.services;

import com.itestra.eep.models.Profile;

public interface ProfileService {

    Profile findOrCreateProfile(String gitlabUsername, String email, String name, String location);

}
