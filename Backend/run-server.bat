@echo off
call kill-port.bat
echo Starting Spring Boot application...
call mvnw spring-boot:run 