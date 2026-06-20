import { ReactNode } from "react";

interface CreateCourseModalProps {
  isOpen: boolean;
  children: ReactNode;
}

export default function CreateCourseModal({
  isOpen,
  children,
}: CreateCourseModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/30
                px-4
                py-8
            "
    >
      <div
        className="
                    max-h-[90vh]
                    w-full
                    max-w-3xl
                    overflow-y-auto
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    p-6
                    shadow-lg
                "
      >
        {children}
      </div>
    </div>
  );
}
