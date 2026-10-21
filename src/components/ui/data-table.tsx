import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type DataTableAlign = "left" | "right" | "center";

export interface DataTableColumn<T> {
    header: ReactNode;
    cell: (row: T) => ReactNode;
    align?: DataTableAlign;
    headerClassName?: string;
    cellClassName?: string | ((row: T) => string);
}

export interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
}

export interface DataTableProps<T> {
    data: T[],
    columns: DataTableColumn<T>[];
    rowKey: (row: T) => string | number;
    empty?: EmptyStateProps;
    className?: string;
}