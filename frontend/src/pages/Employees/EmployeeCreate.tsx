import { useNavigate } from 'react-router-dom';
import EmployeeForm from './EmployeeForm';
import { Card, Button, message, Typography, Form } from 'antd';
import { Breadcrumb } from '../../components/Breadcrumb';
import useApiService from '../../services/apiService';
import { useState } from 'react';

const { Title } = Typography;

export const EmployeeCreate = () => {
  const navigate = useNavigate();
  const { createEmployee } = useApiService();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      // Ensure authorities is always an array
      if (values.profile && values.profile.authorities && !Array.isArray(values.profile.authorities)) {
        values.profile.authorities = [values.profile.authorities];
      }
      // No gender normalization
      await createEmployee(values);
      message.success('Employee created successfully');
      navigate('/employees');
    } catch (error) {
      message.error('Failed to create employee');
      console.error('Error creating employee:', error);
    } finally {
      setLoading(false);
    }
  };

  // Normalize gender to uppercase for initialValues
  const normalizedInitialValues = { profile: { gender: undefined } };

  return (
    <div>
      <Breadcrumb items={[
        { path: '/employees', label: 'Employees' },
        { path: '/employees/new', label: 'Add Employee' },
      ]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Add Employee</Title>
        <div style={{ display: 'flex' }}>
          <Button type="primary" htmlType="submit" loading={loading} onClick={() => form.submit()} style={{ marginRight: 8 }}>
            Add Employee
          </Button>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </div>
      <Card style={{ margin: '0 auto' }}>
        <EmployeeForm initialValues={normalizedInitialValues} onSave={handleFinish} form={form} />
      </Card>
    </div>
  );
}; 