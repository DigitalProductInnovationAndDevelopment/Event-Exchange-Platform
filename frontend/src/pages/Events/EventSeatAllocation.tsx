import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Typography,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb';
import { useEffect, useState } from 'react';
import useApiService from '../../services/apiService';

const { Title } = Typography;

export const EventSeatAllocation = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const { getEventById } = useApiService();

  useEffect(() => {
    (async () => {
      if (eventId) {
        const event = await getEventById(eventId);
        if (event) {
          setEventName(event.name);
        }
      }
    })();
  }, [eventId, getEventById]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { path: '/events', label: 'Events' },
          { path: `/events/${eventId}`, label: eventName || 'Event' },
          { path: `/events/${eventId}/seat-allocation`, label: 'Manage Seat Allocation' },
        ]}
      />

      <div className="flex justify-between items-center">
        <Title level={2}>Manage Seat Allocation</Title>
        <Space>
          <Button onClick={() => navigate(`/events/${eventId}`)}>Back to Event</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card className="mb-6">
            {/* Placeholder for seat allocation management features */}
            <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="text-gray-400">Seat allocation management features coming soon...</span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 