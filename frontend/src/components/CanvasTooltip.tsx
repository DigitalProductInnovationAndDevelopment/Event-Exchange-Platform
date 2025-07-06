import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

export const CanvasTooltip = () => {
  return (
    <Tooltip
      className="ms-3 mt-2"
      title={
        <div className="whitespace-pre-line">
          1. In order to select multiple items, press and hold on "SHIFT" and drag your mouse over the desired
          items.{"\n"}
          2. In order to delete selected items press "BACKSPACE".{"\n"}
          3. In order to deactivate Quick Wall feature press "ESC".{"\n"}
          4. You can duplicate selected items by pressing "D".{"\n"}
          5. You can redo and undo your actions by pressing CTRL + Z / CTRL + SHIFT + Z.
        </div>
      }
      placement="rightBottom"
    >
      <InfoCircleOutlined style={{ fontSize: 24, cursor: "pointer", color: "#1890ff" }} />
    </Tooltip>
  );
};


