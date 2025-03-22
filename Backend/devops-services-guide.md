# DevOps Services Guide

This guide explains how to run Jenkins, SonarQube, MongoDB, and your Frontend and Backend applications using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your system
- At least 4GB of RAM available for these services
- Git installed for version control

## Quick Start

1. Navigate to the Backend directory:
   ```
   cd Backend
   ```

2. Start all services:
   ```
   docker-compose up -d
   ```

3. To check the status of your containers:
   ```
   docker-compose ps
   ```

## Services Overview

- **Frontend Application**: Your Angular application running on port 80
- **Backend Application**: Your Spring Boot application running on port 8081
- **Jenkins**: CI/CD tool running on port 8080
- **SonarQube**: Code quality analysis tool running on port 9000
- **MongoDB**: NoSQL database running on port 27017
- **Portainer**: Container management UI running on port 9443 (https)

## Detailed Setup Instructions

### Initial Setup

1. Clone your repository (if not already done):
   ```
   git clone <your-repo-url>
   cd your-project-directory
   ```

2. Verify Docker installation:
   ```
   docker --version
   docker-compose --version
   ```

3. Start all services:
   ```
   docker-compose up -d
   ```

4. Wait for all services to initialize (this may take a few minutes on first run):
   ```
   docker-compose logs -f
   ```

### Accessing the Services

#### Frontend Application
- URL: http://localhost
- This provides the user interface for your charity application

#### Backend Application
- URL: http://localhost:8081
- API Documentation: http://localhost:8081/swagger-ui.html

#### Jenkins
- URL: http://localhost:8080
- Initial setup is bypassed with environment variables
- Default admin user will be created automatically
- Username: admin
- Password: admin

#### SonarQube
- URL: http://localhost:9000
- Default credentials:
  - Username: admin
  - Password: admin
- You'll be prompted to change the password on first login

#### MongoDB
- Connection string: `mongodb://appuser:apppassword@localhost:27017/application`
- Connect using MongoDB Compass or the Mongo shell:
  ```
  docker exec -it mongodb mongosh -u appuser -p apppassword application
  ```

#### Portainer
- URL: https://localhost:9443
- On first login, you'll create an admin user

## CI/CD Pipeline Configuration

### Setting Up the Jenkins Pipeline for Backend

1. Login to Jenkins at http://localhost:8080

2. Install required plugins (if not already installed):
   - Go to "Manage Jenkins" > "Manage Plugins" > "Available"
   - Search and install: 
     - Docker Pipeline
     - SonarQube Scanner
     - Pipeline
     - Git Integration
     - NodeJS Plugin

3. Configure SonarQube in Jenkins:
   - Go to "Manage Jenkins" > "Configure System"
   - Find "SonarQube servers" section
   - Click "Add SonarQube"
   - Name: SonarQube
   - Server URL: http://sonarqube:9000
   - Server authentication token: (Create this in SonarQube under User > My Account > Security > Generate Token)

4. Configure NodeJS installation (for Frontend builds):
   - Go to "Manage Jenkins" > "Global Tool Configuration"
   - Find "NodeJS" section
   - Click "Add NodeJS"
   - Name: NodeJS
   - Install automatically: Yes
   - Version: Select latest LTS version

5. Create a new Pipeline job for Backend:
   - Click "New Item"
   - Enter a name (e.g., "charity-backend")
   - Select "Pipeline" and click "OK"
   - In the configuration:
     - Select "Pipeline script from SCM"
     - Choose Git as SCM
     - Enter your repository URL
     - Specify the branch (e.g., "main" or "master")
     - Script Path: "Backend/Jenkinsfile"
   - Save the configuration

6. Create a new Pipeline job for Frontend:
   - Click "New Item"
   - Enter a name (e.g., "charity-frontend")
   - Select "Pipeline" and click "OK"
   - In the configuration:
     - Select "Pipeline script from SCM"
     - Choose Git as SCM
     - Enter your repository URL
     - Specify the branch (e.g., "main" or "master")
     - Script Path: "Frontend/Jenkinsfile"
   - Save the configuration

7. Run the pipelines:
   - Click "Build Now" to start the pipelines manually
   - For automatic builds, set up webhooks in your Git repository

### SonarQube Configuration

1. Login to SonarQube at http://localhost:9000

2. Create a new project for Backend:
   - Go to "Projects" > "Create new project"
   - Project key: charity-backend
   - Display name: Charity Backend
   - Set up for local analysis

3. Create a new project for Frontend:
   - Go to "Projects" > "Create new project"
   - Project key: charity-frontend
   - Display name: Charity Frontend
   - Set up for local analysis

4. Generate an authentication token:
   - Go to your profile (top right) > "My Account" > "Security"
   - Generate a new token and copy it for use in Jenkins

## Managing Your Applications

### Application Deployment

When Jenkins successfully completes the pipelines, your applications will be:
1. Built and tested
2. Analyzed for code quality with SonarQube
3. Packaged into Docker images
4. Deployed to your environment

### Checking Application Status

```
docker-compose ps
```

### Viewing Application Logs

```
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Manually Deploying Updates

If you need to manually deploy an update:

For the backend:
```
docker-compose build backend
docker-compose up -d backend
```

For the frontend:
```
docker-compose build frontend
docker-compose up -d frontend
```

### Backing Up Data

To back up MongoDB data:

```
docker exec -it mongodb mongodump --username appuser --password apppassword --db application --out /data/db/backup
docker cp mongodb:/data/db/backup ./mongodb-backup
```

## Troubleshooting

### General Troubleshooting Steps

1. Check container status:
   ```
   docker-compose ps
   ```

2. View logs for a specific service:
   ```
   docker-compose logs -f [service-name]
   ```

3. Restart a service:
   ```
   docker-compose restart [service-name]
   ```

### Common Issues

#### Frontend Not Loading

If the frontend application isn't loading:
```
docker-compose logs frontend
```
Check for CORS issues or API connectivity problems.

#### Jenkins Cannot Connect to Docker

If Jenkins cannot use Docker commands:
```
docker exec -it jenkins bash
ls -la /var/run/docker.sock
chmod 666 /var/run/docker.sock
```

#### SonarQube Fails to Start

SonarQube may fail due to Elasticsearch requirements:
```
sudo sysctl -w vm.max_map_count=262144
```

#### MongoDB Connection Issues

If your application cannot connect to MongoDB:
```
docker exec -it mongodb mongosh -u root -p password
use application
db.auth('appuser', 'apppassword')
```

## Stopping the Services

To stop all services:
```
docker-compose down
```

To remove all data volumes as well:
```
docker-compose down -v
```

## Security Notes

The setup provided uses default credentials for demonstration purposes. In a production environment:

1. Change all default passwords
2. Use environment variables or Docker secrets for sensitive data
3. Consider implementing SSL for all services
4. Restrict access to the services using a reverse proxy or firewall 