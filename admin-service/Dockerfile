FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY target/admin-service.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
