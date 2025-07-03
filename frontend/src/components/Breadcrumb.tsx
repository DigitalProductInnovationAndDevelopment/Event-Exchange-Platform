import {Breadcrumb as AntBreadcrumb} from "antd";
import {Link} from "react-router-dom";

export interface BreadcrumbItem {
  path: string;
  label: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export const Breadcrumb = ({ items = [] }: BreadcrumbProps) => {
  const breadcrumbItems = items.map(item => ({
    key: item.path,
    title: <Link to={item.path}>{item.label}</Link>,
  }));

  return (
    <AntBreadcrumb className="mb-4">
      {breadcrumbItems.map(item => (
        <AntBreadcrumb.Item key={item.key}>{item.title}</AntBreadcrumb.Item>
      ))}
    </AntBreadcrumb>
  );
};
