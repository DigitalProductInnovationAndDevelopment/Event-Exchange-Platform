import React, { useEffect, useState } from 'react';
import { Typography, Descriptions, Card, Button, Row, Col, Table, Space, Modal } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    // Fetch employee data by employeeId (replace with API call)
    setEmployee({
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
    });
  }, [employeeId]);

  const basicFields = [
    { label: 'First Name', value: employee?.firstName },
    { label: 'Last Name', value: employee?.lastName },
    { label: 'Email', value: employee?.email },
    { label: 'Gender', value: employee?.gender },
  ];
  const companyFields = [
    { label: 'Projects', value: employee?.project },
    { label: 'Role', value: employee?.role },
    { label: 'Department', value: employee?.department },
    { label: 'Location', value: employee?.location },
    { label: 'Date Joined', value: employee?.dateJoined },
  ];

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
    { title: 'Event Name', dataIndex: 'eventName', key: 'eventName' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
  ];

  const showDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    // TODO: Add delete logic here
    setDeleteModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { path: '/employees', label: 'Employees' },
          { path: `/employees/${employeeId}`, label: employee?.firstName ? `${employee.firstName} ${employee.lastName}` : 'Employee Details' },
        ]}
      />
      <div className="flex justify-between items-center">
        <Title level={2} className="m-0">{employee?.firstName ? `${employee.firstName} ${employee.lastName}` : 'Employee Details'}</Title>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/employees/${employeeId}/edit`)}
          >
            Edit Employee
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={showDeleteModal}
          >
            Delete Employee
          </Button>
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                Confirm Delete
              </div>
            }
            centered
            open={deleteModalOpen}
            onOk={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            width={400}
          >
            <p>Are you sure you want to delete this employee?</p>
            <p style={{ color: '#8c8c8c', fontSize: '14px' }}>This action cannot be undone.</p>
          </Modal>
        </Space>
      </div>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="General Information" style={{ marginBottom: 24 }}>
            <Descriptions column={1} bordered>
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
        </Col>
        <Col span={12}>
          <Card title="Attended Events List" style={{ marginBottom: 24 }}>
            <Table
              columns={eventColumns}
              dataSource={attendedEvents}
              bordered
              rowKey="key"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Position Information" style={{ marginBottom: 24 }}>
            <Descriptions column={1} bordered>
              {companyFields.map(
                (field) =>
                  field.value && (
                    <Descriptions.Item label={field.label} key={field.label}>
                      {field.value}
                    </Descriptions.Item>
                  )
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
