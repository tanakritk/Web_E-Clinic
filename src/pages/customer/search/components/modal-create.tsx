import DialogCustom from "@/components/custom-element/dialog-custom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import { useState, useEffect } from "react";
import { MasterCustomerModel } from "@/api/controller/master-customer";

interface ModalCreateProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: MasterCustomerModel) => void;
}

const prefixes = [
  { value: "นาย", label: "นาย" },
  { value: "นาง", label: "นาง" },
  { value: "นางสาว", label: "นางสาว" },
];

const ModalCreate = ({ open, onClose, onSubmit }: ModalCreateProps) => {
  const [form, setForm] = useState<MasterCustomerModel>({
    title: "นาย",
    firstname: "",
    surname: "",
    nickname: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm({
        title: "นาย",
        firstname: "",
        surname: "",
        nickname: "",
        phone: "",
      });
    }
  }, [open]);

  const handleChange = (field: keyof MasterCustomerModel, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstname?.trim()) newErrors.firstname = "กรุณาระบุชื่อ";
    if (!form.surname?.trim()) newErrors.surname = "กรุณาระบุนามสกุล";
    if (!form.phone?.trim()) newErrors.phone = "กรุณาระบุเบอร์ติดต่อ";

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
      <div className="p-2 sm:p-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              ลงทะเบียนลูกค้าใหม่
            </h2>
            <p className="text-sm text-gray-500 ">
              ระบุรายละเอียดพื้นฐานสำหรับลูกค้าใหม่
            </p>
          </div>
          <div className="bg-pink-100 p-3 rounded-2xl flex items-center justify-center text-primary relative">
            <PersonAddIcon />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-12 md:col-span-5">
              <p className="block text-sm font-bold text-gray-700 mb-1">
                คำนำหน้าชื่อ <span className="text-red-500">*</span>
              </p>
              <FormControl>
                <RadioGroup 
                  row 
                  value={form.title}
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

        </div>

        <div className="flex justify-between gap-4 mt-8 pt-4 border-t border-gray-100">
          <Button size="large" variant="outlined" onClick={handleClose} fullWidth>
            ยกเลิก
          </Button>
          <Button size="large" variant="contained" fullWidth onClick={handleSave}>
            บันทึกข้อมูล
          </Button>
        </div>
      </div>
    </DialogCustom>
  );
};

export default ModalCreate;
