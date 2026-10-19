-- =====================================================
-- PERSONAL ADMINISTRATIVO, REPRESENTANTES Y DATOS DE CONTACTO
-- 1 secretaria, 1 DECE, 1 inspector, 13 representantes.
-- Además llena `user_contact_details` (teléfono, ocupación, especialidad)
-- de docentes, personal y representantes.
-- Misma clave de prueba que 00_users.sql (MP123456789).
-- Todos los datos son ficticios.
-- =====================================================

CREATE OR REPLACE FUNCTION pg_temp.cedula(province INT, serial INT) RETURNS TEXT AS $$
DECLARE
    base TEXT := lpad(province::text, 2, '0') || '0' || lpad(serial::text, 6, '0');
    total INT := 0;
    digit INT;
    i INT;
BEGIN
    FOR i IN 1..9 LOOP
        digit := substr(base, i, 1)::int;
        IF i % 2 = 1 THEN
            digit := digit * 2;
            IF digit > 9 THEN digit := digit - 9; END IF;
        END IF;
        total := total + digit;
    END LOOP;
    RETURN base || ((10 - (total % 10)) % 10)::text;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

DO $$
DECLARE
    password_hash TEXT := '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu';
    person RECORD;
BEGIN
    FOR person IN
        SELECT * FROM (VALUES
            -- Secretaría, DECE e inspección
            ('eeeeeeee-0000-4000-8000-000000000001'::uuid, 'secretary01', 'SECRETARY', 'Rosa',    'Chávez',   901, 'Secretaría de la institución.'),
            ('ffffffff-0000-4000-8000-000000000001'::uuid, 'dece01',      'DECE',      'Mariana', 'Flores',   902, 'Departamento de Consejería Estudiantil.'),
            ('99999999-0000-4000-8000-000000000001'::uuid, 'inspector01', 'INSPECTOR', 'Hugo',    'Arévalo',  903, 'Inspección general.'),

            -- Representantes (relación con sus representados en 05_people_enrollment.sql)
            ('dddddddd-0000-4000-8000-000000000001'::uuid, 'guardian01', 'GUARDIAN', 'Marcela',  'Castillo',  501, 'Representante legal. Madre de dos estudiantes de grados distintos.'),
            ('dddddddd-0000-4000-8000-000000000002'::uuid, 'guardian02', 'GUARDIAN', 'Jorge',    'Villacrés', 502, 'Representante legal.'),
            ('dddddddd-0000-4000-8000-000000000003'::uuid, 'guardian03', 'GUARDIAN', 'Lucía',    'Pazmiño',   503, 'Representante legal.'),
            ('dddddddd-0000-4000-8000-000000000004'::uuid, 'guardian04', 'GUARDIAN', 'Andrés',   'López',     504, 'Representante legal.'),
            ('dddddddd-0000-4000-8000-000000000005'::uuid, 'guardian05', 'GUARDIAN', 'Sandra',   'Martínez',  505, 'Representante legal.'),
            ('dddddddd-0000-4000-8000-000000000006'::uuid, 'guardian06', 'GUARDIAN', 'Miguel',   'García',    506, 'Representante legal.'),
            ('dddddddd-0000-4000-8000-000000000007'::uuid, 'guardian07', 'GUARDIAN', 'Diana',    'Rodríguez', 507, 'Representante legal.'),
            ('dddddddd-0000-4000-8000-000000000008'::uuid, 'guardian08', 'GUARDIAN', 'Luis',     'Ramírez',   508, 'Representante legal.'),
            ('dddddddd-0000-4000-8000-000000000009'::uuid, 'guardian09', 'GUARDIAN', 'Carolina', 'Ortega',    509, 'Representante legal.'),
            ('dddddddd-0000-4000-8000-000000000010'::uuid, 'guardian10', 'GUARDIAN', 'Pablo',    'Vega',      510, 'Representante legal.'),
            ('dddddddd-0000-4000-8000-000000000011'::uuid, 'guardian11', 'GUARDIAN', 'Mónica',   'Rojas',     511, 'Representante legal.'),
            ('dddddddd-0000-4000-8000-000000000012'::uuid, 'guardian12', 'GUARDIAN', 'Javier',   'Pérez',     512, 'Representante legal de tres estudiantes.'),
            ('dddddddd-0000-4000-8000-000000000013'::uuid, 'guardian13', 'GUARDIAN', 'Ana',      'Salazar',   513, 'Representante legal de tres estudiantes.')
        ) AS t(id, username, role, first_name, last_name, serial, bio)
    LOOP
        INSERT INTO users (
            id, email, password_hash, role,
            is_active, is_verified,
            first_name, last_name,
            created_at, updated_at
        )
        VALUES (
            person.id,
            person.username || '@mentorapredict.edu.ec',
            password_hash,
            person.role,
            TRUE, TRUE,
            person.first_name,
            person.last_name,
            NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            is_verified = EXCLUDED.is_verified,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            updated_at = NOW();

        INSERT INTO user_profiles (
            id, photo, bio, cedula,
            auth_provider, role, status,
            deleted_at, created_at, updated_at
        )
        VALUES (
            person.id,
            NULL,
            person.bio,
            pg_temp.cedula(17, person.serial),
            'LOCAL',
            person.role,
            'ACTIVE',
            NULL,
            NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            photo = EXCLUDED.photo,
            bio = EXCLUDED.bio,
            cedula = EXCLUDED.cedula,
            auth_provider = EXCLUDED.auth_provider,
            role = EXCLUDED.role,
            status = EXCLUDED.status,
            deleted_at = EXCLUDED.deleted_at,
            updated_at = NOW();
    END LOOP;
END $$;

-- Datos de contacto y profesionales -------------------------------------------

INSERT INTO user_contact_details (
    user_id, phone, alternate_phone, address, occupation, specialty, academic_title, updated_at
) VALUES
    -- Docentes
    ('bbbbbbbb-0000-4000-8000-000000000001', '0991100101', NULL, 'Quito, sector Carcelén', NULL, 'Matemática',
     'Licenciada en Ciencias de la Educación, mención Matemática', NOW()),
    ('bbbbbbbb-0000-4000-8000-000000000002', '0991100102', NULL, 'Quito, sector La Magdalena', NULL, 'Lengua y Literatura',
     'Licenciado en Ciencias de la Educación, mención Lengua y Literatura', NOW()),
    ('bbbbbbbb-0000-4000-8000-000000000003', '0991100103', NULL, 'Quito, sector Cumbayá', NULL, 'Ciencias Naturales y Física',
     'Licenciada en Ciencias de la Educación, mención Física', NOW()),
    ('bbbbbbbb-0000-4000-8000-000000000004', '0991100104', NULL, 'Quito, sector El Condado', NULL, 'Química',
     'Ingeniero Químico, con certificación docente', NOW()),
    ('bbbbbbbb-0000-4000-8000-000000000005', '0991100105', NULL, 'Quito, sector San Blas', NULL, 'Historia y Estudios Sociales',
     'Licenciada en Ciencias de la Educación, mención Historia', NOW()),
    ('bbbbbbbb-0000-4000-8000-000000000006', '0991100106', NULL, 'Quito, sector Quitumbe', NULL, 'Inglés',
     'Licenciado en Pedagogía de los Idiomas Nacionales y Extranjeros', NOW()),
    ('bbbbbbbb-0000-4000-8000-000000000007', '0991100107', NULL, 'Quito, sector Chillogallo', NULL, 'Educación Física',
     'Licenciado en Ciencias de la Actividad Física', NOW()),
    ('bbbbbbbb-0000-4000-8000-000000000008', '0991100108', NULL, 'Quito, sector La Floresta', NULL, 'Educación Artística',
     'Licenciada en Artes Plásticas', NOW()),
    -- Personal
    ('eeeeeeee-0000-4000-8000-000000000001', '0991100201', NULL, 'Quito, sector Solanda', 'Secretaria', NULL, NULL, NOW()),
    ('ffffffff-0000-4000-8000-000000000001', '0991100202', NULL, 'Quito, sector La Carolina', 'Psicóloga educativa', 'Consejería estudiantil',
     'Psicóloga Educativa', NOW()),
    ('99999999-0000-4000-8000-000000000001', '0991100203', NULL, 'Quito, sector Calderón', 'Inspector general', NULL, NULL, NOW()),
    -- Representantes
    ('dddddddd-0000-4000-8000-000000000001', '0992200301', '022300301', 'Quito, sector Carapungo', 'Comerciante', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000002', '0992200302', NULL,        'Quito, sector Cotocollao', 'Chofer profesional', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000003', '0992200303', '022300303', 'Quito, sector Comité del Pueblo', 'Docente', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000004', '0992200304', NULL,        'Quito, sector Guamaní', 'Albañil', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000005', '0992200305', '022300305', 'Quito, sector Chimbacalle', 'Costurera', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000006', '0992200306', NULL,        'Quito, sector San Carlos', 'Contador', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000007', '0992200307', '022300307', 'Quito, sector La Ecuatoriana', 'Enfermera', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000008', '0992200308', NULL,        'Quito, sector Turubamba', 'Comerciante', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000009', '0992200309', '022300309', 'Quito, sector Conocoto', 'Peluquera', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000010', '0992200310', NULL,        'Quito, sector Pomasqui', 'Mecánico', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000011', '0992200311', '022300311', 'Quito, sector Tumbaco', 'Empleada doméstica', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000012', '0992200312', NULL,        'Quito, sector Calderón', 'Taxista', NULL, NULL, NOW()),
    ('dddddddd-0000-4000-8000-000000000013', '0992200313', '022300313', 'Quito, sector El Inca', 'Vendedora', NULL, NULL, NOW())
ON CONFLICT (user_id) DO UPDATE SET
    phone = EXCLUDED.phone,
    alternate_phone = EXCLUDED.alternate_phone,
    address = EXCLUDED.address,
    occupation = EXCLUDED.occupation,
    specialty = EXCLUDED.specialty,
    academic_title = EXCLUDED.academic_title,
    updated_at = NOW();
