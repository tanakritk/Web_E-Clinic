import CardCustom from "@/components/custom-element/card-custom";
import TableCustom, { Column } from "@/components/custom-element/table-custom";
import { IconButton, Pagination } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { _SaleApi, _SaleKey, SearchSaleModel } from "@/api/controller/trn-sale";
import { PaginationModel } from "@/api/interface";
import { useAlert } from "@/context/alert-context";
import dayjs from "dayjs";

interface TreatmentHistoryProps {
  customerId?: string | number;
}

const TreatmentHistory = ({
  customerId,
}: TreatmentHistoryProps): JSX.Element => {
  const { setAlertContext } = useAlert();

  const [pagination, setPagination] = useState<PaginationModel>({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const { data: saleResult } = useQuery({
    queryKey: [_SaleKey().search, "customer-info", customerId, pagination.page],
    queryFn: async () => {
      const payload: SearchSaleModel = {
        page: pagination.page,
        limit: pagination.limit,
        sorting: [{ field: "createdDate", pattern: "DESC" }],
        filterOperator: "and",
        filter: [
          { field: "mas_customer.id", operator: "=", value: customerId },
        ],
      };
      try {
        return await _SaleApi().search(payload);
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดึงประวัติการซื้อ",
          type: "warning",
        });
        return null;
      }
    },
    enabled: !!customerId,
  });

  useEffect(() => {
    if (saleResult?.paginationData) {
      setPagination((prev) => ({
        ...prev,
        totalPages: saleResult.paginationData.totalPages,
        totalItems: saleResult.paginationData.totalItems,
      }));
    }
  }, [saleResult]);

  const rows = saleResult?.data ?? [];

  const columns: Column[] = [
    {
      field: "saleDate",
      label: "วันที่",
      width: "15%",
      bodyAlign: "center",
      render: (row: any) =>
        row.saleDate ? dayjs(row.saleDate).format("DD/MM/BBBB HH:mm") : "-",
    },
    {
      field: "receiptNo",
      label: "เลขที่บิล",
      width: "20%",
      bodyAlign: "center",
      render: (row: any) => (
        <span className="bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-lg tracking-wider">
          {row.receiptNo || "-"}
        </span>
      ),
    },
    {
      field: "totalAmount",
      label: "จำนวนเงิน",
      width: "20%",
      bodyAlign: "center",
      render: (row: any) => (
        <span className="font-semibold text-green-600">
          {row.totalAmount
            ? parseFloat(row.totalAmount.toString()).toLocaleString()
            : "0.00"}
        </span>
      ),
    },
    {
      field: "payment",
      label: "วิธีชำระ",
      width: "15%",
      bodyAlign: "center",
      render: (row: any) => (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#fde9f1] text-primary text-xs font-bold w-fit">
          {row.payment || "-"}
        </div>
      ),
    },
    // {
    //   field: "action",
    //   label: "",
    //   width: "10%",
    //   bodyAlign: "center",
    //   render: () => (
    //     <VisibilityIcon
    //       sx={{ color: "#4CAF50", fontSize: 20, cursor: "pointer" }}
    //     />
    //   ),
    // },
  ];

  return (
    <CardCustom className="p-0 border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4 border-b-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">ประวัติการซื้อ</h2>
        </div>
        <div className="flex gap-2">
          <IconButton
            size="small"
            sx={{
              backgroundColor: "#F5F2F5",
              borderRadius: "8px",
              p: 1,
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            <FilterListIcon fontSize="small" sx={{ color: "#A0A0A0" }} />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              backgroundColor: "#F5F2F5",
              borderRadius: "8px",
              p: 1,
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            <FileDownloadOutlinedIcon
              fontSize="small"
              sx={{ color: "#A0A0A0" }}
            />
          </IconButton>
        </div>
      </div>

      <div className="">
        <TableCustom columns={columns} rows={rows} px={false} border={false} />
        {rows.length === 0 && (
          <div className="py-10 flex justify-center items-center text-[#8B93A6] text-sm">
            ไม่พบประวัติการซื้อ
          </div>
        )}
        <div className="mt-5 flex justify-end items-center px-6 pb-4">
          <Pagination
            shape="rounded"
            count={pagination.totalPages}
            page={pagination.page}
            color="primary"
            onChange={(_, page) => setPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      </div>
    </CardCustom>
  );
};

export default TreatmentHistory;
