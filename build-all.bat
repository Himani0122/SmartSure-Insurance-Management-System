@echo off
set services=admin-service api-gateway auth-service claims-service config-server policy-service service-registry payment-service

echo ===========================================
echo  SMARTSURE - FULL MICROSERVICES BUILD
echo ===========================================

for %%s in (%services%) do (
    echo.
    echo [BUILDING] %%s...
    pushd %%s
    call mvn clean package -DskipTests
    if errorlevel 1 (
        echo.
        echo [ERROR] Build failed for %%s!
        popd
        echo.
        pause
        exit /b 1
    )
    popd
)

echo.
echo ===========================================
echo  SUCCESS: ALL SERVICES BUILT!
echo ===========================================
echo You can now run: docker-compose up --build -d
echo.
pause
