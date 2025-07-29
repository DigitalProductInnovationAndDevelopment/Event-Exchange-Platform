package com.itestra.eep.repositories;

import com.itestra.eep.models.Profile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    @EntityGraph(attributePaths = "authorities")
    Optional<Profile> findByGitlabUsername(String gitlabUsername);

    @EntityGraph(attributePaths = "authorities")
    Optional<Profile> findUserProfileByEmail(String email);

}