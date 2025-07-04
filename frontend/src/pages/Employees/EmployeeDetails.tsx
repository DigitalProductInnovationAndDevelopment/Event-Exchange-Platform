import { useEffect, useState } from "react";
import { Button, Card, Descriptions, message, Modal, Space, Table, Typography } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { type Employee } from "../../types/employee.ts";
import useApiService from "../../services/apiService.ts";
import { Breadcrumb } from "../../components/Breadcrumb";
import { DIET_TYPES } from "./EmployeeForm";
import type { EventType } from "types/event.ts";
import { EventTypeTag } from "../../components/EventTypeTag.tsx";
import { EmployeeTypeTag } from "../../components/EmployeeTypeTag.tsx";

const { Title } = Typography;

// Table columns for attended events
const eventColumns = [
  {
    title: "Event Name",
    dataIndex: "eventName",
    key: "eventName",
  },
  {
    title: "Date",
    dataIndex: "eventDate",
    key: "eventDate",
    render: (_: any, record: any) => {
      return new Date(record.eventDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
  {
    title: "Type",
    dataIndex: "eventType",
    key: "eventType",
    render: (type: EventType) => <EventTypeTag type={type} />,
  },
  {
    title: "Address",
    dataIndex: "eventAddress",
    key: "eventAddress",
  },
  {
    title: "Guest Count",
    dataIndex: "guestCount",
    key: "guestCount",
  },
  {
    title: "Status",
    dataIndex: "confirmed",
    key: "confirmed",
    render: (_: any, record: any) => {
      return record.confirmed ? "Confirmed" : "Not Confirmed";
    },
  },
];

export const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const { getEmployeeById, deleteEmployee } = useApiService();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEmployeeById(employeeId!);
        setEmployee(data!);
      } catch (err) {
        console.error("Failed to fetch employee:", err);
      }
    })();
  }, [employeeId, getEmployeeById]);

  const basicFields = [
    { label: "Full Name", value: employee?.profile.fullName },
    { label: "Gitlab Username", value: employee?.profile.gitlabUsername },
    {
      label: "Gender",
      value: employee?.profile.gender ? employee.profile.gender.charAt(0).toUpperCase() + employee.profile.gender.slice(1).toLowerCase() : undefined,
    },
    {
      label: "Role",
      value: employee?.profile.authorities?.map((role: string) => role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()),
    },
    {
      label: "Dietary Preferences",
      value: employee?.profile.dietTypes?.length
        ? employee.profile.dietTypes.map(type => {
          const typeObj = DIET_TYPES.find(t => t.value === type);
          return typeObj ? typeObj.label : type;
        })
        : undefined,
    },
    { label: "Location", value: employee?.location },
    {
      label: "Employment Type",
      value: employee?.employmentType
        ? <EmployeeTypeTag type={employee.employmentType} />
        : undefined,
    },
    { label: "Date Joined", value: employee?.employmentStartDate },
  ];

  const contactFields = [{ label: "Email", value: employee?.profile.email }];

  // Scroll to events section if hash is #events
  useEffect(() => {
    if (location.hash === "#events") {
      const el = document.getElementById("events-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  const showDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEmployee(employeeId!);
      message.success("Employee deleted successfully");
      navigate("/employees");
    } catch (error) {
      message.error("Failed to delete employee");
      console.error("Error deleting employee:", error);
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { path: "/employees", label: "Employees" },
          {
            path: `/employees/${employeeId}`,
            label: employee?.profile?.fullName || "Employee Details",
          },
        ]}
      />
      {/* Page Title */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="m-0">
          {employee?.profile?.fullName || "Employee Details"}
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/employees/${employeeId}/edit`)}
          >
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={showDeleteModal}>
            Delete
          </Button>
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
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
            <p style={{ color: "#8c8c8c", fontSize: "14px" }}>This action cannot be undone.</p>
          </Modal>
        </Space>
      </div>

      {/* Basic Information Section (view only) */}
      <Card title="Basic Information" style={{ marginBottom: 24 }}>
        <Descriptions column={2} bordered>
          {basicFields.map(field => (
            <Descriptions.Item label={field.label} key={field.label}>
              {Array.isArray(field.value)
                ? field.value.map((v, i) => (
                  <span key={i} style={{ marginRight: 4 }}>
                      {v}
                    </span>
                ))
                : field.value || ""}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>

      {/* Contact Information Section (view only) */}
      <Card title="Contact Information" style={{ marginBottom: 24 }}>
        <Descriptions column={1} bordered>
          {contactFields.map(
            field =>
              field.value && (
                <Descriptions.Item label={field.label} key={field.label}>
                  {field.value}
                </Descriptions.Item>
              ),
          )}
        </Descriptions>
      </Card>

      {/* Attended Events List Section */}
      <div id="events-section">
        <Card title="Attended Events List" style={{ marginBottom: 24 }}>
          <Table
            columns={eventColumns}
            dataSource={employee?.participations ?? []}
            bordered
            rowKey="key"
            pagination={false}
          />
        </Card>
      </div>
    </div>
  );
};
