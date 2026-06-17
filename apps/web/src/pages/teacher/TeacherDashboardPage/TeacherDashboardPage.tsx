import { Heading, Text } from "@/components/atoms";
import { DashboardTopbar } from "@/components/organisms";

export default function TeacherDashboardPage() {
    return (
        <>
            <DashboardTopbar title="Teacher Dashboard" />
            <main className="p-8">
                <Heading as="h1">Teacher Dashboard</Heading>
                <Text>Sesion autenticada correctamente.</Text>
            </main>
        </>
    );
}
