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
        userAvatar: (id: string) => `/v1/users/${id}/avatar`,
        list: "/v1/users",
        detail: (id: string) => `/v1/users/${id}`,
    },
    academic: {
        subjects: "/v1/academic/subjects",
        subject: (id: string) => `/v1/academic/subjects/${id}`,
        periods: "/v1/academic/periods",
        period: (id: string) => `/v1/academic/periods/${id}`,
        institutionConfig: "/v1/academic/institution/config",
        institution: "/v1/academic/institution",
        institutionLevels: "/v1/academic/institution/levels",
        gradingScale: "/v1/academic/institution/grading-scale",
        attendanceRule: "/v1/academic/institution/attendance-rule",
        promotionRules: "/v1/academic/institution/promotion-rules",
        gradeLevels: "/v1/academic/grade-levels",
        gradeLevelCurriculum: (code: string) =>
            `/v1/academic/grade-levels/${code}/curriculum`,
        sections: "/v1/academic/sections",
        section: (id: string) => `/v1/academic/sections/${id}`,
        sectionGenerateCourses: (id: string) =>
            `/v1/academic/sections/${id}/generate-courses`,
        sectionCourses: (id: string) => `/v1/academic/sections/${id}/courses`,
        subjectTeacher: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/teacher`,
        subjectCatalog: "/v1/academic/subject-catalog",
        subjectCatalogItem: (id: string) =>
            `/v1/academic/subject-catalog/${id}`,
        studentProfile: (id: string) => `/v1/academic/students/${id}/profile`,
        studentGuardians: (id: string) =>
            `/v1/academic/students/${id}/guardians`,
        studentGuardian: (id: string, guardianId: string) =>
            `/v1/academic/students/${id}/guardians/${guardianId}`,
        studentConsents: (id: string) =>
            `/v1/academic/students/${id}/consents`,
        studentConsent: (id: string, purpose: string) =>
            `/v1/academic/students/${id}/consents/${purpose}`,
        myStudents: "/v1/academic/guardians/me/students",
        sectionEnrollments: (sectionId: string) =>
            `/v1/academic/sections/${sectionId}/enrollments`,
        endStudentEnrollment: (id: string) =>
            `/v1/academic/student-enrollments/${id}/end`,
        subjectSchedule: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/schedule`,
        subjectSessions: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/sessions`,
        sessionAttendance: (subjectId: string, sessionId: string) =>
            `/v1/academic/subjects/${subjectId}/sessions/${sessionId}/attendance`,
        courseAttendance: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/attendance`,
        sectionAttendance: (sectionId: string) =>
            `/v1/academic/sections/${sectionId}/attendance`,
        studentAttendance: (studentId: string) =>
            `/v1/academic/students/${studentId}/attendance`,
        studentJustifications: (studentId: string) =>
            `/v1/academic/students/${studentId}/absence-justifications`,
        justifications: "/v1/academic/absence-justifications",
        justification: (id: string) =>
            `/v1/academic/absence-justifications/${id}`,
        gradingComponents: "/v1/academic/grading/components",
        subjectGradebook: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/gradebook`,
        gradebookGrades: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/gradebook/grades`,
        subjectActivities: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/activities`,
        activity: (id: string) => `/v1/academic/activities/${id}`,
        activityStatus: (id: string) => `/v1/academic/activities/${id}/status`,
        subjectSupplementary: (subjectId: string) =>
            `/v1/academic/subjects/${subjectId}/supplementary`,
        periodClosure: (periodId: string) =>
            `/v1/academic/periods/${periodId}/closure`,
        closePeriod: (periodId: string) =>
            `/v1/academic/periods/${periodId}/close`,
        reopenPeriod: (periodId: string) =>
            `/v1/academic/periods/${periodId}/reopen`,
        studentResults: (studentId: string) =>
            `/v1/academic/students/${studentId}/results`,
        sectionPromotion: (sectionId: string) =>
            `/v1/academic/sections/${sectionId}/promotion`,
        schoolYears: "/v1/academic/school-years",
        schoolYear: (id: string) => `/v1/academic/school-years/${id}`,
        schoolYearStatus: (id: string) =>
            `/v1/academic/school-years/${id}/status`,
        activePeriod: "/v1/academic/periods/active",
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
        surveyQuestions: (surveyCode: string) =>
            `/v1/academic/surveys/${surveyCode}/questions`,
        studentSurveyResponses: "/v1/academic/students/me/survey-responses",
    },
    analytics: {
        studentDashboard: (studentId: string) =>
            `/v1/analytics/dashboard/student/${studentId}`,
        studentSubjectMetrics: (subjectId: string) =>
            `/v1/analytics/students/me/subjects/${subjectId}/metrics`,
        studentSubjectRisk: (subjectId: string) =>
            `/v1/analytics/students/me/subjects/${subjectId}/risk`,
        studentSubjectsOverview: "/v1/analytics/students/me/subjects/overview",
        studentAlerts: "/v1/analytics/students/me/alerts",
        subjectSummary: (subjectId: string) =>
            `/v1/analytics/subjects/${subjectId}/metrics/summary`,
        subjectProgress: (subjectId: string) =>
            `/v1/analytics/subjects/${subjectId}/metrics/progress`,
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
