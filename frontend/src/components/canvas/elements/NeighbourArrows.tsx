import type { ElementProperties } from "../../../components/canvas/utils/constants.tsx";
import type { Table } from "./Table.tsx";
import type { Chair } from "components/canvas/elements/Chair.tsx";
import { Arrow, Group } from "react-konva";
import { areNeighbours } from "../../canvas/utils/functions.tsx";

interface NeighbourArrowsProps {
  state: { elements: ElementProperties[] };
  table: Table;
  selectedChairId: string;
}

function NeighbourArrows({
                           state,
                           table,
                           selectedChairId,
                         }: NeighbourArrowsProps) {
  if (!table || !selectedChairId) return null;

  const chairs = state.elements.filter(
    (el) => el.type === "chair" && table.attachedChairs.includes(el.id),
  ) as Chair[];

  const selectedChair = chairs.find((chair) => chair.id === selectedChairId);
  if (!selectedChair) return null;

  const arrows = chairs
    .filter((chair) => chair.id !== selectedChair.id)
    .filter((chair) => {
      return areNeighbours(selectedChair, chair);
    });

  return (
    <Group>
      {arrows.map((neighbor) => (
        <Arrow
          key={neighbor.id}
          points={[selectedChair.x, selectedChair.y, neighbor.x, neighbor.y]}
          stroke="red"
          fill="red"
          strokeWidth={2}
          pointerLength={10}
          pointerWidth={8}
        />
      ))}
    </Group>
  );
}

export default NeighbourArrows;
