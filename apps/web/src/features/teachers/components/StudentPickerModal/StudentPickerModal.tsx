import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Text from "@/components/atoms/Text";
import Modal from "@/components/molecules/Modal";
import Pagination from "@/components/molecules/Pagination";
import usePagination from "@/hooks/usePagination";

import type { CourseEnrolledStudent } from "@/types/course";

interface StudentPickerModalProps {
  isOpen: boolean;
  students: CourseEnrolledStudent[];
  /** Id del estudiante elegido; vacío = todos. */
  selectedId: string;
  onSelect: (studentId: string) => void;
  onClose: () => void;
}

const STUDENTS_PER_PAGE = 8;

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const fullName = (student: CourseEnrolledStudent) =>
  [student.user.lastName, student.user.firstName].filter(Boolean).join(" ") ||
  student.user.email;

/** Tabla con búsqueda para elegir un estudiante sin cargar una lista larga. */
export default function StudentPickerModal({
  isOpen,
  students,
  selectedId,
  onSelect,
  onClose,
}: StudentPickerModalProps) {
  const [search, setSearch] = useState("");

  const visibleStudents = useMemo(() => {
    const terms = normalize(search).split(/\s+/).filter(Boolean);

    return students.filter((student) => {
      const haystack = normalize(`${fullName(student)} ${student.user.email}`);
      return terms.every((term) => haystack.includes(term));
    });
  }, [students, search]);

  const {
    currentPage,
    paginatedItems,
    totalItems,
    totalPages,
    setCurrentPage,
  } = usePagination(visibleStudents, STUDENTS_PER_PAGE, search);

  const choose = (studentId: string) => {
    onSelect(studentId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Elegir estudiante">
      <Heading as="h4" className="text-gray-900">
        Estudiantes
      </Heading>
      <Text variant="small" className="mt-1 text-gray-600">
        Elige un estudiante para ver solo su progreso, o todo el curso.
      </Text>

      <div className="relative mt-4">
        <FiSearch
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          value={search}
          placeholder="Buscar por nombre, apellido o correo"
          aria-label="Buscar estudiantes"
          onChange={(event) => setSearch(event.target.value)}
          className="pl-11"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Estudiante</th>
              <th className="px-4 py-3 text-center font-medium">Promedio</th>
              <th className="px-4 py-3 text-center font-medium">Asistencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr
              tabIndex={0}
              onClick={() => choose("")}
              onKeyDown={(event) => event.key === "Enter" && choose("")}
              className={`cursor-pointer transition hover:bg-blue-50/50 ${
                selectedId === "" ? "bg-blue-50" : ""
              }`}
            >
              <td className="px-4 py-2.5 font-semibold text-gray-900" colSpan={3}>
                Todos los estudiantes ({students.length})
              </td>
            </tr>

            {paginatedItems.map((student) => (
              <tr
                key={student.id}
                tabIndex={0}
                onClick={() => choose(student.user.id)}
                onKeyDown={(event) =>
                  event.key === "Enter" && choose(student.user.id)
                }
                className={`cursor-pointer transition hover:bg-blue-50/50 ${
                  selectedId === student.user.id ? "bg-blue-50" : ""
                }`}
              >
                <td className="px-4 py-2.5">
                  <span className="font-medium text-gray-900">
                    {fullName(student)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center text-gray-700">
                  {student.average === null ? "-" : `${student.average}/10`}
                </td>
                <td className="px-4 py-2.5 text-center text-gray-700">
                  {student.attendance === null ? "-" : `${student.attendance}%`}
                </td>
              </tr>
            ))}

            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-600">
                  Ningún estudiante coincide con la búsqueda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <Pagination
          currentPage={currentPage}
          pageSize={STUDENTS_PER_PAGE}
          totalItems={totalItems}
          totalPages={totalPages}
          itemLabel="estudiantes"
          onPageChange={setCurrentPage}
        />
      ) : null}
    </Modal>
  );
}