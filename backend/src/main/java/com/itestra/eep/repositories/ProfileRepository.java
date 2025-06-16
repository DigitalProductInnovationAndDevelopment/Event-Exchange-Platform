package com.itestra.eep.repositories;

import com.itestra.eep.models.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByGitlabUsername(String gitlabUsername);

    Profile findUserProfileByEmail(String email);

}