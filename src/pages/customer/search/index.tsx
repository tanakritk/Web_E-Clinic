import { useState, useEffect } from "react";
import ContentLayout from "@/layout/content-layout";
import {
  Button,
  InputAdornment,
  Pagination,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CardCustom from "@/components/custom-element/card-custom";
import SearchIcon from "@mui/icons-material/Search";
import TableCustom, { Column } from "@/components/custom-element/table-custom";
import { EditButton } from "@/components/custom-element/icon-button";
import { useNavigate } from "react-router-dom";
import ModalCreate from "./components/modal-create";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  _MasterCustomerApi,
  _MasterCustomerKey,
  MasterCustomerModel,
  SearchMasterCustomerModel,
} from "@/api/controller/master-customer";
import { BaseSearchQueryModel, PaginationModel } from "@/api/interface";
import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";
import { CryptoHelper } from "@/helpers/encrypt-decrypt";

interface IActionMutate {
  state: "create" | "delete";
  payload: MasterCustomerModel;
}

const PageCustomerSearch = (): JSX.Element => {
  const navigate = useNavigate();
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const queryClient = useQueryClient();

  const [filterType, setFilterType] = useState<string>("all");
  const [openRegisterModal, setOpenRegisterModal] = useState<boolean>(false);
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
      label: "รหัสลูกค้า",
      width: "15%",
      render: (row: MasterCustomerModel) => (
        <span className="bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-lg tracking-wider font-['Sarabun',sans-serif]">
          {row.code}
        </span>
      ),
    },
    {
      field: "name",
      label: "ชื่อ-นามสกุล",
      width: "40%",
      render: (row: MasterCustomerModel) => (
        <span className="font-['Sarabun',sans-serif] font-medium text-gray-800">
          {row.title} {row.firstname} {row.surname}{" "}
          {row.nickname ? "(" + row.nickname + ")" : ""}
        </span>
      ),
    },
    {
      field: "phone",
      label: "เบอร์โทรศัพท์",
      width: "20%",
      render: (row: MasterCustomerModel) => (
        <span className="font-['Sarabun',sans-serif]">{row.phone || "-"}</span>
      ),
    },
    {
      field: "status",
      label: "สถานะ",
      width: "15%",
      bodyAlign: "left",
      render: (row: MasterCustomerModel) => {
        const dateStr = (row as any).createdDate || (row as any).createDate;
        if (dateStr) {
          const createdDate = new Date(dateStr);
          const today = new Date();
          const isToday =
            createdDate.getDate() === today.getDate() &&
            createdDate.getMonth() === today.getMonth() &&
            createdDate.getFullYear() === today.getFullYear();

          if (isToday) {
            return (
              <span className="font-['Sarabun',sans-serif] text-primary bg-pink-50 px-3 py-1 rounded-full text-xs font-bold">
                ลูกค้าใหม่
              </span>
            );
          }
        }
        return <></>;
      },
    },
    {
      field: "actions",
      label: "จัดการ",
      width: "10%",
      bodyAlign: "center",
      render: (row: MasterCustomerModel) => {
        const idEndCode = encodeURIComponent(
          CryptoHelper.encrypt(row.id || ""),
        );
        return (
          <div className="flex justify-center">
            <EditButton
              onClick={() => navigate(`/customer/information/${idEndCode}`)}
            />
          </div>
        );
      },
    },
  ];

  const { mutate: onAction, isPending: isLoadingAction } = useMutation({
    mutationFn: async ({
      state,
      payload,
    }: IActionMutate): Promise<{
      state: "create" | "delete";
      lastId: string | null;
    }> => {
      let lastId = null;
      if (state === "create") {
        const result = await _MasterCustomerApi().create(payload);
        lastId = result.data?.id;
      }
      return { state, lastId };
    },
    onSuccess({ state, lastId }) {
      if (state === "create") {
        setAlertContext({
          type: "success",
          message: "สร้างลูกค้าสำเร็จ",
        });
        const idEnCode = encodeURIComponent(CryptoHelper.encrypt(lastId || ""));
        navigate(`/sale-product/${idEnCode}`);
      } else if (state === "delete") {
        setAlertContext({
          type: "success",
          message: "ลบลูกค้าสำเร็จ",
        });
      }
      queryClient.invalidateQueries({
        queryKey: [_MasterCustomerKey().search],
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
    queryKey: [
      _MasterCustomerKey().search,
      pagination?.page,
      debouncedSearch,
      filterType,
    ],
    queryFn: async (): Promise<BaseSearchQueryModel> => {
      const payload: SearchMasterCustomerModel = {
        page: pagination.page,
        limit: pagination.limit,
        filterOperator: "or",
        filter: debouncedSearch
          ? [
              { field: "firstname", operator: "like", value: debouncedSearch },
              { field: "surname", operator: "like", value: debouncedSearch },
              { field: "phone", operator: "like", value: debouncedSearch },
              { field: "code", operator: "like", value: debouncedSearch },
            ]
          : [],
        advanceFilter: {
          isNew: filterType === "new",
        },
      };

      try {
        return await _MasterCustomerApi().search(payload);
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
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

  const handleFilterChange = (_: unknown, newFilter: string | null) => {
    if (newFilter !== null) {
      setFilterType(newFilter);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  const ButtonAddLayout = () => {
    return (
      <Button
        variant="contained"
        color="primary"
        startIcon={<PersonAddIcon sx={{ color: "white" }} />}
        sx={{
          padding: "10px 24px",
          fontWeight: "bold",
          fontSize: "14px",
          boxShadow: "0 8px 16px -4px rgba(233, 30, 99, 0.4)",
          textTransform: "none",
        }}
        onClick={() => setOpenRegisterModal(true)}
      >
        ลงทะเบียนลูกค้าใหม่
      </Button>
    );
  };
  return (
    <ContentLayout
      titlePage="ค้นหารายชื่อลูกค้า"
      subTitlePage={`พบลูกค้าทั้งหมด ${rows?.paginationData?.totalItems || 0} รายการ`}
      headRightLayout={<ButtonAddLayout />}
    >
      <CardCustom className="mt-6 py-8 px-6">
        <div className="w-full flex flex-wrap items-end">
          <div className="lg:basis-3/5 basis-full px-3">
            <p>ค้นหาข้อมูล</p>
            <TextField
              fullWidth
              variant="outlined"
              name="search"
              placeholder="ค้นหาด้วยชื่อ, นามสกุล, รหัสลูกค้า หรือเบอร์โทรศัพท์"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ color: "#a0a0a0", ml: 1, fontSize: 22 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>
          <div className="lg:basis-2/5 basis-full px-3 mt-4 lg:mt-0">
            <ToggleButtonGroup
              color="primary"
              value={filterType}
              exclusive
              onChange={handleFilterChange}
              fullWidth
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: "16px",
                padding: "4px",
                height: "53px",
                "& .MuiToggleButtonGroup-grouped": {
                  border: "none !important",
                  borderRadius: "12px !important",
                  margin: "0",
                  color: "#E91E63",
                  fontWeight: 500,
                  fontSize: "14px",
                  textTransform: "none",
                  "&.Mui-selected": {
                    backgroundColor: "#E91E63",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  },
                  "&:hover": {
                    backgroundColor: "#E91E63",
                    color: "white",
                  },
                },
                "& .MuiToggleButtonGroup-grouped:not(:last-of-type)": {
                  marginRight: "4px",
                },
              }}
            >
              <ToggleButton value="all">ทั้งหมด</ToggleButton>
              <ToggleButton value="new">ลูกค้าใหม่</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>
      </CardCustom>

      <CardCustom className="mt-8">
        <TableCustom columns={columns} rows={rows?.data || []} border />
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
      </CardCustom>
      <ModalCreate
        open={openRegisterModal}
        onClose={() => setOpenRegisterModal(false)}
        onSubmit={(payload) => {
          onAction({ state: "create", payload });
          // setOpenRegisterModal(false);
        }}
      />
    </ContentLayout>
  );
};

export default PageCustomerSearch;
