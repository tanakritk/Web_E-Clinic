import DialogCustom from "@/components/custom-element/dialog-custom";
import UploadFile from "@/components/upload-file";
import AddIcon from "@mui/icons-material/Add";
import { Button, TextField } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useState, useEffect } from "react";
import { MasterProductModel } from "@/api/controller/master-product";
import _FileApi from "@/api/controller/file";

interface ModalManageProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: MasterProductModel, mode: "create" | "update") => void;
  initialData?: MasterProductModel | null;
  mode: "create" | "update";
}

const ModalManage = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}: ModalManageProps) => {
  const [form, setForm] = useState<MasterProductModel>({
    name: "",
    price: "",
    isActive: true,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchFile = async (path: string) => {
      try {
        const res: any = await _FileApi().getFile({ path });
        setPreviewUrl(res?.data || res);
      } catch (err) {
        console.error("Failed to load file:", err);
      }
    };

    if (open) {
      setErrors({});
      setPreviewUrl(null);
      if (mode === "update" && initialData) {
        setForm({
          id: initialData.id,
          code: initialData.code,
          name: initialData.name,
          price: initialData.price,
          isActive: initialData.isActive,
        });
        if (initialData.filePath) {
          fetchFile(initialData.filePath);
        }
      } else {
        setForm({
          name: "",
          price: "",
          isActive: true,
        });
      }
    }
  }, [open, mode, initialData]);

  const handleChange = (field: keyof MasterProductModel, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name?.trim()) newErrors.name = "กรุณาระบุชื่อสินค้า";
    if (!form.price?.toString().trim()) newErrors.price = "กรุณาระบุราคา";

    // Optional file depending on requirements, let's keep it required like branch
    // Or not? Actually wait, for update it's OK if previewUrl exists.
    if (!form.files && !previewUrl) {
      newErrors.files = "กรุณาแนบรูปภาพสินค้า";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSubmit(form, mode);
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
      <div className="p-2 sm:p-4">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {mode === "update" ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้าใหม่"}
            </h2>
            <p className="text-sm text-gray-500 ">
              {mode === "update"
                ? "แก้ไขรายละเอียดพื้นฐานสำหรับสินค้า"
                : "ระบุรายละเอียดพื้นฐานสำหรับสินค้าใหม่"}
            </p>
          </div>
          <div className="bg-pink-100 p-3 rounded-2xl flex items-center justify-center text-primary relative">
            <InventoryIcon />
            <AddIcon
              sx={{
                fontSize: 14,
                position: "absolute",
                bottom: 4,
                right: 4,
                fontWeight: "bold",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="block text-sm font-bold text-gray-700 mb-2 ">
              รหัสสินค้า
            </p>
            <TextField
              disabled
              value={form.code || "ระบบจะสร้างให้อัตโนมัติ"}
              fullWidth
              variant="outlined"
            />
          </div>
          <div>
            <p className="block text-sm font-bold text-gray-700 mb-2 ">
              ชื่อสินค้า
            </p>
            <TextField
              placeholder="ชื่อสินค้า"
              fullWidth
              variant="outlined"
              value={form.name || ""}
              onChange={(e) => {
                handleChange("name", e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              error={!!errors.name}
              helperText={errors.name}
              autoComplete="off"
            />
          </div>
          <div>
            <p className="block text-sm font-bold text-gray-700 mb-2 ">ราคา</p>
            <TextField
              placeholder="ราคา"
              fullWidth
              variant="outlined"
              type="number"
              value={form.price || ""}
              onChange={(e) => {
                handleChange("price", e.target.value);
                if (errors.price) setErrors({ ...errors, price: "" });
              }}
              error={!!errors.price}
              helperText={errors.price}
              autoComplete="off"
            />
          </div>
          <div>
            <p className="block text-sm font-bold text-gray-700 mb-2 ">
              รูปสินค้า
            </p>
            <UploadFile
              description="PNG, JPG, GIF (สูงสุด 5MB)"
              previewUrl={previewUrl}
              onChange={(file) => {
                handleChange("files", file || undefined);
                if (!file) setPreviewUrl(null);
                if (errors.files) setErrors({ ...errors, files: "" });
              }}
              error={!!errors.files}
              helperText={errors.files}
            />
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-10">
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

export default ModalManage;
