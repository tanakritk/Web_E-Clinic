import DialogCustom from "@/components/custom-element/dialog-custom";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Button, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import {
  _StockApi,
  _StockKey,
  ImportStockModel,
  StockModel,
} from "@/api/controller/trn-stock";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra);

interface ModalUpdateProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: StockModel) => void;
  initialData: StockModel | null;
}

const ModalUpdate = ({ open, onClose, onSubmit, initialData }: ModalUpdateProps) => {
  const [form, setForm] = useState<StockModel>({
    id: undefined,
    productId: undefined,
    branchId: undefined,
    quantity: undefined,
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: [_StockKey().importHistory, initialData?.id],
    queryFn: async () => {
      const res = await _StockApi().importHistory(initialData?.id as number);
      return (Array.isArray(res?.data) ? res.data : []) as ImportStockModel[];
    },
    enabled: open && !!initialData?.id,
  });

  useEffect(() => {
    if (open && initialData) {
      setErrors({});
      setForm({
        id: initialData.id,
        productId: initialData.mas_product?.id,
        branchId: initialData.mas_branch?.id,
        quantity: initialData.quantity,
        description: initialData.description || "",
      });
    }
  }, [open, initialData]);

  const handleChange = (field: keyof StockModel, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (form.quantity === undefined || form.quantity === null || Number(form.quantity) < 0)
      newErrors.quantity = "กรุณาระบุจำนวนคงเหลือให้ถูกต้อง";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSubmit(form);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <DialogCustom
      status={open}
      returnOnClose={handleClose}
      hideHeader={true}
      size="md"
    >
      <div className="p-2 sm:p-4 font-['Sarabun',sans-serif]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              แก้ไขข้อมูลสต็อกสินค้า
            </h2>
            <p className="text-sm text-gray-500 ">
              แก้ไขจำนวนคงเหลือและรายละเอียดเพิ่มเติม
            </p>
          </div>
          <div className="bg-pink-100 p-3 rounded-2xl flex items-center justify-center text-primary relative">
            <InventoryIcon />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="block text-sm font-bold text-gray-700 mb-1">สาขา</p>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              size="small"
              value={initialData?.mas_branch?.name || ""}
            />
          </div>

          <div>
            <p className="block text-sm font-bold text-gray-700 mb-1">สินค้า</p>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              size="small"
              value={initialData?.mas_product?.name || ""}
            />
          </div>

          <div>
            <p className="block text-sm font-bold text-gray-700 mb-1">
              คงเหลือ <span className="text-red-500">*</span>
            </p>
            <TextField
              placeholder="ระบุจำนวนคงเหลือ"
              fullWidth
              variant="outlined"
              size="small"
              type="number"
              value={form.quantity !== undefined ? form.quantity : ""}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("quantity", val ? Number(val) : undefined);
                if (errors.quantity) setErrors({ ...errors, quantity: "" });
              }}
              error={!!errors.quantity}
              helperText={errors.quantity}
            />
          </div>

          <div>
            <p className="block text-sm font-bold text-gray-700 mb-1">
              รายละเอียดเพิ่มเติม
            </p>
            <TextField
              placeholder="ระบุรายละเอียดเพิ่มเติม"
              fullWidth
              variant="outlined"
              size="small"
              multiline
              rows={3}
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="block text-sm font-bold text-gray-700 mb-2">
            ประวัติการนำเข้าสินค้า
          </p>
          <div className="max-h-64 overflow-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-[#F5F2F5] text-[#7A7A7A]">
                <tr>
                  <th className="py-2 px-3 font-semibold text-center">วันที่</th>
                  <th className="py-2 px-3 font-semibold text-center">ประเภท</th>
                  <th className="py-2 px-3 font-semibold text-center">จำนวน</th>
                  <th className="py-2 px-3 font-semibold text-center">ก่อน → หลัง</th>
                  <th className="py-2 px-3 font-semibold text-left">ผู้ทำรายการ</th>
                  <th className="py-2 px-3 font-semibold text-left">รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingHistory ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-400">
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : !history || history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-400">
                      ไม่พบประวัติการนำเข้า
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id} className="border-t border-gray-100">
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        {dayjs(h.importDate).format("DD/MM/BBBB HH:mm")}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {h.importType === "Count" ? (
                          <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                            นับสต๊อก
                          </span>
                        ) : (
                          <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                            นำเข้า
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-2 px-3 text-center font-bold ${
                          Number(h.quantity) < 0 ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {Number(h.quantity) > 0 ? `+${h.quantity}` : h.quantity}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        {h.beforeQuantity} → {h.afterQuantity}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {h.mas_user
                          ? `${h.mas_user.firstname || ""} ${h.mas_user.surname || ""}`
                          : "-"}
                      </td>
                      <td className="py-2 px-3 text-gray-500">
                        {h.description || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-8 pt-4 border-t border-gray-100">
          <Button
            size="large"
            variant="outlined"
            onClick={handleClose}
            fullWidth
          >
            ยกเลิก
          </Button>
          <Button
            size="large"
            variant="contained"
            fullWidth
            onClick={handleSave}
          >
            บันทึกข้อมูล
          </Button>
        </div>
      </div>
    </DialogCustom>
  );
};

export default ModalUpdate;
