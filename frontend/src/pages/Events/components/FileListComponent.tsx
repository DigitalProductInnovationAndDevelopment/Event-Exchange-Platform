import React from 'react';
import {Button, List, Popconfirm, Space, Typography} from 'antd';
import {DeleteOutlined, DownloadOutlined} from '@ant-design/icons';
import type {FileEntity} from 'types/event.ts';

const { Text } = Typography;

const FileListDisplay: React.FC<FileListDisplayProps> = ({ files, onDelete, onDownload }) => {
  return (
    <div className="mb-4">
      <List
        dataSource={files}
        bordered
        size="small"
        locale={{emptyText: "No files available."}}
        renderItem={file => (
          <List.Item
            actions={[
              <Space>
                <Button icon={<DownloadOutlined />} onClick={() => onDownload(file)} />
                  <Popconfirm
                      placement="right"
                      title="Are you sure you want to delete this file?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => onDelete(file.fileId)}
                  >
                      <Button danger icon={<DeleteOutlined/>}/>
                  </Popconfirm>
              </Space>,
            ]}
          >
              <Text ellipsis>{file.name}</Text>
          </List.Item>
        )}
      />
    </div>
  );
};

export default FileListDisplay;

interface FileListDisplayProps {
    files: FileEntity[];
    onDelete: (fileId: string) => void;
    onDownload: (file: FileEntity) => void;
}