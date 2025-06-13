import { Typography, Card, Descriptions, Tag, Button, Space, Row, Col, Statistic, Progress} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, FileTextOutlined, DollarOutlined, BarChartOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { mockEvents } from '../../mocks/eventData';
import type { Event } from '../../types/event';
import { EVENT_STATUS_COLORS, EVENT_TYPE_COLORS } from '../../types/event';

const { Title, Text } = Typography;

export const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    // Find event in mock data
    const foundEvent = mockEvents.find(e => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
    }
  }, [eventId]);

  if (!event) {
    return <div>Event not found</div>;
  }


  return (
    <div className="space-y-6">
      <Breadcrumb 
        items={[
          { path: '/events', label: 'Events' },
          { path: `/events/${eventId}`, label: event.name }
        ]} 
      />

      <div className="flex justify-between items-center">
        <Title level={2}>{event.name}</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/events/${eventId}/edit`)}
          >
            Edit Event
          </Button>
          <Button danger icon={<DeleteOutlined />}>
            Delete Event
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card className="mb-6">
            <Descriptions title="Event Information" bordered>
              <Descriptions.Item label="Event Name" span={3}>
                {event.name}
              </Descriptions.Item>
              <Descriptions.Item label="Date" span={3}>
                {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Descriptions.Item>
              <Descriptions.Item label="Location" span={3}>
                <Space>
                  <EnvironmentOutlined />
                  {event.location}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Type" span={3}>
                <Tag color={EVENT_TYPE_COLORS[event.type]}>
                  {event.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                {event.description}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Event Statistics" className="mb-6">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Participants"
                  value={event.participants}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Capacity"
                  value={event.capacity}
                  prefix={<TeamOutlined />}
                />
              </Col>

              <Col span={8}>
                <Statistic
                  title="Engagement"
                  value={event.engagement}
                  prefix={<BarChartOutlined />}
                  suffix="%"
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Event Status" className="mb-6">
            <div className="flex flex-col items-center space-y-4">
              <Tag color={EVENT_STATUS_COLORS[event.status]} className="text-lg px-4 py-2">
                {event.status.toUpperCase()}
              </Tag>
              <Text type="secondary">
                {event.status === 'upcoming' && 'This event is scheduled for the future'}
                {event.status === 'ongoing' && 'This event is currently in progress'}
                {event.status === 'completed' && 'This event has been completed'}
              </Text>
            </div>
          </Card>

          <Card title="Management Actions">
            <Space direction="vertical" className="w-full">
              <Button block icon={<UserAddOutlined />}>
                Manage Participants
              </Button>
              <Button block icon={<FileTextOutlined />}>
                Generate Reports
              </Button>
              <Button block>
                Export Event Data
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 