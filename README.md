# 🏋️ Fitness Tracking App — Microservices

## ✅ Prerequisites

- [Java 21](https://adoptium.net/)
- [Maven 3.9+](https://maven.apache.org/)
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/)

---

## 🚀 Setup & Run

### Step 1 — Start Infrastructure with Docker

#### MongoDB
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest
```

#### PostgreSQL
```bash
docker run -d \
  --name postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=fitness \
  -e POSTGRES_PASSWORD=fitness \
  -e POSTGRES_DB=fitnessdb \
  postgres:latest
```

#### RabbitMQ
```bash
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=guest \
  -e RABBITMQ_DEFAULT_PASS=guest \
  rabbitmq:3-management
```

#### Keycloak
```bash
docker run -d \
  --name keycloak \
  -p 8181:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:24.0.0 start-dev
```

---

### Step 2 — Configure Keycloak

1. Open [http://localhost:8181](http://localhost:8181) and log in with `admin` / `admin`.
2. Create a new **Realm** named: `fitness-oauth2`
3. Inside the realm, create a new **Client**:
   - Client ID: `oauth2-pkce-client`
   - Client authentication: **OFF** (public client)
   - Standard flow: **ON**
   - Valid redirect URIs: `http://localhost:5173/*`
   - Valid post logout redirect URIs: `http://localhost:5173/*`
   - Web origins: `http://localhost:5173`
4. Make sure the `admin-cli` client in the `master` realm has **Service Accounts Enabled** turned on.

---

### Step 3 — Set Up Google Gemini API Key

The AI Service uses Google Gemini to generate fitness recommendations. You need to get an API key and set it in the `ai-service` property file.

**Get your API key:**
1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API key** and copy it.

**Set it in your `ai-service.yml` property file:**
```yaml
gemini:
  api:
    url: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=
    key: YOUR_GEMINI_API_KEY   # ← paste your key here
```

> The URL and key are concatenated directly in code (`geminiApiUrl + geminiApiKey`), so the URL must end with `?key=` and the key value should be just the key string with no extra characters.

---

### Step 4 — Start Backend Services (in order)


```bash
cd eureka && ./mvnw spring-boot:run          # Service registry — start this first
cd configserver && ./mvnw spring-boot:run    # Config server — start before all other services
cd gateway && ./mvnw spring-boot:run
cd userservice && ./mvnw spring-boot:run
cd activityservice && ./mvnw spring-boot:run
cd aiservice && ./mvnw spring-boot:run
```

---

### Step 5 — Start the Frontend

```bash
cd fitness-app-frontend
npm install
npm run dev
```

To override the backend URL, create a `.env.local` file in the frontend root:
```
VITE_API_BASE_URL=http://localhost:8080
```
