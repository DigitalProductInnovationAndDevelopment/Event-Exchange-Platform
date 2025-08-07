import {
  Button,
  Card,
  Col,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Typography,
} from "utils/antd.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "components/Breadcrumb";
import React, { useEffect, useState } from "react";
import useApiService from "../../services/apiService";
import { DeleteOutlined, UploadOutlined, UserAddOutlined } from "@ant-design/icons";
import { type Employee, getFullName, type ParticipationDetails } from "types/employee.ts";
import Papa, { parse } from "papaparse";
import type { UUID } from "components/canvas/utils/constants.tsx";
import toast from "react-hot-toast";

const { Title } = Typography;

export const EventParticipants = () => {
  const { eventId, eventName } = useParams();
  const navigate = useNavigate();
  const {
    getEventParticipants,
    getEmployees,
    addParticipant,
    addParticipantsBatch,
    updateParticipant,
    deleteParticipation,
  } = useApiService();
  const [participants, setParticipants] = useState([] as ParticipationDetails[]);
  const [allEmployees, setAllEmployees] = useState([] as Employee[]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeGuests, setEmployeeGuests] = useState<{ [id: string]: number }>({});
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importedRows, setImportedRows] = useState<{ email: string; guestCount: number }[]>([]);
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipationData = async () => {
      try {
        setLoading(true);
        const [participantsData, employeesData] = await Promise.all([
          getEventParticipants(eventId!),
          getEmployees(),
        ]);
        setParticipants(participantsData ?? []);
        setAllEmployees(employeesData ?? []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchParticipationData();
    }
  }, [eventId, getEmployees, getEventParticipants]);

  const allEmployeesFiltered = allEmployees
    .filter(
      p =>
        (getFullName(p.profile).toLowerCase().includes(employeeSearch.toLowerCase()) ||
          p.profile.email.toLowerCase().includes(employeeSearch.toLowerCase())) &&
        !participants.some(participant => participant.employeeId === p.profile.id)
    )
    .sort((a, b) => getFullName(a.profile).localeCompare(getFullName(b.profile)));

  const handleDelete = async (id: string) => {
    const result = await deleteParticipation(id);
    if (result) {
      setParticipants(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleGuestsChange = async (
    participationId: string,
    values: {
      guestCount: number;
      eventId: string;
      employeeId: string;
    }
  ) => {
    try {
      setLoading(true);
      const participant = await updateParticipant(values);
      if (participant) {
        setParticipants(prev =>
          prev.map(p =>
            p.id === participationId
              ? {
                  ...p,
                  guestCount: values.guestCount ?? 0,
                }
              : p
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async (values: {
    guestCount: number;
    eventId: string;
    employeeId: string;
  }) => {
    try {
      setLoading(true);
      const participant = await addParticipant(values);
      if (participant) {
        participants.push(participant);
        setParticipants([...participants]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipantBatch = async (
    eventId: UUID,
    rows: { guestCount: number; email: string }[]
  ) => {
    if (!rows.length) return;
    const emailToEmployee = Object.fromEntries(
      allEmployees.map(e => [e.profile.email, e.profile.id])
    );
    const batch = rows
      .map(row => ({
        guestCount: row.guestCount,
        employeeId: emailToEmployee[row.email],
      }))
      .filter(p => p.employeeId);

    if (batch.length != rows.length) {
      const missingEmails = rows.filter(row => !emailToEmployee[row.email]).map(row => row.email);
      toast.error(`Some emails could not be mapped to employees: ${missingEmails.join(", ")}`, {
        duration: 8000,
      });
    }

    if (batch.length) {
      try {
        setLoading(true);
        // Expecting response: { createdParticipations: [...], updatedParticipations: [...] }
        const batchResult = await addParticipantsBatch(eventId, batch);
        setImportModalOpen(false);
        setImportedRows([]);
        // Force file input to re-render and clear
        setFileInputKey(prev => prev + 1);
        if (batchResult) {
          const createdCount = batchResult.createdParticipations?.length ?? 0;
          const updatedCount = batchResult.updatedParticipations?.length ?? 0;
          toast.success(
            `Participants imported! Created: ${createdCount}, Updated: ${updatedCount}`,
            { duration: 6000 }
          );
          const allNew = [
            ...(batchResult.createdParticipations ?? []),
            ...(batchResult.updatedParticipations ?? []),
          ];
          // Remove duplicates by employeeId
          const merged = [
            ...participants.filter(p => !allNew.some(np => np.employeeId === p.employeeId)),
            ...allNew,
          ];
          setParticipants(merged);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredParticipants = participants.filter(
    e =>
      getFullName(e).toLowerCase().includes(participantSearch.toLowerCase()) ||
      e.email.toLowerCase().includes(participantSearch.toLowerCase())
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: ParticipationDetails, b: ParticipationDetails) =>
        getFullName(a).localeCompare(getFullName(b)),
      render: (_: unknown, record: ParticipationDetails) => getFullName(record),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      sorter: (a: ParticipationDetails, b: ParticipationDetails) =>
        (a.lastName ?? "").localeCompare(b.lastName ?? ""),
      render: (_: unknown, record: ParticipationDetails) => record.lastName ?? "",
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Guests",
      dataIndex: "guestCount",
      key: "guestCount",
      render: (guestCount: number, participant: ParticipationDetails) => (
        <InputNumber
          min={0}
          value={guestCount}
          onChange={value =>
            handleGuestsChange(participant.id, {
              guestCount: value!,
              eventId: eventId!,
              employeeId: participant.employeeId,
            })
          }
        />
      ),
    },
    {
      title: "",
      key: "actions",
      render: (_: unknown, record: ParticipationDetails) => (
        <Popconfirm
          placement="right"
          title="Are you sure you want to delete this participant?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button danger icon={<DeleteOutlined />}>
            Delete{" "}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const csv = event.target?.result as string;
        parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<never>) => {
            // Validate headers
            const expectedHeaders = ["email", "guestCount"];
            const actualHeaders = results.meta.fields || [];
            const hasValidHeaders = expectedHeaders.every(header => actualHeaders.includes(header));
            const hasOnlyExpectedHeaders = actualHeaders.every(header =>
              expectedHeaders.includes(header)
            );

            if (!hasValidHeaders || !hasOnlyExpectedHeaders) {
              toast.error(
                `Invalid CSV format. Expected columns: ${expectedHeaders.join(", ")}. Found: ${actualHeaders.join(", ")}`,
                { duration: 5000 }
              );
              setImportedRows([]);
              return;
            }

            // Expecting columns: email, guestCount
            const rows = (results.data as ParticipationDetails[])
              .map(row => ({
                email: row.email?.trim() || "",
                guestCount: Number(row.guestCount) || 0,
              }))
              .filter(row => row.email);
            setImportedRows(rows);
          },
        });
      };
      reader.readAsText(file);
    } else {
      setImportedRows([]);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { path: "/events", label: "Events" },
          { path: `/events/${eventId}`, label: eventName || "Event" },
          { path: `/events/${eventId}/manage-participants`, label: "Manage Participants" },
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
              value={participantSearch}
              onChange={e => setParticipantSearch(e.target.value)}
              className="mb-4"
            />
            <Table
              loading={loading}
              rowKey={r => r.employeeId}
              columns={columns}
              dataSource={filteredParticipants}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        style={{
          maxHeight: "70vh",
          overflow: "auto",
        }}
        centered
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
          rowKey={r => r.profile.id}
          loading={loading}
          columns={[
            { title: "Name", dataIndex: ["profile", "name"], key: "name" },
            { title: "Last Name", dataIndex: ["profile", "lastName"], key: "lastName" },
            { title: "Email", dataIndex: ["profile", "email"], key: "email" },
            {
              title: "Guests",
              dataIndex: "guestCount",
              key: "guestCount",
              render: (_guestCount: number, record: Employee) => (
                <InputNumber
                  min={0}
                  value={employeeGuests[record.profile.id] ?? 0}
                  onChange={value =>
                    setEmployeeGuests(prev => ({ ...prev, [record.profile.id]: value ?? 0 }))
                  }
                  style={{ width: 80 }}
                  disabled={participants.some(p => p.employeeId === record.profile.id)}
                />
              ),
            },
            {
              title: "",
              key: "actions",
              render: (_: unknown, record: Employee & { id: string }) => (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() =>
                    handleAddParticipant({
                      guestCount: employeeGuests[record.profile.id],
                      eventId: eventId!,
                      employeeId: record.profile.id,
                    })
                  }
                  disabled={participants.some(p => p.employeeId === record.profile.id)}
                >
                  Add
                </Button>
              ),
            },
          ]}
          dataSource={allEmployeesFiltered.map(e => ({ ...e, id: e.profile.id }))}
          pagination={false}
        />
      </Modal>

      <Modal
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        style={{
          maxHeight: "70vh",
          overflow: "auto",
        }}
        centered
        title="Import Participants"
        open={importModalOpen}
        onCancel={() => {
          setImportModalOpen(false);
          setImportedRows([]);
          // Force file input to re-render and clear
          setFileInputKey(prev => prev + 1);
        }}
        footer={[
          <Button
            key="addall"
            type="primary"
            disabled={importedRows.length === 0}
            onClick={() =>
              handleAddParticipantBatch(
                eventId!,
                importedRows.map(row => ({ ...row }))
              )
            }
          >
            Add All
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 12, color: "#faad14" }}>
          <strong>Disclaimer:</strong> Please provide a CSV file with the columns <code>email</code>{" "}
          and <code>guestCount</code>.
        </div>
        <Button
          style={{ marginBottom: 12 }}
          onClick={() => {
            const csvContent = "email;guestCount\nexample@email.com;2\n";
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "participants_template.csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          Download CSV Template
        </Button>
        <Input
          key={fileInputKey}
          type="file"
          accept=".csv"
          onChange={handleImportFile}
          className="mb-4"
        />
        {importedRows.length > 0 && (
          <Table
            columns={[
              { title: "Email", dataIndex: "email", key: "email" },
              { title: "Guest Count", dataIndex: "guestCount", key: "guestCount" },
            ]}
            dataSource={importedRows.map((row, idx) => ({ ...row, key: idx }))}
            pagination={false}
            className="mt-4"
          />
        )}
      </Modal>
    </div>
  );
};
