import type { Table } from "./Table.tsx";
import type { Chair } from "components/canvas/elements/Chair.tsx";
import { Arrow, Group } from "react-konva";
import { areNeighbours } from "components/canvas/utils/functions.tsx";
import { setChairIdForManualAssignment } from "components/canvas/actions/actions.tsx";
import type { AppState } from "components/canvas/reducers/CanvasReducer.tsx";

interface NeighbourArrowsProps {
  state: AppState;
  dispatch: (action: { type: string; payload?: any; setSelectedIds?: any }) => void;
  table: Table;
  selectedChairId: string;
}

function NeighbourArrows({
                           state,
                           dispatch,
                           table,
                           selectedChairId,
                         }: NeighbourArrowsProps) {
  if (!table || !selectedChairId) return null;

  const chairs = state.elements.filter(
    (el) => el.type === "chair" && table.attachedChairs.includes(el.id),
  ) as Chair[];

  const selectedChair = chairs.find((chair) => chair.id === selectedChairId);
  if (!selectedChair) return null;

  if (!selectedChair.assigneeProfileId && (state.chairIdForManualAssignment === null || (state.chairIdForManualAssignment !== selectedChairId))) {
    dispatch(setChairIdForManualAssignment(selectedChair.id));
  } else if (selectedChair.assigneeProfileId && state.chairIdForManualAssignment !== null && state.chairIdForManualAssignment === selectedChairId) {
    dispatch(setChairIdForManualAssignment(null));
  }

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
