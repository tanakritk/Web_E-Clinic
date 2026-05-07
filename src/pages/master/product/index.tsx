import ContentLayout from "@/layout/content-layout";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import TableCustom, { Column } from "@/components/custom-element/table-custom";
import { Pagination, Button, Switch, TextField } from "@mui/material";
import ModalManage from "./components/modal-manage";
import { useState, useEffect } from "react";
import InventoryIcon from "@mui/icons-material/Inventory";
import { EditButton } from "@/components/custom-element/icon-button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";
import {
  _MasterProductApi,
  _MasterProductKey,
  MasterProductModel,
} from "@/api/controller/master-product";
import {
  BaseSearchModel,
  BaseSearchQueryModel,
  PaginationModel,
} from "@/api/interface";
import { _MasterCoursesKey } from "@/api/controller/master-courses";

interface IActionMutate {
  state: "create" | "update" | "changeActive";
  payload: MasterProductModel;
}

const PageMasterProduct = (): JSX.Element => {
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] =
    useState<MasterProductModel | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
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
      field: "code",
      label: "รหัสสินค้า",
      width: "15%",
      bodyAlign: "center",
      render: (row: MasterProductModel) => (
        <span className="bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-lg tracking-wider font-['Sarabun',sans-serif]">
          {row.code}
        </span>
      ),
    },
    {
      field: "name",
      label: "ชื่อสินค้า",
      width: "55%",
      render: (row: MasterProductModel) => (
        <div className="flex items-center gap-3 font-['Sarabun',sans-serif]">
          <div className="bg-pink-50 p-1.5 rounded-full flex items-center justify-center shrink-0">
            <InventoryIcon className="text-secondary" sx={{ fontSize: 18 }} />
          </div>
          <span className="font-bold text-gray-800 text-[15px] truncate">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      field: "price",
      label: "ราคา",
      width: "10%",
      bodyAlign: "center",
      render: (row: MasterProductModel) => {
        return (
          <span className="font-['Sarabun',sans-serif]">
            {row.price
              ? parseFloat(row.price.toString()).toLocaleString()
              : "-"}
          </span>
        );
      },
    },
    {
      field: "status",
      label: "สถานะ",
      width: "10%",
      bodyAlign: "center",
      render: (row: MasterProductModel) => (
        <Switch checked={row.isActive} onChange={() => onChangeSwitch(row)} />
      ),
    },
    {
      field: "actions",
      label: "การจัดการ",
      width: "10%",
      bodyAlign: "right",
      render: (row: MasterProductModel) => (
        <div className="flex justify-end">
          <EditButton
            onClick={() => {
              setSelectedProduct(row);
              setModalMode("update");
              setOpenModal(true);
            }}
          />
        </div>
      ),
    },
  ];

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
            },
          }}
        />

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon sx={{ color: "white" }} />}
          size="large"
          onClick={() => {
            setSelectedProduct(null);
            setModalMode("create");
            setOpenModal(true);
          }}
        >
          เพิ่มสินค้าใหม่
        </Button>
      </div>
    );
  };

  const { mutate: onAction, isPending: isLoadingAction } = useMutation({
    mutationFn: async ({
      state,
      payload,
    }: IActionMutate): Promise<"create" | "update" | "changeActive"> => {
      if (state === "create") {
        await _MasterProductApi().create(payload);
      } else if (state === "update") {
        const {
          createdDate,
          updatedDate,
          deletedDate,
          no,
          fileName,
          filePath,
          fileOriginalName,
          fileType,
          id,
          ...newPayload
        } = payload as any;
        await _MasterProductApi().update(
          Number(payload.id),
          newPayload as MasterProductModel,
        );
      } else if (state === "changeActive") {
        await _MasterProductApi().changeActiveStatus(
          Number(payload.id),
          Boolean(payload.isActive),
        );
      }
      return state;
    },
    onSuccess(state) {
      if (state === "create") {
        setAlertContext({
          type: "success",
          message: "สร้างสินค้าสำเร็จ",
        });
      } else if (state === "update") {
        setAlertContext({
          type: "success",
          message: "อัปเดตสินค้าสำเร็จ",
        });
      } else if (state === "changeActive") {
        queryClient.invalidateQueries({
          queryKey: [_MasterCoursesKey().search],
        });
        setAlertContext({
          type: "success",
          message: "เปลี่ยนสถานะสำเร็จ",
        });
      }
      queryClient.invalidateQueries({
        queryKey: [_MasterProductKey().search],
      });
    },
    onError(err) {
      setAlertContext({
        type: "warning",
        message: err?.message || "เกิดข้อผิดพลาดในการดำเนินการ",
      });
    },
    onSettled() {
      setLoadingContext(false);
    },
  });

  const { data: rows, isLoading: isLoadingRows } = useQuery({
    queryKey: [_MasterProductKey().search, pagination?.page, debouncedSearch],
    queryFn: async (): Promise<BaseSearchQueryModel> => {
      const payload: BaseSearchModel = {
        page: pagination.page,
        limit: pagination.limit,
        filterOperator: "or",
        filter: debouncedSearch
          ? [
              { field: "name", operator: "like", value: debouncedSearch },
              { field: "code", operator: "like", value: debouncedSearch },
            ]
          : [],
      };
      try {
        return await _MasterProductApi().search(payload);
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า",
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

  const onChangeSwitch = (row: MasterProductModel) => {
    const payload: MasterProductModel = {
      isActive: !row.isActive,
      id: row.id,
    };
    return onAction({ state: "changeActive", payload });
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
    const finalLoading = isLoadingRows || isLoadingAction;
    setLoadingContext(finalLoading);
  }, [setLoadingContext, isLoadingRows, isLoadingAction]);

  return (
    <>
      <ContentLayout
        titlePage="จัดการข้อมูลสินค้า"
        subTitlePage="เพิ่ม เเก้ไข ข้อมูลสินค้า"
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

      <ModalManage
        open={openModal}
        mode={modalMode}
        initialData={selectedProduct}
        onClose={() => setOpenModal(false)}
        onSubmit={(payload, mode) => {
          onAction({ state: mode, payload });
          setOpenModal(false);
        }}
      />
    </>
  );
};

export default PageMasterProduct;
