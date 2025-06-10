import { Typography, Button, Table, Space, Tag } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export const EventsList = () => {
  const navigate = useNavigate();

  // Mock data for events
  const events = [
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
      render: (status: string) => {
        const color = status === 'completed' ? 'green' : status === 'ongoing' ? 'blue' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
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

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <Title level={2} style={{ margin: 0 }}>Events</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Create Event
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={events} 
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}; 