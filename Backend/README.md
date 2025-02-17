# Volunteer Platform Backend

A Spring Boot application that powers the volunteer management platform.

## Features

- User Authentication & Authorization
- Organization Management
- Volunteer Profile Management
- Event Management
- Event Attendance & Feedback
- Waitlist System
- Statistics & Analytics

## Prerequisites

- Java 17
- Maven
- MongoDB
- Docker (optional)

## Setup & Installation

### Local Development

1. Clone the repository
```bash
git clone <repository-url>
cd Backend
```

2. Configure environment variables
- Copy `application-dev.yml.example` to `application-dev.yml`
- Update the configuration values

3. Build the application
```bash
mvn clean install
```

4. Run the application
```bash
mvn spring-boot:run -Dspring.profiles.active=dev
```

### Docker Deployment

1. Build and run using Docker Compose
```bash
docker-compose -f docker/docker-compose.yml up --build
```

## API Documentation

### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/refresh-token` - Refresh JWT token

### Organizations

- POST `/api/organizations` - Create organization
- PUT `/api/organizations/{id}` - Update organization
- GET `/api/organizations/{id}` - Get organization details
- GET `/api/organizations/search` - Search organizations
- POST `/api/organizations/{id}/verify` - Verify organization

### Volunteers

- POST `/api/volunteer-profiles/{id}` - Create volunteer profile
- PUT `/api/volunteer-profiles/{id}` - Update volunteer profile
- GET `/api/volunteer-profiles/{id}` - Get volunteer profile
- GET `/api/volunteer-profiles/search` - Search volunteers

### Events

- POST `/api/events` - Create event
- PUT `/api/events/{id}` - Update event
- GET `/api/events/{id}` - Get event details
- GET `/api/events/search` - Search events
- POST `/api/events/{id}/register` - Register for event

## Security

- JWT based authentication
- Role-based access control
- Input validation
- Rate limiting
- Two-factor authentication

## Configuration

The application uses different configuration profiles:

- `application-dev.yml` - Development environment
- `application-prod.yml` - Production environment

## Monitoring

- Health check endpoint: `/actuator/health`
- Metrics endpoint: `/actuator/metrics`
- Prometheus endpoint: `/actuator/prometheus`

## Testing

Run tests using:
```bash
mvn test
```

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

[License details here]
