import type { ReactNode } from "react";
import { FiImage } from "react-icons/fi";

interface CourseImagePlaceholderProps {
  imageUrl?: string;
  alt?: string;
  /** Insignia de estado superpuesta arriba-derecha de la portada (esquina
   * superior derecha, estilo tarjeta de laboratorio de SIGLA-Backend). */
  overlayBadge?: ReactNode;
}

export default function CourseImagePlaceholder({
  imageUrl,
  alt = "Imagen del curso",
  overlayBadge,
}: CourseImagePlaceholderProps) {
  return (
    <div
      className="
                relative
                flex
                h-40
                w-full
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-gray-100
            "
    >
      {imageUrl ? (
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <FiImage size={36} className="text-gray-300" />
      )}

      {overlayBadge ? (
        <div className="absolute right-2 top-2">{overlayBadge}</div>
      ) : null}
    </div>
  );
}
