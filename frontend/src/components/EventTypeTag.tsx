import { Tag } from "utils/antd.tsx";
import { EVENT_TYPE_COLORS, type EventType } from "../types/event.ts";

export const EventTypeTag = ({ type }: { type: EventType }) => {
  if (!type) return null;

  return (
    <Tag color={EVENT_TYPE_COLORS[type]}>
      {type
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")}
    </Tag>
  );
};
