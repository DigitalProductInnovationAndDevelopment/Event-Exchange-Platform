import React from 'react';
import {Button, List, Space, Typography} from 'antd';
import {DeleteOutlined, DownloadOutlined} from '@ant-design/icons';
import type {FileEntity} from "types/event.ts";

const {Text} = Typography;


interface FileListDisplayProps {
    files: FileEntity[];
    onDelete: (fileId: string) => void;
    onDownload: (file: FileEntity) => void;
}

const FileListDisplay: React.FC<FileListDisplayProps> = ({files, onDelete, onDownload}) => {
    return (
        <div className="mb-4">
            <List
                dataSource={files}
                bordered
                size="small"
                renderItem={(file) => (
                    <List.Item
                        actions={[
                            <Space>
                                <Button
                                    icon={<DownloadOutlined/>}
                                    onClick={() => onDownload(file)}
                                />
                                <Button
                                    danger
                                    icon={<DeleteOutlined/>}
                                    onClick={() => onDelete(file.fileId)}
                                />
                            </Space>,
                        ]}
                    >
                        <Text>{file.name}</Text>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default FileListDisplay;
