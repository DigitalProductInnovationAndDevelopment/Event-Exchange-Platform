package com.itestra.eep.factories;

import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.Profile;
import com.itestra.eep.models.VisitorParticipation;
import com.itestra.eep.repositories.ProfileRepository;
import com.itestra.eep.repositories.VisitorParticipationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static com.itestra.eep.enums.Role.VISITOR;


@RequiredArgsConstructor
@Service
@Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
// TODO not well optimized. Batch guest insertions are not optimized.
public class VisitorParticipationFactory {

    private static final String GUEST_NAME_TEMPLATE = "%s Guest: %d";
    // TODO for now, we just generate a random UUID but later another type of string can be used of course
    private static final String ACCESS_LINK_TEMPLATE = "%s";

    private final ProfileRepository profileRepository;
    private final VisitorParticipationRepository visitorParticipationRepository;


    public List<VisitorParticipation> createVisitorParticipations(EmployeeParticipation participation,
                                                                 int guestCount,
                                                                 int startIndex) {
        List<VisitorParticipation> newVisitors = new ArrayList<>();

        for (int i = 0; i < guestCount; i++) {
            int guestIndex = startIndex + i + 1;
            VisitorParticipation visitor = generateVisitorParticipation(guestIndex, participation);
            newVisitors.add(visitor);
        }

        return newVisitors;
    }

    public void insertVisitorParticipations(EmployeeParticipation participation, int currentCount, int newCount) {
        int guestsToAdd = newCount - currentCount;
        List<VisitorParticipation> newVisitors = createVisitorParticipations(participation, guestsToAdd, currentCount);
        visitorParticipationRepository.saveAll(newVisitors);
    }

    public void deleteVisitorParticipations(Set<VisitorParticipation> visitors, int guestsToRemove) {
        List<VisitorParticipation> visitorList = new ArrayList<>(visitors);
        List<UUID> obsoleteProfileIds = new ArrayList<>();
        for (int i = 0; i < guestsToRemove && i < visitorList.size(); i++) {
            obsoleteProfileIds.add(visitorList.get(visitorList.size() - 1 - i).getProfile().getId());
        }
        // deleting visitor profile will cascade delete the respective visitor_participations
        profileRepository.deleteAllByIdInBatch(obsoleteProfileIds);
    }


    private VisitorParticipation generateVisitorParticipation(int guestIndexNumber,
                                                              EmployeeParticipation parentParticipation) {

        String parentEmployeeName = parentParticipation.getEmployee().getProfile().getFullName();

        Profile visitorProfile = Profile.builder()
                .authorities(Set.of(VISITOR))
                .name(String.format(GUEST_NAME_TEMPLATE, parentEmployeeName, guestIndexNumber))
                .build();

        VisitorParticipation visitor = new VisitorParticipation(
                visitorProfile,
                parentParticipation,
                String.format(ACCESS_LINK_TEMPLATE, UUID.randomUUID()));


        visitor.setEvent(parentParticipation.getEvent());
        visitor.setConfirmed(true);
        return visitor;
    }
}


