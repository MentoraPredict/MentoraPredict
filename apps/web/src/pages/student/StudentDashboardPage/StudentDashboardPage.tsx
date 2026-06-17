import { Heading, Text } from "@/components/atoms";
import { DashboardTopbar } from "@/components/organisms";

export default function StudentDashboardPage() {
    return (
        <>
            <DashboardTopbar title="Student Dashboard" />
            <main className="p-8">
                <Heading as="h1">Student Dashboard</Heading>
                <Text>Sesion autenticada correctamente.</Text>
            </main>
        </>
    );
}
