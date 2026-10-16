import { FiBookOpen } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import type { ChatResource } from "@/features/aiChat/types";

interface AiChatResourcesPanelProps {
  resources: ChatResource[];
}

export default function AiChatResourcesPanel({ resources }: AiChatResourcesPanelProps) {
  if (resources.length === 0) return null;

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <FiBookOpen size={16} className="text-blue-700" />
        <Heading as="h6" className="text-gray-900">
          Recursos relacionados
        </Heading>
      </div>

      <div className="space-y-2">
        {resources.map((resource) => (
          <div key={resource.id} className="rounded-xl bg-gray-50 p-3">
            <Text variant="small" className="font-medium text-gray-800">
              {resource.title}
            </Text>
            <Text variant="caption" className="mt-0.5 text-gray-500">
              {resource.description}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
