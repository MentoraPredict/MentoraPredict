import { useMemo, useState } from "react";

import Text from "@/components/atoms/Text";
import SearchBar from "@/components/molecules/SearchBar";
import SelectedItemChip from "@/components/molecules/SelectedItemChip";

import type { AppUser } from "@/types/user/user.types";

interface StudentSelectorProps {
  students: AppUser[];
  selectedStudents: AppUser[];
  onSelectStudent: (student: AppUser) => void;
  onRemoveStudent: (studentId: string) => void;
}

export default function StudentSelector({
  students,
  selectedStudents,
  onSelectStudent,
  onRemoveStudent,
}: StudentSelectorProps) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  const selectedIds = useMemo(
    () => selectedStudents.map((student) => student.id),
    [selectedStudents],
  );

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return [];
    }

    return students.filter((student) => {
      const firstName = student.firstName?.toLowerCase() ?? "";
      const lastName = student.lastName?.toLowerCase() ?? "";
      const email = student.email.toLowerCase();

      return (
        !selectedIds.includes(student.id) &&
        student.role === "STUDENT" &&
        (firstName.includes(normalizedSearch) ||
          lastName.includes(normalizedSearch) ||
          email.includes(normalizedSearch))
      );
    });
  }, [search, selectedIds, students]);

  const handleClear = () => {
    setSearch("");
    setShowResults(false);
  };

  return (
    <div>
      <Text variant="caption" className="mb-2 font-semibold text-gray-700">
        Agregar Usuarios
      </Text>

      <SearchBar
        value={search}
        placeholder="Buscar usuarios"
        onChange={setSearch}
        onSearch={() => {
          setShowResults(true);
        }}
        onClear={handleClear}
      />

      {showResults && filteredStudents.length > 0 ? (
        <div
          className="
                        mt-3
                        max-h-40
                        overflow-y-auto
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                    "
        >
          {filteredStudents.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => {
                onSelectStudent(student);
                setSearch("");
                setShowResults(false);
              }}
              className="
                                flex
                                w-full
                                items-center
                                justify-between
                                px-4
                                py-3
                                text-left
                                transition
                                hover:bg-gray-50
                            "
            >
              <Text variant="small" className="font-medium text-gray-900">
                {[student.firstName, student.lastName]
                  .filter(Boolean)
                  .join(" ") || student.email}
              </Text>

              <Text variant="caption">{student.email}</Text>
            </button>
          ))}
        </div>
      ) : null}

      {showResults && search.trim() && filteredStudents.length === 0 ? (
        <Text variant="caption" className="mt-3">
          No se encontraron estudiantes.
        </Text>
      ) : null}

      {selectedStudents.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedStudents.map((student) => (
            <SelectedItemChip
              key={student.id}
              label={
                [student.firstName, student.lastName]
                  .filter(Boolean)
                  .join(" ") || student.email
              }
              onRemove={() => {
                onRemoveStudent(student.id);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
