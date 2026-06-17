import { Heading, Text } from "@/components/atoms";
import { DashboardTopbar } from "@/components/organisms";

export default function AdminDashboardPage() {
    return (
        <>
            <DashboardTopbar title="Admin Dashboard" />
            <main className="p-8">
                <Heading as="h1">Admin Dashboard</Heading>
                <Text>Sesion autenticada correctamente.</Text>
            </main>
        </>
    );
}
