import ContentLayout from "@/layout/content-layout";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import TableCustom, { Column } from "@/components/custom-element/table-custom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Pagination, Button, Switch, TextField } from "@mui/material";
import ModalManage from "./components/modal-manage";
import { useEffect, useState } from "react";
import { EditButton } from "@/components/custom-element/icon-button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  _MasterBranchApi,
  _MasterBranchKey,
  MasterBranchModel,
} from "@/api/controller/master-branch";
import {
  BaseSearchModel,
  BaseSearchQueryModel,
  PaginationModel,
} from "@/api/interface";
import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";
import { _MasterUserKey } from "@/api/controller/master-user";

interface IActionMutate {
  state: "create" | "update" | "changeActive";
  payload: MasterBranchModel;
}

// interface IResponseMutate {
//   state: "create" | "update";
//   data: MasterBranchModel;
// }

const PageMasterBranch = (): JSX.Element => {
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] =
    useState<MasterBranchModel | null>(null);
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
      label: "รหัสสาขา",
      width: "15%",
      bodyAlign: "center",
      render: (row: MasterBranchModel) => (
        <span className="bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-lg tracking-wider font-['Sarabun',sans-serif]">
          {row.code}
        </span>
      ),
    },
    {
      field: "name",
      label: "ชื่อสาขา",
      width: "65%",
      render: (row: MasterBranchModel) => (
        <div className="flex items-center gap-3 font-['Sarabun',sans-serif]">
          <div className="bg-pink-50 p-1.5 rounded-full flex items-center justify-center shrink-0">
            <LocationOnIcon className="text-secondary" sx={{ fontSize: 18 }} />
          </div>
          <span className="font-bold text-gray-800 text-[15px] truncate">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      field: "status",
      label: "สถานะ",
      width: "10%",
      bodyAlign: "center",
      render: (row: MasterBranchModel) => (
        <Switch checked={row.isActive} onChange={() => onChangeSwitch(row)} />
      ),
    },
    {
      field: "actions",
      label: "การจัดการ",
      width: "10%",
      bodyAlign: "right",
      render: (row: MasterBranchModel) => (
        <div className="flex justify-end">
          <EditButton
            onClick={() => {
              setSelectedBranch(row);
              setModalMode("update");
              setOpenModal(true);
            }}
          />
          {/* <DeleteButton /> */}
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
          placeholder="ค้นหารหัส หรือ ชื่อสาขา..."
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
            setSelectedBranch(null);
            setModalMode("create");
            setOpenModal(true);
          }}
        >
          เพิ่มสาขาใหม่
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
        await _MasterBranchApi().create(payload);
      } else if (state === "update") {
        const {
          createdDate,
          updatedDate,
          deletedDate,
          no,
          qrFileName,
          qrFilePath,
          qrFileOriginalName,
          qrFileType,
          ...newPayload
        } = payload as any;
        await _MasterBranchApi().update(
          Number(payload.id),
          newPayload as MasterBranchModel,
        );
      } else if (state === "changeActive") {
        await _MasterBranchApi().changeActiveStatus(
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
          message: "สร้างสาขาสำเร็จ",
        });
      } else if (state === "update") {
        setAlertContext({
          type: "success",
          message: "อัปเดตสาขาสำเร็จ",
        });
      } else if (state === "changeActive") {
        queryClient.invalidateQueries({
          queryKey: [_MasterUserKey().search],
        });
        setAlertContext({
          type: "success",
          message: "เปลี่ยนสถานะสำเร็จ",
        });
      }
      queryClient.invalidateQueries({
        queryKey: [_MasterBranchKey().search],
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
    queryKey: [_MasterBranchKey().search, pagination?.page, debouncedSearch],
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
        return await _MasterBranchApi().search(payload);
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสาขา",
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

  const onChangeSwitch = (row: MasterBranchModel) => {
    const payload: MasterBranchModel = {
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
        titlePage="จัดการข้อมูลสาขา"
        subTitlePage="เพิ่ม เเก้ไข ข้อมูลสาขา"
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
        initialData={selectedBranch}
        onClose={() => setOpenModal(false)}
        onSubmit={(payload, mode) => {
          onAction({ state: mode, payload });
          setOpenModal(false);
        }}
      />
    </>
  );
};

export default PageMasterBranch;
