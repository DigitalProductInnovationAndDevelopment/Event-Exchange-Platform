import { Group, Rect, Text } from "react-konva";

export type SelectionRectangleProps = {
  visible: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function SelectionRectangle({
  selectionRectangle,
}: {
  selectionRectangle: SelectionRectangleProps;
}) {
  return (
    <Group>
      <Rect
        x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
        y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
        width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
        height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
        fill="rgba(0,0,255,0.5)"
      />
      <Text
        text={`start: ${selectionRectangle.x1.toFixed(2)}:${selectionRectangle.y1.toFixed(2)}\nend: ${selectionRectangle.x2.toFixed(2)}:${selectionRectangle.y2.toFixed(2)}`}
        x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
        y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
        width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
        height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
        fill="white"
        fontSize={12}
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
}

export default SelectionRectangle;
