# Developer Manual

Download the backend repository.

There should be a `docker-compose.yaml` file in the project's root directory.

Run `docker compose up`.

This will create a `postgres` container with the necessary credentials and also set up the required tables.

## Accessing the endpoints:

1. You need to be authenticated via GitLab.
    - Go to the following link in your browser: `http://localhost:8000/oauth2/authorization/gitlab`
    - Use your own GitLab credentials or log in via `Gmail` with the following test email:
      ```
      Email: itestra.tum.hr@gmail.com
      Password: itestratumhr1.
      ```
2. After a successful login, you will receive a JWT token. You can find the Authentication JWT token as a cookie. Refer
   to the attached screenshot for guidance.
3. Add the authentication token as a header to trigger backend endpoints:
   ```
   Authorization: eyJhbGciOiJIUzI1.............
   ```

Alternatively, you can run the backend with the "local" profile:

- Uncomment the following line in `application.properties`:
  ```
  # spring.profiles.active=local
  ```
- This will enable the backend to authenticate endpoints using a mock user.

## Swagger:

You can explore the APIs and their requirements at:

```
http://localhost:8000/swagger-ui/index.html
```