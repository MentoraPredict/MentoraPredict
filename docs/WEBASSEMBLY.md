# WebAssembly en MentoraPredict

## Descripción general

MentoraPredict utiliza WebAssembly (WASM) en `analytics-service` para ejecutar la
regresión lineal empleada en el cálculo de tendencias académicas.

Esta implementación se ejecuta en el backend, dentro de Node.js. No se ejecuta
en el navegador ni forma parte directamente de la aplicación React.

## ¿Para qué sirve?

La regresión lineal permite determinar cómo cambia el promedio académico de un
estudiante a través de varios periodos. A partir de los promedios históricos se
calculan dos valores:

- `slope`: pendiente de la tendencia.
- `intercept`: punto de intersección de la recta calculada.

La pendiente se utiliza para clasificar el rendimiento:

| Condición | Clasificación |
| --- | --- |
| `slope > 0.5` | `ASCENDING` |
| `slope < -0.5` | `DESCENDING` |
| Cualquier otro valor | `STABLE` |

Por ejemplo, este resultado indica que el rendimiento está mejorando:

```json
{
  "slope": 6.32,
  "intercept": -8.427,
  "classification": "ASCENDING",
  "periodsAnalyzed": 3
}
```

## Ubicación de la implementación

El adaptador de WebAssembly se encuentra en:

```text
services/analytics-service/src/infrastructure/wasm/
├── linear-regression.wasm.ts
└── linear-regression.wasm.spec.ts
```

El caso de uso que consume el adaptador está en:

```text
services/analytics-service/src/application/use-cases/
└── calculate-trend.use-case.ts
```

### `linear-regression.wasm.ts`

Este archivo contiene:

- El módulo WebAssembly precompilado como un arreglo de bytes.
- El código WAT equivalente como documentación legible.
- La creación de `WebAssembly.Module` y `WebAssembly.Instance`.
- La función pública `linearRegression()`.
- Una implementación TypeScript de respaldo.

El módulo está embebido para evitar incorporar Rust, `wasm-pack`, AssemblyScript
o dependencias adicionales al proyecto por una sola operación matemática.

### `calculate-trend.use-case.ts`

Este caso de uso recupera el promedio del estudiante para cada periodo y envía
los valores al adaptador:

```ts
const { slope, intercept } = linearRegression(averages);
```

Después redondea los resultados, clasifica la tendencia y registra el cálculo
en el repositorio de versiones del conjunto de datos.

### `linear-regression.wasm.spec.ts`

Contiene pruebas para comprobar que el adaptador devuelve correctamente la
pendiente y el intercepto de una serie ascendente y de una serie constante.

## Flujo de ejecución

Cuando se solicita una tendencia mediante la API, el flujo es:

```text
Cliente o Swagger
  → Kong
  → AnalyticsController
  → CalculateTrendUseCase
  → linearRegression()
  → WebAssembly
  → clasificación de la tendencia
  → respuesta HTTP
```

El endpoint que inicia este flujo es:

```http
POST /api/v1/analytics/trend/:studentId?periodIds=id1,id2,id3
```

Se requieren al menos tres IDs de periodos.

## Funcionamiento interno

La función TypeScript recorre los promedios y prepara los acumulados requeridos
por la regresión:

- Cantidad de valores (`n`).
- Suma de posiciones (`sumX`).
- Suma de promedios (`sumY`).
- Suma de productos (`sumXY`).
- Suma de posiciones al cuadrado (`sumXX`).

Estos valores se envían a la función exportada por WebAssembly:

```ts
const [slope, intercept] = wasm(n, sumX, sumY, sumXY, sumXX);
```

WASM ejecuta las fórmulas finales de la pendiente y el intercepto y devuelve
ambos valores a Node.js.

El módulo se instancia una sola vez. Las llamadas posteriores reutilizan la
función ya cargada mediante la variable `wasmRegression`.

## Mecanismo de respaldo

La disponibilidad del servicio no depende completamente de WebAssembly. Si el
entorno no permite crear el módulo o la instancia, el error es capturado y se
utiliza la misma fórmula implementada en TypeScript.

```text
WebAssembly disponible
  → ejecutar el módulo WASM

WebAssembly no disponible
  → ejecutar el fallback TypeScript
```

Ambas rutas producen la misma estructura de respuesta. El fallback evita que
una restricción del runtime interrumpa el endpoint de tendencias.

## Cómo verificar la implementación

### Prueba automatizada del adaptador

Desde la raíz del proyecto:

```powershell
pnpm.cmd --filter @mentorapredict/analytics-service test -- --runInBand src/infrastructure/wasm/linear-regression.wasm.spec.ts
```

### Prueba de integración con el caso de uso

```powershell
pnpm.cmd --filter @mentorapredict/analytics-service test -- --runInBand src/infrastructure/wasm/linear-regression.wasm.spec.ts src/application/use-cases/__tests__/calculate-trend.use-case.spec.ts
```

### Compilación del servicio

```powershell
pnpm.cmd --filter @mentorapredict/analytics-service build
```

### Prueba desde Swagger

Con el entorno local levantado, Swagger está disponible en:

```text
http://localhost:3004/api/v1/analytics/docs
```

Después de autorizarse con un JWT, se puede ejecutar:

```http
POST /api/v1/analytics/trend/{studentId}
```

El parámetro `periodIds` debe contener al menos tres IDs reales separados por
comas.

## Alcance actual

WebAssembly se usa únicamente para la regresión lineal del cálculo de tendencias
por periodo. Actualmente no interviene en:

- Autenticación o autorización.
- Acceso a PostgreSQL, MongoDB o Redis.
- Cálculo de promedios ponderados.
- Cálculo del índice de cumplimiento.
- Clasificación del nivel de riesgo.
- Generación de recomendaciones.
- Interfaz web o aplicación de escritorio.

Este alcance reducido mantiene la integración aislada y evita modificar los
contratos, controladores o respuestas existentes.
