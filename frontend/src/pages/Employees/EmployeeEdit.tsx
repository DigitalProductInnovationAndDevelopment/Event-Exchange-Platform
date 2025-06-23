import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeForm from './EmployeeForm';
import { Card, Button, message, Typography } from 'antd';

const { Title } = Typography;

export const EmployeeEdit = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);

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

  const handleSave = (values: any) => {
    // Update employee (replace with API call)
    message.success('Employee updated successfully');
    navigate(`/employees/${employeeId}`);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>Edit Employee</Title>
      <Card>
        <EmployeeForm initialValues={employee} onSave={handleSave} />
      </Card>
      <Button style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Cancel</Button>
    </div>
  );
}; 