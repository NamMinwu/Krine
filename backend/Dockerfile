# Build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN ./gradlew --version
COPY src ./src
RUN ./gradlew bootJar --no-daemon

# Run
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
# H2 file DB 경로 (Railway 볼륨을 /app/data에 마운트하면 재배포 후에도 유지)
ENV SPRING_DATASOURCE_URL=jdbc:h2:file:/app/data/krine
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
