import Text from "@/components/atoms/Text";

interface UserWelcomeMessageProps {
  firstName?: string;
  lastName?: string;
}

export default function UserWelcomeMessage({
  firstName,
  lastName,
}: UserWelcomeMessageProps) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <Text variant="small" className="font-medium text-gray-700">
      Bienvenido{fullName ? `, ${fullName}` : ""}
    </Text>
  );
}
