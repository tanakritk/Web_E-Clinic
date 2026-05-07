import DialogCustom from "@/components/custom-element/dialog-custom";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import {
  Button,
  TextField,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import { useState, useEffect } from "react";
import { MasterUserModel } from "@/api/controller/master-user";
import { _MasterBranchApi } from "@/api/controller/master-branch";
import _DropdownApi, { DropdownModel } from "@/api/controller/dropdown";

interface ModalManageProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: MasterUserModel, mode: "create" | "update") => void;
  initialData?: MasterUserModel | null;
  mode: "create" | "update";
}

const prefixes = [
  { value: "นาย", label: "นาย" },
  { value: "นาง", label: "นาง" },
  { value: "นางสาว", label: "นางสาว" },
];

const genders = [
  { value: "ชาย", label: "ชาย" },
  { value: "หญิง", label: "หญิง" },
];

const ModalManage = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}: ModalManageProps) => {
  const [form, setForm] = useState<MasterUserModel>({
    title: "นาย",
    sex: "ชาย",
    isActive: true,
    branchId: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<DropdownModel[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await _DropdownApi().branch();
        if (res?.data) {
          setBranches(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (open) {
      setErrors({});
      if (mode === "update" && initialData) {
        setForm({
          ...initialData,
          branchId: initialData?.mas_branch?.id,
        });
      } else {
        setForm({
          title: "นาย",
          sex: "ชาย",
          isActive: true,
          branchId: branches.length > 0 ? Number(branches[0].value) : undefined,
        });
      }
    }
  }, [open, mode, initialData, branches]);

  const handleChange = (field: keyof MasterUserModel, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (mode === "create" && !form.username?.trim())
      newErrors.username = "กรุณาระบุชื่อผู้ใช้งาน";
    if (!form.firstname?.trim()) newErrors.firstname = "กรุณาระบุชื่อ";
    if (!form.surname?.trim()) newErrors.surname = "กรุณาระบุนามสกุล";

    if (!form.idCardNumber?.trim()) {
      newErrors.idCardNumber = "กรุณาระบุรหัสบัตรประชาชน";
    } else if (!/^\d{13}$/.test(form.idCardNumber.replace(/-/g, ""))) {
      newErrors.idCardNumber = "รหัสบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
    }

    if (!form.phone?.trim()) {
      newErrors.phone = "กรุณาระบุเบอร์ติดต่อ";
    } else if (!/^0\d{8,9}$/.test(form.phone.replace(/-/g, ""))) {
      newErrors.phone =
        "เบอร์ติดต่อไม่ถูกต้อง (ควรเป็นตัวเลข 9-10 หลักและขึ้นต้นด้วย 0)";
    }

    if (!form.branchId) newErrors.branchId = "กรุณาเลือกสาขา";

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
      size="md"
    >
      <div className="p-2 sm:p-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {mode === "update" ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งาน"}
            </h2>
            <p className="text-sm text-gray-500 ">
              {mode === "update"
                ? "แก้ไขรายละเอียดพื้นฐานสำหรับผู้ใช้งาน"
                : "ระบุรายละเอียดพื้นฐานสำหรับผู้ใช้งานใหม่"}
            </p>
          </div>
          <div className="bg-pink-100 p-3 rounded-2xl flex items-center justify-center text-primary relative">
            <GroupAddIcon />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">
                รหัสผู้ใช้ <span className="text-red-500">*</span>
              </p>
              <TextField
                disabled
                value={form.code || "ระบบจะสร้างให้อัตโนมัติ"}
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
              />
            </div>
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">
                ชื่อผู้ใช้งาน (Username) <span className="text-red-500">*</span>
              </p>
              <TextField
                disabled={mode === "update"} // Usually username cannot be changed later
                placeholder="ระบุชื่อผู้ใช้งาน"
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                value={form.username || ""}
                onChange={(e) => {
                  handleChange("username", e.target.value);
                  if (errors.username) setErrors({ ...errors, username: "" });
                }}
                error={!!errors.username}
                helperText={errors.username}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-12 md:col-span-5">
              <p className="block text-sm font-bold text-gray-700 mb-1">
                คำนำหน้าชื่อ <span className="text-red-500">*</span>
              </p>
              <FormControl>
                <RadioGroup
                  row
                  value={form.title || "นาย"}
                  onChange={(e) => handleChange("title", e.target.value)}
                >
                  {prefixes.map((prefix) => (
                    <FormControlLabel
                      key={prefix.value}
                      value={prefix.value}
                      control={<Radio size="small" />}
                      label={<span className="text-sm">{prefix.label}</span>}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </div>
            <div className="sm:col-span-6 md:col-span-3">
              <p className="block text-sm font-bold text-gray-700 mb-1">
                ชื่อ <span className="text-red-500">*</span>
              </p>
              <TextField
                placeholder="ระบุชื่อ"
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                value={form.firstname || ""}
                onChange={(e) => {
                  handleChange("firstname", e.target.value);
                  if (errors.firstname) setErrors({ ...errors, firstname: "" });
                }}
                error={!!errors.firstname}
                helperText={errors.firstname}
              />
            </div>
            <div className="sm:col-span-6 md:col-span-4">
              <p className="block text-sm font-bold text-gray-700 mb-1">
                นามสกุล <span className="text-red-500">*</span>
              </p>
              <TextField
                placeholder="ระบุนามสกุล"
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                value={form.surname || ""}
                onChange={(e) => {
                  handleChange("surname", e.target.value);
                  if (errors.surname) setErrors({ ...errors, surname: "" });
                }}
                error={!!errors.surname}
                helperText={errors.surname}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">
                รหัสบัตรประชาชน <span className="text-red-500">*</span>
              </p>
              <TextField
                placeholder="เลขประจำตัวประชาชน 13 หลัก"
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                value={form.idCardNumber || ""}
                onChange={(e) => {
                  handleChange("idCardNumber", e.target.value);
                  if (errors.idCardNumber)
                    setErrors({ ...errors, idCardNumber: "" });
                }}
                error={!!errors.idCardNumber}
                helperText={errors.idCardNumber}
              />
            </div>
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">
                เบอร์ติดต่อ <span className="text-red-500">*</span>
              </p>
              <TextField
                placeholder="08X-XXX-XXXX"
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                value={form.phone || ""}
                onChange={(e) => {
                  handleChange("phone", e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">
                ชื่อเล่น
              </p>
              <TextField
                placeholder="ระบุชื่อเล่น"
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                value={form.nickname || ""}
                onChange={(e) => handleChange("nickname", e.target.value)}
              />
            </div>
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">เพศ</p>
              <FormControl>
                <RadioGroup
                  row
                  value={form.sex || "ชาย"}
                  onChange={(e) => handleChange("sex", e.target.value)}
                >
                  {genders.map((gender) => (
                    <FormControlLabel
                      key={gender.value}
                      value={gender.value}
                      control={<Radio size="small" />}
                      label={<span className="text-sm">{gender.label}</span>}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-12 md:col-span-4">
              <p className="block text-sm font-bold text-gray-700 mb-1">
                วันเกิด
              </p>
              <TextField
                type="date"
                fullWidth
                variant="outlined"
                size="small"
                value={form.birthday || ""}
                onChange={(e) => handleChange("birthday", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="sm:col-span-12 md:col-span-8">
              <p className="block text-sm font-bold text-gray-700 mb-1">
                ที่อยู่
              </p>
              <TextField
                placeholder="ระบุที่อยู่"
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                value={form.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">
                สาขา <span className="text-red-500">*</span>
              </p>
              <TextField
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

export default ModalManage;
