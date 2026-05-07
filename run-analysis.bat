@echo off
set services=admin-service api-gateway auth-service claims-service config-server policy-service payment-service
set SONAR_TOKEN=sqa_0c42db2a70d8829d0cac67820c4b1e16d3b3b170
set SONAR_HOST=http://localhost:9000

for %%s in (%services%) do (
    echo.
    echo ========================================
    echo  Analyzing %%s
    echo ========================================
    pushd %%s
    call mvn clean verify sonar:sonar -Dsonar.login=%SONAR_TOKEN% -Dsonar.host.url=%SONAR_HOST%
    popd
)

echo.
echo ========================================
echo  All services analyzed successfully!
echo ========================================
pause
