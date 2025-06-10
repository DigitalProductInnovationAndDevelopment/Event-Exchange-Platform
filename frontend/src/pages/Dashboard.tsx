import { Card, Typography, Button } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Welcome, {user?.name}!</Title>
        <Text>You are logged in as {user?.email}</Text>
        <div style={{ marginTop: '24px' }}>
          <Button type="primary" danger onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
} 