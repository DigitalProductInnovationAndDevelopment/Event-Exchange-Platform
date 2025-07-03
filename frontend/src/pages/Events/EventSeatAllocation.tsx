import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Typography,
  List,
  Avatar,
  message,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb';
import useApiService from '../../services/apiService';
import { CanvasProvider, useCanvas } from '../../components/canvas/contexts/CanvasContext';
import KonvaCanvas from '../../components/canvas/KonvaCanvas';
import type { ParticipationDetails } from 'types/employee';
import type { AppState } from 'components/canvas/reducers/CanvasReducer';
import { setState } from '../../components/canvas/actions/actions';

const { Title } = Typography;

type SchematicsType = { id: string; name: string; state: AppState } | null;

// Main content component for seat allocation
const SeatAllocationContent = ({ eventId, eventName, schematics, participants }: {
  eventId: string;
  eventName: string;
  schematics: SchematicsType;
  participants: ParticipationDetails[];
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
      state.elements?.filter((e: any) => e.type === 'chair' && e.employeeId).map((e: any) => e.employeeId)
    );
    setUnallocated(participants.filter(p => !allocatedIds.has(p.employeeId)));
  }, [participants, state]);

  // Generate initial seat allocation: assign unallocated employees to empty chairs
  const handleGenerate = () => {
    if (!state || !participants) return;
    const newElements = state.elements.map((el: any) => {
      if (el.type === 'chair') {
        if (!el.employeeId) {
          const next = participants.find(p => {
            return !state.elements.some((e: any) => e.type === 'chair' && e.employeeId === p.employeeId);
          });
          if (next) {
            return { ...el, employeeId: next.employeeId };
          }
        }
      }
      return el;
    });
    dispatch(setState({ ...state, elements: newElements }));
    message.success('Initial allocation generated. You can drag and adjust!');
  };

  // Save the current seat allocation to the backend
  const handleSave = async () => {
    if (!schematics || !state) return;
    setLoading(true);
    await updateSchematics(schematics.id, state, null as any);
    setLoading(false);
    message.success('Allocation saved!');
  };

  return (
    <div className="space-y-2">
      {/* Breadcrumb navigation */}
      <Breadcrumb
        items={[
          { path: '/events', label: 'Events' },
          { path: `/events/${eventId}`, label: eventName || 'Event' },
          { path: `/events/${eventId}/seat-allocation`, label: 'Manage Seat Allocation' },
        ]}
      />
      {/* Page title and action buttons */}
      <div className="flex justify-between items-center">
        <Title level={2}>Seat Allocation</Title>
        <Space>
          {/* Generate button on the left */}
          <Button type="primary" onClick={handleGenerate} disabled={loading}>Generate</Button>
          {/* Save button in the middle */}
          <Button type="primary" onClick={handleSave} loading={loading}>Save</Button>
          {/* Back to Event button on the right */}
          <Button onClick={() => navigate(`/events/${eventId}`)}>Back to Event</Button>
        </Space>
      </div>
      {/* Main content: seat map and unallocated employees list */}
      <Row gutter={16}>
        <Col span={18}>
        <Card className="mb-6">
            <div style={{ height: '600px', overflow: 'hidden' }}>
              <CanvasProvider initialState={schematics.state}>
                <KonvaCanvas />
              </CanvasProvider>
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
  const [eventName, setEventName] = useState('');
  const [participants, setParticipants] = useState<ParticipationDetails[]>([]);
  const [schematics, setSchematics] = useState<SchematicsType>(null);
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
      }
      setLoading(false);
    })();
  }, [eventId, getEventById, getEventParticipants, getSchematics]);

  if (!eventId || !schematics) return <div>Loading...</div>;

  return (
    <CanvasProvider initialState={schematics.state}>
      <SeatAllocationContent
        eventId={eventId}
        eventName={eventName}
        schematics={schematics}
        participants={participants}
      />
    </CanvasProvider>
  );
}; 