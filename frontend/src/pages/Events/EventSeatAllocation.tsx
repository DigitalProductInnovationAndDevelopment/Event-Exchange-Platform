import React, { useEffect, useState } from "react";
import { Avatar, Button, Card, Col, List, message, Row, Space, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import useApiService from "../../services/apiService";
import { CanvasProvider, useCanvas } from "../../components/canvas/contexts/CanvasContext";
import KonvaCanvas from "../../components/canvas/KonvaCanvas";
import type { ParticipationDetails } from "types/employee";
import type { AppState } from "components/canvas/reducers/CanvasReducer";
import type { ElementProperties } from "components/canvas/utils/constants.tsx";
import type { Chair } from "components/canvas/elements/Chair.tsx";
import type { Table } from "components/canvas/elements/Table.tsx";

import { CanvasTooltip } from "../../components/CanvasTooltip.tsx";
import { areNeighbours } from "../../components/canvas/utils/functions.tsx";

const { Title } = Typography;


// Main content component for seat allocation
const SeatAllocationContent = ({
                                 eventId,
                                 eventName,
                                 schematicsState,
                                 participants,
                                 schematicsId,
                               }: {
  eventId: string,
  eventName: string,
  schematicsState: AppState,
  participants: ParticipationDetails[],
  schematicsId: string
}) => {
  const navigate = useNavigate();
  const { state, dispatch } = useCanvas();
  const [loading, setLoading] = useState(false);
  const [unallocated, setUnallocated] = useState<ParticipationDetails[]>([]);
  const { updateSchematics } = useApiService();

  // Calculate unallocated employees based on current seat assignment
  useEffect(() => {
    if (!participants || !state) return;
    const allocatedIds = new Set(
        state.elements
            ?.filter((e: any) => e.type === "chair" && e.employeeId)
            .map((e: any) => e.employeeId),
    );
    setUnallocated(participants.filter(p => !allocatedIds.has(p.employeeId)));
  }, [participants, state]);

  const generateChairNeighborMap = () => {
    const tables: Table[] = (state.elements.filter((el: ElementProperties) => el.type === "circleTable" || el.type === "rectTable") as Table[]);
    const chairs: Chair[] = (state.elements.filter((el: ElementProperties) => el.type === "chair") as Chair[]);

    const chairMap = new Map<string, Chair>();
    chairs.forEach((chair: Chair) => {
      chairMap.set(chair.id, chair);
    });

    const neighborMap: Record<string, Record<string, string[]>> = {};

    tables.forEach((table: Table) => {
      const attachedChairIds = table.attachedChairs || [];

      const neighbors: Record<string, string[]> = {};

      for (let i = 0; i < attachedChairIds.length; i++) {
        const chairA = chairMap.get(attachedChairIds[i]);
        if (!chairA) continue;

        neighbors[chairA.id] = [];

        for (let j = 0; j < attachedChairIds.length; j++) {
          if (i === j) continue;

          const chairB = chairMap.get(attachedChairIds[j]);
          if (!chairB) continue;
          if (areNeighbours(chairA, chairB)) {
            neighbors[chairA.id].push(chairB.id);
          }
        }
      }

      neighborMap[table.id] = neighbors;
    });

    console.log("Chair Neighbors:", neighborMap);
    return neighborMap;
  };


  // Generate initial seat allocation: assign unallocated employees to empty chairs
  const handleGenerate = () => {
    if (!state || !participants) return;
    console.log(generateChairNeighborMap());
  };

  // Save the current seat allocation to the backend
  const handleSave = async () => {
    if (!schematicsState || !state) return;
    setLoading(true);
    await updateSchematics(schematicsId, state, null as any);
    setLoading(false);
    message.success("Allocation saved!");
  };

  return (
    <div className="space-y-2">
      {/* Breadcrumb navigation */}
      <Breadcrumb
        items={[
          { path: "/events", label: "Events" },
          { path: `/events/${eventId}`, label: eventName || "Event" },
          { path: `/events/${eventId}/seat-allocation`, label: "Manage Seat Allocation" },
        ]}
      />
      {/* Page title and action buttons */}
      <div className="flex justify-between items-center">
        <div className="flex flex-row">
          <Title level={2}>Seat Allocation</Title>
          <CanvasTooltip />
        </div>

        <Space>
          {/* Generate button on the left */}
          <Button type="primary" onClick={handleGenerate} disabled={loading}>
            Generate
          </Button>
          {/* Save button in the middle */}
          <Button type="primary" onClick={handleSave} loading={loading}>
            Save
          </Button>
          {/* Back to Event button on the right */}
          <Button onClick={() => navigate(`/events/${eventId}`)}>Back to Event</Button>
        </Space>
      </div>
      {/* Main content: seat map and unallocated employees list */}
      <Row gutter={16}>
        <Col span={18}>
          <Card className="mb-6">
            <div style={{ height: "600px", overflow: "hidden" }}>
              <KonvaCanvas />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Unallocated Employees" className="mb-6">
            {/* List of employees who are not yet assigned to any seat */}
            <List
              dataSource={unallocated}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{item.fullName?.[0]}</Avatar>}
                    title={item.fullName}
                    description={item.email}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Main page component: fetches data and provides context
export const EventSeatAllocation = () => {
  const { eventId } = useParams();
  const { getEventById, getEventParticipants, getSchematics } = useApiService();
  const [eventName, setEventName] = useState("");
  const [participants, setParticipants] = useState<ParticipationDetails[]>([]);
  const [schematics, setSchematics] = useState<AppState | null>(null);
  const [schematicsId, setSchematicsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch event info, participants, and seat map on mount
  useEffect(() => {
    (async () => {
      if (!eventId) return;
      setLoading(true);
      const event = await getEventById(eventId);
      if (event) setEventName(event.name);
      const parts = await getEventParticipants(eventId);
      setParticipants(parts || []);
      if (event?.schematics?.id) {
        const sch = await getSchematics(event.schematics.id);
        setSchematics(sch || null);
        setSchematicsId(event.schematics.id || null);
      }
      setLoading(false);
    })();
  }, [eventId, getEventById, getEventParticipants, getSchematics]);

  if (!eventId || !schematics) return <div>Loading...</div>;

  return (
    <CanvasProvider initialState={schematics}>
      <SeatAllocationContent
        eventId={eventId}
        eventName={eventName}
        schematicsId={schematicsId!}
        schematicsState={schematics}
        participants={participants}
      />
    </CanvasProvider>
  );
};
