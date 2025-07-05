import { Tag } from "antd";
import { EMPLOYMENT_TYPE_COLORS } from "../components/canvas/utils/constants.tsx";

export const EmployeeTypeTag = ({ type }: { type: string }) => {
  if (!type) return null;
  return <Tag color={EMPLOYMENT_TYPE_COLORS[type]}>
    {type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")}
  </Tag>;
};