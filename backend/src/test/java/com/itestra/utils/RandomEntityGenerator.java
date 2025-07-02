package com.itestra.utils;

import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.EmploymentType;
import com.itestra.eep.enums.EventType;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;


@Component
public class RandomEntityGenerator {

    public static final Random random = new Random();

    public <T> T generate(Class<T> clazz) {
        if (clazz.equals(Employee.class))
            return clazz.cast(generateRandomEmployee());
        else if (clazz.equals(Event.class))
            return clazz.cast(generateRandomEvent());
        else if (clazz.equals(Profile.class))
            return clazz.cast(generateRandomProfile());
        else if (clazz.equals(LocalDateTime.class))
            return clazz.cast(generateRandomLocalDateTime());
        else
            throw new IllegalArgumentException("No random Entity generator function is found for Entity type : " + clazz.getName());
    }


    private Employee generateRandomEmployee() {
        return Employee.builder()
                .employmentStartDate(generateRandomLocalDateTime().toLocalDate())
                .employmentType(random.nextBoolean() ? EmploymentType.FULLTIME : EmploymentType.PARTTIME)
                .location(getRandomString(50))
                .profile(generateRandomProfile())
                .build();
    }

    private Event generateRandomEvent() {
        return Event.builder()
                .name(getRandomString(50))
                .address(getRandomString(50))
                .capacity(50)
                .date(generateRandomLocalDateTime())
                .description(getRandomString(100))
                .eventType(random.nextBoolean() ? EventType.SUMMER_EVENT : EventType.WINTER_EVENT)
                .build();
    }

    private Profile generateRandomProfile() {
        String name = getRandomString(50);
        return Profile.builder()
                .fullName(name)
                .gender(random.nextBoolean() ? "Male" : "Female")
                .gitlabUsername(name)
                .dietTypes(new DietaryPreference[0])
                .email("%s@testmail.com".formatted(name)).build();
    }


    public <T> List<T> generateListOf(Class<T> clazz, int count) {
        List<T> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(generate(clazz));
        }
        return list;
    }

    public <T> Set<T> generateSetOf(Class<T> clazz, int count) {
        Set<T> set = new HashSet<>();
        for (int i = 0; i < count; i++) {
            set.add(generate(clazz));
        }
        return set;
    }

    private LocalDateTime generateRandomLocalDateTime() {
        LocalDateTime now = LocalDateTime.now();
        long startEpochSecond = now.toEpochSecond(ZoneOffset.UTC);
        LocalDateTime twoYearsAgo = now.minusYears(2);

        long endEpochSecond = twoYearsAgo.toEpochSecond(ZoneOffset.UTC);

        Random random = new Random();
        long randomEpochSecond = startEpochSecond + Math.round(random.nextDouble() * (endEpochSecond - startEpochSecond));

        return LocalDateTime.ofEpochSecond(randomEpochSecond, 0, ZoneOffset.UTC);
    }

    public static <T> T getOneFromCollection(List<T> collection) {

        if (collection == null || collection.isEmpty()) {
            throw new IllegalArgumentException("Collection is null or empty");
        }
        Random random = new Random();
        return collection.get(random.nextInt(collection.size()));
    }

    public static <T> List<T> getListFromCollection(final List<T> collection, int count) {
        if (collection == null || collection.isEmpty()) {
            throw new IllegalArgumentException("Collection is null or empty");
        }
        if (count <= 0) {
            return new ArrayList<>();
        } else if (count > collection.size()) {
            count = collection.size();
        }

        List<T> shuffled = new ArrayList<>(List.copyOf(collection));
        Collections.shuffle(shuffled);
        return shuffled.subList(0, count);

    }

    public static <T> Set<T> getSetFromCollection(final List<T> collection, int count) {
        if (collection == null || collection.isEmpty()) {
            throw new IllegalArgumentException("Collection is null or empty");
        }
        if (count <= 0) {
            return new HashSet<>();
        } else if (count > collection.size()) {
            count = collection.size();
        }

        List<T> shuffled = new ArrayList<>(List.copyOf(collection));
        Collections.shuffle(shuffled);
        return new HashSet<>(shuffled.subList(0, count));

    }

    public static String getRandomString(int length) {
        Random random = ThreadLocalRandom.current();
        byte[] r = new byte[length];
        random.nextBytes(r);
        return Base64.getEncoder().encodeToString(r);
    }

}
