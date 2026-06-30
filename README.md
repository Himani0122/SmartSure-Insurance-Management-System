# 🛡️ SmartSure — Enterprise Insurance Management System

SmartSure is a state-of-the-art, enterprise-grade Insurance Management System built on a **reactive microservices architecture**. Designed with Spring Boot backends, an interactive React frontend, and robust middleware integrations, SmartSure provides seamless user registration, multi-category policy acquisition with integrated payments, automated claims processing, real-time tracking, and deep system observability.

---

## 🌟 Key Features

*   **🔒 Secure Identity & Access Management (IAM):** Dual-step registration featuring email verification (OTP via SMTP & Redis caching) and JWT-based authentication with role-based routing (Admin vs. User).
*   **💳 Automated Payments:** End-to-end integration with Razorpay Checkout for direct policy premium transactions.
*   **📋 Policy Lifecycle Orchestration:** Create, query, and purchase policies managed via saga orchestration to maintain transactional integrity.
*   **📁 Advanced Claim Intake:** Interactive document upload system with real-time coverage validation preventing invalid claim submissions.
*   **📊 Interactive Analytics Dashboard:** Beautiful charts showing claim approval rates, policy distributions, and financial metrics powered by Recharts.
*   **⚙️ centralized Configuration:** Real-time property management via Spring Cloud Config server.
*   **📈 Observability Suite:** Prometheus for metrics, Grafana for dashboard visualizations, Zipkin for distributed tracing, and SonarQube for automated code analysis.

---

## 🏗️ Architecture & Component Overview

SmartSure operates on a decoupled microservices design:

```
                  ┌───────────────────────┐
                  │   React Frontend (UI) │
                  └───────────┬───────────┘
                              │ Port 80 / 5173
                              ▼
                  ┌───────────────────────┐
                  │    Spring API Gateway │ (Port 8090)
                  └───────────┬───────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Auth Service   │  │ Policy Service  │  │ Claims Service  │
│   (Port 8083)   │  │   (Port 8084)   │  │   (Port 8089)   │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   [Postgres DB]         [Redis Cache]       [RabbitMQ Queue]
```

### Core Services

1.  **`service-registry`** *(Eureka Server)*: Registry where all microservices are registered, enabling dynamic service discovery. (Port `8761`)
2.  **`config-server`** *(Spring Cloud Config)*: Reads configurations from `config-repo` and distributes them dynamically. (Port `8888`)
3.  **`api-gateway`** *(Spring Cloud Gateway)*: Single entry point handling security filters and routing to backend services. (Port `8090`)
4.  **`auth-service`**: Handles authentication, user profiles, credentials verification, and OTP generation/validation. (Port `8083`)
5.  **`policy-service`**: Oversees policy listings, user-purchased policies, and handles purchase execution. (Port `8084`)
6.  **`claims-service`**: Manages insurance claims processing, Outbox pattern updates, and stores uploaded documentation. (Port `8089`)
7.  **`payment-service`**: Interfaces with Razorpay API, tracks transactions, and triggers policy acquisition. (Port `8088`)
8.  **`admin-service`**: Aggregates metrics and gives administrative access to claims approval, system logs, and users. (Port `8087`)
9.  **`user-management-ui`** *(React + Vite)*: Client portal with dark/light themes, sleek glassmorphic UI elements, and Recharts. (Port `80` inside Docker)

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Axios, Context API (Auth & Theme), Lucide Icons, Recharts, Razorpay Checkout |
| **Backend** | Java 17, Spring Boot, Spring Cloud (Gateway, Config Server, Eureka), Spring Security |
| **Database & Cache** | PostgreSQL 15, Redis 7 (OTP & Session caching) |
| **Messaging** | RabbitMQ (Asynchronous communications & Saga orchestration) |
| **Observability** | OpenZipkin, Prometheus, Grafana, SonarQube |
| **Containerization** | Docker, Docker Compose |

---

## 📂 Project Directory Structure

```
SmartSure-Insurance-Management-System/
├── admin-service/            # Admin operations & analytics backend
├── api-gateway/              # Spring Cloud Gateway routing & filter manager
├── auth-service/             # IAM, registration, login, profile operations
├── claims-service/           # Insurance claims & file storage microservice
├── config-server/            # Spring Cloud Config server
├── config-repo/              # YAML properties config storage for backend services
├── payment-service/          # Razorpay payment processor backend
├── policy-service/           # Policy management & Saga database orchestrator
├── service-registry/         # Eureka Service Registry Discovery server
├── user-management-ui/       # React SPA frontend portal
├── postgres/                 # DB schemas and initial database configurations
├── prometheus/               # Metrics collection configuration
├── grafana/                  # Preconfigured monitoring dashboards
├── docker-compose.yml        # Multi-container orchestration config
├── build-all.bat             # Automates builds for all Java services
└── run-analysis.bat          # Script to run SonarQube scans
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Before running the application, make sure you have:
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
*   [Java 17 JDK](https://www.oracle.com/java/technologies/downloads/) and [Maven 3.8+](https://maven.apache.org/) (if building locally outside Docker).
*   [Node.js](https://nodejs.org/) (for local UI customization outside Docker).

### 🔧 Configuration (`.env`)

Create a `.env` file at the root level (or modify the existing one) to customize your parameters:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=smartcourier

KAFKA_BROKER=kafka:29092
SONAR_TOKEN=sqa_your_sonar_token

GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=admin

RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret
```

### ⚡ Build and Launch via Docker Compose

1.  **Build all Java Service Artifacts:**
    Run the provided build batch file to clean and package all microservices into runnable `.jar` packages:
    ```bash
    .\build-all.bat
    ```

2.  **Launch the Services Ecosystem:**
    Start all components (Postgres, Redis, RabbitMQ, Gateway, Registry, UI, and Backend Services) using Docker Compose:
    ```bash
    docker-compose up -d
    ```

3.  **Monitor Startups:**
    You can check the health status of the services using:
    ```bash
    docker-compose ps
    ```
    Once healthy, you can access the frontend dashboard at [http://localhost](http://localhost).

---

## 📈 Monitoring & Observability

SmartSure is equipped with advanced telemetry and code-quality auditing tools out of the box:

*   **Eureka Discovery Dashboard:** Check registered microservices status at [http://localhost:8761](http://localhost:8761)
*   **Grafana Dashboards:** View custom graphs and metrics at [http://localhost:3000](http://localhost:3000) (Default user/pass: `admin`/`admin`)
*   **Prometheus Metric Scraper:** View collected system metrics at [http://localhost:9090](http://localhost:9090)
*   **Zipkin Tracing Panel:** Trace HTTP calls and message hops through the system at [http://localhost:9411](http://localhost:9411)
*   **SonarQube Code Analysis:** Check code coverage and smells at [http://localhost:9000](http://localhost:9000) (Run analysis using `.\run-analysis.bat`)

---

## 🤝 Contributing

Contributions are welcome! If you would like to help improve SmartSure:
1. Fork the Repository.
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
