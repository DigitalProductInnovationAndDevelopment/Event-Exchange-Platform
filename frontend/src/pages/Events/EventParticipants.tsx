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
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "components/Breadcrumb";
import { useEffect, useState } from "react";
import useApiService from "../../services/apiService";
import { DeleteOutlined, UploadOutlined, UserAddOutlined } from "@ant-design/icons";
import type { Employee, ParticipationDetails } from "types/employee.ts";
import { parse } from "papaparse";
import Papa from "papaparse";

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
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importedRows, setImportedRows] = useState<{ email: string; guestCount: number }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEventParticipants(eventId!);
        setParticipants(data ?? []);
      } catch (err) {
        console.error("Failed to fetch participants of the event:", err);
      }
    })();
  }, [eventId, getEventParticipants]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEmployees();
        setAllEmployees(data ?? []);
      } catch (err) {
        console.error("Failed to fetch all employees in the system:", err);
      }
    })();
  }, [getEmployees]);

  const allEmployeesFiltered = allEmployees
    .filter(
      p =>
        (p.profile.fullName.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          p.profile.email.toLowerCase().includes(employeeSearch.toLowerCase())) &&
        !participants.some(participant => participant.employeeId === p.profile.id)
    )
    .sort((a, b) => a.profile.fullName.localeCompare(b.profile.fullName));

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
  };

  const handleAddParticipant = async (values: {
    guestCount: number;
    eventId: string;
    employeeId: string;
  }) => {
    const participant = await addParticipant(values);
    if (participant) {
      participants.push(participant);
      setParticipants([...participants]);
    }
  };

  const handleAddParticipantBatch = async (
    rows: { guestCount: number; email: string; eventId: string }[]
  ) => {
    console.log(rows);
    if (!rows.length) return;
    const emailToEmployee = Object.fromEntries(
      allEmployees.map(e => [e.profile.email, e.profile.id])
    );
    const batch = rows
      .map(row => ({
        guestCount: row.guestCount,
        eventId: row.eventId,
        employeeId: emailToEmployee[row.email],
      }))
      .filter(p => p.employeeId);
    if (batch.length) {
      const newParticipants = await addParticipantsBatch(batch);
      setImportModalOpen(false);
      setImportFile(null);
      setImportedRows([]);
      if (newParticipants) {
        participants.push(...newParticipants);
        setParticipants([...participants]);
      }
    }
  };

  const filteredParticipants = participants.filter(
    e =>
      e.fullName.toLowerCase().includes(participantSearch.toLowerCase()) ||
      e.email.toLowerCase().includes(participantSearch.toLowerCase())
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a: ParticipationDetails, b: ParticipationDetails) =>
        (a.fullName ?? "").localeCompare(b.fullName ?? ""),
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
      render: (record: ParticipationDetails) => (
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
    setImportFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const csv = event.target?.result as string;
        parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<any>) => {
            // Expecting columns: email, guestCount
            const rows = (results.data as any[])
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
          columns={[
            { title: "Name", dataIndex: ["profile", "fullName"], key: "fullName" },
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
              render: (_: any, record: Employee) => (
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
          dataSource={allEmployeesFiltered}
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
          setImportFile(null);
          setImportedRows([]);
        }}
        footer={[
          <Button
            key="addall"
            type="primary"
            disabled={importedRows.length === 0}
            onClick={() =>
              handleAddParticipantBatch(
                importedRows.map(row => ({ ...row, eventId: String(eventId) }))
              )
            }
          >
            Add All
          </Button>,
        ]}
      >
        <Input type="file" accept=".csv" onChange={handleImportFile} className="mb-4" />
        {importFile && <div className="mt-2 text-green-600">Selected file: {importFile.name}</div>}
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
