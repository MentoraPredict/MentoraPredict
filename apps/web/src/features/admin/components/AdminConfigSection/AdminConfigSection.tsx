import type { FormEvent, ReactNode } from "react";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface AdminConfigSectionProps {
  title: string;
  description: string;
  isSaving: boolean;
  isSaved: boolean;
  errorMessage?: string | null;
  onSubmit: () => void;
  children: ReactNode;
}

export default function AdminConfigSection({
  title,
  description,
  isSaving,
  isSaved,
  errorMessage,
  onSubmit,
  children,
}: AdminConfigSectionProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
    >
      <div>
        <Heading as="h5" className="text-gray-900">
          {title}
        </Heading>
        <Text variant="caption" className="mt-1 text-gray-600">
          {description}
        </Text>
      </div>

      {children}

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {errorMessage}
          </Text>
        </div>
      ) : null}

      {isSaved && !errorMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Text variant="small" className="font-medium text-emerald-700">
            Cambios guardados.
          </Text>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
