import { Tag } from "antd";
import { EVENT_STATUS_COLORS, type EventStatus } from "../types/event.ts";

export type EventStatusTagSize = "big" | "small";

export const EventStatusTag = ({
  status,
  size,
}: {
  status: EventStatus;
  size?: EventStatusTagSize;
}) => {
  if (!status) return null;

  return (
    <Tag className={`${size === "big" ? "text-lg" : ""}`} color={EVENT_STATUS_COLORS[status]}>
      {status
        ?.split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")}
    </Tag>
  );
};
