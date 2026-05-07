import DialogCustom from "@/components/custom-element/dialog-custom";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Button, TextField, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import _DropdownApi, { DropdownModel } from "@/api/controller/dropdown";
import { StockModel } from "@/api/controller/trn-stock";
import { getLoginStorage } from "@/helpers/set-storage";
import AutocompleteCustom from "@/components/custom-element/autocomplete-custom";

interface ModalImportProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: StockModel) => void;
}

const ModalImport = ({ open, onClose, onSubmit }: ModalImportProps) => {
  const profile = getLoginStorage().profile;
  const [form, setForm] = useState<StockModel>({
    productId: undefined,
    branchId: undefined,
    quantity: undefined,
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<DropdownModel[]>([]);
  const [branches, setBranches] = useState<DropdownModel[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProduct, resBranch] = await Promise.all([
          _DropdownApi().product(),
          _DropdownApi().branch(),
        ]);
        if (resProduct?.data) setProducts(resProduct.data);
        if (resBranch?.data) setBranches(resBranch.data);
      } catch (err) {
        console.error("Failed to fetch dropdowns", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm({
        productId: undefined,
        branchId: profile?.mas_branch?.id ? profile?.mas_branch?.id : undefined,
        quantity: undefined,
        description: "",
      });
    }
  }, [open, branches]);

  const handleChange = (field: keyof StockModel, value: any) => {
    console.log("val--> ", value);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.branchId) newErrors.branchId = "กรุณาเลือกสาขา";
    if (!form.productId) newErrors.productId = "กรุณาเลือกสินค้า";
    if (!form.quantity || Number(form.quantity) <= 0)
      newErrors.quantity = "กรุณาระบุจำนวน (มากกว่า 0)";

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
      size="sm"
    >
      <div className="p-2 sm:p-4 font-['Sarabun',sans-serif]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              นำเข้าสินค้า
            </h2>
            <p className="text-sm text-gray-500 ">
              ระบุรายละเอียดสินค้าและจำนวนที่ต้องการนำเข้า
            </p>
          </div>
          <div className="bg-pink-100 p-3 rounded-2xl flex items-center justify-center text-primary relative">
            <InventoryIcon />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="block text-sm font-bold text-gray-700 mb-1">
              สาขา <span className="text-red-500">*</span>
            </p>
            <TextField
              disabled
              select
              fullWidth
              variant="outlined"
              size="small"
              value={form.branchId || ""}
              onChange={(e) => {
                handleChange("branchId", Number(e.target.value));
                if (errors.branchId) setErrors({ ...errors, branchId: "" });
              }}
              error={!!errors.branchId}
              helperText={errors.branchId}
            >
              {branches.length > 0 ? (
                branches.map((branch) => (
                  <MenuItem key={branch.value} value={branch.value}>
                    {branch.label}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">ไม่พบข้อมูลสาขา</MenuItem>
              )}
            </TextField>
          </div>

          <div>
            <p className="block text-sm font-bold text-gray-700 mb-1">
              สินค้า <span className="text-red-500">*</span>
            </p>
            <AutocompleteCustom
              name="productId"
              option={products.map((p) => ({
                label: p.label,
                value: String(p.value),
              }))}
              value={form.productId ? String(form.productId) : ""}
              onChange={(_, value) => {
                handleChange("productId", value ? Number(value) : undefined);
                if (errors.productId) setErrors({ ...errors, productId: "" });
              }}
            />
            {errors.productId && (
              <p className="text-[#d32f2f] text-[0.75rem] mt-[3px] mx-[14px]">
                {errors.productId}
              </p>
            )}
          </div>

          <div>
            <p className="block text-sm font-bold text-gray-700 mb-1">
              จำนวนนำเข้า <span className="text-red-500">*</span>
            </p>
            <TextField
              placeholder="ระบุจำนวน"
              fullWidth
              variant="outlined"
              size="small"
              type="number"
              value={form.quantity || ""}
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
            นำเข้าสินค้า
          </Button>
        </div>
      </div>
    </DialogCustom>
  );
};

export default ModalImport;
