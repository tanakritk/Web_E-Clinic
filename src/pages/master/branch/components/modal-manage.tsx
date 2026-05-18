import DialogCustom from "@/components/custom-element/dialog-custom";
import AddIcon from "@mui/icons-material/Add";
import { Button, TextField, MenuItem } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import UploadFile from "@/components/upload-file";
import { useState, useEffect } from "react";
import { MasterBranchModel } from "@/api/controller/master-branch";
import _FileApi from "@/api/controller/file";

interface ModalManageProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: MasterBranchModel, mode: "create" | "update") => void;
  initialData?: MasterBranchModel | null;
  mode: "create" | "update";
}

const ModalManage = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}: ModalManageProps) => {
  const [form, setForm] = useState<MasterBranchModel>({
    name: "",
    taxIdNumber: "",
    address: "",
    phone: "",
    email: "",
    isActive: true,
    vatType: "ไม่คำนวณภาษี",
    vatRate: 0,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchFile = async (path: string) => {
      try {
        const res: any = await _FileApi().getFile({ path });
        // The API returns base64 string directly or inside data wrap
        // We will try both common patterns. Assuming it returns `data:image...`
        setPreviewUrl(res?.data || res);
      } catch (err) {
        console.error("Failed to load file:", err);
      }
    };

    if (open) {
      setErrors({});
      setPreviewUrl(null);
      if (mode === "update" && initialData) {
        setForm(initialData);
        if (initialData.qrFilePath) {
          fetchFile(initialData.qrFilePath);
        }
      } else {
        setForm({
          name: "",
          taxIdNumber: "",
          address: "",
          phone: "",
          email: "",
          isActive: true,
          vatType: "ไม่คำนวณภาษี",
          vatRate: 0,
        });
      }
    }
  }, [open, mode, initialData]);

  const handleChange = (field: keyof MasterBranchModel, value: any) => {
    setForm((prev) => {
      const updatedForm = { ...prev, [field]: value };
      if (field === "vatType" && value === "ไม่คำนวณภาษี") {
        updatedForm.vatRate = 0;
      }
      return updatedForm;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.taxIdNumber?.trim())
      newErrors.taxIdNumber = "กรุณาระบุเลขที่ผู้เสียภาษี";
    if (!form.name?.trim()) newErrors.name = "กรุณาระบุชื่อสาขา";
    if (!form.address?.trim()) newErrors.address = "กรุณาระบุที่อยู่";
    if (!form.phone?.trim()) newErrors.phone = "กรุณาระบุเบอร์ติดต่อ";

    if (!form.vatType) {
      newErrors.vatType = "กรุณาเลือกรูปแบบภาษี";
    }

    if (
      form.vatType !== "ไม่คำนวณภาษี" &&
      (form.vatRate === undefined || form.vatRate === null || isNaN(form.vatRate))
    ) {
      newErrors.vatRate = "กรุณาระบุเปอร์เซ็นต์ภาษี";
    }

    if (!form.email?.trim()) {
      newErrors.email = "กรุณาระบุอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!form.files && !previewUrl) {
      newErrors.files = "กรุณาแนบไฟล์ QR Code";
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
              {mode === "update" ? "แก้ไขข้อมูลสาขา" : "เพิ่มสาขาใหม่"}
            </h2>
            <p className="text-sm text-gray-500 ">
              {mode === "update"
                ? "แก้ไขรายละเอียดพื้นฐานสำหรับสาขา"
                : "ระบุรายละเอียดพื้นฐานสำหรับสาขาคลินิกใหม่"}
            </p>
          </div>
          <div className="bg-pink-100 p-3 rounded-2xl flex items-center justify-center text-primary relative">
            <LocationOnIcon />
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

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="block text-sm font-bold text-gray-700 mb-2 ">
                รหัสสาขา
              </p>
              <TextField
                disabled
                value={form.code || "ระบบจะสร้างให้อัตโนมัติ"}
                fullWidth
                variant="outlined"
              />
            </div>
            <div className="flex-1">
              <p className="block text-sm font-bold text-gray-700 mb-2 ">
                เลขที่ผู้เสียภาษี
              </p>
              <TextField
                placeholder="xxxxxxxxxxxxx"
                fullWidth
                variant="outlined"
                value={form.taxIdNumber || ""}
                onChange={(e) => {
                  handleChange("taxIdNumber", e.target.value);
                  if (errors.taxIdNumber)
                    setErrors({ ...errors, taxIdNumber: "" });
                }}
                error={!!errors.taxIdNumber}
                helperText={errors.taxIdNumber}
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <p className="block text-sm font-bold text-gray-700 mb-2 ">
              ชื่อสาขา
            </p>
            <TextField
              placeholder="สาขาสยามสแควร์"
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
            <p className="block text-sm font-bold text-gray-700 mb-2 ">
              ที่อยู่
            </p>
            <TextField
              multiline
              rows={3}
              placeholder="รายละเอียดที่อยู่..."
              fullWidth
              variant="outlined"
              value={form.address || ""}
              onChange={(e) => {
                handleChange("address", e.target.value);
                if (errors.address) setErrors({ ...errors, address: "" });
              }}
              error={!!errors.address}
              helperText={errors.address}
              autoComplete="off"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <p className="block text-sm font-bold text-gray-700 mb-2 ">
                เบอร์ติดต่อ
              </p>
              <TextField
                placeholder="02-xxx-xxxx"
                fullWidth
                variant="outlined"
                value={form.phone || ""}
                onChange={(e) => {
                  handleChange("phone", e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                error={!!errors.phone}
                helperText={errors.phone}
                autoComplete="off"
              />
            </div>
            <div className="flex-1">
              <p className="block text-sm font-bold text-gray-700 mb-2 ">
                อีเมล
              </p>
              <TextField
                placeholder="example@clinic.com"
                fullWidth
                variant="outlined"
                value={form.email || ""}
                onChange={(e) => {
                  handleChange("email", e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <p className="block text-sm font-bold text-gray-700 mb-2 ">
                การคำนวณภาษี
              </p>
              <TextField
                select
                fullWidth
                variant="outlined"
                value={form.vatType || "ไม่คำนวณภาษี"}
                onChange={(e) => {
                  handleChange("vatType", e.target.value);
                  if (errors.vatType) setErrors({ ...errors, vatType: "" });
                }}
                error={!!errors.vatType}
                helperText={errors.vatType}
              >
                <MenuItem value="ภาษีนอก">ภาษีนอก</MenuItem>
                <MenuItem value="ภาษีใน">ภาษีใน</MenuItem>
                <MenuItem value="ไม่คำนวณภาษี">ไม่คำนวณภาษี</MenuItem>
              </TextField>
            </div>
            <div className="flex-1">
              <p className="block text-sm font-bold text-gray-700 mb-2 ">
                Vat (%)
              </p>
              <TextField
                type="number"
                placeholder="7"
                fullWidth
                variant="outlined"
                value={form.vatRate ?? ""}
                onChange={(e) => {
                  handleChange("vatRate", Number(e.target.value));
                  if (errors.vatRate) setErrors({ ...errors, vatRate: "" });
                }}
                disabled={form.vatType === "ไม่คำนวณภาษี"}
                error={!!errors.vatRate}
                helperText={errors.vatRate}
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <p className="block text-sm font-bold text-gray-700 mb-2 ">
              ไฟล์ QR Code
            </p>
            <UploadFile
              description="รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB"
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

        {/* <div className="mt-6 bg-[#F8F5F6] rounded-2xl p-4 flex gap-3 items-start">
          <div className="bg-primary text-white rounded-full mt-0.5 flex items-center justify-center w-5 h-5 shrink-0">
            <InfoIcon sx={{ fontSize: 16 }} />
          </div>
          <p className="text-[13px] text-gray-600  leading-relaxed">
            การเพิ่มสาขาใหม่จะทำให้ระบบสร้างบัญชีแยกประเภทสาขาให้อัตโนมัติใน
            Medical Ledger
          </p>
        </div> */}

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
