import { useEffect, useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Modal from "@/components/molecules/Modal";
import Pagination from "@/components/molecules/Pagination";
import SearchBar from "@/components/molecules/SearchBar";

import AdminStudentRecord from "@/features/admin/components/AdminStudentRecord";
import { getUsers } from "@/services/users/users.service";
import type { AppUser } from "@/types/user/user.types";

const PAGE_SIZE = 15;

function displayName(user: AppUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email;
}

export default function AdminStudentsManagement() {
  const [students, setStudents] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AppUser | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getUsers({ role: "STUDENT", search, page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;

        setStudents(result.data);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar la lista de estudiantes.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Heading as="h3" className="text-gray-900">
          Estudiantes
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          Completa la ficha de cada estudiante, vincula a sus representantes y
          revisa los consentimientos otorgados.
        </Text>
      </div>

      <div className="mb-4">
        <SearchBar
          value={search}
          placeholder="Buscar por nombres, apellidos o correo"
          onChange={setSearch}
          onClear={() => setSearch("")}
          onSearch={() => {}}
        />
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <Text variant="small">Cargando...</Text>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3"
              >
                <div className="min-w-[12rem] flex-1">
                  <Text variant="small" className="font-medium text-gray-900">
                    {displayName(student)}
                  </Text>
                  <Text variant="caption" className="text-gray-500">
                    {student.email}
                  </Text>
                </div>
                <Badge tone={student.isActive ? "green" : "neutral"}>
                  {student.isActive ? "Activo" : "Inactivo"}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  className="px-4 py-2 text-sm"
                  onClick={() => setSelected(student)}
                >
                  Ver ficha
                </Button>
              </div>
            ))}

            {students.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Text variant="small" className="text-gray-600">
                  No se encontraron estudiantes.
                </Text>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={PAGE_SIZE}
          itemLabel="estudiantes"
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        ariaLabel="Ficha del estudiante"
      >
        {selected ? (
          <AdminStudentRecord
            studentId={selected.id}
            studentName={displayName(selected)}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </Modal>
    </Container>
  );
}
