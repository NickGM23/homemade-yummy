'use client';

import * as React from 'react';

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <table className={`w-full caption-bottom text-sm ${className || ''}`} {...props} />
);

export const TableHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={`bg-gray-50 ${className || ''}`} {...props} />
);

export const TableBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={`${className || ''}`} {...props} />
);

export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`border-b last:border-0 ${className || ''}`} {...props} />
);

export const TableHead = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-gray-900 ${className || ''}`}
    {...props}
  />
);

export const TableCell = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <td className={`p-4 align-middle ${className || ''}`} {...props} />
);
