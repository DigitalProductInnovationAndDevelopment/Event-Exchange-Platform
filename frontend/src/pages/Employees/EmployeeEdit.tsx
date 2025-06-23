import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeForm from './EmployeeForm';
import { Card, Button, message, Typography } from 'antd';
import { Breadcrumb } from '../../components/Breadcrumb';
import useApiService from '../../services/apiService';

const { Title } = Typography;

export const EmployeeEdit = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { getEmployeeById, updateEmployee } = useApiService();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEmployeeById(employeeId!);
        setEmployee(data);
      } catch (err) {
        message.error('Failed to fetch employee');
        console.error('Failed to fetch employee:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [employeeId, getEmployeeById]);

  const handleSave = async (values: any) => {
    try {
      await updateEmployee(employeeId!, values);
      message.success('Employee updated successfully');
      navigate(`/employees/${employeeId!}`);
    } catch (error) {
      message.error('Failed to update employee');
      console.error('Error updating employee:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        items={[
          { path: '/employees', label: 'Employees' },
          { path: `/employees/${employeeId}/edit`, label: 'Edit Employee' }
        ]}
      />
      <Title level={2}>Edit Employee</Title>
      <Card>
        <EmployeeForm initialValues={employee} onSave={handleSave} />
      </Card>
      <Button style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Cancel</Button>
    </div>
  );
}; 