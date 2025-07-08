import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeForm from "./EmployeeForm";
import { Button, Card, Form, message, Spin, Typography } from "antd";
import { Breadcrumb } from "components/Breadcrumb";
import useApiService from "services/apiService";
import type { Employee } from "types/employee.ts";

const { Title } = Typography;

export const EmployeeEdit = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { getEmployeeById, updateEmployee } = useApiService();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getEmployeeById(employeeId!) ?? null;
        setEmployee(data);
      } catch (err) {
        message.error("Failed to fetch employee");
        console.error("Failed to fetch employee:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [employeeId, getEmployeeById]);

  const handleFinish = async (values: Employee) => {
    setSaving(true);
    try {
      // Ensure authorities is always an array
      if (
        values.profile &&
        values.profile.authorities &&
        !Array.isArray(values.profile.authorities)
      ) {
        values.profile.authorities = [values.profile.authorities];
      }
      // No gender normalization
      await updateEmployee(employeeId!, values);
      message.success("Employee updated successfully");
      navigate(`/employees/${employeeId!}`);
    } catch (error) {
      message.error("Failed to update employee");
      console.error("Error updating employee:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (<div className="flex justify-center items-center h-screen">
      <Spin size="large" tip="Loading employee details..." />
    </div>);
  }

  // Normalize gender to uppercase for initialValues
  const normalizedInitialValues = employee
    ? {
      ...employee,
      profile: {
        ...employee.profile,
        gender: employee.profile.gender?.toUpperCase() || undefined,
      },
    }
    : { profile: { gender: undefined } };

  return (
    <div style={{ padding: 0 }}>
      <Breadcrumb
        items={[
          { path: "/employees", label: "Employees" },
          { path: `/employees/${employeeId}/edit`, label: "Edit Employee" },
        ]}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Edit Employee
        </Title>
        <div style={{ display: "flex" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            onClick={() => form.submit()}
            style={{ marginRight: 8 }}
          >
            Save
          </Button>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </div>
      <Card>
        <EmployeeForm initialValues={normalizedInitialValues} onSave={handleFinish} form={form} />
      </Card>
    </div>
  );
};
