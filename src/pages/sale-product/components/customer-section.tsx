import { TextField, InputAdornment, IconButton, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { BaseSearchModel } from "@/api/interface";
import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";
import {
  _MasterCustomerApi,
  MasterCustomerModel,
} from "@/api/controller/master-customer";
import { ModalCustomerList } from "./modal-customer-list";

interface CustomerSectionProps {
  onSelect: (customer: MasterCustomerModel | undefined) => void;
}

export const CustomerSection = ({ onSelect }: CustomerSectionProps) => {
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const [searchCustomer, setSearchCustomer] = useState("");
  const [customersList, setCustomersList] = useState<MasterCustomerModel[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<MasterCustomerModel | null>(null);

  const onSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload: BaseSearchModel = {
      page: 1,
      limit: 20,
      filterOperator: "or",
      filter: [
        {
          field: "code",
          operator: "like",
          value: searchCustomer,
        },
        {
          field: "firstname",
          operator: "like",
          value: searchCustomer,
        },
        {
          field: "surname",
          operator: "like",
          value: searchCustomer,
        },
        {
          field: "phone",
          operator: "like",
          value: searchCustomer,
        },
        {
          field: "nickname",
          operator: "like",
          value: searchCustomer,
        },
      ],
    };
    setLoadingContext(true);
    try {
      const result = await _MasterCustomerApi().search(payload);
      if (result.statusCode === 200) {
        setCustomersList(result.data || []);
        setOpenModal(true);
      }
    } catch (error: any) {
      setAlertContext({
        message: error?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
        type: "warning",
      });
    } finally {
      setLoadingContext(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full bg-white p-6 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-pink-700 font-bold text-lg">
          <PersonSearchIcon />
          <span>ข้อมูลลูกค้า</span>
        </div>
        {/* <button className="flex items-center gap-1 text-pink-600 font-semibold text-sm hover:bg-pink-50 px-2 py-1 rounded transition">
          <AddIcon fontSize="small" />
          เพิ่มลูกค้าใหม่
        </button> */}
      </div>
      <form onSubmit={onSearch}>
        <div className="flex flex-wrap w-full items-center">
          <div className="basis-full lg:basis-4/5 px-3">
            <TextField
              placeholder="ค้นหาด้วย ชื่อ-นามสกุล, เบอร์โทรศัพท์ หรือ เลขประจำตัวลูกค้า..."
              variant="outlined"
              autoComplete="off"
              size="small"
              fullWidth
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className="basis-full lg:basis-1/5 px-3 flex justify-end mt-3 lg:mt-0 md:mt-3">
            <Button
              className="w-full"
              size="large"
              variant="contained"
              type="submit"
            >
              ค้นหา
            </Button>
          </div>
        </div>
      </form>

      {/* Selected Customer Card */}
      {selectedCustomer ? (
        <div className="flex items-center justify-between p-4 bg-[#F5EEF2] rounded-xl border border-pink-100">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800 text-lg">
                  คุณ {selectedCustomer.title || ""}{" "}
                  {selectedCustomer.firstname} {selectedCustomer.surname}
                  {selectedCustomer.nickname
                    ? "(" + selectedCustomer.nickname + ")"
                    : ""}
                </span>
              </div>
              <span className="text-sm text-gray-500 mt-1">
                {selectedCustomer.phone || "-"}
              </span>
            </div>
          </div>
          <IconButton
            size="small"
            sx={{ color: "#9CA3AF" }}
            onClick={() => {
              setSelectedCustomer(null);
              return onSelect(undefined);
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      ) : (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
          <span className="text-gray-400 text-sm">ยังไม่ได้เลือกลูกค้า</span>
        </div>
      )}

      <ModalCustomerList
        open={openModal}
        onClose={() => setOpenModal(false)}
        customers={customersList}
        onSelect={(customer) => {
          setSelectedCustomer(customer);
          setOpenModal(false);
          return onSelect(customer);
        }}
      />
    </div>
  );
};
