-- =====================================================
-- USERS AND PROFILES
-- 3 ADMINISTRADORES
-- 15 DOCENTES
-- password_hash correspondiente a MP123456789 temporalmente
-- =====================================================

DO $$
DECLARE
    -- =====================================================
    -- CONFIG
    -- =====================================================
    admin_count INT := 3;
    teacher_count INT := 15;
    student_count INT := 50;

    i INT;

    password_hash TEXT := '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu';

    -- =====================================================
    -- POOL DE NOMBRES
    -- =====================================================
    first_names TEXT[] := ARRAY[
        'Carlos','Andrea','Javier','Luis','María','Fernando','Patricia','Ricardo','Diana','Miguel',
        'Sandra','Esteban','Gabriela','José','Verónica','Daniel','Paola','Roberto','Juan','Ana',
        'Sofía','Diego','Valeria','Andrés','Daniela','Jorge','Paula','Camila','Kevin','Tatiana',
        'Lucía','David','Karla','Pablo','Santiago','Melissa','Bryan','Mónica','Ángel','Carolina'
    ];

    last_names TEXT[] := ARRAY[
        'Mendoza','Villacis','Paredes','Andrade','Pérez','Gómez','León','Salazar','Vega','Herrera',
        'Torres','Rojas','Cárdenas','Naranjo','Mora','Acosta','Castillo','Villacrés','Pazmiño','Cevallos',
        'López','Martínez','García','Rodríguez','Morales','Ramírez','Ortega','Reyes','Silva'
    ];

BEGIN

    -- =====================================================
    -- ADMINISTRATORS
    -- =====================================================
    FOR i IN 1..admin_count LOOP
        INSERT INTO users (
            id, email, password_hash, role,
            is_active, is_verified,
            first_name, last_name,
            created_at, updated_at
        )
        VALUES (
            ('aaaaaaaa-0000-4000-8000-0000000000' || lpad(i::text, 2, '0'))::uuid,
            'admin' || lpad(i::text, 2, '0') || '@mentorapredict.edu.ec',
            password_hash,
            'ADMIN',
            TRUE, TRUE,
            first_names[i],
            last_names[i],
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
            ('aaaaaaaa-0000-4000-8000-0000000000' || lpad(i::text, 2, '0'))::uuid,
            NULL,
            'Administrador del sistema.',
            '17000000' || lpad(i::text, 2, '0'),
            'LOCAL',
            'ADMIN',
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
    -- TEACHERS
    -- =====================================================
    FOR i IN 1..teacher_count LOOP
        INSERT INTO users (
            id, email, password_hash, role,
            is_active, is_verified,
            first_name, last_name,
            created_at, updated_at
        )
        VALUES (
            ('bbbbbbbb-0000-4000-8000-0000000000' || lpad(i::text, 2, '0'))::uuid,
            'teacher' || lpad(i::text, 2, '0') || '@mentorapredict.edu.ec',
            password_hash,
            'TEACHER',
            TRUE, TRUE,
            first_names[(i % array_length(first_names,1)) + 1],
            last_names[(i % array_length(last_names,1)) + 1],
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
            ('bbbbbbbb-0000-4000-8000-0000000000' || lpad(i::text, 2, '0'))::uuid,
            NULL,
            'Docente del sistema.',
            '18000000' || lpad(i::text, 2, '0'),
            'LOCAL',
            'TEACHER',
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
    -- STUDENTS
    -- =====================================================
    FOR i IN 1..student_count LOOP
        INSERT INTO users (
            id, email, password_hash, role,
            is_active, is_verified,
            first_name, last_name,
            created_at, updated_at
        )
        VALUES (
            ('cccccccc-0000-4000-8000-000000000' || lpad(i::text, 3, '0'))::uuid,
            'student' || lpad(i::text, 3, '0') || '@mentorapredict.edu.ec',
            password_hash,
            'STUDENT',
            TRUE, TRUE,
            first_names[(i % array_length(first_names,1)) + 1],
            last_names[(i % array_length(last_names,1)) + 1],
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
            ('cccccccc-0000-4000-8000-000000000' || lpad(i::text, 3, '0'))::uuid,
            NULL,
            'Estudiante de MentoraPredict',
            '01000000' || lpad(i::text, 3, '0'),
            'LOCAL',
            'STUDENT',
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
