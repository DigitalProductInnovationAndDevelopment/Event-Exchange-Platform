-- Create schemas
CREATE SCHEMA IF NOT EXISTS organization;

CREATE USER organization_user WITH PASSWORD 'organization_password';
GRANT CONNECT ON DATABASE postgres TO organization_user;
GRANT USAGE ON SCHEMA organization TO organization_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA organization TO organization_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA organization
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO organization_user;


CREATE TYPE organization.event_type AS ENUM ( 'WINTER_EVENT', 'SUMMER_EVENT', 'YEAR_END_PARTY');
CREATE TYPE organization.dietary_preference AS ENUM ('VEGETARIAN', 'PESCATARIAN', 'HALAL', 'KOSHER', 'VEGAN');
CREATE TYPE organization.employment_type AS ENUM ('FULLTIME', 'PARTTIME', 'WORKING_STUDENT', 'THESIS');


CREATE TABLE organization.audit_log
(
    id             BIGSERIAL PRIMARY KEY,
    uid            UUID         NOT NULL,
    ip_address     VARCHAR(45)  NOT NULL,
    operation_type VARCHAR(255) NOT NULL,
    timestamp      TIMESTAMP
);

CREATE TABLE organization.address
(
    id            UUID PRIMARY KEY,
    postal_code   INTEGER,
    country       VARCHAR(255) NOT NULL,
    city          VARCHAR(255) NOT NULL,
    latitude      DOUBLE PRECISION,
    longitude     DOUBLE PRECISION,
    address_line1 TEXT         NULL,
    address_line2 TEXT         NULL
);


CREATE TABLE organization.profile
(
    id              UUID PRIMARY KEY,
    gitlab_username VARCHAR(255)                      NULL UNIQUE,
    email           VARCHAR(255)                      NULL UNIQUE,
    name            VARCHAR(255)                      NOT NULL,
    last_name       VARCHAR(255)                      NULL,
    gender          VARCHAR(255)                      NULL,
    diet_types      organization.dietary_preference[] NULL,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE TABLE organization.user_roles
(
    id         BIGSERIAL PRIMARY KEY,
    profile_id UUID        NOT NULL,
    role       VARCHAR(50) NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES organization.profile (id) ON DELETE CASCADE
);


CREATE TABLE organization.employee
(
    profile_id            UUID PRIMARY KEY REFERENCES organization.Profile (id),
    employment_type       organization.employment_type,
    employment_start_date DATE
);

CREATE TABLE organization.project
(
    id           UUID PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(10)  NULL
);


CREATE TABLE organization.employee_project
(
    employee_id UUID REFERENCES organization.Employee (profile_id),
    project_id  UUID REFERENCES organization.Project (id),
    PRIMARY KEY (employee_id, project_id)
);


CREATE TABLE organization.previous_matches
(
    id        UUID PRIMARY KEY,
    person_id UUID REFERENCES organization.Profile (id)
);


CREATE TABLE organization.event
(
    id          UUID PRIMARY KEY,
    name        VARCHAR(255)   NOT NULL,
    description VARCHAR(10000) NOT NULL,
    date    TIMESTAMP     NULL,
    capacity    INT            NOT NULL,
    event_type  organization.event_type,
    address VARCHAR(1000) NOT NULL
);


CREATE TABLE organization.participation
(
    id          UUID PRIMARY KEY,
    guest_count INTEGER,
    confirmed   BOOLEAN,
    person_id   UUID REFERENCES organization.Profile (id),
    event_id    UUID REFERENCES organization.Event (id)
);


CREATE TABLE organization.table
(
    id       UUID PRIMARY KEY,
    event_id UUID REFERENCES organization.Event (id)
);


CREATE TABLE organization.chair
(
    id       UUID PRIMARY KEY,
    table_id UUID REFERENCES organization.table (id)
);

CREATE TABLE organization.schematics
(
    id       UUID PRIMARY KEY,
    event_id UUID REFERENCES organization.event (id),
    name     VARCHAR(255) NOT NULL,
    state    TEXT         NOT NULL
);

CREATE TABLE organization.files
(
    file_id      UUID PRIMARY KEY,
    event_id     UUID references organization.event (id),
    name         VARCHAR(255) NOT NULL,
    content_type VARCHAR(255) NULL,
    content      BYTEA        NOT NULL,
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP
);


GRANT USAGE, SELECT ON SEQUENCE organization.user_roles_id_seq TO organization_user;
GRANT USAGE, SELECT ON SEQUENCE organization.audit_log_id_seq TO organization_user;



INSERT INTO organization.profile (id, gitlab_username, email, name, last_name, gender, diet_types, created_at,
                                  updated_at)
VALUES ('a3f2f969-d8cd-4af1-9391-85eb57b0c6b4'::uuid, 'itestra.tum.hr', 'itestra.tum.hr@gmail.com', 'itestra', NULL,
        NULL, NULL, '2025-06-11 20:45:36.046825', '2025-06-11 20:45:36.046855');

INSERT INTO organization.user_roles (profile_id, "role")
VALUES ('a3f2f969-d8cd-4af1-9391-85eb57b0c6b4'::uuid, 'ADMIN');


INSERT INTO organization."event" (id, "name", description, "date", capacity, "event_type", address)
VALUES ('a8f2b29f-634e-4e56-a2f7-d3a3e7e1f8e0'::uuid, 'Tech Conference 2024',
        'Join us for the biggest tech conference of the year. Network with industry leaders, attend workshops, and discover the latest innovations in technology.',
        '2025-12-13 14:00:00', 200, 'WINTER_EVENT'::organization."event_type", 'San Francisco Convention Center'),
       ('c0b7a9de-42c0-4e1c-8358-d8f6f7d8f7c1'::uuid, 'Web Development Workshop',
        'Hands-on workshop covering modern web development practices, frameworks, and tools. Perfect for developers looking to enhance their skills.',
        '2023-07-06 14:00:00', 300, 'WINTER_EVENT'::organization."event_type", 'New York Tech Hub'),
       ('e3059cd7-f7fa-4821-9671-c73f1462a1a6'::uuid, 'Project Planning Meeting',
        'Quarterly project planning meeting to discuss goals, timelines, and resource allocation for upcoming initiatives.',
        '2024-12-20 14:00:00', 150, 'YEAR_END_PARTY'::organization."event_type", 'Chicago Business Center'),
       ('b1578e9a-0a39-4e7a-9187-940181ddc64d'::uuid, 'Winter Networking Mixer',
        'Annual winter networking event bringing together industry professionals for an evening of connections and collaboration.',
        '2023-12-14 14:00:00', 150, 'WINTER_EVENT'::organization."event_type", 'Boston Innovation Center'),
       ('9f5a4dbf-e15d-4c8b-8d51-fb9a3e07f289'::uuid, 'Summer Tech Festival',
        'A week-long celebration of technology and innovation featuring workshops, hackathons, and networking opportunities.',
        '2025-06-25 14:00:00', 250, 'SUMMER_EVENT'::organization."event_type", 'Miami Beach Convention Center'),
       ('d624cc6d-98ea-4d27-9f04-14d47ef55856'::uuid, 'Annual Company Celebration',
        'Join us for our annual year-end celebration featuring awards, entertainment, and a look back at our achievements.',
        '2024-06-20 14:00:00', 150, 'SUMMER_EVENT'::organization."event_type", 'Las Vegas Grand Hotel');


