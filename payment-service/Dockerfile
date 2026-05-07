FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/payment-service.jar app.jar
EXPOSE 8088
ENTRYPOINT ["java", "-jar", "app.jar"]
