import { Heading, Text } from "@/components/atoms";

export default function AdminDashboardPage() {
    return (
        <main className="p-8">
            <Heading as="h1">Admin Dashboard</Heading>
            <Text>
                Sesion autenticada correctamente.
            </Text>
        </main>
    );
}
