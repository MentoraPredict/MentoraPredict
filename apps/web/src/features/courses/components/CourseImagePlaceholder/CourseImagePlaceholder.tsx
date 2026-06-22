import { FiImage } from "react-icons/fi";

interface CourseImagePlaceholderProps {
  imageUrl?: string;
  alt?: string;
}

export default function CourseImagePlaceholder({
  imageUrl,
  alt = "Imagen del curso",
}: CourseImagePlaceholderProps) {
  return (
    <div
      className="
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
    </div>
  );
}
