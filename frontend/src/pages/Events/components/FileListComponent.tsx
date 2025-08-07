import React from "react";
import { Button, List, Popconfirm, Space, Typography } from "utils/antd.tsx";
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import type { FileEntity } from "types/event.ts";
import { useAuth } from "../../../contexts/AuthContext";

const { Text } = Typography;

const FileListDisplay: React.FC<FileListDisplayProps> = ({ files, onDelete, onDownload }) => {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin();

  return (
    <div className="mb-4">
      <List
        dataSource={files}
        bordered
        size="small"
        locale={{ emptyText: "No files available." }}
        pagination={{
          pageSize: 5,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          showQuickJumper: false,
        }}
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
                  {isAdmin && <Button danger icon={<DeleteOutlined />} />}
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
