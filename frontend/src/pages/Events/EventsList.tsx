import { Typography, Button, Table, Space, Tag, Card, Row, Col, Switch } from 'antd';
import { PlusOutlined, EyeOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Breadcrumb } from '../../components/Breadcrumb';

const { Title } = Typography;

interface Event {
  key: string;
  id: string;
  name: string;
  date: string;
  location: string;
  participants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export const EventsList = () => {
  const navigate = useNavigate();
  const [isTableView, setIsTableView] = useState(true);

  // Mock data for events
  const events: Event[] = [
    {
      key: '1',
      id: '1',
      name: 'Tech Conference 2024',
      date: '2024-03-15',
      location: 'San Francisco',
      participants: 150,
      status: 'upcoming',
    },
    {
      key: '2',
      id: '2',
      name: 'Marketing Workshop',
      date: '2024-02-28',
      location: 'New York',
      participants: 75,
      status: 'ongoing',
    },
    {
      key: '3',
      id: '3',
      name: 'Annual Company Meeting',
      date: '2024-01-20',
      location: 'Chicago',
      participants: 200,
      status: 'completed',
    },
  ];

  const columns = [
    {
      title: 'Event Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Participants',
      dataIndex: 'participants',
      key: 'participants',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Event['status']) => {
        const color = status === 'completed' ? 'green' : status === 'ongoing' ? 'blue' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Event) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/events/${record.id}`)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  const getStatusColor = (status: Event['status']) => {
    return status === 'completed' ? 'green' : status === 'ongoing' ? 'blue' : 'orange';
  };

  return (
    <div>
      <Breadcrumb 
        items={[
          { path: '/events', label: 'Events' }
        ]} 
      />
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="m-0">Events</Title>
        <div className="flex items-center gap-4">
          <Space>
            <UnorderedListOutlined className={isTableView ? "text-blue-500" : "text-gray-400"} />
            <Switch 
              checked={!isTableView} 
              onChange={(checked) => setIsTableView(!checked)}
              className="bg-gray-200"
            />
            <AppstoreOutlined className={!isTableView ? "text-blue-500" : "text-gray-400"} />
          </Space>
          <Button type="primary" icon={<PlusOutlined />}>
            Create Event
          </Button>
        </div>
      </div>

      {isTableView ? (
        <Table 
          columns={columns} 
          dataSource={events} 
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {events.map((event) => (
            <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
              <Card 
                hoverable
                className="h-full"
                actions={[
                  <Button 
                    type="text" 
                    icon={<EyeOutlined />} 
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    View Details
                  </Button>
                ]}
              >
                <Card.Meta
                  title={event.name}
                  description={
                    <div className="space-y-2">
                      <div className="text-gray-600">
                        <div>Date: {event.date}</div>
                        <div>Location: {event.location}</div>
                        <div>Participants: {event.participants}</div>
                      </div>
                      <Tag color={getStatusColor(event.status)}>
                        {event.status.toUpperCase()}
                      </Tag>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}; 