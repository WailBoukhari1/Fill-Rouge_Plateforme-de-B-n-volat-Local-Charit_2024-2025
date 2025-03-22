#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== DevOps Environment Setup =====${NC}"
echo "This script will check your system and set up the DevOps environment"
echo ""

# Check Docker
echo -e "${YELLOW}Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker is installed: ${DOCKER_VERSION}${NC}"
else
    echo -e "${RED}✗ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check Docker Compose
echo -e "${YELLOW}Checking Docker Compose installation...${NC}"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}✓ Docker Compose is installed: ${COMPOSE_VERSION}${NC}"
else
    echo -e "${RED}✗ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check system resources
echo -e "${YELLOW}Checking system resources...${NC}"
TOTAL_MEM=$(grep MemTotal /proc/meminfo | awk '{print $2}')
TOTAL_MEM_GB=$(echo "scale=2; $TOTAL_MEM/1024/1024" | bc)

if (( $(echo "$TOTAL_MEM_GB >= 4" | bc -l) )); then
    echo -e "${GREEN}✓ System has sufficient memory: ${TOTAL_MEM_GB}GB${NC}"
else
    echo -e "${YELLOW}⚠ System has less than 4GB of RAM (${TOTAL_MEM_GB}GB). This might not be enough.${NC}"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check disk space
echo -e "${YELLOW}Checking disk space...${NC}"
FREE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo -e "${GREEN}✓ Available disk space: ${FREE_SPACE}${NC}"

# Check if the services are already running
echo -e "${YELLOW}Checking if services are already running...${NC}"
if docker ps | grep -q "jenkins\|sonarqube\|mongodb\|frontend\|backend"; then
    echo -e "${YELLOW}⚠ Some services are already running. Stopping them...${NC}"
    docker-compose down
fi

# Check Docker socket permissions
echo -e "${YELLOW}Checking Docker socket permissions...${NC}"
if [ -e /var/run/docker.sock ]; then
    DOCKER_SOCKET_PERMS=$(stat -c "%a" /var/run/docker.sock)
    if [ "$DOCKER_SOCKET_PERMS" -lt "660" ]; then
        echo -e "${YELLOW}⚠ Docker socket permissions might be too restrictive.${NC}"
        echo "Current permissions: $DOCKER_SOCKET_PERMS"
        echo "This might cause issues with Jenkins accessing Docker."
        echo "Consider running: sudo chmod 666 /var/run/docker.sock"
    else
        echo -e "${GREEN}✓ Docker socket permissions look good.${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Cannot find Docker socket at /var/run/docker.sock${NC}"
fi

# Set up VM max map count for SonarQube
echo -e "${YELLOW}Setting up VM max map count for SonarQube...${NC}"
CURRENT_MAP_COUNT=$(cat /proc/sys/vm/max_map_count)
if [ "$CURRENT_MAP_COUNT" -lt "262144" ]; then
    echo "Current vm.max_map_count: $CURRENT_MAP_COUNT"
    echo "SonarQube requires at least 262144"
    echo "Please run this command to increase it:"
    echo -e "${GREEN}sudo sysctl -w vm.max_map_count=262144${NC}"
    echo "To make it permanent, add the following line to /etc/sysctl.conf:"
    echo -e "${GREEN}vm.max_map_count=262144${NC}"
else
    echo -e "${GREEN}✓ VM max map count is sufficient: $CURRENT_MAP_COUNT${NC}"
fi

# Offer to start services
echo ""
echo -e "${YELLOW}System check completed.${NC}"
read -p "Do you want to start the DevOps services now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Starting services...${NC}"
    docker-compose up -d
    
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    echo "This might take a few minutes on first run."
    
    # Wait for services to be healthy
    COUNT=0
    MAX_WAIT=30
    echo -n "Waiting for services to become healthy"
    while [ $COUNT -lt $MAX_WAIT ]; do
        HEALTHY_COUNT=$(docker-compose ps | grep -c "(healthy)")
        TOTAL_SERVICES=$(docker-compose ps | grep -c service)
        
        if [ $HEALTHY_COUNT -eq $TOTAL_SERVICES ]; then
            echo -e "\n${GREEN}✓ All services are healthy!${NC}"
            break
        fi
        
        echo -n "."
        sleep 10
        COUNT=$((COUNT+1))
    done
    
    if [ $COUNT -eq $MAX_WAIT ]; then
        echo -e "\n${YELLOW}⚠ Not all services reported healthy within timeout period.${NC}"
        echo "Please check the logs with: docker-compose logs"
    fi
    
    echo ""
    echo -e "${GREEN}===== DevOps Services Setup Complete =====${NC}"
    echo "Access your services at:"
    echo " - Frontend Application: http://localhost"
    echo " - Backend API: http://localhost:8081"
    echo " - Jenkins: http://localhost:8080"
    echo " - SonarQube: http://localhost:9000"
    echo " - Portainer: https://localhost:9443"
    echo ""
    echo "For more information, refer to the devops-services-guide.md"
else
    echo "You can start the services later with: docker-compose up -d"
fi 