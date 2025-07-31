import type { Table } from "./Table.tsx";
import type { Chair } from "components/canvas/elements/Chair.tsx";
import { Arrow, Group } from "react-konva";
import { areNeighbours } from "components/canvas/utils/functions.tsx";
import type { AppState } from "components/canvas/reducers/CanvasReducer.tsx";
import type { AlgorithmType } from "components/canvas/utils/constants.tsx";

interface NeighbourArrowsProps {
  state: AppState;
  table: Table;
  selectedChairId: string;
  algorithmType: AlgorithmType;
}

function NeighbourArrows({
                           state,
                           table,
                           selectedChairId,
                           algorithmType,
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
      if (algorithmType === "table") {
        return selectedChair.attachedTo === chair.attachedTo;
      } else if (algorithmType === "distance") {
        return areNeighbours(selectedChair, chair);
      } else {
        return false;
      }
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
