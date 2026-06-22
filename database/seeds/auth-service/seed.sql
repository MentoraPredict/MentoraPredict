-- =====================================================
-- USERS
-- 3 ADMINISTRADORES
-- 15 DOCENTES
-- password_hash correspondiente a MP123456789 temporalmente
-- =====================================================

INSERT INTO users (
    id,
    email,
    password_hash,
    role,
    is_active,
    is_verified,
    first_name,
    last_name,
    created_at,
    updated_at
) VALUES

-- =====================================================
-- ADMINISTRADORES
-- =====================================================

(
    '00000000-0000-0000-0000-000000000001',
    'admin01@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'ADMIN',
    TRUE,
    TRUE,
    'Carlos',
    'Mendoza',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000002',
    'admin02@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'ADMIN',
    TRUE,
    TRUE,
    'Andrea',
    'Villacis',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000003',
    'admin03@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'ADMIN',
    TRUE,
    TRUE,
    'Javier',
    'Paredes',
    NOW(),
    NOW()
),

-- =====================================================
-- DOCENTES
-- =====================================================

(
    '00000000-0000-0000-0000-000000000001',
    'docente01@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Luis',
    'Andrade',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000002',
    'docente02@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'María',
    'Pérez',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000003',
    'docente03@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Fernando',
    'Gómez',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000004',
    'docente04@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Patricia',
    'León',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000005',
    'docente05@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Ricardo',
    'Salazar',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000006',
    'docente06@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Diana',
    'Vega',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000007',
    'docente07@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Miguel',
    'Herrera',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000008',
    'docente08@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Sandra',
    'Torres',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000009',
    'docente09@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Esteban',
    'Rojas',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000010',
    'docente10@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Gabriela',
    'Cárdenas',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000011',
    'docente11@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'José',
    'Naranjo',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000012',
    'docente12@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Verónica',
    'Mora',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000013',
    'docente13@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Daniel',
    'Acosta',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000014',
    'docente14@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Paola',
    'Castillo',
    NOW(),
    NOW()
),

(
    '00000000-0000-0000-0000-000000000015',
    'docente15@mentorapredict.edu.ec',
    '$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu',
    'TEACHER',
    TRUE,
    TRUE,
    'Roberto',
    'Villacrés',
    NOW(),
    NOW()
)

ON CONFLICT (id) DO NOTHING;

INSERT INTO users (
    id,
    email,
    password_hash,
    role,
    is_active,
    is_verified,
    first_name,
    last_name,
    created_at,
    updated_at
) VALUES

('30000000-0000-0000-0000-000000000001','estudiante001@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Juan','Pérez',NOW(),NOW()),
('30000000-0000-0000-0000-000000000002','estudiante002@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'María','García',NOW(),NOW()),
('30000000-0000-0000-0000-000000000003','estudiante003@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Carlos','Rodríguez',NOW(),NOW()),
('30000000-0000-0000-0000-000000000004','estudiante004@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Ana','López',NOW(),NOW()),
('30000000-0000-0000-0000-000000000005','estudiante005@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Luis','Martínez',NOW(),NOW()),
('30000000-0000-0000-0000-000000000006','estudiante006@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Sofía','Torres',NOW(),NOW()),
('30000000-0000-0000-0000-000000000007','estudiante007@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Diego','Vargas',NOW(),NOW()),
('30000000-0000-0000-0000-000000000008','estudiante008@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Valeria','Castro',NOW(),NOW()),
('30000000-0000-0000-0000-000000000009','estudiante009@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Andrés','Morales',NOW(),NOW()),
('30000000-0000-0000-0000-000000000010','estudiante010@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Daniela','Herrera',NOW(),NOW()),

('30000000-0000-0000-0000-000000000011','estudiante011@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Jorge','Ramírez',NOW(),NOW()),
('30000000-0000-0000-0000-000000000012','estudiante012@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Paula','Mendoza',NOW(),NOW()),
('30000000-0000-0000-0000-000000000013','estudiante013@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Ricardo','Ortega',NOW(),NOW()),
('30000000-0000-0000-0000-000000000014','estudiante014@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Camila','Reyes',NOW(),NOW()),
('30000000-0000-0000-0000-000000000015','estudiante015@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Fernando','León',NOW(),NOW()),
('30000000-0000-0000-0000-000000000016','estudiante016@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Gabriela','Paredes',NOW(),NOW()),
('30000000-0000-0000-0000-000000000017','estudiante017@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Kevin','Rojas',NOW(),NOW()),
('30000000-0000-0000-0000-000000000018','estudiante018@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Andrea','Salazar',NOW(),NOW()),
('30000000-0000-0000-0000-000000000019','estudiante019@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Miguel','Espinoza',NOW(),NOW()),
('30000000-0000-0000-0000-000000000020','estudiante020@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Natalia','Cruz',NOW(),NOW()),

('30000000-0000-0000-0000-000000000021','estudiante021@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Cristian','Flores',NOW(),NOW()),
('30000000-0000-0000-0000-000000000022','estudiante022@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Tatiana','Guerrero',NOW(),NOW()),
('30000000-0000-0000-0000-000000000023','estudiante023@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'José','Navarro',NOW(),NOW()),
('30000000-0000-0000-0000-000000000024','estudiante024@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Lucía','Cárdenas',NOW(),NOW()),
('30000000-0000-0000-0000-000000000025','estudiante025@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'David','Benítez',NOW(),NOW()),
('30000000-0000-0000-0000-000000000026','estudiante026@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Karla','Aguilar',NOW(),NOW()),
('30000000-0000-0000-0000-000000000027','estudiante027@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Pablo','Mora',NOW(),NOW()),
('30000000-0000-0000-0000-000000000028','estudiante028@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Verónica','Silva',NOW(),NOW()),
('30000000-0000-0000-0000-000000000029','estudiante029@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Santiago','Ibarra',NOW(),NOW()),
('30000000-0000-0000-0000-000000000030','estudiante030@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Melissa','Acosta',NOW(),NOW()),

('30000000-0000-0000-0000-000000000031','estudiante031@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Bryan','Velasco',NOW(),NOW()),
('30000000-0000-0000-0000-000000000032','estudiante032@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Mónica','Vera',NOW(),NOW()),
('30000000-0000-0000-0000-000000000033','estudiante033@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Ángel','Suárez',NOW(),NOW()),
('30000000-0000-0000-0000-000000000034','estudiante034@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Carolina','Naranjo',NOW(),NOW()),
('30000000-0000-0000-0000-000000000035','estudiante035@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Esteban','Almeida',NOW(),NOW()),
('30000000-0000-0000-0000-000000000036','estudiante036@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Tatiana','Bravo',NOW(),NOW()),
('30000000-0000-0000-0000-000000000037','estudiante037@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Jonathan','Pazmiño',NOW(),NOW()),
('30000000-0000-0000-0000-000000000038','estudiante038@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Diana','Pozo',NOW(),NOW()),
('30000000-0000-0000-0000-000000000039','estudiante039@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Marco','Cevallos',NOW(),NOW()),
('30000000-0000-0000-0000-000000000040','estudiante040@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Jennifer','Yánez',NOW(),NOW()),

('30000000-0000-0000-0000-000000000041','estudiante041@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Patricio','Maldonado',NOW(),NOW()),
('30000000-0000-0000-0000-000000000042','estudiante042@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Cecilia','Gómez',NOW(),NOW()),
('30000000-0000-0000-0000-000000000043','estudiante043@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Henry','Cisneros',NOW(),NOW()),
('30000000-0000-0000-0000-000000000044','estudiante044@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Lorena','Vallejo',NOW(),NOW()),
('30000000-0000-0000-0000-000000000045','estudiante045@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Mauricio','Chávez',NOW(),NOW()),
('30000000-0000-0000-0000-000000000046','estudiante046@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Jessica','Pinto',NOW(),NOW()),
('30000000-0000-0000-0000-000000000047','estudiante047@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Roberto','Lema',NOW(),NOW()),
('30000000-0000-0000-0000-000000000048','estudiante048@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Belén','Moya',NOW(),NOW()),
('30000000-0000-0000-0000-000000000049','estudiante049@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Alejandro','Jaramillo',NOW(),NOW()),
('30000000-0000-0000-0000-000000000050','estudiante050@mentorapredict.edu.ec','$2b$12$/Tfqe5UGo6SrexGZxsGsEuN5.GRUfq.zZGU4uiXJfEELYW//IxGPu', 'STUDENT', TRUE, TRUE,'Nicole','Carrillo',NOW(),NOW())

ON CONFLICT (id) DO NOTHING;