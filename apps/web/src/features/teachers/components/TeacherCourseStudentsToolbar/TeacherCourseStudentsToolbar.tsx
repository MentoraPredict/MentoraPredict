import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import SearchBar from "@/components/molecules/SearchBar";
import SelectedItemChip from "@/components/molecules/SelectedItemChip";

import type { AppUser } from "@/types/user/user.types";

interface TeacherCourseStudentsToolbarProps {
  search: string;
  selectedStudents: AppUser[];
  searchResults: AppUser[];
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  onSelectStudent: (student: AppUser) => void;
  onRemoveSelectedStudent: (studentId: string) => void;
  onAddStudents: () => void;
  isLoadingStudents?: boolean;
  isAddingStudents?: boolean;
}

export default function TeacherCourseStudentsToolbar({
  search,
  selectedStudents,
  searchResults,
  onSearchChange,
  onSearch,
  onClear,
  onSelectStudent,
  onRemoveSelectedStudent,
  onAddStudents,
  isLoadingStudents = false,
  isAddingStudents = false,
}: TeacherCourseStudentsToolbarProps) {
  return (
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
        Agregar usuarios
      </Text>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex-1">
          <SearchBar
            value={search}
            placeholder="Buscar estudiantes por nombre, apellido o correo"
            onChange={onSearchChange}
            onSearch={onSearch}
            onClear={onClear}
          />
        </div>

        <Button
          type="button"
          onClick={onAddStudents}
          disabled={selectedStudents.length === 0 || isAddingStudents}
          className={
            selectedStudents.length === 0 || isAddingStudents
              ? "cursor-not-allowed opacity-60 lg:min-w-28"
              : "lg:min-w-28"
          }
        >
          {isAddingStudents ? "Agregando..." : "Agregar"}
        </Button>
      </div>

      {isLoadingStudents ? (
        <Text variant="caption" className="mt-4 block text-gray-500">
          Cargando estudiantes disponibles...
        </Text>
      ) : searchResults.length > 0 ? (
        <div
          className="
                        mt-4
                        max-h-44
                        overflow-y-auto
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                    "
        >
          {searchResults.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => {
                onSelectStudent(student);
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
                onRemoveSelectedStudent(student.id);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
