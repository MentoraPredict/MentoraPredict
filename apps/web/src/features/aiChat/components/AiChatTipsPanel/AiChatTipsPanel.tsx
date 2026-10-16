import { FiZap } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import type { ChatTip } from "@/features/aiChat/types";

interface AiChatTipsPanelProps {
  tips: ChatTip[];
}

export default function AiChatTipsPanel({ tips }: AiChatTipsPanelProps) {
  if (tips.length === 0) return null;

  return (
    <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
      <div className="flex items-center gap-2">
        <FiZap size={16} className="text-amber-600" />
        <Heading as="h6" className="text-amber-900">
          Consejos de estudio
        </Heading>
      </div>

      <ul className="space-y-2">
        {tips.map((tip) => (
          <li key={tip.id} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            <Text variant="small" className="text-amber-900">
              {tip.text}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}
