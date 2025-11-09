plugins {
    java
    id("org.springframework.boot") version "3.4.1"
    id("io.spring.dependency-management") version "1.1.6"
    id("com.github.node-gradle.node") version "7.0.2"
}

group = "com.globalcarelink"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot Starters
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-cache")
    
    // WebClient for reactive HTTP client
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    
    // Spring Retry
    implementation("org.springframework.retry:spring-retry")
    implementation("org.springframework:spring-aspects")
    
    // OpenAPI/Swagger
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0")
    
    // Database
    runtimeOnly("com.h2database:h2")
    // SQLite for logging and statistics
    runtimeOnly("org.xerial:sqlite-jdbc:3.51.0.0")
    
    // JWT (Legacy - for migration safety)
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")
    
    // Clerk JWT Verification (commented out - not needed for new frontend)
    // implementation("com.clerk:clerk-sdk-java:4.3.0")
    
    // Caffeine Cache
    implementation("com.github.ben-manes.caffeine:caffeine")
    
    // Redis for JWT blacklist and caching
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    
    // JSON Logging
    implementation("net.logstash.logback:logstash-logback-encoder:8.0")
    
    // Lombok
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    
    // Testing - 테스트 디렉토리 제거로 인해 주석 처리 (2025-07-29)
    // testImplementation("org.springframework.boot:spring-boot-starter-test")
    // testImplementation("org.springframework.security:spring-security-test")
    // testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

// 테스트 태스크 비활성화 - 테스트 디렉토리가 제거됨
// tasks.withType<Test> {
//     useJUnitPlatform()
// }

// ==========================================
// 프론트엔드-백엔드 통합 빌드 설정
// ==========================================

node {
    version.set("22.13.1")
    npmVersion.set("10.9.3")
    download.set(true)
    workDir.set(file("${project.projectDir}/.gradle/nodejs"))
    npmWorkDir.set(file("${project.projectDir}/.gradle/npm"))
}

// 프론트엔드 디렉토리 설정
val frontendDir = "${project.projectDir}/frontend"
val staticDir = "${project.projectDir}/src/main/resources/static"

// npm install 태스크 (node-gradle 플러그인이 자동 생성)
// npmInstall 태스크는 플러그인에서 자동으로 생성됨

// 프론트엔드 빌드 태스크
tasks.register<com.github.gradle.node.npm.task.NpmTask>("buildFrontend") {
    description = "프론트엔드 빌드 (정적 파일 생성)"
    dependsOn("npmInstall")
    workingDir.set(file(frontendDir))
    args.set(listOf("run", "build"))
    inputs.dir("$frontendDir/src")
    inputs.file("$frontendDir/vite.config.ts")
    inputs.file("$frontendDir/package.json")
    outputs.dir(staticDir)
    
    doFirst {
        println("🏗️  프론트엔드 빌드 시작...")
        println("   소스: $frontendDir/src")
        println("   출력: $staticDir")
    }
    
    doLast {
        println("✅ 프론트엔드 빌드 완료")
    }
}

// 프론트엔드 개발 서버 태스크
tasks.register<com.github.gradle.node.npm.task.NpmTask>("devFrontend") {
    description = "프론트엔드 개발 서버 실행 (포트 5173)"
    dependsOn("npmInstall")
    workingDir.set(file(frontendDir))
    args.set(listOf("run", "dev"))
    
    doFirst {
        println("🚀 프론트엔드 개발 서버 시작 중...")
        println("   URL: http://localhost:5173")
        println("   API Proxy: http://localhost:8080/api")
    }
}

// 정적 파일 정리 태스크
tasks.register<Delete>("cleanStatic") {
    description = "정적 파일 디렉토리 정리"
    delete(staticDir)
}

// 프론트엔드 빌드 파일 복사 태스크
tasks.register<Copy>("copyFrontendAssets") {
    description = "프론트엔드 빌드 파일을 Spring Boot static 디렉토리로 복사"
    dependsOn("buildFrontend")
    from("$frontendDir/dist")
    into(staticDir)
    
    doFirst {
        println("📁 정적 파일 복사 중...")
        println("   소스: $frontendDir/dist")
        println("   대상: $staticDir")
    }
    
    doLast {
        println("✅ 정적 파일 복사 완료")
    }
}

// Spring Boot JAR 빌드시 프론트엔드도 함께 빌드
tasks.named("processResources") {
    dependsOn("copyFrontendAssets")
}

// clean 시 정적 파일도 정리
tasks.named("clean") {
    dependsOn("cleanStatic")
}

// 개발용 태스크 그룹 생성
tasks.register("dev") {
    description = "개발 환경 시작 (백엔드 + 프론트엔드)"
    group = "development"
    
    doLast {
        println("""
        🎯 개발 환경 가이드:
        
        1. 백엔드 API 서버 실행:
           ./gradlew bootRun
           
        2. 프론트엔드 개발 서버 실행 (별도 터미널):
           ./gradlew devFrontend
           
        3. 또는 PowerShell 스크립트 사용:
           .\start-dev.ps1
           
        🌐 접속 URL:
        - 프론트엔드: http://localhost:5173
        - 백엔드 API: http://localhost:8080/api
        - Swagger UI: http://localhost:8080/swagger-ui.html
        """.trimIndent())
    }
}

// 통합 배포 빌드 태스크
tasks.register("buildForDeploy") {
    description = "배포용 통합 빌드 (프론트엔드 + 백엔드)"
    group = "build"
    dependsOn("clean", "buildFrontend", "bootJar")
    
    doLast {
        println("""
        ✅ 배포용 빌드 완료!
        
        📦 생성된 파일:
        - JAR: build/libs/${project.name}-${project.version}.jar
        - 정적 파일: src/main/resources/static/
        
        🚀 실행 방법:
        java -jar build/libs/${project.name}-${project.version}.jar
        
        🌐 접속 URL:
        - 통합 서비스: http://localhost:8080
        """.trimIndent())
    }
}