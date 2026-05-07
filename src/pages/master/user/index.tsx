import ContentLayout from "@/layout/content-layout";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import TableCustom, { Column } from "@/components/custom-element/table-custom";
import { Pagination, Button, Switch, TextField } from "@mui/material";
import ModalManage from "./components/modal-manage";
import { useEffect, useState } from "react";
import PersonIcon from "@mui/icons-material/Person";
import {
  EditButton,
  ResetButton,
} from "@/components/custom-element/icon-button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  _MasterUserApi,
  _MasterUserKey,
  MasterUserModel,
} from "@/api/controller/master-user";
import {
  BaseSearchModel,
  BaseSearchQueryModel,
  PaginationModel,
} from "@/api/interface";
import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

interface IActionMutate {
  state: "create" | "update" | "delete" | "changeActive";
  payload?: MasterUserModel;
  id?: string | number;
}

const PageMasterUser = (): JSX.Element => {
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedUser, setSelectedUser] = useState<MasterUserModel | null>(
    null,
  );

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
      label: "รหัสผู้ใช้งาน",
      width: "15%",
      render: (row: MasterUserModel) => (
        <div className="flex space-x-1 items-center">
          <span className="bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-lg tracking-wider font-['Sarabun',sans-serif]">
            {row.code || row.id}
          </span>
          {!row?.isRefactorPassword && (
            <VpnKeyIcon color="warning" sx={{ fontSize: 18 }} />
          )}
        </div>
      ),
    },
    {
      field: "name",
      label: "ชื่อ-นามสกุล",
      width: "40%",
      render: (row: MasterUserModel) => (
        <div className="flex items-center gap-3 font-['Sarabun',sans-serif]">
          <div className="bg-pink-50 p-1.5 rounded-full flex items-center justify-center shrink-0">
            <PersonIcon className="text-secondary" sx={{ fontSize: 18 }} />
          </div>
          <span className="font-bold text-gray-800 text-[15px] truncate">
            {row.title} {row.firstname} {row.surname}
          </span>
        </div>
      ),
    },
    {
      field: "username",
      label: "ชื่อผู้ใช้ (Username)",
      width: "15%",
      bodyAlign: "center",
      render: (row: MasterUserModel) => row.username || "-",
    },
    {
      field: "phone",
      label: "เบอร์ติดต่อ",
      width: "10%",
      bodyAlign: "center",
      render: (row: MasterUserModel) => row.phone || "-",
    },
    {
      field: "status",
      label: "สถานะ",
      width: "10%",
      bodyAlign: "center",
      render: (row: MasterUserModel) => (
        <Switch
          disabled={row?.mas_branch?.isActive === false}
          checked={row.isActive}
          onChange={() => onChangeSwitch(row)}
        />
      ),
    },
    {
      field: "actions",
      label: "การจัดการ",
      width: "10%",
      bodyAlign: "right",
      render: (row: MasterUserModel) => (
        <div className="flex justify-end gap-2">
          <ResetButton onClick={() => onResetPassword(row)} />
          <EditButton
            onClick={() => {
              setSelectedUser(row);
              setModalMode("update");
              setOpenModal(true);
            }}
          />
          {/* <DeleteButton onClick={() => handleDelete(row)} /> */}
        </div>
      ),
    },
  ];

  const onResetPassword = async (row: MasterUserModel) => {
    try {
      setLoadingContext(true);
      await _MasterUserApi().resetPassword(Number(row.id));
      setAlertContext({
        type: "success",
        message: "รีเซ็ตรหัสผ่านสำเร็จ",
      });
      queryClient.invalidateQueries({
        queryKey: [_MasterUserKey().search],
      });
    } catch (err: any) {
      setAlertContext({
        type: "warning",
        message: err?.message || "เกิดข้อผิดพลาดในการดำเนินการ",
      });
    } finally {
      setLoadingContext(false);
    }
  };

  const { mutate: onAction, isPending: isLoadingAction } = useMutation({
    mutationFn: async ({
      state,
      payload,
    }: IActionMutate): Promise<
      "create" | "update" | "delete" | "changeActive"
    > => {
      if (state === "create" && payload) {
        await _MasterUserApi().create(payload);
      } else if (state === "update" && payload) {
        const {
          mas_branch,
          createdDate,
          updatedDate,
          deletedDate,
          no,
          id,
          ...newPayload
        } = payload as any;
        await _MasterUserApi().update(
          Number(id),
          newPayload as MasterUserModel,
        );
      } else if (state === "changeActive" && payload) {
        await _MasterUserApi().changeActiveStatus(
          Number(payload.id),
          Boolean(payload.isActive),
        );
      }
      return state;
    },
    onSuccess(state) {
      const msgs = {
        create: "เพิ่มผู้ใช้งานสำเร็จ",
        update: "อัปเดตผู้ใช้งานสำเร็จ",
        delete: "ลบผู้ใช้งานสำเร็จ",
        changeActive: "เปลี่ยนสถานะสำเร็จ",
      };
      setAlertContext({
        type: "success",
        message: msgs[state],
      });
      queryClient.invalidateQueries({
        queryKey: [_MasterUserKey().search],
      });
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

  const { data: rows, isLoading: isLoadingRows } = useQuery({
    queryKey: [_MasterUserKey().search, pagination?.page, debouncedSearch],
    queryFn: async (): Promise<BaseSearchQueryModel> => {
      const payload: BaseSearchModel = {
        page: pagination.page,
        limit: pagination.limit,
        filterOperator: "or",
        relation: ["mas_branch"],
        filter: debouncedSearch
          ? [
              { field: "firstname", operator: "like", value: debouncedSearch },
              { field: "surname", operator: "like", value: debouncedSearch },
              { field: "username", operator: "like", value: debouncedSearch },
              { field: "code", operator: "like", value: debouncedSearch },
              { field: "phone", operator: "like", value: debouncedSearch },
            ]
          : [],
      };
      try {
        return await _MasterUserApi().search(payload);
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน",
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

  const onChangeSwitch = (row: MasterUserModel) => {
    const payload: MasterUserModel = {
      isActive: !row.isActive,
      id: (row as any).id,
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

  const SearchAction = (): JSX.Element => {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6 md:mt-0 w-full md:w-auto font-['Sarabun',sans-serif]">
        <TextField
          variant="outlined"
          placeholder="ค้นหารหัส ชื่อ นามสกุล Username..."
          className="w-full sm:w-64 md:w-80 flex-1 sm:flex-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            setSelectedUser(null);
            setModalMode("create");
            setOpenModal(true);
          }}
        >
          เพิ่มผู้ใช้งานใหม่
        </Button>
      </div>
    );
  };

  return (
    <>
      <ContentLayout
        titlePage="จัดการข้อมูลผู้ใช้งาน"
        subTitlePage="เพิ่ม เเก้ไข ข้อมูลผู้ใช้งาน"
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
        initialData={selectedUser}
        onClose={() => setOpenModal(false)}
        onSubmit={(payload, mode) => {
          onAction({ state: mode, payload });
          setOpenModal(false);
        }}
      />
    </>
  );
};

export default PageMasterUser;
