import { FiFileText, FiUpload, FiX } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type { CourseUploadedFile } from "@/types/course";

interface CourseFilesUploadPanelProps {
  files: CourseUploadedFile[];
  onAddFile: (fileName: string) => void;
  onRemoveFile: (fileId: string) => void;
}

export default function CourseFilesUploadPanel({
  files,
  onAddFile,
  onRemoveFile,
}: CourseFilesUploadPanelProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onAddFile(file.name);

    event.target.value = "";
  };

  return (
    <section
      className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
            "
    >
      <Heading as="h5" className="text-gray-900">
        Calificaciones y Asistencia
      </Heading>

      <div
        className="
                    mt-5
                    rounded-2xl
                    border
                    border-dashed
                    border-gray-300
                    bg-gray-50
                    p-5
                "
      >
        <div className="space-y-3">
          {files.length > 0 ? (
            files.map((file) => (
              <div
                key={file.id}
                className="
                                    flex
                                    items-center
                                    justify-between
                                    rounded-xl
                                    bg-white
                                    px-4
                                    py-3
                                "
              >
                <div className="flex items-center gap-3">
                  <FiFileText className="text-blue-700" />

                  <Text variant="small" className="font-medium text-gray-700">
                    {file.name}
                  </Text>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onRemoveFile(file.id);
                  }}
                  className="
                                        text-red-600
                                        transition
                                        hover:text-red-800
                                    "
                >
                  <FiX size={18} />
                </button>
              </div>
            ))
          ) : (
            <Text variant="small" className="text-center">
              Todavía no has subido archivos.
            </Text>
          )}
        </div>

        <div className="mt-5 flex justify-center">
          <label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            <span>
              <Button
                type="button"
                variant="outline"
                className="pointer-events-none gap-2 px-4 py-2 text-sm"
              >
                <FiUpload />
                Subir archivo
              </Button>
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
