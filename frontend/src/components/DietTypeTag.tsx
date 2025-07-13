import { Tag } from "antd";
import { DIET_TYPE_COLORS } from "components/canvas/utils/constants.tsx";

export const DietTypeTag = ({ type }: { type: string }) => {
  if (!type) return null;
  return (
    <Tag color={DIET_TYPE_COLORS[type]}>
      {type
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")}
    </Tag>
  );
};
