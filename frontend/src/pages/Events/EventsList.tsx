import { Typography, Button, Table, Space, Tag, Card, Row, Col, Switch, Input, Select, DatePicker, Statistic } from 'antd';
import { PlusOutlined, EyeOutlined, AppstoreOutlined, UnorderedListOutlined, SearchOutlined, TeamOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
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
  budget: number;
  department: string;
}

export const EventsList = () => {
  const navigate = useNavigate();
  const [isTableView, setIsTableView] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

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
      type: 'conference',
      budget: 50000,
      department: 'IT',
    },
    {
      key: '2',
      id: '2',
      name: 'Marketing Workshop',
      date: '2024-02-28',
      location: 'New York',
      participants: 75,
      status: 'ongoing',
      type: 'workshop',
      budget: 15000,
      department: 'Marketing',
    },
    {
      key: '3',
      id: '3',
      name: 'Annual Company Meeting',
      date: '2024-01-20',
      location: 'Chicago',
      participants: 200,
      status: 'completed',
      type: 'meeting',
      budget: 30000,
      department: 'All',
    },
    {
      key: '4',
      id: '4',
      name: 'Leadership Training',
      date: '2024-04-10',
      location: 'Boston',
      participants: 45,
      status: 'upcoming',
      type: 'training',
      budget: 25000,
      department: 'HR',
    },
  ];

  // Filter events based on all criteria
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search text filter
      const matchesSearch = searchText === '' || 
        event.name.toLowerCase().includes(searchText.toLowerCase()) ||
        event.location.toLowerCase().includes(searchText.toLowerCase());

      // Event type filter
      const matchesType = !selectedType || event.type === selectedType;

      // Department filter
      const matchesDepartment = !selectedDepartment || event.department === selectedDepartment;

      // Date range filter
      const matchesDateRange = !dateRange || !dateRange[0] || !dateRange[1] || (
        new Date(event.date) >= dateRange[0].toDate() &&
        new Date(event.date) <= dateRange[1].toDate()
      );

      return matchesSearch && matchesType && matchesDepartment && matchesDateRange;
    });
  }, [events, searchText, selectedType, selectedDepartment, dateRange]);

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
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      filters: [
        { text: 'IT', value: 'IT' },
        { text: 'Marketing', value: 'Marketing' },
        { text: 'HR', value: 'HR' },
        { text: 'All', value: 'All' },
      ],
      onFilter: (value, record) => record.department === value,
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
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget: number) => `$${budget.toLocaleString()}`,
      sorter: (a, b) => a.budget - b.budget,
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

  // Calculate statistics based on filtered events
  const totalEvents = filteredEvents.length;
  const totalParticipants = filteredEvents.reduce((sum, event) => sum + event.participants, 0);
  const totalBudget = filteredEvents.reduce((sum, event) => sum + event.budget, 0);
  const upcomingEvents = filteredEvents.filter(event => event.status === 'upcoming').length;

  return (
    <div>
      <Breadcrumb 
        items={[
          { path: '/events', label: 'Events' }
        ]} 
      />
      
      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Events"
              value={totalEvents}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Participants"
              value={totalParticipants}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Budget"
              value={totalBudget}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Upcoming Events"
              value={upcomingEvents}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

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

      {/* Search and Filters */}
      <Card className="mb-6">
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Search events..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={6}>
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
          <Col span={6}>
            <Select
              placeholder="Department"
              style={{ width: '100%' }}
              allowClear
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              options={[
                { value: 'IT', label: 'IT' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'HR', label: 'HR' },
                { value: 'All', label: 'All' },
              ]}
            />
          </Col>
          <Col span={6}>
            <RangePicker 
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
          </Col>
        </Row>
      </Card>

      {isTableView ? (
        <Table 
          columns={columns} 
          dataSource={filteredEvents} 
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredEvents.map((event) => (
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
                        <div>Budget: ${event.budget.toLocaleString()}</div>
                        <div>Department: {event.department}</div>
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
  );
}; 