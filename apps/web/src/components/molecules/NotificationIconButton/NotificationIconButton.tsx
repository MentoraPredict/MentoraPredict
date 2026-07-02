import { useState } from "react";
import { FiBell } from "react-icons/fi";

import IconButton from "@/components/atoms/IconButton";

interface NotificationIconButtonProps {
  hasUnread?: boolean;
}

export default function NotificationIconButton({
  hasUnread = true,
}: NotificationIconButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);

    window.setTimeout(() => {
      setIsPressed(false);
    }, 150);
  };

  return (
    <IconButton
      type="button"
      onClick={handleClick}
      className={`
                relative
                text-gray-600
                hover:text-blue-700
                ${isPressed ? "scale-90" : "scale-100"}
            `}
    >
      <FiBell size={18} />

      {hasUnread ? (
        <span
          className="
                        absolute
                        right-1
                        top-1
                        h-2
                        w-2
                        rounded-full
                        bg-red-500
                    "
        />
      ) : null}
    </IconButton>
  );
}
