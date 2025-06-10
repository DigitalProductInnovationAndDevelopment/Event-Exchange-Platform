import { Card, Typography, Row, Col, Statistic } from 'antd';
import { CalendarOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Title level={2} className="mb-2">Welcome back, {user?.name}!</Title>
        <Text type="secondary">Here's what's happening with your events today.</Text>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Events"
              value={12}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Active Employees"
              value={48}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Completed Exchanges"
              value={156}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Recent Events" size="small" className="shadow-sm">
            <Text>Event management dashboard coming soon...</Text>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Employee Activity" size="small" className="shadow-sm">
            <Text>Employee activity dashboard coming soon...</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
} 