# MentoraPredict - Arquitectura y Entregable Phase 0

> Task: Definir el siguiente paso del backend en el monorepo Turborepo.
> Alcance: documentacion, contratos, diseno y configuracion minima.
> No incluye: logica de negocio, implementaciones de servicios o integraciones finales.

---

## 1) Contratos API (OpenAPI / Swagger)

### 1.1 Estructura global
- Base path: `/api/v1`
- API Gateway enruta:
  - `/api/v1/auth` -> `auth-service`
  - `/api/v1/users` -> `user-service`
  - `/api/v1/academic` -> `academic-service`
  - `/api/v1/metrics` -> `metrics-service`
  - `/api/v1/prediction` -> `prediction-service`
  - `/api/v1/recommendation` -> `recommendation-service`
  - `/api/v1/analytics` -> `analytics-service`

### 1.2 Seguridad y headers requeridos
- Autenticacion: `Authorization: Bearer <jwt>` con JWT RS256.
- Headers internos obligatorios:
  - `Authorization`
  - `x-correlation-id`
  - `x-request-id`
  - `x-service-origin` (opcional para trazabilidad interna)
- Versionado de API: todas las rutas usan `/api/v1`.

### 1.3 Roles y RBAC
- Roles: `STUDENT`, `TEACHER`, `ADMIN`.
- Las rutas protegidas deben validar JWT y roles.
- Ejemplo: `GET /api/v1/users/me` accesible para `STUDENT`, `TEACHER`, `ADMIN`.

### 1.4 Contratos por microservicio

#### 1.4.1 auth-service
**Endpoints minimos**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

**RBAC**
- `login` y `refresh`: publico.
- `me` y `logout`: `STUDENT/TEACHER/ADMIN`.

**DTOs**
```json
LoginRequest:
{
  "email": "user@mentorapredict.edu",
  "password": "string"
}

AuthResponse:
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 3600,
  "roles": ["TEACHER"]
}
```

#### 1.4.2 user-service
**Endpoints minimos**
- `POST /api/v1/users`
- `GET /api/v1/users`
- `GET /api/v1/users/{userId}`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/{userId}`
- `GET /api/v1/users/{userId}/roles`

**RBAC**
- `ADMIN`: crear, editar, listar.
- `TEACHER`: leer estudiantes y docentes.
- `STUDENT`: solo su propio perfil.

**DTOs**
```json
UserCreateDto:
{
  "email": "student@mentorapredict.edu",
  "name": "Ana Perez",
  "roleIds": [2]
}

UserDto:
{
  "id": "uuid",
  "email": "student@mentorapredict.edu",
  "name": "Ana Perez",
  "roles": ["STUDENT"],
  "status": "ACTIVE"
}
```

#### 1.4.3 academic-service
**Endpoints minimos**
- `GET /api/v1/academic/faculties`
- `GET /api/v1/academic/careers`
- `GET /api/v1/academic/subjects`
- `GET /api/v1/academic/academic-periods`
- `POST /api/v1/academic/enrollments`
- `GET /api/v1/academic/enrollments`
- `POST /api/v1/academic/evaluations`
- `GET /api/v1/academic/evaluations`

**RBAC**
- `ADMIN`: gestiona datos academicos.
- `TEACHER`: crea evaluaciones y consulta matriculas.
- `STUDENT`: consulta su propia matricula y calificaciones.

**DTOs**
```json
SubjectDto:
{
  "id": "uuid",
  "code": "MAT101",
  "name": "Calculo I",
  "careerId": "uuid"
}

EnrollmentRequest:
{
  "studentId": "uuid",
  "subjectId": "uuid",
  "periodId": "uuid"
}

EvaluationDto:
{
  "id": "uuid",
  "subjectId": "uuid",
  "teacherId": "uuid",
  "periodId": "uuid",
  "title": "Parcial 1",
  "weight": 0.25
}
```

#### 1.4.4 metrics-service
**Endpoints minimos**
- `GET /api/v1/metrics/overview`
- `GET /api/v1/metrics/users/{userId}`
- `GET /api/v1/metrics/subjects/{subjectId}`

**RBAC**
- `ADMIN/TEACHER`: dashboards generales.
- `STUDENT`: su propio resumen.

**DTOs**
```json
MetricsOverviewDto:
{
  "activeStudents": 324,
  "averageGrade": 8.7,
  "atRiskCount": 12
}

MetricPointDto:
{
  "period": "2026-01",
  "value": 85
}
```

#### 1.4.5 prediction-service
**Endpoints minimos**
- `POST /api/v1/prediction/predict`
- `GET /api/v1/prediction/models`
- `POST /api/v1/prediction/feedback`

**RBAC**
- `TEACHER/ADMIN`: prediccion y feedback.
- `STUDENT`: puede leer sus propias predicciones si se expone.

**DTOs**
```json
PredictionRequest:
{
  "studentId": "uuid",
  "subjectId": "uuid",
  "context": {
    "attendance": 0.92,
    "homeworkCompletion": 0.88
  }
}

PredictionResponse:
{
  "studentId": "uuid",
  "subjectId": "uuid",
  "probabilityPass": 0.78,
  "predictedGrade": 8.3,
  "modelVersion": "v1.0.0"
}
```

#### 1.4.6 recommendation-service
**Endpoints minimos**
- `GET /api/v1/recommendation/student/{studentId}`
- `GET /api/v1/recommendation/subjects`
- `POST /api/v1/recommendation/refresh`

**RBAC**
- `STUDENT`: sus propias recomendaciones.
- `TEACHER/ADMIN`: recomendaciones de grupos/carreras.

**DTOs**
```json
RecommendationDto:
{
  "studentId": "uuid",
  "recommendations": [
    {
      "type": "COURSE",
      "title": "Refuerzo de Algebra",
      "reason": "Bajo rendimiento en pre-requisito"
    }
  ]
}
```

#### 1.4.7 analytics-service
**Endpoints minimos**
- `GET /api/v1/analytics/activity`
- `GET /api/v1/analytics/alerts`
- `POST /api/v1/analytics/events`

**RBAC**
- `ADMIN/TEACHER`: dashboards de actividad.
- `STUDENT`: su propia actividad si se expone.

**DTOs**
```json
AnalyticsEventDto:
{
  "eventType": "STUDENT_LOGIN",
  "occurredAt": "2026-05-31T10:45:00Z",
  "metadata": {
    "studentId": "uuid",
    "ip": "192.168.1.10"
  }
}

AlertDto:
{
  "id": "uuid",
  "studentId": "uuid",
  "level": "WARNING",
  "message": "Riesgo de desaprobar Matematicas",
  "createdAt": "2026-05-31T11:00:00Z"
}
```

---

## 2) DER / Modelo de datos (PostgreSQL)

### 2.1 Ownership por microservicio
- `user-service`: `users`, `roles`, `user_roles`
- `academic-service`: `faculties`, `careers`, `academic_periods`, `subjects`, `enrollments`, `evaluations`, `grades`, `observations`
- `recommendation-service`: `recommendations`
- `analytics-service`: `alerts`
- `prediction-service`: utiliza MongoDB para IA, sin tablas relacionales minimas en esta fase.

### 2.2 Tablas esenciales y relaciones

#### users
- `id` UUID PK
- `email` VARCHAR UNIQUE
- `name` VARCHAR
- `password_hash` VARCHAR
- `status` VARCHAR
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

#### roles
- `id` SMALLINT PK
- `name` VARCHAR UNIQUE
- `description` VARCHAR

#### user_roles
- `id` UUID PK
- `user_id` UUID FK -> `users.id`
- `role_id` SMALLINT FK -> `roles.id`

#### faculties
- `id` UUID PK
- `code` VARCHAR UNIQUE
- `name` VARCHAR
- `created_at` TIMESTAMP

#### careers
- `id` UUID PK
- `faculty_id` UUID FK -> `faculties.id`
- `code` VARCHAR UNIQUE
- `name` VARCHAR
- `level` VARCHAR

#### academic_periods
- `id` UUID PK
- `name` VARCHAR
- `start_date` DATE
- `end_date` DATE
- `status` VARCHAR

#### subjects
- `id` UUID PK
- `career_id` UUID FK -> `careers.id`
- `code` VARCHAR UNIQUE
- `name` VARCHAR
- `credits` INT
- `semester` INT

#### enrollments
- `id` UUID PK
- `student_id` UUID FK -> `users.id`
- `subject_id` UUID FK -> `subjects.id`
- `period_id` UUID FK -> `academic_periods.id`
- `status` VARCHAR
- `enrolled_at` TIMESTAMP

#### evaluations
- `id` UUID PK
- `subject_id` UUID FK -> `subjects.id`
- `teacher_id` UUID FK -> `users.id`
- `period_id` UUID FK -> `academic_periods.id`
- `title` VARCHAR
- `weight` NUMERIC(5,4)
- `date` DATE

#### grades
- `id` UUID PK
- `evaluation_id` UUID FK -> `evaluations.id`
- `student_id` UUID FK -> `users.id`
- `score` NUMERIC(5,2)
- `created_at` TIMESTAMP

#### observations
- `id` UUID PK
- `student_id` UUID FK -> `users.id`
- `teacher_id` UUID FK -> `users.id`
- `subject_id` UUID FK -> `subjects.id`
- `comment` TEXT
- `type` VARCHAR
- `created_at` TIMESTAMP

#### alerts
- `id` UUID PK
- `student_id` UUID FK -> `users.id`
- `level` VARCHAR
- `source` VARCHAR
- `message` TEXT
- `created_at` TIMESTAMP
- `resolved_at` TIMESTAMP NULLABLE

#### recommendations
- `id` UUID PK
- `student_id` UUID FK -> `users.id`
- `type` VARCHAR
- `payload` JSONB
- `reason` TEXT
- `created_at` TIMESTAMP
- `expires_at` TIMESTAMP NULLABLE

### 2.3 Relaciones clave
- `users` 1:N `user_roles`
- `faculties` 1:N `careers`
- `careers` 1:N `subjects`
- `academic_periods` 1:N `enrollments`
- `subjects` 1:N `enrollments`
- `subjects` 1:N `evaluations`
- `evaluations` 1:N `grades`
- `users` 1:N `grades`
- `users` 1:N `observations`
- `users` 1:N `alerts`
- `users` 1:N `recommendations`

---

## 3) Modelo NoSQL (MongoDB)

### 3.1 Colecciones minimas

#### student_profiles
- Registra datos enriquecidos por IA para cada alumno.

**Ejemplo**
```json
{
  "_id": "student-uuid",
  "studentId": "uuid",
  "academicHistory": {
    "averageGrade": 8.4,
    "failedSubjects": ["MAT101", "FIS102"]
  },
  "behavioralSignals": {
    "lateSubmissions": 3,
    "attendanceRate": 0.91
  },
  "riskScore": 0.72,
  "updatedAt": "2026-05-31T10:00:00Z"
}
```

#### prediction_requests
- Guarda entradas y resultados de prediccion.

**Ejemplo**
```json
{
  "_id": "prediction-uuid",
  "studentId": "uuid",
  "subjectId": "uuid",
  "modelVersion": "v1.0.0",
  "inputFeatures": {
    "attendance": 0.92,
    "homeworkCompletion": 0.84,
    "previousGrade": 7.9
  },
  "output": {
    "probabilityPass": 0.78,
    "predictedGrade": 8.1
  },
  "requestedAt": "2026-05-31T10:05:00Z"
}
```

#### recommendation_logs
- Almacena recomendaciones generadas con justificacion y confianza.

**Ejemplo**
```json
{
  "_id": "recommendation-uuid",
  "studentId": "uuid",
  "generatedAt": "2026-05-31T10:10:00Z",
  "recommendations": [
    {
      "itemId": "MAT201",
      "type": "COURSE",
      "confidence": 0.81,
      "reason": "Mejora el rendimiento en algebra"
    }
  ],
  "source": "prediction-service"
}
```

#### analytics_events
- Eventos de uso y comportamiento para analisis.

**Ejemplo**
```json
{
  "_id": "event-uuid",
  "eventType": "COURSE_ACCESS",
  "studentId": "uuid",
  "subjectId": "uuid",
  "timestamp": "2026-05-31T10:15:00Z",
  "properties": {
    "durationSec": 420,
    "page": "/subjects/MAT101"
  }
}
```

---

## 4) Redis (Diseno de cache)

### 4.1 Que se cachea
- Dashboards de metricas frecuentes (`metrics-service`, `analytics-service`).
- Listados academicos de acceso repetido (`academic-service`).
- Sesiones y refresh tokens (`auth-service`).
- Perfiles temporales para IA (`prediction-service`, `recommendation-service`).

### 4.2 Claves sugeridas
- `cache:dashboard:overview:{periodId}`
- `cache:student:profile:{studentId}`
- `cache:academic:subjects:{careerId}`
- `cache:metrics:user:{userId}`
- `cache:recommendation:student:{studentId}`
- `session:refresh:{refreshTokenId}`
- `trace:correlation:{requestId}`

### 4.3 TTL recomendado
- Dashboards/ metricas: `60s-120s`
- Listados academicos: `300s`
- Perfil de usuario: `120s`
- Sesiones/refresh tokens: `600s-1800s`
- Tracing: `30s`

---

## 5) Paquetes compartidos en `/packages`

### 5.1 shared-types
**Debe incluir**
- Enumeraciones de roles: `Role.STUDENT`, `Role.TEACHER`, `Role.ADMIN`.
- Tipos DTO comunes: `UserDto`, `SubjectDto`, `PredictionResponse`.
- Interfaces de headers y contratos de comunicacion interna.
- Tipos de dominio generales: `UserId`, `SubjectId`, `AcademicPeriodStatus`.

**No debe incluir**
- logica de negocio.
- validaciones de caso de uso.
- adaptadores de infraestructura.

### 5.2 shared-config
**Debe incluir**
- Variables de entorno compartidas.
- Constantes globales: `API_VERSION`, `JWT_ISSUER`, `JWT_AUDIENCE`.
- Helpers de carga de configuracion.
- Configuraciones comunes de logger.

**No debe incluir**
- acceso a bases de datos.
- adaptadores especificos de servicio.
- reglas de negocio.

### 5.3 shared-utils
**Debe incluir**
- Utilitarios genericos: `logger`, `correlationId`, `requestId`.
- Helpers HTTP y de headers.
- Transformaciones de strings y fechas.
- Serializacion y deserializacion simples.

**No debe incluir**
- repositorios.
- persistencia.
- logica de dominio.

---

## 6) Infraestructura local minima

### 6.1 docker-compose.yml
- Levanta PostgreSQL, MongoDB y Redis.
- No conecta servicios reales todavia.
- Permite validar la infraestructura local.

### 6.2 Variables de entorno sugeridas (.env.example)
```env
# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=mentorapredict
POSTGRES_PASSWORD=mentorapredict
POSTGRES_DB=mentorapredict

# MongoDB
MONGO_HOST=mongo
MONGO_PORT=27017
MONGO_USER=mentor
MONGO_PASSWORD=mentor
MONGO_DB=mentorapredict

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT RS256
JWT_ISSUER=https://auth.mentorapredict.local
JWT_AUDIENCE=mentorapredict
JWT_PUBLIC_KEY_PATH=/secrets/jwt_public.pem
JWT_PRIVATE_KEY_PATH=/secrets/jwt_private.pem

# General
API_VERSION=v1
CORRELATION_HEADER=x-correlation-id
REQUEST_HEADER=x-request-id
```

---

## 7) Plan de implementacion por sprints (MVP)

### Sprint 1 - Auth + User + Shared
**Entregable minimo**
- auth-service skeleton con contratos OpenAPI.
- user-service skeleton con contratos OpenAPI.
- Paquetes shared-types, shared-config, shared-utils scaffold.
- Infra local docker-compose.yml funcionando.

### Sprint 2 - Academic
**Entregable minimo**
- academic-service skeleton con rutas basicas.
- DER inicial: faculties, careers, subjects, academic_periods, enrollments.
- Documentacion de ownership.

### Sprint 3 - Evaluations + Grades
**Entregable minimo**
- Extension de academic-service con evaluations, grades, observations.
- Contratos de calificaciones.
- DER actualizado.

### Sprint 4 - Metrics / Analytics
**Entregable minimo**
- metrics-service skeleton con endpoints.
- analytics-service skeleton con eventos y alertas.
- Diseno de cache Redis.

### Sprint 5 - Prediction / Recommendation
**Entregable minimo**
- prediction-service skeleton con contratos de IA.
- recommendation-service skeleton con rutas de recomendaciones.
- Modelo NoSQL MongoDB documentado.

---

## 8) Checklist de validacion
- [ ] Contratos API definidos por microservicio.
- [ ] RBAC y headers internos documentados.
- [ ] DER relacional con ownership por dominio.
- [ ] Modelo NoSQL MongoDB con ejemplos JSON.
- [ ] Diseno de cache Redis con claves y TTL.
- [ ] Paquetes /packages/shared-* definidos como skeletons.
- [ ] docker-compose.yml levanta PostgreSQL, MongoDB y Redis.
- [ ] .env.example creada con variables minimas.
- [ ] Documentacion y plan de sprints listos.

---

## Resumen
Este documento es el entregable de diseno de la fase inicial. Deja el monorepo listo para arrancar la implementacion del backend siguiendo Turborepo, microservicios, arquitectura hexagonal y separacion de dominios. No contiene logica de negocio ni implementaciones concretas.
