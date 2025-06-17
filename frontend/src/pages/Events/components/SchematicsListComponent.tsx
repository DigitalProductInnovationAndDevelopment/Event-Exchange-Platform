import React from "react";
import {Button, List, Popconfirm, Space, Typography} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import type {SchematicsEntity} from "../../../types/event.ts";
import {useNavigate} from "react-router-dom";

const {Text} = Typography;


interface SchematicsListComponentProps {
    schematics: SchematicsEntity[];
    onDelete: (schematicId: string) => void;
}

const SchematicsListComponent: React.FC<SchematicsListComponentProps> = ({
                                                                             schematics,
                                                                             onDelete,
                                                                         }) => {
    const navigate = useNavigate();

    return (
        <div className="mb-4">
            <List
                dataSource={schematics}
                bordered
                size="small"
                locale={{emptyText: "No schematics available."}}
                renderItem={(schematic) => (
                    <List.Item
                        actions={[
                            <Space>
                                <Button
                                    icon={<EditOutlined/>}
                                    onClick={() => navigate(`/canvas/${schematic.id}`)}
                                />
                                <Popconfirm
                                    placement="right"
                                    title="Are you sure you want to delete this schematic?"
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={() => onDelete(schematic.id)}
                                >
                                    <Button
                                        danger
                                        icon={<DeleteOutlined/>}
                                    />
                                </Popconfirm>
                            </Space>,
                        ]}
                    >
                        <Text ellipsis>{schematic.name}</Text>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default SchematicsListComponent;
