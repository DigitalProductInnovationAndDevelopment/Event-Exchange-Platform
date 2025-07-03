import {Tag} from "antd";


export const EMPLOYMENT_TYPE_COLORS: Record<string, string> = {
    FULLTIME: 'green',
    PARTTIME: 'blue',
    WORKING_STUDENT: 'orange',
    THESIS: 'purple',
};

export const EmployeeTypeTag = ({type}: { type: string }) => {
    if (!type) return null;
    return <Tag color={EMPLOYMENT_TYPE_COLORS[type]}>
        {type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')}
    </Tag>;
}