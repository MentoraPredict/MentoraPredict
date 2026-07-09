import { type MouseEvent, useState } from "react";
import { FiBell } from "react-icons/fi";

import IconButton from "@/components/atoms/IconButton";

const MAX_DISPLAY_COUNT = 99;

interface NotificationIconButtonProps {
  count?: number;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export default function NotificationIconButton({
  count = 0,
  onClick,
}: NotificationIconButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    onClick?.(event);

    window.setTimeout(() => {
      setIsPressed(false);
    }, 150);
  };

  const hasUnread = count > 0;
  const displayCount =
    count > MAX_DISPLAY_COUNT ? `${MAX_DISPLAY_COUNT}+` : String(count);

  return (
    <IconButton
      type="button"
      onClick={handleClick}
      aria-label={
        hasUnread
          ? `Notificaciones, ${count} sin leer`
          : "Notificaciones"
      }
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
                        -right-1
                        -top-1
                        flex
                        h-4
                        min-w-4
                        items-center
                        justify-center
                        rounded-full
                        bg-red-500
                        px-1
                        text-[10px]
                        font-bold
                        leading-none
                        text-white
                    "
        >
          {displayCount}
        </span>
      ) : null}
    </IconButton>
  );
}
