import React, { useState, useEffect } from 'react';
import { Typography, Descriptions, Card, Table, Button, Form, Input, Space, message, Select } from 'antd';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

// Example data for attended events
const attendedEvents = [
  {
    key: '1',
    eventName: 'Annual Gala Dinner',
    date: '2023-12-01',
    type: 'Dinner',
    address: 'Berlin HQ',
    participants: 100,
    status: 'Attended',
  },
  {
    key: '2',
    eventName: 'Project Kickoff',
    date: '2024-03-15',
    type: 'Workshop',
    address: 'Munich Office',
    participants: 30,
    status: 'Attended',
  },
];

// Table columns for attended events
const eventColumns = [
  {
    title: 'Event Name',
    dataIndex: 'eventName',
    key: 'eventName',
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
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
  },
];

export const EmployeeDetails = () => {
  // Get employeeId from route params
  const { employeeId } = useParams();
  // Get hash and state from location for anchor navigation and edit mode
  const location = useLocation();
  const navigate = useNavigate();

  // Determine page mode: add, edit, or view
  const isNew = !employeeId || employeeId === 'new';
  // If coming from edit button, set edit mode directly
  const [isEdit, setIsEdit] = useState(
    isNew || (location.state && location.state.editMode) || location.search.includes('edit=true')
  );

  // Example employee data (should be fetched from API in real app)
  const employee = isNew
    ? null
    : {
        employeeId: 'E001',
        firstName: 'John',
        lastName: 'Doe',
        gender: 'Male',
        project: 'Project Alpha',
        location: 'Germany',
        department: 'Engineering',
        email: 'john.doe@example.com',
        role: 'Developer',
        dateJoined: '2022-01-15',
      };

  // Basic Information fields
  const basicFields = [
    { label: 'Employee ID', value: employee?.employeeId },
    { label: 'First Name', value: employee?.firstName },
    { label: 'Last Name', value: employee?.lastName },
    { label: 'Gender', value: employee?.gender },
    { label: 'Project', value: employee?.project },
    { label: 'Role', value: employee?.role },
    { label: 'Department', value: employee?.department },
    { label: 'Location', value: employee?.location },
    { label: 'Date Joined', value: employee?.dateJoined },
  ];

  // Contact Information fields
  const contactFields = [
    { label: 'Email', value: employee?.email },
    // Add more contact fields if needed
  ];

  // Scroll to events section if hash is #events
  useEffect(() => {
    if (location.hash === '#events') {
      const el = document.getElementById('events-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  // Handle save (for add or edit)
  const handleSave = () => {
    message.success('Employee information saved');
    setIsEdit(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEdit(false);
  };

  // If editing, show editable form; if viewing, show read-only details
  const renderBasicInfo = () => {
    if (isNew || isEdit) {
      // Editable form for add or edit
      return (
        <Card title="Basic Information" style={{ marginBottom: 24 }}>
          <Form layout="vertical" initialValues={employee || {}}>
            {/* Employee ID field for add and edit form, always editable in edit mode */}
            <Form.Item label="Employee ID" name="employeeId" required>
              <Input placeholder="Enter employee ID" />
            </Form.Item>
            <Form.Item label="First Name" name="firstName" required>
              <Input placeholder="Enter first name" />
            </Form.Item>
            <Form.Item label="Last Name" name="lastName" required>
              <Input placeholder="Enter last name" />
            </Form.Item>
            {/* Gender as a select field */}
            <Form.Item label="Gender" name="gender" required>
              <Select placeholder="Select gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Diverse">Diverse</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Project" name="project">
              <Input placeholder="Enter project" />
            </Form.Item>
            <Form.Item label="Role" name="role">
              <Input placeholder="Enter role" />
            </Form.Item>
            <Form.Item label="Department" name="department">
              <Input placeholder="Enter department" />
            </Form.Item>
            <Form.Item label="Location" name="location">
              <Input placeholder="Enter location" />
            </Form.Item>
            <Form.Item label="Date Joined" name="dateJoined">
              <Input placeholder="Enter date joined" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleSave}>Save</Button>
                <Button onClick={isNew ? handleBack : handleCancelEdit}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      );
    }
    // Read-only details, no Edit button
    return (
      <Card title="Basic Information" style={{ marginBottom: 24 }}>
        <Descriptions column={2} bordered>
          {basicFields.map(
            (field) =>
              field.value && (
                <Descriptions.Item label={field.label} key={field.label}>
                  {field.value}
                </Descriptions.Item>
              )
          )}
        </Descriptions>
      </Card>
    );
  };

  const renderContactInfo = () => {
    if (isNew || isEdit) {
      // Editable form for add or edit
      return (
        <Card title="Contact Information" style={{ marginBottom: 24 }}>
          <Form layout="vertical" initialValues={employee || {}}>
            <Form.Item label="Email" name="email">
              <Input placeholder="Enter email" />
            </Form.Item>
            {/* Add more contact fields here if needed */}
          </Form>
        </Card>
      );
    }
    // Read-only details
    return (
      <Card title="Contact Information" style={{ marginBottom: 24 }}>
        <Descriptions column={1} bordered>
          {contactFields.map(
            (field) =>
              field.value && (
                <Descriptions.Item label={field.label} key={field.label}>
                  {field.value}
                </Descriptions.Item>
              )
          )}
        </Descriptions>
      </Card>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      {/* Back Button at the very top left, above the page title, styled with Ant Design */}
      <div style={{ marginBottom: 16 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ paddingLeft: 0 }}
        >
          Back
        </Button>
      </div>
      {/* Page Title */}
      <Title level={2} style={{ marginBottom: 24 }}>
        {isNew ? 'Add Employee' : 'Employee Details'}
      </Title>

      {/* Basic Information Section (editable or read-only) */}
      {renderBasicInfo()}

      {/* Contact Information Section (editable or read-only) */}
      {renderContactInfo()}

      {/* Attended Events List Section (only show for view or edit, not for add) */}
      {!isNew && !isEdit && (
        <div id="events-section">
          <Card title="Attended Events List" style={{ marginBottom: 24 }}>
            <Table
              columns={eventColumns}
              dataSource={attendedEvents}
              bordered
              rowKey="key"
              pagination={false}
            />
          </Card>
        </div>
      )}
    </div>
  );
};
