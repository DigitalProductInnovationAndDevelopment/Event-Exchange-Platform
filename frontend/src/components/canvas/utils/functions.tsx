import type { Chair } from "components/canvas/elements/Chair.tsx";

export function areNeighbours(sourceChair: Chair, targetChair: Chair): boolean {
  const dx = sourceChair.x - targetChair.x;
  const dy = sourceChair.y - targetChair.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const threshold = 7 * (sourceChair.radius + targetChair.radius);
  return distance <= threshold;
}

