# Academic Service - Documentación Detallada

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Nombre** | Academic Service (Servicio Académico) |
| **Puerto** | 3003 |
| **Estado** | ✅ FUNCIONAL |
| **Base de Datos** | PostgreSQL |
| **Framework** | NestJS 11.1.24 |
| **Versión Node** | 18+ |

---

## 🎯 Propósito

Academic Service es el **servicio de gestión académica** de MentoraPredict. Centraliza toda la información y operaciones relacionadas con la vida académica del estudiante.

### Responsabilidades Principales

1. **Gestión de Asignaturas**
   - Crear y mantener catálogo de asignaturas
   - Asignar créditos y cargas académicas
   - Activar/desactivar asignaturas

2. **Matriculación de Estudiantes**
   - Matricular estudiantes en asignaturas
   - Controlar duplicados
   - Seguimiento de estado de matrícula

3. **Evaluaciones y Rúbricas**
   - Crear evaluaciones (parciales, finales, trabajos)
   - Definir pesos y puntuaciones
   - Validar que pesos no superen 100%

4. **Calificaciones**
   - Registrar calificaciones de estudiantes
   - Validar rangos válidos (0-10)
   - Evitar duplicados
   - Calcular promedios

5. **Historial Académico**
   - Mantener registro completo de desempeño
   - Información para analytics y prediction

---

## 🏗️ Estructura del Proyecto

```
academic-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── academic.entity.ts       # Entidad principal de académico
│   │   │   ├── subject.entity.ts        # Asignatura
│   │   │   ├── enrollment.entity.ts     # Matriculación
│   │   │   ├── evaluation.entity.ts     # Evaluación
│   │   │   ├── grade.entity.ts          # Calificación
│   │   │   ├── career.entity.ts         # Carrera
│   │   │   ├── faculty.entity.ts        # Facultad
│   │   │   └── academic-period.entity.ts # Período académico
│   │   │
│   │   ├── value-objects/
│   │   │   └── (Vacío - Validación en DTOs)
│   │   │
│   │   └── services/
│   │       └── (Vacío - Lógica en use-cases)
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── enroll-student.use-case.ts         # Matricular estudiante
│   │   │   ├── record-grade.use-case.ts           # Registrar calificación
│   │   │   ├── create-evaluation.use-case.ts      # Crear evaluación
│   │   │   ├── assign-teacher.use-case.ts         # Asignar docente
│   │   │   ├── ingest-academic-data.use-case.ts   # Ingerir datos masivos
│   │   │   └── register-grade.use-case.ts         # Registrar grupo de calif.
│   │   │
│   │   ├── dtos/
│   │   │   ├── enroll-student.dto.ts
│   │   │   ├── record-grade.dto.ts
│   │   │   └── create-evaluation.dto.ts
│   │   │
│   │   ├── ports/
│   │   │   ├── input/
│   │   │   │   └── (Usecases como puertos de entrada)
│   │   │   └── output/
│   │   │       ├── i-subject.repository.ts
│   │   │       ├── i-enrollment.repository.ts
│   │   │       ├── i-evaluation.repository.ts
│   │   │       └── i-grade.repository.ts
│   │   │
│   │   └── mappers/
│   │       └── academic.mapper.ts
│   │
│   ├── infrastructure/
│   │   ├── controllers/
│   │   │   ├── academic.controller.ts   # Endpoints HTTP
│   │   │   └── health.controller.ts     # Health check
│   │   │
│   │   ├── persistence/
│   │   │   ├── subject.orm-entity.ts
│   │   │   ├── subject.repository.ts
│   │   │   ├── enrollment.orm-entity.ts
│   │   │   ├── enrollment.repository.ts
│   │   │   ├── evaluation.orm-entity.ts
│   │   │   ├── evaluation.repository.ts
│   │   │   ├── grade.orm-entity.ts
│   │   │   ├── grade.repository.ts
│   │   │   ├── academic.repository.ts   # Métodos comunes
│   │   │   └── migrations/              # Migraciones BD
│   │   │
│   │   ├── config/
│   │   │   └── (Configuración general)
│   │   │
│   │   └── external/
│   │       └── (Integraciones externas)
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── dist/
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env
└── README.md
```

---

## 🔄 Flujos Principales

### 1. Matriculación de Estudiante

```
POST /api/v1/academic/enrollments
{
  "studentId": "550e8400-...",
  "subjectId": "660e8400-..."
}

┌─────────────────────────────────────────┐
│ AcademicController.enroll(dto)          │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ ValidationPipe (class-validator)        │
│ ✓ Validar @IsUUID studentId            │
│ ✓ Validar @IsUUID subjectId            │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ EnrollStudentUseCase.execute(dto)       │
│                                         │
│ 1. subjectRepo.findById(subjectId)      │
│    └─ Si no existe → NotFoundException  │
│    └─ Si no está activa → Error        │
│                                         │
│ 2. enrollRepo.findByStudentAndSubject() │
│    └─ Verificar no duplicado            │
│    └─ Si existe activa → ConflictEx.    │
│                                         │
│ 3. Crear EnrollmentEntity               │
│    ├─ id: UUID nuevo                   │
│    ├─ studentId                         │
│    ├─ subjectId                         │
│    ├─ status: "ACTIVE"                 │
│    └─ timestamps                        │
│                                         │
│ 4. enrollRepo.save(entity)              │
│    └─ INSERT en PostgreSQL              │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Retornar EnrollmentDTO                  │
│ {                                       │
│   "id": "550e8400-...",                │
│   "studentId": "550e8400-...",         │
│   "subjectId": "660e8400-...",         │
│   "status": "ACTIVE",                  │
│   "enrolledAt": "2026-06-07T..."       │
│ }                                       │
└─────────────────────────────────────────┘
```

### 2. Crear Evaluación

```
POST /api/v1/academic/evaluations
{
  "subjectId": "660e8400-...",
  "name": "Parcial 1",
  "weight": 30,
  "maxScore": 10
}

┌─────────────────────────────────────────┐
│ CreateEvaluationUseCase.execute(dto)    │
│                                         │
│ 1. subjectRepo.findById(subjectId)      │
│    └─ Si no existe → NotFoundException  │
│                                         │
│ 2. Validar peso total <= 100%           │
│    └─ Buscar evaluaciones existentes    │
│    └─ weight_total + 30 <= 100          │
│    └─ Si excede → BadRequestException   │
│                                         │
│ 3. Crear EvaluationEntity               │
│    ├─ id: UUID                         │
│    ├─ subjectId                        │
│    ├─ name                             │
│    ├─ weight (30%)                     │
│    ├─ maxScore (10)                    │
│    └─ timestamps                       │
│                                         │
│ 4. evalRepo.save(entity)                │
│    └─ INSERT en PostgreSQL              │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Retornar EvaluationDTO                  │
│ {                                       │
│   "id": "770e8400-...",                │
│   "subjectId": "660e8400-...",         │
│   "name": "Parcial 1",                 │
│   "weight": 30,                        │
│   "maxScore": 10                       │
│ }                                       │
└─────────────────────────────────────────┘
```

### 3. Registrar Calificación

```
POST /api/v1/academic/grades
{
  "studentId": "550e8400-...",
  "evaluationId": "770e8400-...",
  "value": 8.5
}

┌─────────────────────────────────────────┐
│ RecordGradeUseCase.execute(dto)         │
│                                         │
│ 1. evalRepo.findById(evaluationId)      │
│    └─ Si no existe → NotFoundException  │
│    └─ Obtener subject del evaluation    │
│                                         │
│ 2. enrollRepo.findByStudentAndSubject() │
│    └─ Verificar matriculación activa    │
│    └─ Si no activa → BadRequestException
│                                         │
│ 3. gradeRepo.findByStudentAndEval()     │
│    └─ Evitar duplicados                │
│    └─ Si existe → ConflictException    │
│                                         │
│ 4. Validar rango (0-10)                │
│    └─ Si value < 0 o > 10 → Error     │
│                                         │
│ 5. Crear GradeEntity                    │
│    ├─ id: UUID                         │
│    ├─ studentId                        │
│    ├─ evaluationId                     │
│    ├─ value: 8.5                       │
│    ├─ recordedBy: teacherId            │
│    └─ timestamps                       │
│                                         │
│ 6. gradeRepo.save(entity)               │
│    └─ INSERT en PostgreSQL              │
│                                         │
│ 7. (Futuro) Emitir evento               │
│    eventBus.emit('grade.recorded', {})  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Retornar GradeDTO                       │
│ {                                       │
│   "id": "880e8400-...",                │
│   "studentId": "550e8400-...",         │
│   "evaluationId": "770e8400-...",      │
│   "value": 8.5,                        │
│   "recordedBy": "990e8400-...",        │
│   "createdAt": "2026-06-07T..."        │
│ }                                       │
└─────────────────────────────────────────┘
```

---

## 📊 Entidades y Tablas

### Subject (Asignatura)

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,      -- e.g. "PROG-101"
  name VARCHAR(255) NOT NULL,            -- e.g. "Programación I"
  credits INT DEFAULT 3,
  faculty_id UUID,                       -- FK
  career_id UUID,                        -- FK
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Enrollment (Matriculación)

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',   -- ACTIVE, DROPPED, COMPLETED
  enrolled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);
```

### Evaluation (Evaluación)

```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY,
  subject_id UUID NOT NULL,
  name VARCHAR(255),                     -- e.g. "Parcial 1"
  weight INT NOT NULL,                   -- 0-100%
  max_score DECIMAL(5,2) DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Grade (Calificación)

```sql
CREATE TABLE grades (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  evaluation_id UUID NOT NULL,
  value DECIMAL(5,2) NOT NULL,          -- 0-10
  recorded_by UUID,                     -- Teacher ID
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, evaluation_id)
);
```

---

## 📦 DTOs

### EnrollStudentDto

```typescript
{
  studentId: string;       // @IsUUID()
  subjectId: string;       // @IsUUID()
}
```

### CreateEvaluationDto

```typescript
{
  subjectId: string;       // @IsUUID()
  name: string;            // @IsString()
  weight: number;          // @IsNumber() @Min(0) @Max(100)
  maxScore: number;        // @IsNumber()
}
```

### RecordGradeDto

```typescript
{
  studentId: string;       // @IsUUID()
  evaluationId: string;    // @IsUUID()
  value: number;           // @IsNumber() @Min(0) @Max(10)
}
```

---

## 🚀 Instalación y Ejecución

### Requisitos

```bash
# Node.js 18+
# PostgreSQL 16
```

### Instalación

```bash
cd services/academic-service
npm install
```

### Configuración (.env)

```bash
NODE_ENV=development
APP_PORT=3003

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=mp_user
POSTGRES_PASSWORD=mp_pass
POSTGRES_DB=mentorapredict

CORS_ORIGINS=http://localhost:3000
```

### Ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

---

## 📊 Health Check

```bash
GET /health

Respuesta:
{
  "status": "UP",
  "services": {
    "database": "UP"
  }
}
```

---

## 🔗 Integración con Auth Service

Academic Service **NO** está protegido por JWT en esta versión (Sprint 1). En Sprint 2 se agregará:

```typescript
// Futuro: Proteger endpoints
@UseGuards(JwtAuthGuard)
@Post('enrollments')
async enroll(@Body() dto: EnrollStudentDto) {
  return this.enrollStudentUC.execute(dto);
}
```

---

## 🧪 Testing

```bash
npm test
npm run test:cov
```

---

## 📞 Soporte

Consultar [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

---

**Última actualización:** 2026-06-07
**Versión:** 1.0.0
**Estado:** ✅ Producción Ready
