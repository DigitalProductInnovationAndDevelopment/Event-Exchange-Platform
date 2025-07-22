-- Create schemas
CREATE SCHEMA IF NOT EXISTS organization;

CREATE USER organization_user WITH PASSWORD 'organization_password';
GRANT CONNECT ON DATABASE postgres TO organization_user;
GRANT USAGE ON SCHEMA organization TO organization_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA organization TO organization_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA organization
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO organization_user;


CREATE TABLE organization.audit_log
(
    id             BIGSERIAL PRIMARY KEY,
    uid            UUID         NOT NULL,
    ip_address     VARCHAR(45)  NOT NULL,
    operation_type VARCHAR(255) NOT NULL,
    timestamp      TIMESTAMP
);

CREATE TABLE organization.profile
(
    id              UUID PRIMARY KEY,
    gitlab_username VARCHAR(255) NULL UNIQUE,
    email           VARCHAR(255) NULL UNIQUE,
    name      VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NULL,
    gender          VARCHAR(255) NULL,
    diet_types      VARCHAR      NULL,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE TABLE organization.user_roles
(
    profile_id UUID        NOT NULL,
    role       VARCHAR(50) NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES organization.profile (id) ON DELETE CASCADE,
    CONSTRAINT unique_user_role UNIQUE (profile_id, role)
);

CREATE TABLE organization.employee
(
    profile_id      UUID PRIMARY KEY REFERENCES organization.profile (id) ON DELETE CASCADE,
    location        VARCHAR(255) NOT NULL,
    employment_start_date DATE
);

CREATE TABLE organization.event
(
    id          UUID PRIMARY KEY,
    name        VARCHAR(255)   NOT NULL,
    description VARCHAR(10000) NOT NULL,
    date       TIMESTAMP     NULL,
    capacity    INT            NOT NULL,
    event_type VARCHAR,
    address    VARCHAR(1000) NOT NULL
);

CREATE TABLE organization.previous_matches
(
    first_employee_id  UUID REFERENCES organization.employee (profile_id) ON DELETE CASCADE,
    second_employee_id UUID REFERENCES organization.employee (profile_id) ON DELETE CASCADE,
    event_id           UUID REFERENCES organization.event (id),
    PRIMARY KEY (first_employee_id, second_employee_id, event_id)
);

CREATE TABLE organization.chair
(
    id       UUID PRIMARY KEY,
    event_id UUID REFERENCES organization.event (id)
);

CREATE TABLE organization.employee_participation
(
    id          UUID PRIMARY KEY,
    guest_count INTEGER,
    confirmed   BOOLEAN,
    profile_id UUID REFERENCES organization.employee (profile_id) ON DELETE CASCADE NOT NULL,
    event_id   UUID REFERENCES organization.Event (id) ON DELETE CASCADE,
    chair_id   UUID REFERENCES organization.chair (id)                              NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT unique_event_participation_for_employee UNIQUE (profile_id, event_id)
);

CREATE TABLE organization.visitor_participation
(
    id                       UUID PRIMARY KEY,
    profile_id               UUID REFERENCES organization.profile (id) ON DELETE CASCADE                NOT NULL,
    confirmed                BOOLEAN,
    invitor_participation_id UUID REFERENCES organization.employee_participation (id) ON DELETE CASCADE NULL,
    event_id                 UUID REFERENCES organization.event (id) ON DELETE CASCADE                  NOT NULL,
    access_link              VARCHAR(255)                                                               NOT NULL,
    chair_id                 UUID REFERENCES organization.chair (id)                                    NULL,
    created_at               TIMESTAMP,
    updated_at               TIMESTAMP,
    CONSTRAINT unique_event_participation_for_visitor UNIQUE (profile_id, event_id),
    CONSTRAINT unique_visitor_access_link UNIQUE (access_link)
);


CREATE TABLE organization.files
(
    file_id      UUID PRIMARY KEY,
    event_id UUID references organization.event (id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    content_type VARCHAR(255) NULL,
    content      BYTEA        NOT NULL,
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP
);

CREATE TABLE organization.schematics
(
    id         UUID PRIMARY KEY,
    event_id UUID REFERENCES organization.event (id) ON DELETE CASCADE,
    file_id    UUID REFERENCES organization.files (file_id),
    state      TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT unique_schematic_per_event UNIQUE (event_id)
);

GRANT USAGE, SELECT ON SEQUENCE organization.audit_log_id_seq TO organization_user;



