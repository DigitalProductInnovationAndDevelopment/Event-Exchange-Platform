import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "utils/antd.tsx";

const tooltipSteps = [
  {
    text: "Select multiple items: Hold \"<b>SHIFT</b>\" and drag your mouse.",
    icon: '⇧',
  },
  {
    text: "Delete selected items: Press \"<b>BACKSPACE</b>\".",
    icon: '⌫',
  },
  {
    text: "Deactivate Quick Wall: Press \"<b>ESC</b>\".",
    icon: "␛",
  },
  {
    text: "Duplicate selected items: Press \"<b>D</b>\".",
    icon: 'D',
  },
  {
    text: "Undo/Redo: Press \"<b>CTRL + Z</b>\" / \"<b>CTRL + SHIFT + Z</b>\".",
    icon: "↩️",
  },
];

export const CanvasTooltip = () => {
  return (
    <Tooltip
      className="ms-3 mt-2"
      title={
        <div style={{ minWidth: 500, padding: 4 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#1677ff', display: 'flex', alignItems: 'center' }}>
            <InfoCircleOutlined style={{ marginRight: 8, fontSize: 18 }} />
            Canvas Shortcuts
          </div>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {tooltipSteps.map((step, idx) => (
              <li key={idx} style={{ marginBottom: 6, display: 'flex', alignItems: 'center' }}>
                <span style={{
                  display: 'inline-block',
                  width: 22,
                  height: 22,
                  background: '#e6f7ff',
                  color: '#1677ff',
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '22px',
                  fontWeight: 700,
                  marginRight: 10,
                  fontSize: 13,
                  border: '1px solid #91d5ff',
                }}>{step.icon}</span>
                <span dangerouslySetInnerHTML={{ __html: step.text }} />
              </li>
            ))}
          </ul>
        </div>
      }
      placement="rightBottom"
      styles={{ body: { borderRadius: 12, boxShadow: "0 4px 24px #1677ff22", width: "500px" } }}>
      <InfoCircleOutlined style={{ fontSize: 28, cursor: "pointer", color: "#1677ff", filter: 'drop-shadow(0 2px 6px #1677ff44)' }} />
    </Tooltip>
  );
};
