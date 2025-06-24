-- Create schemas
CREATE SCHEMA IF NOT EXISTS organization;

CREATE USER organization_user WITH PASSWORD 'organization_password';
GRANT CONNECT ON DATABASE postgres TO organization_user;
GRANT USAGE ON SCHEMA organization TO organization_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA organization TO organization_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA organization
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO organization_user;


CREATE TYPE organization.event_type AS ENUM ( 'WINTER_EVENT', 'SUMMER_EVENT', 'YEAR_END_PARTY');
CREATE TYPE organization.dietary_preference AS ENUM ('VEGETARIAN', 'PESCATARIAN', 'HALAL', 'KOSHER', 'VEGAN', 'LACTOSE_FREE', 'GLUTEN_FREE', 'KETO');
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


CREATE TABLE organization.table
(
    id       UUID PRIMARY KEY,
    event_id UUID REFERENCES organization.Event (id)
);

CREATE TABLE organization.participation
(
    id          UUID PRIMARY KEY,
    guest_count INTEGER,
    confirmed   BOOLEAN,
    employee_id UUID REFERENCES organization.employee (profile_id) NOT NULL,
    event_id    UUID REFERENCES organization.Event (id),
    table_id    UUID REFERENCES organization.table (id)            NULL,
    CONSTRAINT unique_person_event UNIQUE (employee_id, event_id)
);

CREATE TABLE organization.chair
(
    id       UUID PRIMARY KEY,
    table_id UUID REFERENCES organization.table (id)
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

CREATE TABLE organization.schematics
(
    id         UUID PRIMARY KEY,
    event_id   UUID REFERENCES organization.event (id),
    file_id    UUID REFERENCES organization.files (file_id),
    state      TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT unique_schematic_per_event UNIQUE (event_id)
);


GRANT USAGE, SELECT ON SEQUENCE organization.user_roles_id_seq TO organization_user;
GRANT USAGE, SELECT ON SEQUENCE organization.audit_log_id_seq TO organization_user;

