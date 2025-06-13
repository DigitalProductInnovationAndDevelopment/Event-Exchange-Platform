import { Typography, Card, Row, Col, Statistic, List, Tag, Space, Divider, Button } from 'antd';
import { CalendarOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, RiseOutlined, BankOutlined, FireOutlined, PlusOutlined, UserOutlined, DashboardOutlined, EyeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Event } from '../types/event';
import { mockEvents } from '../mocks/eventData';


const { Title, Text } = Typography;

export const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // Mock API calls - replace with actual API endpoints
        // const eventsResponse = await fetch('/api/events');
        // const statsResponse = await fetch('/api/dashboard/stats');
        // const eventsData = await eventsResponse.json();
        // const statsData = await statsResponse.json();
        
        // For now, use mock data
        setEvents(mockEvents);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // TODO: Handle error appropriately
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: Event['status']) => {
    return status === 'completed' ? 'green' : status === 'ongoing' ? 'blue' : 'orange';
  };

  const getStatusIcon = (status: Event['status']) => {
    return status === 'completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div>
        <Title level={2}>Event Management Dashboard</Title>
        <Text type="secondary">Comprehensive analytics and insights for your events</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Row gutter={[16, 16]} className="mb-4">
            <Col span={8}>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                block
                onClick={() => navigate('/events/create')}
              >
                Create New Event
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                type="primary"
                icon={<CalendarOutlined />}
                size="large"
                block
                onClick={() => navigate('/events')}
              >
                Events
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                type="primary"
                icon={<TeamOutlined />}
                size="large"
                block
                onClick={() => navigate('/employees')}
              >
                Employees
              </Button>
            </Col>
          </Row>

          <Card 
            title="Upcoming Events" 
            className="shadow-sm"
            bodyStyle={{ padding: '12px' }}
          >
            <List
              dataSource={events.filter(event => event.status === 'upcoming')}
              renderItem={(event) => (
                <List.Item
                  actions={[
                    <Button 
                      icon={<EyeOutlined />} 
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Link to={`/events/${event.id}`}>{event.name}</Link>
                        <Tag color={getStatusColor(event.status)} icon={getStatusIcon(event.status)}>
                          {event.status.toUpperCase()}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Space>
                          <CalendarOutlined /> {event.date}
                          <TeamOutlined /> {event.participants}/{event.capacity} participants
                        </Space>
                        <Space>
                          <FireOutlined /> {event.engagement}% engagement
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            className="shadow-sm h-full"
            title={<Title level={4} className="mb-0">Event Statistics</Title>}
          >
            <div className="space-y-2">
              <Statistic
                title="Total Events"
                value={events.length}
                prefix={<CalendarOutlined />}
              />
              <Divider className="my-4" />
              
              <Statistic
                title="Total Participants"
                value={events.reduce((sum, event) => sum + event.participants, 0)}
                prefix={<TeamOutlined />}
              />
              <Divider className="my-4" />
              
              <Statistic
                title="Average Engagement"
                value={events.reduce((sum, event) => sum + (event.engagement || 0), 0) / events.length}
                suffix="%"
                prefix={<FireOutlined />}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 