import ContentLayout from "@/layout/content-layout";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import TableCustom, { Column } from "@/components/custom-element/table-custom";
import { Pagination, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import InventoryIcon from "@mui/icons-material/Inventory";
import { EditButton } from "@/components/custom-element/icon-button";
import { PaginationModel } from "@/api/interface";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";
import {
  _StockApi,
  _StockKey,
  SearchStockModel,
  StockModel,
} from "@/api/controller/trn-stock";
import ModalImport from "./components/modal-import";
import ModalUpdate from "./components/modal-update";
import { getLoginStorage } from "@/helpers/set-storage";

const PageStock = (): JSX.Element => {
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<StockModel | null>(null);
  const [pagination, setPagination] = useState<PaginationModel>({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const profile = getLoginStorage().profile;

  const columns: Column[] = [
    {
      field: "code",
      label: "รหัสสินค้า",
      width: "15%",
      bodyAlign: "center",
      render: (row: StockModel) => {
        return (
          <span className="bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-lg tracking-wider font-['Sarabun',sans-serif]">
            {row.mas_product?.code}
          </span>
        );
      },
    },
    {
      field: "name",
      label: "ชื่อสินค้า",
      width: "55%",
      render: (row: StockModel) => (
        <div className="flex items-center gap-3 font-['Sarabun',sans-serif]">
          <div className="bg-pink-50 p-1.5 rounded-full flex items-center justify-center shrink-0">
            <InventoryIcon className="text-secondary" sx={{ fontSize: 18 }} />
          </div>
          <span className="font-bold text-gray-800 text-[15px] truncate">
            {row.mas_product?.name}
          </span>
        </div>
      ),
    },
    {
      field: "price",
      label: "ราคา",
      width: "10%",
      bodyAlign: "center",
      render: (row: StockModel) => {
        return (
          <span className="font-['Sarabun',sans-serif]">
            {row?.mas_product?.price
              ? parseFloat(row?.mas_product?.price.toString()).toLocaleString()
              : "-"}
          </span>
        );
      },
    },
    {
      field: "status",
      label: "คงเหลือ",
      width: "10%",
      bodyAlign: "center",
      render: (row: StockModel) => row.quantity,
    },
    {
      field: "actions",
      label: "การจัดการ",
      width: "10%",
      bodyAlign: "right",
      render: (row: StockModel) => (
        <div className="flex justify-end">
          <EditButton
            onClick={() => {
              setSelectedRow(row);
              setOpenUpdateModal(true);
            }}
          />
        </div>
      ),
    },
  ];

  const { data: rows, isLoading: isLoadingRows } = useQuery({
    queryKey: [_StockKey().search, pagination?.page, debouncedSearch],
    queryFn: async () => {
      const payload: SearchStockModel = {
        page: pagination.page,
        limit: pagination.limit,
        filterOperator: "or",
        relation: ["mas_branch", "mas_product"],
        filter: debouncedSearch
          ? [
              {
                field: "mas_product.name",
                operator: "like",
                value: debouncedSearch,
              },
              {
                field: "mas_product.code",
                operator: "like",
                value: debouncedSearch,
              },
            ]
          : [],
        advanceFilter: {
          branchId: profile?.mas_branch?.id
            ? profile?.mas_branch?.id
            : undefined,
        },
      };

      try {
        return await _StockApi().search(payload);
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดำเนินการ",
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

  const { mutate: onSaveAction, isPending: isLoadingAction } = useMutation({
    mutationFn: async (payload: StockModel) => {
      if (selectedRow?.id) {
        console.log("payload--> ", payload);
        const { id, ...newPayload } = payload;
        await _StockApi().update(id as number, newPayload);
      } else {
        await _StockApi().import(payload);
      }
    },
    onSuccess() {
      setAlertContext({
        type: "success",
        message: selectedRow ? "อัปเดตข้อมูลสต็อกสำเร็จ" : "นำเข้าสินค้าสำเร็จ",
      });
      queryClient.invalidateQueries({
        queryKey: [_StockKey().search],
      });
      setOpenModal(false);
      setOpenUpdateModal(false);
      setSelectedRow(null);
    },
    onError(err: any) {
      setAlertContext({
        type: "warning",
        message: err?.message || "เกิดข้อผิดพลาดในการดำเนินการ",
      });
    },
    onSettled() {
      setLoadingContext(false);
    },
  });

  const SearchAction = (): JSX.Element => {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6 md:mt-0 w-full md:w-auto font-['Sarabun',sans-serif]">
        <TextField
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหารหัส หรือ ชื่อสินค้า..."
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
              fontFamily: "'Sarabun',sans-serif",
            },
          }}
        />

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon sx={{ color: "white" }} />}
          size="large"
          onClick={() => {
            setOpenModal(true);
          }}
        >
          เพิ่มสินค้าใหม่
        </Button>
      </div>
    );
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
    const finalLoad = isLoadingRows || isLoadingAction;
    setLoadingContext(finalLoad);
  }, [setLoadingContext, isLoadingRows, isLoadingAction]);

  return (
    <>
      <ContentLayout
        titlePage="ข้อมูลการจัดการคลังสินค้า"
        subTitlePage="เพิ่ม เเก้ไข ข้อมูลการจัดการคลังสินค้า"
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

      <ModalImport
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={(payload) => onSaveAction(payload)}
      />

      <ModalUpdate
        open={openUpdateModal}
        onClose={() => {
          setOpenUpdateModal(false);
          setSelectedRow(null);
        }}
        onSubmit={(payload) => onSaveAction(payload)}
        initialData={selectedRow}
      />
    </>
  );
};

export default PageStock;
