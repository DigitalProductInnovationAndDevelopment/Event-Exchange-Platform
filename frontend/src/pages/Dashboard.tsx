import { Typography, Card, Row, Col, Statistic, List, Tag, Space, Progress, Divider } from 'antd';
import { CalendarOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, RiseOutlined, BankOutlined, FireOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

interface Event {
  id: string;
  name: string;
  date: string;
  participants: number;
  capacity: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  category: string;
  cost?: number;
  budget?: number;
  engagement?: number;
  quarter: string;
  year: number;
}

export const Dashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalParticipants: 0,
    averageAttendance: 0,
    monthlyGrowth: 5.2,
    participantGrowth: 12.5,
    costGrowth: 3.2,
    engagementGrowth: 15.7,
    topPerformingEvent: 'Tech Conference 2024',
    topAttendanceRate: 95,
    totalCosts: 85000,
    averageEngagement: 78,
    budgetUtilization: 82,
    quarterlyCosts: {
      'Q1': 25000,
      'Q2': 30000,
      'Q3': 20000,
      'Q4': 10000
    },
    yearlyCosts: {
      '2023': 85000,
      '2024': 45000
    },
    categoryBreakdown: {
      'Tech': 35,
      'Business': 25,
      'Social': 20,
      'Other': 20
    }
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    setEvents([
      {
        id: '1',
        name: 'Tech Conference 2024',
        date: '2024-03-15',
        participants: 150,
        capacity: 200,
        status: 'upcoming',
        category: 'Tech',
        cost: 30000,
        budget: 35000,
        engagement: 92,
        quarter: 'Q1',
        year: 2024
      },
      {
        id: '2',
        name: 'Workshop Series',
        date: '2024-03-20',
        participants: 45,
        capacity: 50,
        status: 'upcoming',
        category: 'Business',
        cost: 12000,
        budget: 15000,
        engagement: 88,
        quarter: 'Q1',
        year: 2024
      },
      {
        id: '3',
        name: 'Annual Meeting',
        date: '2024-02-28',
        participants: 80,
        capacity: 100,
        status: 'completed',
        category: 'Business',
        cost: 18000,
        budget: 20000,
        engagement: 85,
        quarter: 'Q1',
        year: 2024
      },
    ]);

    setStats({
      totalEvents: 12,
      upcomingEvents: 5,
      totalParticipants: 275,
      averageAttendance: 85,
      monthlyGrowth: 5.2,
      participantGrowth: 12.5,
      costGrowth: 3.2,
      engagementGrowth: 15.7,
      topPerformingEvent: 'Tech Conference 2024',
      topAttendanceRate: 95,
      totalCosts: 85000,
      averageEngagement: 78,
      budgetUtilization: 82,
      quarterlyCosts: {
        'Q1': 25000,
        'Q2': 30000,
        'Q3': 20000,
        'Q4': 10000
      },
      yearlyCosts: {
        '2023': 85000,
        '2024': 45000
      },
      categoryBreakdown: {
        'Tech': 35,
        'Business': 25,
        'Social': 20,
        'Other': 20
      }
    });
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
    <div className="space-y-6">
      <div>
        <Title level={2}>Event Management Overview</Title>
        <Text type="secondary">Comprehensive analytics and insights for your events</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Events"
              value={stats.totalEvents}
              prefix={<CalendarOutlined />}
            />
            <div className="mt-2">
              <Text type="secondary">
                <RiseOutlined className="text-green-500" /> {stats.monthlyGrowth}% this month
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Q1 Costs"
              value={formatCurrency(stats.quarterlyCosts.Q1)}
              prefix={<BankOutlined />}
            />
            <div className="mt-2">
              <Text type="secondary">
                <RiseOutlined className="text-green-500" /> {stats.costGrowth}% vs previous quarter
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Participants"
              value={stats.totalParticipants}
              prefix={<TeamOutlined />}
            />
            <div className="mt-2">
              <Text type="secondary">
                <RiseOutlined className="text-green-500" /> {stats.participantGrowth}% growth
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Average Engagement"
              value={stats.averageEngagement}
              suffix="%"
              prefix={<FireOutlined />}
            />
            <div className="mt-2">
              <Text type="secondary">
                <RiseOutlined className="text-green-500" /> {stats.engagementGrowth}% growth
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card 
            title="Recent Events" 
            className="shadow-sm h-full"
            extra={<Link to="/events">View All</Link>}
          >
            <List
              dataSource={events}
              renderItem={(event) => (
                <List.Item
                  actions={[
                    <Link to={`/events/${event.id}`}>View Details</Link>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Link to={`/events/${event.id}`}>{event.name}</Link>
                        <Tag color={getStatusColor(event.status)} icon={getStatusIcon(event.status)}>
                          {event.status.toUpperCase()}
                        </Tag>
                        <Tag color="blue">{event.category}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Space>
                          <CalendarOutlined /> {event.date}
                          <TeamOutlined /> {event.participants}/{event.capacity} participants
                        </Space>
                        <Space>
                          <BankOutlined /> {formatCurrency(event.cost || 0)} / {formatCurrency(event.budget || 0)}
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
          <Card title="Event Insights" className="shadow-sm h-full">
            <div className="space-y-6">
              <div>
                <Text strong>Budget Utilization</Text>
                <div className="mt-1">
                  <Progress 
                    percent={stats.budgetUtilization} 
                    size="small" 
                    status="active"
                    className="mt-2"
                  />
                  <Text type="secondary" className="mt-1 block">
                    Average budget utilization across all events
                  </Text>
                </div>
              </div>
              <Divider className="my-4" />
              <div>
                <Text strong>Category Distribution</Text>
                <div className="mt-2 space-y-2">
                  {Object.entries(stats.categoryBreakdown).map(([category, percentage]) => (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <Text>{category}</Text>
                        <Text>{percentage}%</Text>
                      </div>
                      <Progress percent={percentage} size="small" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 