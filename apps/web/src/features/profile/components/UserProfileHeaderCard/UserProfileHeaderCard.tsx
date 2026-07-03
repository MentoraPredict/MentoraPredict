import { useEffect, useState } from "react";

import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";
import ImageUploadPreview from "@/components/molecules/ImageUploadPreview";

interface UserProfileHeaderCardProps {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  onChangeImage?: (file: File) => void;
  resetToken?: number;
}

export default function UserProfileHeaderCard({
  firstName,
  lastName,
  imageUrl,
  onChangeImage,
  resetToken = 0,
}: UserProfileHeaderCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(imageUrl);

  useEffect(() => {
    setPreviewUrl(imageUrl);
  }, [imageUrl, resetToken]);

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const handleChangeImage = (file: File) => {
    const nextPreviewUrl = URL.createObjectURL(file);

    setPreviewUrl(nextPreviewUrl);
    onChangeImage?.(file);
  };

  return (
    <MotionCard
      as="section"
      className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
            "
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <ImageUploadPreview
          imageUrl={previewUrl}
          alt="Foto de perfil"
          helperText="¿Cambiar foto de perfil?"
          onChangeImage={handleChangeImage}
        />

        <div>
          <Heading as="h3" className="max-w-xl text-gray-900">
            {fullName || "Usuario"}
          </Heading>

          <Text variant="caption" className="mt-2 font-semibold text-blue-700">
            Solo puedes cambiar tu foto de perfil.
          </Text>
        </div>
      </div>
    </MotionCard>
  );
}
