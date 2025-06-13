import { Typography, Button, Table, Space, Tag, Card, Row, Col, Switch, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, EyeOutlined, AppstoreOutlined, UnorderedListOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Breadcrumb } from '../../components/Breadcrumb';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface Event {
  key: string;
  id: string;
  name: string;
  date: string;
  location: string;
  participants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  type: 'training' | 'meeting' | 'conference' | 'workshop';
}

export const EventsList = () => {
  const navigate = useNavigate();
  const [isTableView, setIsTableView] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // Mock data for events
  const events = useMemo<Event[]>(() => [
    {
      key: '1',
      id: '1',
      name: 'Tech Conference 2024',
      date: '2024-03-15',
      location: 'San Francisco',
      participants: 150,
      status: 'upcoming' as const,
      type: 'conference' as const,
    },
    {
      key: '2',
      id: '2',
      name: 'Marketing Workshop',
      date: '2024-02-28',
      location: 'New York',
      participants: 75,
      status: 'ongoing' as const,
      type: 'workshop' as const,
    },
    {
      key: '3',
      id: '3',
      name: 'Annual Company Meeting',
      date: '2024-01-20',
      location: 'Chicago',
      participants: 200,
      status: 'completed' as const,
      type: 'meeting' as const,
    },
    {
      key: '4',
      id: '4',
      name: 'Leadership Training',
      date: '2023-12-10',
      location: 'Boston',
      participants: 45,
      status: 'completed' as const,
      type: 'training' as const,
    },
    {
      key: '5',
      id: '5',
      name: 'Product Launch',
      date: '2023-11-15',
      location: 'Los Angeles',
      participants: 120,
      status: 'completed' as const,
      type: 'conference' as const,
    },
  ], []);

  // Filter events based on all criteria
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search text filter
      const matchesSearch = searchText === '' || 
        event.name.toLowerCase().includes(searchText.toLowerCase()) ||
        event.location.toLowerCase().includes(searchText.toLowerCase());

      // Event type filter
      const matchesType = !selectedType || event.type === selectedType;

      // Date range filter
      const matchesDateRange = !dateRange || !dateRange[0] || !dateRange[1] || (
        new Date(event.date) >= dateRange[0].toDate() &&
        new Date(event.date) <= dateRange[1].toDate()
      );

      return matchesSearch && matchesType && matchesDateRange;
    });
  }, [events, searchText, selectedType, dateRange]);

  const columns: ColumnsType<Event> = [
    {
      title: 'Event Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: Event['type']) => (
        <Tag color={
          type === 'conference' ? 'blue' :
          type === 'workshop' ? 'green' :
          type === 'training' ? 'purple' : 'orange'
        }>
          {type.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Conference', value: 'conference' },
        { text: 'Workshop', value: 'workshop' },
        { text: 'Training', value: 'training' },
        { text: 'Meeting', value: 'meeting' },
      ],
      onFilter: (value, record) => record.type === value,
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
      sorter: (a, b) => a.participants - b.participants,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Event['status']) => {
        const color = status === 'completed' ? 'green' : status === 'ongoing' ? 'blue' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Upcoming', value: 'upcoming' },
        { text: 'Ongoing', value: 'ongoing' },
        { text: 'Completed', value: 'completed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
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

  const getTypeColor = (type: Event['type']) => {
    return type === 'conference' ? 'blue' :
           type === 'workshop' ? 'green' :
           type === 'training' ? 'purple' : 'orange';
  };

  // Split events into upcoming/ongoing and past events
  const upcomingEvents = filteredEvents
    .filter(event => event.status === 'upcoming' || event.status === 'ongoing')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const pastEvents = filteredEvents
    .filter(event => event.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/events/create')}
          >
            Create Event
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="Search events..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Event Type"
              style={{ width: '100%' }}
              allowClear
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { value: 'conference', label: 'Conference' },
                { value: 'workshop', label: 'Workshop' },
                { value: 'training', label: 'Training' },
                { value: 'meeting', label: 'Meeting' },
              ]}
            />
          </Col>
          <Col span={8}>
            <RangePicker 
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
          </Col>
        </Row>
      </Card>

      {/* Upcoming Events Section */}
      <div className="mb-8">
        <Title level={3} className="mb-4">Upcoming Events</Title>
        {isTableView ? (
          <Table 
            columns={columns} 
            dataSource={upcomingEvents} 
            pagination={false}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {upcomingEvents.map((event) => (
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
                        <Space>
                          <Tag color={getStatusColor(event.status)}>
                            {event.status.toUpperCase()}
                          </Tag>
                          <Tag color={getTypeColor(event.type)}>
                            {event.type.toUpperCase()}
                          </Tag>
                        </Space>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Past Events Section */}
      <div>
        <Title level={3} className="mb-4">Past Events</Title>
        {isTableView ? (
          <Table 
            columns={columns} 
            dataSource={pastEvents} 
            pagination={{ pageSize: 15 }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {pastEvents.map((event) => (
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
                        <Space>
                          <Tag color={getStatusColor(event.status)}>
                            {event.status.toUpperCase()}
                          </Tag>
                          <Tag color={getTypeColor(event.type)}>
                            {event.type.toUpperCase()}
                          </Tag>
                        </Space>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}; 