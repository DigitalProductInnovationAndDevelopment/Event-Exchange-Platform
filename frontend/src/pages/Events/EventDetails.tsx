import { Typography, Card, Descriptions, Tag, Button, Space, Row, Col, Statistic } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, FileTextOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Title, Text } = Typography;

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  participants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  organizer: string;
  capacity: number;
}

export const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    // Mock data - replace with actual API call
    setEvent({
      id: eventId || '',
      name: 'Tech Conference 2024',
      date: '2024-03-15',
      location: 'San Francisco Convention Center',
      participants: 150,
      status: 'upcoming',
      description: 'Join us for the biggest tech conference of the year. Network with industry leaders, attend workshops, and discover the latest innovations in technology.',
      organizer: 'Tech Events Inc.',
      capacity: 200,
    });
  }, [eventId]);

  if (!event) {
    return <div>Loading...</div>;
  }

  const getStatusColor = (status: Event['status']) => {
    return status === 'completed' ? 'green' : status === 'ongoing' ? 'blue' : 'orange';
  };

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
              <Descriptions.Item label="Date" span={3}>
                <Space>
                  <CalendarOutlined />
                  {event.date}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Location" span={3}>
                <Space>
                  <EnvironmentOutlined />
                  {event.location}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Organizer" span={3}>
                {event.organizer}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                {event.description}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Participant Management" className="mb-6">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Total Participants"
                  value={event.participants}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Available Spots"
                  value={event.capacity - event.participants}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Capacity"
                  value={event.capacity}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Event Status" className="mb-6">
            <div className="flex flex-col items-center space-y-4">
              <Tag color={getStatusColor(event.status)} className="text-lg px-4 py-2">
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