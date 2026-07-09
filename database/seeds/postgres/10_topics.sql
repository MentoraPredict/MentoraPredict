-- =====================================================
-- TOPICS (syllabus) - deterministic and idempotent
--
-- Real, subject-specific unit titles (keyed by subject code) instead of
-- generic "Unidad N" placeholders. The AI recommendation prompt
-- (prediction-service) is instructed to cite a syllabus topic by name when
-- one is available, so a generic placeholder ("Unidad 2: Conceptos clave")
-- gave the model nothing concrete to reference — real unit names let it
-- actually point a student at something specific to review.
--
-- Subjects not covered by topic_catalog below (e.g. ad-hoc courses created
-- manually through the app, not part of the seeded curriculum) are left
-- untouched.
-- =====================================================

WITH topic_catalog (subject_code, rn, title, description) AS (
  VALUES
    -- Introducción a la Programación (FP101)
    ('FP101', 1, 'Variables, tipos de datos y operadores', 'Declaracion de variables, tipos primitivos y operadores aritmeticos, relacionales y logicos.'),
    ('FP101', 2, 'Estructuras de control', 'Condicionales (if/else, switch) y bucles (for, while, do-while) para controlar el flujo del programa.'),
    ('FP101', 3, 'Funciones y modularidad', 'Definicion de funciones, parametros, valores de retorno y descomposicion de problemas en subrutinas.'),
    ('FP101', 4, 'Arreglos y cadenas de texto', 'Declaracion y manipulacion de arreglos unidimensionales y cadenas de caracteres.'),
    ('FP101', 5, 'Depuracion y manejo basico de errores', 'Tecnicas de depuracion, lectura de mensajes de error y validacion de entradas.'),

    -- Matemática Básica (MAT101)
    ('MAT101', 1, 'Conjuntos numericos y operaciones', 'Numeros reales, propiedades algebraicas y orden de operaciones.'),
    ('MAT101', 2, 'Ecuaciones y sistemas de ecuaciones', 'Resolucion de ecuaciones lineales y sistemas de dos o mas variables.'),
    ('MAT101', 3, 'Funciones y sus graficas', 'Concepto de funcion, dominio, rango y representacion grafica de funciones basicas.'),
    ('MAT101', 4, 'Trigonometria basica', 'Razones trigonometricas, identidades fundamentales y resolucion de triangulos.'),
    ('MAT101', 5, 'Introduccion a la geometria analitica', 'Ecuacion de la recta, distancia entre puntos y conicas basicas.'),

    -- Lógica Computacional (LOG101)
    ('LOG101', 1, 'Logica proposicional', 'Proposiciones, conectores logicos y construccion de tablas de verdad.'),
    ('LOG101', 2, 'Equivalencias e inferencia logica', 'Leyes de equivalencia logica y reglas de inferencia para validar argumentos.'),
    ('LOG101', 3, 'Logica de predicados', 'Cuantificadores universales y existenciales aplicados a predicados.'),
    ('LOG101', 4, 'Metodos de demostracion', 'Demostracion directa, por contradiccion y por induccion matematica.'),
    ('LOG101', 5, 'Logica aplicada a circuitos digitales', 'Traduccion de expresiones logicas a compuertas y simplificacion con mapas de Karnaugh.'),

    -- Programación I (FP201)
    ('FP201', 1, 'Clases y objetos', 'Definicion de clases, atributos, metodos e instanciacion de objetos.'),
    ('FP201', 2, 'Herencia y polimorfismo', 'Reutilizacion de codigo mediante herencia y comportamiento polimorfico de metodos.'),
    ('FP201', 3, 'Manejo de excepciones', 'Bloques try/catch/finally y creacion de excepciones personalizadas.'),
    ('FP201', 4, 'Colecciones y estructuras basicas', 'Listas, pilas y colas provistas por el lenguaje para organizar datos.'),
    ('FP201', 5, 'Entrada/salida de archivos', 'Lectura y escritura de archivos de texto y manejo de flujos (streams).'),

    -- Cálculo Diferencial (CAL201)
    ('CAL201', 1, 'Limites y continuidad', 'Concepto de limite, calculo de limites y condiciones de continuidad de una funcion.'),
    ('CAL201', 2, 'Definicion de derivada', 'La derivada como razon de cambio y su interpretacion geometrica.'),
    ('CAL201', 3, 'Reglas de derivacion', 'Reglas de la suma, producto, cociente y regla de la cadena.'),
    ('CAL201', 4, 'Aplicaciones de la derivada', 'Maximos, minimos y problemas de optimizacion.'),
    ('CAL201', 5, 'Derivadas de funciones trascendentes', 'Derivacion de funciones trigonometricas, exponenciales y logaritmicas.'),

    -- Base de Datos I (BD301)
    ('BD301', 1, 'Modelo entidad-relacion', 'Diseño conceptual de bases de datos: entidades, atributos y relaciones.'),
    ('BD301', 2, 'Modelo relacional y algebra relacional', 'Traduccion del modelo entidad-relacion a tablas y operaciones del algebra relacional.'),
    ('BD301', 3, 'SQL: consultas y subconsultas', 'Sentencias SELECT, joins, agrupaciones y subconsultas.'),
    ('BD301', 4, 'Normalizacion de bases de datos', 'Formas normales (1FN, 2FN, 3FN) para eliminar redundancia.'),
    ('BD301', 5, 'Integridad referencial y transacciones', 'Llaves foraneas, restricciones y propiedades ACID de las transacciones.'),

    -- Arquitectura de Computadores (AC301)
    ('AC301', 1, 'Representacion de datos y aritmetica binaria', 'Sistemas numericos, complemento a dos y aritmetica en punto flotante.'),
    ('AC301', 2, 'Organizacion del procesador', 'Datapath, unidad de control y ciclo de ejecucion de instrucciones.'),
    ('AC301', 3, 'Jerarquia de memoria y cache', 'Niveles de memoria, localidad de referencia y politicas de reemplazo de cache.'),
    ('AC301', 4, 'Segmentacion (pipelining)', 'Ejecucion segmentada de instrucciones y riesgos (hazards) asociados.'),
    ('AC301', 5, 'Entrada/salida y buses', 'Mecanismos de comunicacion entre el procesador y los dispositivos perifericos.'),

    -- Sistemas Operativos (SO301)
    ('SO301', 1, 'Procesos e hilos', 'Ciclo de vida de procesos, hilos y comunicacion entre procesos.'),
    ('SO301', 2, 'Planificacion de CPU', 'Algoritmos de planificacion: FCFS, Round Robin y prioridades.'),
    ('SO301', 3, 'Sincronizacion y exclusion mutua', 'Semaforos, mutex y el problema de la seccion critica.'),
    ('SO301', 4, 'Gestion de memoria', 'Paginacion, segmentacion y memoria virtual.'),
    ('SO301', 5, 'Sistemas de archivos', 'Organizacion de archivos, directorios y metodos de asignacion de espacio.'),
    ('SO301', 6, 'Interbloqueos (deadlocks)', 'Condiciones necesarias para un deadlock y estrategias de prevencion y deteccion.'),

    -- Estructuras de Datos (ED301)
    ('ED301', 1, 'Listas enlazadas, pilas y colas', 'Implementacion y operaciones basicas sobre listas enlazadas, pilas y colas.'),
    ('ED301', 2, 'Arboles binarios y arboles de busqueda', 'Recorridos de arboles y propiedades de los arboles binarios de busqueda.'),
    ('ED301', 3, 'Arboles balanceados', 'Arboles AVL y Rojo-Negro para mantener el balance y garantizar complejidad logaritmica.'),
    ('ED301', 4, 'Tablas hash', 'Funciones de dispersion, manejo de colisiones y complejidad amortizada.'),
    ('ED301', 5, 'Grafos: representacion y recorridos', 'Listas y matrices de adyacencia, y recorridos BFS/DFS.'),
    ('ED301', 6, 'Colas de prioridad y heaps', 'Implementacion de heaps binarios y su uso en colas de prioridad.'),

    -- Redes de Computadores (NET401)
    ('NET401', 1, 'Modelo OSI y TCP/IP', 'Capas de referencia y su correspondencia con los protocolos de Internet.'),
    ('NET401', 2, 'Direccionamiento IP y subredes', 'Calculo de subredes, mascaras y asignacion de direcciones IP.'),
    ('NET401', 3, 'Protocolos de enrutamiento', 'Enrutamiento estatico y dinamico, y protocolos como RIP y OSPF.'),
    ('NET401', 4, 'Capa de transporte: TCP y UDP', 'Diferencias entre transporte confiable (TCP) y no confiable (UDP).'),
    ('NET401', 5, 'Seguridad en redes', 'Firewalls, VPN y mecanismos basicos de proteccion de una red.'),

    -- Base de Datos II (BD401)
    ('BD401', 1, 'Optimizacion de consultas e indices', 'Planes de ejecucion, indices y tecnicas para acelerar consultas.'),
    ('BD401', 2, 'Transacciones y control de concurrencia', 'Aislamiento de transacciones y protocolos de bloqueo.'),
    ('BD401', 3, 'Bases de datos distribuidas', 'Fragmentacion, replicacion y consultas distribuidas.'),
    ('BD401', 4, 'NoSQL: documentos, clave-valor y grafos', 'Modelos NoSQL alternativos al relacional y sus casos de uso.'),
    ('BD401', 5, 'Data warehousing y OLAP', 'Modelado dimensional y procesamiento analitico en linea.'),
    ('BD401', 6, 'Administracion y respaldo de bases de datos', 'Estrategias de backup, recuperacion y mantenimiento.'),

    -- Redes/Otros: Análisis de Algoritmos (AA501)
    ('AA501', 1, 'Notacion asintotica y complejidad', 'Notacion Big O, Omega y Theta para analizar el desempeño de algoritmos.'),
    ('AA501', 2, 'Divide y venceras', 'Diseño de algoritmos recursivos que dividen el problema en subproblemas.'),
    ('AA501', 3, 'Programacion dinamica', 'Resolucion de problemas mediante subestructura optima y memoizacion.'),
    ('AA501', 4, 'Algoritmos voraces (greedy)', 'Estrategias que toman decisiones localmente optimas.'),
    ('AA501', 5, 'Grafos: caminos minimos', 'Algoritmos de Dijkstra y Bellman-Ford para caminos minimos.'),
    ('AA501', 6, 'Problemas NP-completos', 'Introduccion a la teoria de complejidad y problemas intratables.'),

    -- Ingeniería de Software (IS501)
    ('IS501', 1, 'Ciclo de vida y metodologias agiles', 'Modelos de ciclo de vida del software y marcos agiles como Scrum.'),
    ('IS501', 2, 'Ingenieria de requisitos', 'Tecnicas de elicitacion, especificacion y validacion de requisitos.'),
    ('IS501', 3, 'Diseño de software y patrones', 'Principios de diseño y patrones de diseño mas comunes.'),
    ('IS501', 4, 'Pruebas de software', 'Pruebas unitarias, de integracion y estrategias de aseguramiento de calidad.'),
    ('IS501', 5, 'Gestion de proyectos e integracion continua', 'Planificacion de proyectos y practicas de CI/CD.'),

    -- Proyecto Integrador I (PI901)
    ('PI901', 1, 'Definicion del alcance y objetivos', 'Delimitacion del problema a resolver y los objetivos del proyecto.'),
    ('PI901', 2, 'Levantamiento de requisitos con el cliente', 'Tecnicas de entrevista y documentacion de requisitos del cliente.'),
    ('PI901', 3, 'Diseño de la solucion propuesta', 'Arquitectura y diseño tecnico de la solucion a implementar.'),
    ('PI901', 4, 'Desarrollo e implementacion', 'Construccion iterativa de la solucion siguiendo el diseño planteado.'),
    ('PI901', 5, 'Presentacion y evaluacion de resultados', 'Documentacion final y sustentacion de los resultados obtenidos.'),

    -- Redes de Computadores avanzado: Sistemas Distribuidos (SD601)
    ('SD601', 1, 'Modelos de comunicacion y RPC', 'Paso de mensajes y llamadas a procedimientos remotos.'),
    ('SD601', 2, 'Sincronizacion de relojes y coordinacion', 'Algoritmos de sincronizacion de tiempo y exclusion mutua distribuida.'),
    ('SD601', 3, 'Consenso distribuido y tolerancia a fallos', 'Algoritmos de consenso (Paxos/Raft) y manejo de fallos parciales.'),
    ('SD601', 4, 'Consistencia y replicacion de datos', 'Modelos de consistencia y estrategias de replicacion.'),
    ('SD601', 5, 'Balanceo de carga y escalabilidad', 'Tecnicas para distribuir carga entre nodos y escalar horizontalmente.'),

    -- Cloud Computing (CC601)
    ('CC601', 1, 'Modelos de servicio: IaaS, PaaS, SaaS', 'Diferencias entre los modelos de servicio en la nube y casos de uso.'),
    ('CC601', 2, 'Virtualizacion y contenedores', 'Maquinas virtuales frente a contenedores y orquestacion basica.'),
    ('CC601', 3, 'Arquitecturas serverless', 'Funciones como servicio y su modelo de ejecucion por eventos.'),
    ('CC601', 4, 'Escalabilidad y balanceo de carga', 'Autoescalado horizontal/vertical y distribucion de trafico.'),
    ('CC601', 5, 'Seguridad en la nube', 'Gestion de identidades, cifrado y buenas practicas de seguridad en la nube.'),

    -- Inteligencia Artificial (IA701)
    ('IA701', 1, 'Agentes inteligentes y busqueda', 'Definicion de agente racional y estrategias de busqueda no informada.'),
    ('IA701', 2, 'Busqueda informada y heuristicas', 'Algoritmos A* y diseño de funciones heuristicas.'),
    ('IA701', 3, 'Representacion del conocimiento y logica', 'Representacion simbolica del conocimiento y razonamiento logico.'),
    ('IA701', 4, 'Aprendizaje automatico: fundamentos', 'Conceptos base de aprendizaje supervisado y no supervisado.'),
    ('IA701', 5, 'Redes neuronales y aprendizaje profundo', 'Perceptron, retropropagacion y arquitecturas de redes profundas.'),
    ('IA701', 6, 'Procesamiento de lenguaje natural', 'Tecnicas basicas de PLN aplicadas a texto.'),

    -- Machine Learning (ML801)
    ('ML801', 1, 'Aprendizaje supervisado: regresion y clasificacion', 'Modelos de regresion lineal/logistica y clasificadores basicos.'),
    ('ML801', 2, 'Aprendizaje no supervisado: clustering', 'Algoritmos de agrupamiento como K-means y clustering jerarquico.'),
    ('ML801', 3, 'Validacion de modelos y metricas', 'Validacion cruzada, matriz de confusion y metricas de evaluacion.'),
    ('ML801', 4, 'Arboles de decision y ensambles', 'Arboles de decision, random forest y boosting.'),
    ('ML801', 5, 'Redes neuronales aplicadas', 'Aplicacion practica de redes neuronales a problemas reales.'),

    -- Proyecto de Titulación (PT1001)
    ('PT1001', 1, 'Planteamiento del problema de investigacion', 'Formulacion del problema, justificacion y objetivos del trabajo de titulacion.'),
    ('PT1001', 2, 'Marco teorico y estado del arte', 'Revision de literatura y trabajos relacionados.'),
    ('PT1001', 3, 'Metodologia de desarrollo', 'Definicion de la metodologia y plan de trabajo a seguir.'),
    ('PT1001', 4, 'Implementacion y validacion de resultados', 'Desarrollo de la propuesta y validacion de los resultados obtenidos.'),
    ('PT1001', 5, 'Redaccion y defensa del trabajo de titulacion', 'Estructura del documento final y preparacion de la sustentacion.')
),

subjects_topics AS (
  SELECT
    s.id AS subject_id,
    tc.rn,
    tc.title,
    tc.description,
    md5(s.id::text || ':topic:' || tc.rn::text) AS seed_hash
  FROM subjects s
  INNER JOIN topic_catalog tc ON tc.subject_code = s.code
),

topics_seed AS (
  SELECT
    (
      substr(seed_hash, 1, 8) || '-' ||
      substr(seed_hash, 9, 4) || '-4' ||
      substr(seed_hash, 14, 3) || '-8' ||
      substr(seed_hash, 18, 3) || '-' ||
      substr(seed_hash, 21, 12)
    )::uuid AS id,
    subject_id,
    title,
    description,
    rn - 1 AS "order"
  FROM subjects_topics
)

INSERT INTO topics (
  id,
  subject_id,
  title,
  description,
  "order",
  file_url,
  original_file_name,
  file_size,
  mime_type,
  created_at,
  updated_at
)
SELECT
  id,
  subject_id,
  title,
  description,
  "order",
  NULL,
  NULL,
  NULL,
  NULL,
  now(),
  now()
FROM topics_seed
ON CONFLICT (id) DO UPDATE SET
  subject_id = EXCLUDED.subject_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "order" = EXCLUDED."order",
  updated_at = NOW();

-- Drops any leftover topic from the previous generic (4-6 random units)
-- seed whose position is beyond what this subject now defines above —
-- otherwise a stale "Unidad 6: Repaso y evaluacion final" could linger
-- past the real syllabus for subjects with fewer catalog entries.
DELETE FROM topics t
USING subjects s
WHERE t.subject_id = s.id
  AND s.code IN (SELECT DISTINCT subject_code FROM (
    VALUES
      ('FP101'), ('MAT101'), ('LOG101'), ('FP201'), ('CAL201'),
      ('BD301'), ('AC301'), ('SO301'), ('ED301'), ('NET401'),
      ('BD401'), ('AA501'), ('IS501'), ('PI901'), ('SD601'),
      ('CC601'), ('IA701'), ('ML801'), ('PT1001')
  ) AS covered_codes(subject_code))
  AND t."order" >= (
    SELECT topic_counts.topic_count FROM (
      VALUES
        ('FP101', 5), ('MAT101', 5), ('LOG101', 5), ('FP201', 5), ('CAL201', 5),
        ('BD301', 5), ('AC301', 5), ('SO301', 6), ('ED301', 6), ('NET401', 5),
        ('BD401', 6), ('AA501', 6), ('IS501', 5), ('PI901', 5), ('SD601', 5),
        ('CC601', 5), ('IA701', 6), ('ML801', 5), ('PT1001', 5)
    ) AS topic_counts(subject_code, topic_count)
    WHERE topic_counts.subject_code = s.code
  );
