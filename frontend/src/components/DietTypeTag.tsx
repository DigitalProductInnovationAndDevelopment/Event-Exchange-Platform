import {Tag} from "antd";


export const DIET_TYPE_COLORS: Record<string, string> = {
    VEGETARIAN: 'green',
    PESCATARIAN: 'blue',
    HALAL: 'orange',
    KOSHER: 'purple',
    VEGAN: 'magenta',
    LACTOSE_FREE: 'cyan',
    GLUTEN_FREE: 'lime',
    KETO: 'gold',
};

export const DietTypeTag = ({type}: { type: string }) => {
    if (!type) return null;
    return <Tag color={DIET_TYPE_COLORS[type]}>{type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')}
    </Tag>;
}