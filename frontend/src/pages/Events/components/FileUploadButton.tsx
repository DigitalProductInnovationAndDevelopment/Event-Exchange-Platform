import { useState } from "react";
import { Button, Upload } from "utils/antd.tsx";
import { CloseOutlined, UploadOutlined } from "@ant-design/icons";
import useApiService from "../../../services/apiService.ts";
import toast from "react-hot-toast";
import type { RcFile } from "antd/es/upload/interface";
import type { UUID } from "components/canvas/utils/constants.tsx";
import type { FileEntity } from "types/event.ts";

const FileUploadButton = ({
                            eventId,
                            onUpload,
                          }: {
  eventId: UUID;
  onUpload: (file: FileEntity | undefined) => Promise<void>;
}) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<RcFile | null>(null);
  const { fileUpload } = useApiService();

  const handleBeforeUpload = (file: RcFile) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10 MB");
      return false;
    }
    setFile(file);
    return true;
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);

    try {
      setUploading(true);
      const uploadedFile: FileEntity | undefined = await fileUpload(formData);
      onUpload(uploadedFile);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const handleCancel = () => {
    setFile(null);
  };

  return (
    <div className="flex flex-col gap-2">
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
        {file && (
          <Button
            onClick={handleCancel}
            disabled={uploading}
            danger
            icon={<CloseOutlined />}
          >
            Cancel
          </Button>
        )}
      </div>

      {file && (
        <div className="text-sm text-gray-600">
          Selected file: {file.name}
        </div>
      )}
    </div>
  );
};

export default FileUploadButton;
