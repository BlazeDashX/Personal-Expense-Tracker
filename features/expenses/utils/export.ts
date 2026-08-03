// file: features/expenses/utils/export.ts
import * as xlsx from "xlsx";
import { format } from "date-fns";
import type { ExpenseColumnType } from "../components/columns";

export function downloadDataAsFile(data: ExpenseColumnType[], filename: string, type: "csv" | "xlsx") {
  if (!data || data.length === 0) return;

  const formattedData = data.map((row) => ({
    Date: format(new Date(row.expenseDate), "yyyy-MM-dd"),
    Description: row.description,
    Category: row.category.name,
    "Payment Method": row.paymentMethod.name,
    Amount: row.amount,
  }));

  const worksheet = xlsx.utils.json_to_sheet(formattedData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Expenses");

  if (type === "csv") {
    xlsx.writeFile(workbook, `${filename}.csv`);
  } else {
    xlsx.writeFile(workbook, `${filename}.xlsx`);
  }
}