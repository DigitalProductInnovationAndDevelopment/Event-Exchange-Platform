import React, {useState} from 'react';
import {Button, Input, message, Modal} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import useApiService from '../../../services/apiService.ts';

const SchematicsCreateButton = ({eventId, onCreate}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [fileName, setFileName] = useState("");
    const [uploading, setUploading] = useState(false);
    const {initiateSchematics} = useApiService();

    const handleCreate = async () => {
        if (!fileName.trim()) {
            message.error("Please enter a valid file name.");
            return;
        }

        setUploading(true);
        try {
            const result = await initiateSchematics(eventId, fileName);
            onCreate(result);
            setFileName("");
            setIsModalVisible(false);
        } catch (error) {
            message.error("Failed to create schematics.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-row gap-2">
            <Button
                block
                className="flex"
                type="primary"
                icon={<PlusOutlined/>}
                onClick={() => setIsModalVisible(true)}
                loading={uploading}
            >
                Create Schematics
            </Button>

            <Modal
                title="Create New Schematics"
                open={isModalVisible}
                onOk={handleCreate}
                onCancel={() => setIsModalVisible(false)}
                okText="Create"
                confirmLoading={uploading}
            >
                <Input
                    placeholder="Enter file name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default SchematicsCreateButton;
