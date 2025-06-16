import React, { useState } from 'react';
import { Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import useApiService from '../services/apiService.ts';

const FileUploadButton = ({ eventId, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const { fileUpload } = useApiService();

  const handleBeforeUpload = file => {
    setFile(file);
    return false;
  };

  const handleUpload = async () => {
    if (!file) {
      message.warning('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);

    try {
      setUploading(true);
      const uploadedFile = await fileUpload(formData);
      onUpload(uploadedFile);
    } catch (error) {
      message.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-row gap-2">
      <div className="flex">
        <Upload beforeUpload={handleBeforeUpload} showUploadList={false}>
          <Button>Select File</Button>
        </Upload>
      </div>
      <Button
        className="flex"
        type="primary"
        block
        icon={<UploadOutlined />}
        onClick={handleUpload}
        loading={uploading}
        disabled={!file}
      >
        Upload File
      </Button>
    </div>
  );
};

export default FileUploadButton;
