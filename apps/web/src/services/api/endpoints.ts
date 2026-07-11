export const endpoints = {
    auth: {
        login: "/v1/auth/login",
        logout: "/v1/auth/logout",
        refresh: "/v1/auth/refresh",
        register: "/v1/auth/register",
        forgotPassword: "/v1/auth/forgot-password",
        resetPassword: "/v1/auth/reset-password",
        microsoft: "/v1/auth/microsoft",
    },
    users: {
        me: "/v1/users/me",
        avatar: "/v1/users/me/avatar",
        list: "/v1/users",
        detail: (id: string) => `/v1/users/${id}`,
    },
    academic: {
        subjects: "/v1/academic/subjects",
        subject: (id: string) => `/v1/academic/subjects/${id}`,
        faculties: "/v1/academic/faculties",
        periods: "/v1/academic/periods",
        activePeriod: "/v1/academic/periods/active",
        careers: "/v1/academic/careers",
        enrollments: "/v1/academic/enrollments",
        studentEnrollments: (studentId: string) =>
            `/v1/academic/enrollments?studentId=${studentId}`,
        subjectEnrollments: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/enrollments`,
        teacherSubjects: "/v1/academic/teachers/me/subjects",
        enrollmentStatus: (enrollmentId: string) =>
            `/v1/academic/enrollments/${enrollmentId}/status`,
        batchEnrollments: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/enrollments/batch`,
        studentSubjects: "/v1/academic/students/me/subjects",
        studentCurrentCheckIn: (subjectId: string) =>
            `/v1/academic/students/me/subjects/${subjectId}/check-ins/current`,
        studentCheckIns: (subjectId: string) =>
            `/v1/academic/students/me/subjects/${subjectId}/check-ins`,
        subjectImage: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/image`,
        subjectStatus: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/status`,
        importGrades: "/v1/academic/import/grades",
        topics: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/topics`,
        topic: (topicId: string) =>
            `/v1/academic/topics/${topicId}`,
        topicFile: (topicId: string) =>
            `/v1/academic/topics/${topicId}/file`,
    },
    analytics: {
        studentDashboard: (studentId: string) =>
            `/v1/analytics/dashboard/student/${studentId}`,
        studentSubjectMetrics: (subjectId: string) =>
            `/v1/analytics/students/me/subjects/${subjectId}/metrics`,
        studentSubjectRisk: (subjectId: string) =>
            `/v1/analytics/students/me/subjects/${subjectId}/risk`,
        studentAlerts: "/v1/analytics/students/me/alerts",
        subjectSummary: (subjectId: string) =>
            `/v1/analytics/subjects/${subjectId}/metrics/summary`,
        subjectAlerts: (subjectId: string) =>
            `/v1/analytics/subjects/${subjectId}/alerts`,
    },
    prediction: {
        studentSubject: (subjectId: string) =>
            `/v1/prediction/students/me/subjects/${subjectId}/prediction`,
        subject: (subjectId: string) =>
            `/v1/prediction/subjects/${subjectId}/predictions`,
        teacherStudentSubject: (subjectId: string, studentId: string) =>
            `/v1/prediction/subjects/${subjectId}/students/${studentId}/prediction`,
        generate: (periodId: string) =>
            `/v1/prediction/students/me/periods/${periodId}/generate`,
        generateForSubject: (subjectId: string) =>
            `/v1/prediction/students/me/subjects/${subjectId}/generate`,
        history: (studentId: string) =>
            `/v1/prediction/students/${studentId}/history`,
    },
    notifications: {
        mine: "/v1/notifications/me",
        read: (notificationId: string) =>
            `/v1/notifications/${notificationId}/read`,
        readAll: "/v1/notifications/read-all",
    },
} as const;
