@echo off
setlocal

:: ========================================================
::  SMARTSURE - Docker Rebuild + Tag + Push Script
::  Usage: docker-push.bat <your-dockerhub-username>
::  Example: docker-push.bat himani0122
:: ========================================================

set DOCKERHUB_USER=%1

if "%DOCKERHUB_USER%"=="" (
    echo.
    echo [ERROR] Please provide your Docker Hub username.
    echo Usage: docker-push.bat ^<dockerhub-username^>
    echo Example: docker-push.bat himani0122
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================================
echo  SMARTSURE - Docker Build, Tag and Push
echo  Docker Hub User: %DOCKERHUB_USER%
echo ==========================================================

:: Step 1 - Login check
echo.
echo [STEP 1] Logging in to Docker Hub...
docker login
if errorlevel 1 (
    echo [ERROR] Docker login failed. Aborting.
    pause
    exit /b 1
)

:: Step 2 - Build all Maven services first
echo.
echo [STEP 2] Building all Maven services (skipping tests)...
for %%s in (admin-service api-gateway auth-service claims-service config-server policy-service service-registry payment-service) do (
    echo.
    echo   [MAVEN BUILD] %%s...
    pushd %%s
    call mvn clean package -DskipTests -q
    if errorlevel 1 (
        echo   [ERROR] Maven build failed for %%s!
        popd
        pause
        exit /b 1
    )
    popd
)
echo.
echo   [OK] All Maven builds done.

:: Step 3 - Docker Compose build (builds all images including frontend)
echo.
echo [STEP 3] Building Docker images via docker-compose...
docker-compose build --no-cache
if errorlevel 1 (
    echo [ERROR] docker-compose build failed!
    pause
    exit /b 1
)
echo   [OK] Docker images built.

:: Step 4 - Tag and push each service image
echo.
echo [STEP 4] Tagging and pushing images to Docker Hub...

set services=admin-service api-gateway auth-service claims-service config-server payment-service policy-service service-registry
set frontend=frontend

for %%s in (%services%) do (
    echo.
    echo   [TAGGING]  sprint_project-%%s:latest  -->  %DOCKERHUB_USER%/%%s:latest
    docker tag sprint_project-%%s:latest %DOCKERHUB_USER%/%%s:latest
    if errorlevel 1 (
        echo   [ERROR] Tagging failed for %%s
        pause
        exit /b 1
    )

    echo   [PUSHING]  %DOCKERHUB_USER%/%%s:latest...
    docker push %DOCKERHUB_USER%/%%s:latest
    if errorlevel 1 (
        echo   [ERROR] Push failed for %%s
        pause
        exit /b 1
    )
    echo   [OK] %%s pushed successfully!
)

:: Push frontend separately (named differently in compose)
echo.
echo   [TAGGING]  sprint_project-frontend:latest  -->  %DOCKERHUB_USER%/smartsure-frontend:latest
docker tag sprint_project-frontend:latest %DOCKERHUB_USER%/smartsure-frontend:latest
echo   [PUSHING]  %DOCKERHUB_USER%/smartsure-frontend:latest...
docker push %DOCKERHUB_USER%/smartsure-frontend:latest
if errorlevel 1 (
    echo   [ERROR] Push failed for frontend
    pause
    exit /b 1
)
echo   [OK] frontend pushed successfully!

echo.
echo ==========================================================
echo  SUCCESS! All images pushed to Docker Hub!
echo.
echo  Images available at:
for %%s in (%services%) do (
    echo    https://hub.docker.com/r/%DOCKERHUB_USER%/%%s
)
echo    https://hub.docker.com/r/%DOCKERHUB_USER%/smartsure-frontend
echo ==========================================================
echo.
pause
