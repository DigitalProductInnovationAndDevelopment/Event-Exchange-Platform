import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  Table,
  Typography,
  Modal,
  InputNumber,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb';
import { useEffect, useState } from 'react';
import useApiService from '../../services/apiService';
import { DeleteOutlined, UserAddOutlined, UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;

// Mock participant data
const MOCK_PARTICIPANTS = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', guests: 2 },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', guests: 0 },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', guests: 1 },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', guests: 3 },
];

// Mock employee data
const MOCK_EMPLOYEES = [
  { id: '5', name: 'Eve Adams', email: 'eve@example.com' },
  { id: '6', name: 'Frank Miller', email: 'frank@example.com' },
  { id: '7', name: 'Grace Hopper', email: 'grace@example.com' },
  { id: '8', name: 'Henry Ford', email: 'henry@example.com' },
];

export const EventParticipants = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const { getEventById } = useApiService();
  const [search, setSearch] = useState('');
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeGuests, setEmployeeGuests] = useState<{ [id: string]: number }>({});
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      if (eventId) {
        const event = await getEventById(eventId);
        if (event) {
          setEventName(event.name);
        }
      }
    })();
  }, [eventId, getEventById]);

  const filteredParticipants = participants
    .filter(
      p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleDelete = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleGuestsChange = (id: string, value: number | null) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, guests: value ?? 0 } : p));
  };

  const handleAddParticipant = (employee: { id: string; name: string; email: string }) => {
    setParticipants(prev =>
      prev.some(p => p.id === employee.id)
        ? prev
        : [...prev, { ...employee, guests: employeeGuests[employee.id] ?? 0 }]
    );
    setEmployeeGuests(prev => ({ ...prev, [employee.id]: 0 }));
  };

  const filteredEmployees = MOCK_EMPLOYEES.filter(
    e =>
      e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.email.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Guests',
      dataIndex: 'guests',
      key: 'guests',
      render: (guests: number, record: any) => (
        <InputNumber
          min={0}
          value={guests}
          onChange={value => handleGuestsChange(record.id, value)}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { path: '/events', label: 'Events' },
          { path: `/events/${eventId}`, label: eventName || 'Event' },
          { path: `/events/${eventId}/manage-participants`, label: 'Manage Participants' },
        ]}
      />

      <div className="flex justify-between items-center">
        <Title level={2}>Manage Participants</Title>
        <Space>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>
            Import Participants
          </Button>
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setAddModalOpen(true)}>
            Add Participants
          </Button>
          <Button onClick={() => navigate(`/events/${eventId}`)}>Back to Event</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card className="mb-6">
            <Input.Search
              placeholder="Search participants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mb-4"
            />
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filteredParticipants}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Add Participants"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={null}
      >
        <Input.Search
          placeholder="Search employees..."
          value={employeeSearch}
          onChange={e => setEmployeeSearch(e.target.value)}
          className="mb-4"
        />
        <Table
          rowKey="id"
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            {
              title: 'Guests',
              dataIndex: 'guests',
              key: 'guests',
              render: (_: any, record: any) => (
                <InputNumber
                  min={0}
                  value={employeeGuests[record.id] ?? 0}
                  onChange={value => setEmployeeGuests(prev => ({ ...prev, [record.id]: value ?? 0 }))}
                  style={{ width: 80 }}
                  disabled={participants.some(p => p.id === record.id)}
                />
              ),
            },
            {
              title: '',
              key: 'actions',
              render: (_: any, record: any) => (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => handleAddParticipant(record)}
                  disabled={participants.some(p => p.id === record.id)}
                >
                  Add
                </Button>
              ),
            },
          ]}
          dataSource={filteredEmployees}
          pagination={false}
        />
      </Modal>

      <Modal
        title="Import Participants"
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={[
          <Button key="addall" type="primary" onClick={() => setImportModalOpen(false)}>
            Add All
          </Button>
        ]}
      >
        <Input
          type="file"
          accept=".csv,.xlsx,.xls,.txt"
          onChange={e => setImportFile(e.target.files?.[0] || null)}
          className="mb-4"
        />
        {importFile && (
          <div className="mt-2 text-green-600">Selected file: {importFile.name}</div>
        )}

<Input.Search
          placeholder="Search employees..."
          value={employeeSearch}
          onChange={e => setEmployeeSearch(e.target.value)}
          className="mb-4"
        />
        <Table
          rowKey="id"
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            {
              title: 'Guests',
              dataIndex: 'guests',
              key: 'guests',
              render: (_: any, record: any) => (
                <InputNumber
                  min={0}
                  value={employeeGuests[record.id] ?? 0}
                  onChange={value => setEmployeeGuests(prev => ({ ...prev, [record.id]: value ?? 0 }))}
                  style={{ width: 80 }}
                  disabled={participants.some(p => p.id === record.id)}
                />
              ),
            },
            {
              title: '',
              key: 'actions',
              render: (_: any, record: any) => (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => handleAddParticipant(record)}
                  disabled={participants.some(p => p.id === record.id)}
                >
                  Add
                </Button>
              ),
            },
          ]}
          dataSource={filteredEmployees}
          pagination={false}
        />
      </Modal>
    </div>
  );
}; 