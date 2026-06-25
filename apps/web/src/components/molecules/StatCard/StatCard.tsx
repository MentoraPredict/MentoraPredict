import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface StatCardProps {
  value: string;
  label: string;
}

export default function StatCard({ value, label }: StatCardProps) {
  return (
    <div
      className="
        rounded-2xl
        bg-white
        p-6
        shadow-md
      "
    >
      <Heading as="h3" className="text-blue-700">
        {value}
      </Heading>

      <Text>{label}</Text>
    </div>
  );
}
