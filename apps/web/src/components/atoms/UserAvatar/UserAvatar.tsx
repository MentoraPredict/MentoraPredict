import Text from "@/components/atoms/Text";

interface UserAvatarProps {
  imageUrl?: string;
  firstName?: string;
  lastName?: string;
  alt?: string;
  className?: string;
}

function getInitials(firstName?: string, lastName?: string) {
  const firstInitial = firstName?.charAt(0) ?? "";
  const lastInitial = lastName?.charAt(0) ?? "";

  const initials = `${firstInitial}${lastInitial}`.trim();

  return initials || "U";
}

export default function UserAvatar({
  imageUrl,
  firstName,
  lastName,
  alt = "Foto de perfil",
  className = "",
}: UserAvatarProps) {
  return (
    <div
      className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                border
                border-gray-200
                bg-blue-100
                ${className}
            `}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <Text variant="small" className="font-semibold text-blue-700">
          {getInitials(firstName, lastName)}
        </Text>
      )}
    </div>
  );
}
