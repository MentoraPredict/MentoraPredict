import { useMemo, useState } from "react";

import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import SearchBar from "@/components/molecules/SearchBar";

import AdminUsersTable from "@/features/admin/components/AdminUsersTable";
import type { AppUser } from "@/types/user/user.types";

const mockUsers: AppUser[] = [
  {
    id: "1",
    firstName: "Franco",
    lastName: "Paredes",
    email: "franco.paredes@uce.edu.ec",
    role: "STUDENT",
    isActive: true,
  },
  {
    id: "2",
    firstName: "María",
    lastName: "Gómez",
    email: "maria.gomez@uce.edu.ec",
    role: "TEACHER",
    isActive: true,
  },
  {
    id: "3",
    firstName: "Carlos",
    lastName: "Mendoza",
    email: "carlos.mendoza@uce.edu.ec",
    role: "STUDENT",
    isActive: false,
  },
  {
    id: "4",
    firstName: "Admin",
    lastName: "Académico",
    email: "admin@uce.edu.ec",
    role: "ADMIN",
    isActive: true,
  },
];

export default function AdminUsersManagement() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AppUser[]>(mockUsers);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      const firstName = user.firstName?.toLowerCase() ?? "";
      const lastName = user.lastName?.toLowerCase() ?? "";
      const email = user.email.toLowerCase();

      return (
        firstName.includes(normalizedSearch) ||
        lastName.includes(normalizedSearch) ||
        email.includes(normalizedSearch)
      );
    });
  }, [search, users]);

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleToggleStatus = (userId: string) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              isActive: !user.isActive,
            }
          : user,
      ),
    );
  };

  const handleToggleTeacherRole = (userId: string) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) => {
        if (user.id !== userId || user.role === "ADMIN") {
          return user;
        }

        return {
          ...user,
          role: user.role === "STUDENT" ? "TEACHER" : "STUDENT",
        };
      }),
    );
  };

  return (
    <section className="py-8">
      <Container>
        <div className="mb-6">
          <Heading as="h3" className="text-gray-900">
            Gestión de usuarios
          </Heading>

          <Text variant="small" className="mt-2 max-w-2xl">
            Visualiza usuarios registrados, administra su estado de cuenta y
            asigna o remueve el rol de docente.
          </Text>
        </div>

        <div
          className="
                        rounded-t-2xl
                        border
                        border-gray-200
                        bg-white
                        p-5
                    "
        >
          <Text
            variant="caption"
            className="
                            mb-3
                            font-semibold
                            uppercase
                            tracking-[0.2em]
                            text-gray-600
                        "
          >
            Buscar usuarios
          </Text>

          <SearchBar
            value={search}
            placeholder="Buscar por nombres, apellidos o correo"
            onChange={setSearch}
            onClear={handleClearSearch}
            onSearch={() => {}}
          />
        </div>

        <AdminUsersTable
          users={filteredUsers}
          onToggleStatus={handleToggleStatus}
          onToggleTeacherRole={handleToggleTeacherRole}
        />
      </Container>
    </section>
  );
}
