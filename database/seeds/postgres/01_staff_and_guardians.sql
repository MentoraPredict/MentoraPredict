-- =====================================================
-- PERSONAL ADMINISTRATIVO Y REPRESENTANTES
-- 1 SECRETARIA, 1 DECE, 1 INSPECTOR
-- 25 REPRESENTANTES (cada uno con dos representados)
-- Misma clave de prueba que 00_users.sql (MP123456789).
-- Todos los datos son ficticios.
-- =====================================================

DO $$
DECLARE
    guardian_count INT := 25;
    i INT;

    password_hash TEXT := '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu';

    first_names TEXT[] := ARRAY[
        'Carlos','Andrea','Javier','Luis','María','Fernando','Patricia','Ricardo','Diana','Miguel',
        'Sandra','Esteban','Gabriela','José','Verónica','Daniel','Paola','Roberto','Juan','Ana',
        'Sofía','Diego','Valeria','Andrés','Daniela','Jorge','Paula','Camila','Kevin','Tatiana'
    ];

    last_names TEXT[] := ARRAY[
        'Mendoza','Villacis','Paredes','Andrade','Pérez','Gómez','León','Salazar','Vega','Herrera',
        'Torres','Rojas','Cárdenas','Naranjo','Mora','Acosta','Castillo','Villacrés','Pazmiño','Cevallos',
        'López','Martínez','García','Rodríguez','Morales','Ramírez','Ortega','Reyes','Silva'
    ];

    staff RECORD;
BEGIN

    -- =====================================================
    -- SECRETARÍA, DECE E INSPECCIÓN
    -- =====================================================
    FOR staff IN
        SELECT * FROM (VALUES
            ('eeeeeeee-0000-4000-8000-000000000001'::uuid, 'secretary01', 'SECRETARY', 'Rosa',    'Chávez',  '1600000001', 'Secretaría de la institución.'),
            ('ffffffff-0000-4000-8000-000000000001'::uuid, 'dece01',      'DECE',      'Mariana', 'Flores',  '1500000001', 'Departamento de Consejería Estudiantil.'),
            ('99999999-0000-4000-8000-000000000001'::uuid, 'inspector01', 'INSPECTOR', 'Hugo',    'Arévalo', '1400000001', 'Inspección general.')
        ) AS t(id, username, role, first_name, last_name, cedula, bio)
    LOOP
        INSERT INTO users (
            id, email, password_hash, role,
            is_active, is_verified,
            first_name, last_name,
            created_at, updated_at
        )
        VALUES (
            staff.id,
            staff.username || '@mentorapredict.edu.ec',
            password_hash,
            staff.role,
            TRUE, TRUE,
            staff.first_name,
            staff.last_name,
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
            staff.id,
            NULL,
            staff.bio,
            staff.cedula,
            'LOCAL',
            staff.role,
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

    -- =====================================================
    -- REPRESENTANTES
    -- =====================================================
    FOR i IN 1..guardian_count LOOP
        INSERT INTO users (
            id, email, password_hash, role,
            is_active, is_verified,
            first_name, last_name,
            created_at, updated_at
        )
        VALUES (
            ('dddddddd-0000-4000-8000-0000000000' || lpad(i::text, 2, '0'))::uuid,
            'guardian' || lpad(i::text, 2, '0') || '@mentorapredict.edu.ec',
            password_hash,
            'GUARDIAN',
            TRUE, TRUE,
            first_names[((i * 7) % array_length(first_names, 1)) + 1],
            last_names[((i * 3) % array_length(last_names, 1)) + 1],
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
            ('dddddddd-0000-4000-8000-0000000000' || lpad(i::text, 2, '0'))::uuid,
            NULL,
            'Representante legal de MentoraPredict.',
            '19000000' || lpad(i::text, 2, '0'),
            'LOCAL',
            'GUARDIAN',
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
