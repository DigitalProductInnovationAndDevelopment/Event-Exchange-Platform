package com.itestra.eep.repositories.custom;

import com.itestra.eep.models.PreviousMatch;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreviousMatchesRepositoryCustom {

    void batchInsertPreviousMatches(List<PreviousMatch> matches);

}