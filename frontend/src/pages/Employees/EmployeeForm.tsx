import React from 'react';
import { Form, Input, Select, Button, Space, Tag } from 'antd';

const { Option } = Select;

type EmployeeFormProps = {
  initialValues: any;
  onSave: (values: any) => void;
};

const EmployeeForm = ({ initialValues, onSave }: EmployeeFormProps) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onSave(values);
  };

  const DIET_TYPE_COLORS: Record<string, string> = {
    VEGETARIAN: 'green',
    PESCATARIAN: 'blue',
    HALAL: 'orange',
    KOSHER: 'purple',
    VEGAN: 'magenta',
  };
  const DIET_TYPES = [
    { label: <Tag color={DIET_TYPE_COLORS['VEGETARIAN']}>Vegetarian</Tag>, value: 'VEGETARIAN' },
    { label: <Tag color={DIET_TYPE_COLORS['PESCATARIAN']}>Pescatarian</Tag>, value: 'PESCATARIAN' },
    { label: <Tag color={DIET_TYPE_COLORS['HALAL']}>Halal</Tag>, value: 'HALAL' },
    { label: <Tag color={DIET_TYPE_COLORS['KOSHER']}>Kosher</Tag>, value: 'KOSHER' },
    { label: <Tag color={DIET_TYPE_COLORS['VEGAN']}>Vegan</Tag>, value: 'VEGAN' },
  ];

  const EMPLOYMENT_TYPE_COLORS: Record<string, string> = {
    FULLTIME: 'green',
    PARTTIME: 'blue',
    WORKING_STUDENT: 'orange',
    THESIS: 'purple',
  };
  
  const EMPLOYMENT_TYPES = [
    { label: <Tag color={EMPLOYMENT_TYPE_COLORS['FULLTIME']}>Full time</Tag>, value: 'FULLTIME' },
    { label: <Tag color={EMPLOYMENT_TYPE_COLORS['PARTTIME']}>Part time</Tag>, value: 'PARTTIME' },
    { label: <Tag color={EMPLOYMENT_TYPE_COLORS['WORKING_STUDENT']}>Working Student</Tag>, value: 'WORKING_STUDENT' },
    { label: <Tag color={EMPLOYMENT_TYPE_COLORS['THESIS']}>Thesis</Tag>, value: 'THESIS' },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleFinish}
    >
      <Form.Item label="GitLab Username" name={["profile", "gitlabUsername"]} rules={[{ required: true, message: 'Please enter GitLab Username' }]}> 
        <Input placeholder="Enter GitLab Username" maxLength={500} />
      </Form.Item>
      <Form.Item label="Full Name" name={["profile", "fullName"]} rules={[{ required: true, message: 'Please enter full name' }]}> 
        <Input placeholder="Enter full name" maxLength={500} />
      </Form.Item>
      <Form.Item label="Gender" name={["profile", "gender"]} rules={[{ required: true, message: 'Please select gender' }]}> 
        <Select placeholder="Select gender" maxLength={255}>
          <Option value="Male">Male</Option>
          <Option value="Female">Female</Option>
          <Option value="Diverse">Diverse</Option>
        </Select>
      </Form.Item>
      <Form.Item label="Email" name={["profile", "email"]} rules={[{ required: true, message: 'Please enter email' }]}> 
        <Input placeholder="Enter email" />
      </Form.Item>
      <Form.Item label="Dietary Preference" name={["profile", "dietTypes"]}>
        <Select
          placeholder="Select dietary preference"
          options={DIET_TYPES}
          mode={undefined}
        />
      </Form.Item>
      <Form.Item label="Employment Type" name="employmentType" rules={[{ required: true, message: 'Please select employment type' }]}> 
        <Select placeholder="Select employment type" options={EMPLOYMENT_TYPES} />
      </Form.Item>
      <Form.Item label="Date Joined" name="employmentStartDate" rules={[{ required: true, message: 'Please enter employment start date' }]}> 
        <Input placeholder="Enter date joined" type="date" />
      </Form.Item>
      <Form.Item label="Location" name="location" rules={[{ required: true, message: 'Please enter location' }]}> 
        <Input placeholder="Enter location" />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">Save</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default EmployeeForm;
