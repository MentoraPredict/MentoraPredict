import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface StudentPerformanceUnavailableCardProps {
  title: string;
  description: string;
}

export default function StudentPerformanceUnavailableCard({
  title,
  description,
}: StudentPerformanceUnavailableCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Heading as="h5" className="text-gray-900">
        {title}
      </Heading>
      <Text variant="small" className="mt-3">
        {description}
      </Text>
    </section>
  );
}
