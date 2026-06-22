import { useRef } from "react";
import { FiImage } from "react-icons/fi";

import Text from "@/components/atoms/Text";

interface ImageUploadPreviewProps {
  imageUrl?: string;
  alt?: string;
  helperText?: string;
  onChangeImage: (file: File) => void;
}

export default function ImageUploadPreview({
  imageUrl,
  alt = "Imagen",
  helperText = "Cambiar imagen",
  onChangeImage,
}: ImageUploadPreviewProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onChangeImage(file);

    event.target.value = "";
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleOpenFilePicker}
        className="
                    flex
                    h-40
                    w-40
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-dashed
                    border-gray-300
                    bg-gray-100
                    transition
                    hover:border-blue-700
                    hover:bg-blue-50
                "
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <FiImage size={34} className="text-gray-400" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <button type="button" onClick={handleOpenFilePicker} className="mt-2">
        <Text variant="caption" className="font-semibold text-blue-700">
          {helperText}
        </Text>
      </button>
    </div>
  );
}
