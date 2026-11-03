import { type TableHTMLAttributes, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { TABLE_STYLES } from "@/shared/components/bvc/tableStyles";
import { cn } from "@/shared/utils/cn";

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className={TABLE_STYLES.frame}>
      <table {...props} className={cn(TABLE_STYLES.table, className)} />
    </div>
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} className={className} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} className={className} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={cn(TABLE_STYLES.row, className)} />;
}

// Hàng tiêu đề: đặt trong <TableHead>
export function TableHeaderRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={cn(TABLE_STYLES.headRow, className)} />;
}

export function TableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props} className={cn(TABLE_STYLES.headCell, className)} />;
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn(TABLE_STYLES.cell, className)} />;
}
