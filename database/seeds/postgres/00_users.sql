-- =====================================================
-- USUARIOS Y PERFILES: ADMINISTRACIÓN, DOCENTES Y ESTUDIANTES
-- 1 administrador, 8 docentes, 26 estudiantes.
--   admin01 · teacher01..08 · student001..026
-- Los representantes y el personal (secretaría, DECE, inspección) están
-- en 01_staff_and_guardians.sql.
--
-- Clave de todos los usuarios de prueba: MP123456789 (hash bcrypt de abajo).
-- Todos los datos son ficticios. Las cédulas llevan dígito verificador
-- válido, para poder probar la validación sin usar números reales.
-- =====================================================

-- Cédula ecuatoriana: provincia (2) + tercer dígito < 6 + 6 dígitos + verificador.
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
            -- Administración
            ('aaaaaaaa-0000-4000-8000-000000000001'::uuid, 'admin01',   'ADMIN',   'Carlos',    'Mendoza',   1,
             'Administrador del sistema.'),

            -- Docentes
            ('bbbbbbbb-0000-4000-8000-000000000001'::uuid, 'teacher01', 'TEACHER', 'Patricia',  'Andrade',   101,
             'Docente de Matemática.'),
            ('bbbbbbbb-0000-4000-8000-000000000002'::uuid, 'teacher02', 'TEACHER', 'Fernando',  'Paredes',   102,
             'Docente de Lengua y Literatura. Tutor de 8.º A.'),
            ('bbbbbbbb-0000-4000-8000-000000000003'::uuid, 'teacher03', 'TEACHER', 'Gabriela',  'Ibarra',    103,
             'Docente de Ciencias Naturales y Física.'),
            ('bbbbbbbb-0000-4000-8000-000000000004'::uuid, 'teacher04', 'TEACHER', 'Roberto',   'Herrera',   104,
             'Docente de Química.'),
            ('bbbbbbbb-0000-4000-8000-000000000005'::uuid, 'teacher05', 'TEACHER', 'Verónica',  'Cárdenas',  105,
             'Docente de Estudios Sociales e Historia. Tutora de 1.º BGU A.'),
            ('bbbbbbbb-0000-4000-8000-000000000006'::uuid, 'teacher06', 'TEACHER', 'Daniel',    'Naranjo',   106,
             'Docente de Inglés.'),
            ('bbbbbbbb-0000-4000-8000-000000000007'::uuid, 'teacher07', 'TEACHER', 'Esteban',   'Mora',      107,
             'Docente de Educación Física.'),
            ('bbbbbbbb-0000-4000-8000-000000000008'::uuid, 'teacher08', 'TEACHER', 'Paola',     'Acosta',    108,
             'Docente de Educación Cultural y Artística.'),

            -- Estudiantes de 8.º A (001-012)
            ('cccccccc-0000-4000-8000-000000000001'::uuid, 'student001', 'STUDENT', 'Sofía',      'Castillo',  1001, 'Estudiante de 8.º A.'),
            ('cccccccc-0000-4000-8000-000000000002'::uuid, 'student002', 'STUDENT', 'Mateo',      'Villacrés', 1002, 'Estudiante de 8.º A.'),
            ('cccccccc-0000-4000-8000-000000000003'::uuid, 'student003', 'STUDENT', 'Valentina',  'Pazmiño',   1003, 'Estudiante de 8.º A.'),
            ('cccccccc-0000-4000-8000-000000000004'::uuid, 'student004', 'STUDENT', 'Santiago',   'Pazmiño',   1004, 'Estudiante de 8.º A.'),
            ('cccccccc-0000-4000-8000-000000000005'::uuid, 'student005', 'STUDENT', 'Camila',     'López',     1005, 'Estudiante de 8.º A.'),
            ('cccccccc-0000-4000-8000-000000000006'::uuid, 'student006', 'STUDENT', 'Joaquín',    'Martínez',  1006, 'Estudiante de 8.º A.'),
            ('cccccccc-0000-4000-8000-000000000007'::uuid, 'student007', 'STUDENT', 'Isabella',   'García',    1007, 'Estudiante de 8.º A.'),
            ('cccccccc-0000-4000-8000-000000000008'::uuid, 'student008', 'STUDENT', 'Sebastián',  'Rodríguez', 1008, 'Estudiante de 8.º A.'),
            ('cccccccc-0000-4000-8000-000000000009'::uuid, 'student009', 'STUDENT', 'Luciana',    'Rodríguez', 1009, 'Estudiante de 8.º A.'),
            ('cccccccc-0000-4000-8000-000000000010'::uuid, 'student010', 'STUDENT', 'Nicolás',    'Ramírez',   1010, 'Estudiante de 8.º A.'),
            ('cccccccc-0000-4000-8000-000000000011'::uuid, 'student011', 'STUDENT', 'Emilia',     'Ortega',    1011, 'Estudiante de 8.º A.'),
            ('cccccccc-0000-4000-8000-000000000012'::uuid, 'student012', 'STUDENT', 'Gabriel',    'Ortega',    1012, 'Estudiante de 8.º A.'),

            -- Estudiantes de 1.º BGU A (013-024)
            ('cccccccc-0000-4000-8000-000000000013'::uuid, 'student013', 'STUDENT', 'Daniela',    'Castillo',  1013, 'Estudiante de 1.º BGU A.'),
            ('cccccccc-0000-4000-8000-000000000014'::uuid, 'student014', 'STUDENT', 'Alejandro',  'Vega',      1014, 'Estudiante de 1.º BGU A.'),
            ('cccccccc-0000-4000-8000-000000000015'::uuid, 'student015', 'STUDENT', 'Kerly',      'Martínez',  1015, 'Estudiante de 1.º BGU A.'),
            ('cccccccc-0000-4000-8000-000000000016'::uuid, 'student016', 'STUDENT', 'Bryan',      'Vega',      1016, 'Estudiante de 1.º BGU A.'),
            ('cccccccc-0000-4000-8000-000000000017'::uuid, 'student017', 'STUDENT', 'Melissa',    'Rojas',     1017, 'Estudiante de 1.º BGU A.'),
            ('cccccccc-0000-4000-8000-000000000018'::uuid, 'student018', 'STUDENT', 'Anthony',    'Rojas',     1018, 'Estudiante de 1.º BGU A.'),
            ('cccccccc-0000-4000-8000-000000000019'::uuid, 'student019', 'STUDENT', 'Paula',      'Pérez',     1019, 'Estudiante de 1.º BGU A.'),
            ('cccccccc-0000-4000-8000-000000000020'::uuid, 'student020', 'STUDENT', 'David',      'Pérez',     1020, 'Estudiante de 1.º BGU A.'),
            ('cccccccc-0000-4000-8000-000000000021'::uuid, 'student021', 'STUDENT', 'Karla',      'Pérez',     1021, 'Estudiante de 1.º BGU A.'),
            ('cccccccc-0000-4000-8000-000000000022'::uuid, 'student022', 'STUDENT', 'Josué',      'Salazar',   1022, 'Estudiante de 1.º BGU A.'),
            ('cccccccc-0000-4000-8000-000000000023'::uuid, 'student023', 'STUDENT', 'Tatiana',    'Salazar',   1023, 'Estudiante de 1.º BGU A.'),
            ('cccccccc-0000-4000-8000-000000000024'::uuid, 'student024', 'STUDENT', 'Kevin',      'Salazar',   1024, 'Estudiante de 1.º BGU A.'),

            -- Sin matrícula (para probar la matriculación desde Secretaría) y traspasado
            ('cccccccc-0000-4000-8000-000000000025'::uuid, 'student025', 'STUDENT', 'Antonella',  'Villacrés', 1025, 'Estudiante nueva, aún sin matrícula.'),
            ('cccccccc-0000-4000-8000-000000000026'::uuid, 'student026', 'STUDENT', 'Mauricio',   'López',     1026, 'Estudiante trasladado a otra institución.')
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
