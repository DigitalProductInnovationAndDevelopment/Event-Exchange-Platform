import {Button, Card, Col, DatePicker, Input, Row, Select, Space, Switch, Table, Tag, Typography} from 'antd';
import {AppstoreOutlined, EyeOutlined, PlusOutlined, SearchOutlined, UnorderedListOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import {useEffect, useMemo, useState} from 'react';
import {Breadcrumb} from '../../components/Breadcrumb';
import type {ColumnsType} from 'antd/es/table';
import type {Dayjs} from 'dayjs';
import dayjs from 'dayjs';
import type {Event, EventStatus, EventType} from '../../types/event';
import {EVENT_STATUS_COLORS, EVENT_TYPE_COLORS} from '../../types/event';
import useApiService from "../../services/apiService.ts";

const {Title} = Typography;
const {RangePicker} = DatePicker;

export const EventsList = () => {
    const navigate = useNavigate();
    const [isTableView, setIsTableView] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedType, setSelectedType] = useState<EventType | null>(null);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [fetchedEvents, setEvents] = useState<Event[]>([]);
    const {getEvents} = useApiService();

    useEffect(() => {
        (async () => {
            try {
                const data = await getEvents();
                setEvents(data ?? []);
            } catch (err) {
                console.error('Failed to fetch events:', err);
            }
        })();
    }, [getEvents]);

    const events = useMemo(() => fetchedEvents.map(e => ({...e, key: e.id})), [fetchedEvents]);

    // Filter events based on all criteria
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            // Search text filter
            const matchesSearch = searchText === '' ||
                event.name.toLowerCase().includes(searchText.toLowerCase()) ||
                event.location.toLowerCase().includes(searchText.toLowerCase());

            // Event type filter
            const matchesType = !selectedType || event.eventType === selectedType;

            // Date range filter
            const matchesDateRange = !dateRange || !dateRange[0] || !dateRange[1] || (
                new Date(event.date) >= dateRange[0].toDate() &&
                new Date(event.date) <= dateRange[1].toDate()
            );

            return matchesSearch && matchesType && matchesDateRange;
        });
    }, [events, searchText, selectedType, dateRange]);

    const columns: ColumnsType<Event> = [
        {
            title: 'Event Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Type',
            dataIndex: 'eventType',
            key: 'eventType',
            render: (type: EventType) => (
                <Tag color={EVENT_TYPE_COLORS[type]}>
                    {type.toUpperCase()}
                </Tag>
            ),
            filters: Object.entries(EVENT_TYPE_COLORS).map(([type, _]) => ({
                text: type.replace(/-/g, ' '),
                value: type
            })),
            onFilter: (value, record) => record.eventType === value,
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
            sorter: (a, b) => a.participants - b.participants,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: EventStatus) => (
                <Tag color={EVENT_STATUS_COLORS[status]}>
                    {status?.toUpperCase()}
                </Tag>
            ),
            filters: Object.entries(EVENT_STATUS_COLORS).map(([status, _]) => ({
                text: status?.charAt(0).toUpperCase() + status.slice(1),
                value: status
            })),
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EyeOutlined/>}
                        onClick={() => navigate(`/events/${record.id}`)}
                    >
                        View
                    </Button>
                </Space>
            ),
        },
    ];

    // Split events into upcoming/ongoing and past events
    const upcomingEvents = filteredEvents
        // TODO
        // .filter(event => event.status === 'upcoming' || event.status === 'ongoing')
        .filter(event => new Date(event.date).getTime() > new Date().getTime())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const pastEvents = filteredEvents
        // TODO
        // .filter(event => event.status === 'completed')
        .filter(event => new Date(event.date).getTime() < new Date().getTime())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <Breadcrumb
                items={[
                    {path: '/events', label: 'Events'}
                ]}
            />

            <div className="flex justify-between items-center mb-6">
                <Title level={2} className="m-0">Events</Title>
                <div className="flex items-center gap-4">
                    <Space>
                        <UnorderedListOutlined className={isTableView ? "text-blue-500" : "text-gray-400"}/>
                        <Switch
                            checked={!isTableView}
                            onChange={(checked) => setIsTableView(!checked)}
                            className="bg-gray-200"
                        />
                        <AppstoreOutlined className={!isTableView ? "text-blue-500" : "text-gray-400"}/>
                    </Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined/>}
                        onClick={() => navigate('/events/create')}
                    >
                        Create Event
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
                <Row gutter={16}>
                    <Col span={8}>
                        <Input
                            placeholder="Search events..."
                            prefix={<SearchOutlined/>}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col span={8}>
                        <Select
                            placeholder="Event Type"
                            style={{width: '100%'}}
                            allowClear
                            value={selectedType}
                            onChange={setSelectedType}
                            options={Object.entries(EVENT_TYPE_COLORS).map(([value]) => ({
                                value,
                                label: value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                            }))}
                        />
                    </Col>
                    <Col span={8}>
                        <RangePicker
                            style={{width: '100%'}}
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Upcoming Events Section */}
            <div className="mb-8">
                <Title level={3} className="mb-4">Upcoming Events</Title>
                {isTableView ? (
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={upcomingEvents}
                        pagination={false}
                    />
                ) : (
                    <Row gutter={[16, 16]}>
                        {upcomingEvents.map((event) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                                <Card
                                    hoverable
                                    className="h-full"
                                    actions={[
                                        <Button
                                            type="text"
                                            icon={<EyeOutlined/>}
                                            onClick={() => navigate(`/events/${event.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    ]}
                                >
                                    <Card.Meta
                                        title={event.name}
                                        description={
                                            <div className="space-y-2">
                                                <div className="text-gray-600">
                                                    <div>Date: {event.date}</div>
                                                    <div>Location: {event.location}</div>
                                                    <div>Participants: {event.participants}</div>
                                                </div>
                                                <Space>
                                                    {/* TODO

                                                    <Tag color={EVENT_STATUS_COLORS[event.status]}>
                                                        {event.status.toUpperCase()}
                                                    </Tag>
                                                    <Tag color={EVENT_TYPE_COLORS[event.eventType]}>
                                                        {event.eventType.toUpperCase()}
                                                    </Tag>*/}
                                                </Space>
                                            </div>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            {/* Past Events Section */}
            <div>
                <Title level={3} className="mb-4">Past Events</Title>
                {isTableView ? (
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={pastEvents}
                        pagination={{pageSize: 15}}
                    />
                ) : (
                    <Row gutter={[16, 16]}>
                        {pastEvents.map((event) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                                <Card
                                    hoverable
                                    className="h-full"
                                    actions={[
                                        <Button
                                            type="text"
                                            icon={<EyeOutlined/>}
                                            onClick={() => navigate(`/events/${event.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    ]}
                                >
                                    <Card.Meta
                                        title={event.name}
                                        description={
                                            <div className="space-y-2">
                                                <div className="text-gray-600">
                                                    <div>Date: {event.date}</div>
                                                    <div>Location: {event.location}</div>
                                                    <div>Participants: {event.participants}</div>
                                                </div>
                                                <Space>
                                                    {/* TODO

                                                    <Tag color={EVENT_STATUS_COLORS[event.status]}>
                                                        {event.status?.toUpperCase()}
                                                    </Tag>
                                                    <Tag color={EVENT_TYPE_COLORS[event.eventType]}>
                                                        {event.eventType.toUpperCase()}
                                                    </Tag>*/}
                                                </Space>
                                            </div>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
}; 