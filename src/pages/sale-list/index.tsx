import ContentLayout from "@/layout/content-layout";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import TableCustom, { Column } from "@/components/custom-element/table-custom";
import { Pagination, Button, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";
import { BaseSearchQueryModel, PaginationModel } from "@/api/interface";
import { _SaleApi, _SaleKey, SearchSaleModel } from "@/api/controller/trn-sale";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getLoginStorage } from "@/helpers/set-storage";
import {
  BillButton,
  DeleteButton,
} from "@/components/custom-element/icon-button";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import useConfirm from "@/components/drawer-confirm";
import { _StockKey } from "@/api/controller/trn-stock";
import { CryptoHelper } from "@/helpers/encrypt-decrypt";

const PageSaleList = (): JSX.Element => {
  const [confirm, confirmDialog] = useConfirm();
  const queryClient = useQueryClient();
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const navigate = useNavigate();
  const profile = getLoginStorage().profile;

  const [pagination, setPagination] = useState<PaginationModel>({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const columns: Column[] = [
    {
      field: "receiptNo",
      label: "เลขที่ใบเสร็จ",
      width: "15%",
      bodyAlign: "center",
      render: (row: any) => (
        <span className="bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-lg tracking-wider ">
          {row.receiptNo || "-"}
        </span>
      ),
    },
    {
      field: "saleDate",
      label: "วันที่",
      width: "15%",
      bodyAlign: "center",
      render: (row: any) => (
        <span className="">
          {row.saleDate ? dayjs(row.saleDate).format("DD/MM/BBBB HH:mm") : "-"}
        </span>
      ),
    },
    {
      field: "customer",
      label: "ลูกค้า",
      width: "30%",
      render: (row: any) => (
        <div className="flex items-center gap-3 ">
          <div className="bg-pink-50 p-1.5 rounded-full flex items-center justify-center shrink-0">
            <ReceiptLongIcon className="text-secondary" sx={{ fontSize: 18 }} />
          </div>
          <span className="font-bold text-gray-800 text-[15px] truncate">
            {row.mas_customer?.firstname} {row.mas_customer?.surname}{" "}
            {row.mas_customer?.nickname
              ? "(" + row.mas_customer?.nickname + ")"
              : ""}
          </span>
        </div>
      ),
    },
    {
      field: "totalAmount",
      label: "ยอดรวม",
      width: "15%",
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
      label: "การชำระเงิน",
      width: "15%",
      bodyAlign: "center",
      render: (row: any) => {
        return (
          // <Chip
          //   label={row.payment || "-"}
          //   color={color}
          //   size="small"
          //   variant="outlined"
          // />
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#fde9f1] text-primary text-xs font-bold w-fit">
            {row.payment || "-"}
          </div>
        );
      },
    },
    {
      field: "actions",
      label: "จัดการ",
      width: "10%",
      bodyAlign: "center",
      render: (row: any) => (
        <div className="flex justify-end gap-2">
          <BillButton onClick={() => onToBill(row.id)} />
          <DeleteButton onClick={() => onDelete(row.id)} />
        </div>
      ),
    },
  ];
  // navigate(`/bill-detail/${row.id}`)
  const SearchAction = (): JSX.Element => {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6 md:mt-0 w-full md:w-auto ">
        <TextField
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาเลขที่ใบเสร็จ..."
          className="w-full sm:w-64 md:w-80 flex-1 sm:flex-none"
          InputProps={{
            startAdornment: (
              <div className="mr-2 flex items-center text-gray-400">
                <SearchIcon fontSize="small" />
              </div>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "white",
              borderRadius: "1rem", // rounded-2xl
              paddingLeft: "12px",
              boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // shadow-sm
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "transparent" },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
                borderWidth: "1px",
              },
            },
            "& .MuiInputBase-input": {
              padding: "10px 16px 10px 0", // equivalent to py-2.5
              fontSize: "14px",
            },
          }}
        />

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon sx={{ color: "white" }} />}
          size="large"
          onClick={() => {
            navigate("/sale-product");
          }}
        >
          สร้างรายการขาย
        </Button>
      </div>
    );
  };

  const { data: rows, isLoading: isLoadingRows } = useQuery({
    queryKey: [_SaleKey().search, pagination?.page, debouncedSearch],
    queryFn: async (): Promise<BaseSearchQueryModel> => {
      const payload: SearchSaleModel = {
        page: pagination.page,
        limit: pagination.limit,
        filterOperator: "or",
        sorting: [
          {
            field: "createdDate",
            pattern: "DESC",
          },
        ],
        relation: ["mas_customer", "mas_branch"],
        filter: debouncedSearch
          ? [{ field: "receiptNo", operator: "like", value: debouncedSearch }]
          : [],
        advanceFilter: {
          branchId: profile.mas_branch?.id,
        },
      };
      try {
        return await _SaleApi().search(payload);
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลการขาย",
          type: "warning",
        });
        return {
          statusCode: 0,
          message: "",
          data: [],
          paginationData: {
            page: pagination.page,
            limit: pagination.limit,
            totalPages: 1,
            totalItems: 0,
          },
        };
      }
    },
  });

  const onDelete = async (id: number) => {
    const resultConfirm = await confirm("ต้องการลบข้อมูลการขายนี้หรือไม่?");
    if (resultConfirm) {
      setLoadingContext(true);
      try {
        await _SaleApi().delete(id);
        setAlertContext({
          type: "success",
          message: "ลบข้อมูลการขายสำเร็จ",
        });
        queryClient.invalidateQueries({ queryKey: [_SaleKey().search] });
        queryClient.invalidateQueries({ queryKey: [_StockKey().search] });
      } catch (error: any) {
        setAlertContext({
          type: "warning",
          message: error?.message || "เกิดข้อผิดพลาดในการลบข้อมูล",
        });
      } finally {
        setLoadingContext(false);
      }
    }
  };

  const onToBill = (id: number) => {
    const curentId = encodeURIComponent(CryptoHelper.encrypt(id));
    navigate(`/bill-detail/${curentId}`);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search, debouncedSearch]);

  useEffect(() => {
    setLoadingContext(isLoadingRows);
  }, [setLoadingContext, isLoadingRows]);

  return (
    <>
      <ContentLayout
        titlePage="รายการขายสินค้า"
        subTitlePage="ดูรายการประวัติการขาย และจัดการข้อมูล"
        headRightLayout={SearchAction()}
      >
        <div className="w-full px-6 py-8 bg-white mt-6 rounded-xl shadow-sm border border-gray-100">
          <TableCustom
            columns={columns}
            rows={rows?.data || []}
            border={true}
            px={false}
          />
          <div className="flex justify-end mt-6">
            <Pagination
              count={rows?.paginationData?.totalPages || 1}
              page={pagination?.page || 1}
              shape="rounded"
              onChange={(_, page) => {
                setPagination((prev) => ({ ...prev, page }));
              }}
            />
          </div>
        </div>
      </ContentLayout>

      {confirmDialog}
    </>
  );
};

export default PageSaleList;
