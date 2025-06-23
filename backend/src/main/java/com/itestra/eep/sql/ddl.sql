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
    gitlab_username VARCHAR(255)  NULL UNIQUE,
    email           VARCHAR(255)  NULL UNIQUE,
    full_name       VARCHAR(500)  NOT NULL,
    gender          VARCHAR(255)  NULL,
    diet_types      VARCHAR(55)[] NULL,
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
    location VARCHAR(255) NOT NULL,
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
    event_id UUID REFERENCES organization.Event (id),
    CONSTRAINT unique_person_event UNIQUE (person_id, event_id)
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
    state      TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
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



INSERT INTO organization.profile (id, gitlab_username, email, full_name, gender, diet_types, created_at,
                                  updated_at)
VALUES ('a3f2f969-d8cd-4af1-9391-85eb57b0c6b4'::uuid, 'itestra.tum.hr', 'itestra.tum.hr@gmail.com', 'itestra',
        'MALE', NULL, '2025-06-11 20:45:36.046825', '2025-06-11 20:45:36.046855');

INSERT INTO organization.user_roles (profile_id, "role")
VALUES ('a3f2f969-d8cd-4af1-9391-85eb57b0c6b4'::uuid, 'ADMIN');


INSERT INTO organization."event" (id, "name", description, "date", capacity, "event_type", address)
VALUES ('a8f2b29f-634e-4e56-a2f7-d3a3e7e1f8e0'::uuid, 'Augustiner-Keller',
        'Relaxed year-end dinner with the whole team. Great food, cold beer, and a look back at the highlights of the year.',
        '2025-12-20 19:00:00', 150, 'YEAR_END_PARTY'::organization."event_type", 'Arnulfstraße 52, 80335 München'),
        ('c0b7a9de-42c0-4e1c-8358-d8f6f7d8f7c1'::uuid, 'Lost Weekend',
        'Casual after-work meetup with coffee, snacks, and short lightning talks. Great chance to connect across teams.',
        '2024-11-06 17:00:00', 50, 'WINTER_EVENT'::organization."event_type", 'Schellingstraße 3, 80779 München'),
        ('9f5a4dbf-e15d-4c8b-8d51-fb9a3e07f289'::uuid, 'Alte Utting',
        'Laid-back summer hangout on the ship with drinks, music, and rooftop views. Just time to catch up and enjoy the sun.',
        '2024-06-25 15:00:00', 75, 'SUMMER_EVENT'::organization."event_type", 'Lagerhausstraße 15, 81371 München'),
        ('d624cc6d-98ea-4d27-9f04-14d47ef55856'::uuid, 'Café Münchner Freiheit',
        'Small informal meetup to welcome new colleagues and casually chat about project ideas and team topics.',
        '2023-12-05 17:00:00', 50, 'WINTER_EVENT'::organization."event_type", 'Leopoldstraße 82, 80802 München'),
        ('f1c9d9f4-7a5e-4d91-9fcb-2c9d1c3b7bfa'::uuid, 'Käfer-Schänke',
        'Dinner in a small group focused on sharing ideas between project leads and management. Great food, relaxed setting.',
        '2023-06-23 18:30:00', 40, 'SUMMER_EVENT'::organization."event_type", 'Prinzregentenstraße 73, 81675 München');


