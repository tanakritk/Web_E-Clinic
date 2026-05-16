import DialogCustom from "@/components/custom-element/dialog-custom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Checkbox,
  FormGroup,
  FormHelperText,
} from "@mui/material";
import { useState, useEffect } from "react";
import { MasterCustomerModel } from "@/api/controller/master-customer";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "dayjs/locale/th";

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

const tagsList = ["ลูกค้าใหม่", "ลูกค้าเก่า", "VIP"];
const sourceList = ["Facebook", "TikTok", "Walk-in", "ลูกค้าแนะนำ"];

const ModalCreate = ({ open, onClose, onSubmit }: ModalCreateProps) => {
  const [form, setForm] = useState<MasterCustomerModel>({
    title: "นาย",
    firstname: "",
    surname: "",
    nickname: "",
    phone: "",
    phone2: "",
    birthday: "",
    idCardNumber: "",
    address: "",
    lineId: "",
    facebook: "",
    source: "",
    tag: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sourceType, setSourceType] = useState<string>("");

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm({
        title: "นาย",
        firstname: "",
        surname: "",
        nickname: "",
        phone: "",
        phone2: "",
        birthday: "",
        idCardNumber: "",
        address: "",
        lineId: "",
        facebook: "",
        source: "",
        tag: "",
      });
      setSourceType("");
    }
  }, [open]);

  const handleTagChange = (tag: string, checked: boolean) => {
    const currentTags = form.tag ? form.tag.split(",").filter(Boolean) : [];
    let newTags = [];
    if (checked) {
      newTags = [...currentTags, tag];
    } else {
      newTags = currentTags.filter((t) => t !== tag);
    }
    handleChange("tag", newTags.join(","));
  };

  const handleChange = (field: keyof MasterCustomerModel, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstname?.trim()) newErrors.firstname = "กรุณาระบุชื่อ";
    if (!form.surname?.trim()) newErrors.surname = "กรุณาระบุนามสกุล";
    if (!form.phone?.trim()) {
      newErrors.phone = "กรุณาระบุเบอร์ติดต่อ";
    } else if (!/^0\d{9}$/.test(form.phone.trim())) {
      newErrors.phone = "รูปแบบเบอร์ติดต่อไม่ถูกต้อง (เช่น 0812345678)";
    }

    if (!form.phone2?.trim()) {
      newErrors.phone2 = "กรุณาระบุเบอร์ติดต่อญาติ";
    } else if (!/^0\d{9}$/.test(form.phone2.trim())) {
      newErrors.phone2 = "รูปแบบเบอร์ติดต่อญาติไม่ถูกต้อง (เช่น 0812345678)";
    }

    if (!form.source?.trim()) newErrors.source = "กรุณาระบุแหล่งที่มา";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    console.log("form--> ", form);
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                placeholder="08XXXXXXXX"
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
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">
                เบอร์ติดต่อญาติ <span className="text-red-500">*</span>
              </p>
              <TextField
                placeholder="08XXXXXXXX"
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                value={form.phone2 || ""}
                onChange={(e) => handleChange("phone2", e.target.value)}
                error={!!errors.phone2}
                helperText={errors.phone2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">
                เลขที่บัตรประชาชน
              </p>
              <TextField
                placeholder="ระบุเลขที่บัตรประชาชน"
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                value={form.idCardNumber || ""}
                onChange={(e) => handleChange("idCardNumber", e.target.value)}
              />
            </div>
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">
                วันเดือนปีเกิด
              </p>
              <DatePicker
                format="DD/MM/YYYY"
                value={form.birthday ? dayjs(form.birthday) : null}
                onChange={(newValue) => {
                  if (newValue) {
                    handleChange("birthday", newValue.format("YYYY-MM-DD"));
                  } else {
                    handleChange("birthday", "");
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="block text-sm font-bold text-gray-700 mb-1">
              ที่อยู่
            </p>
            <TextField
              placeholder="ระบุที่อยู่"
              fullWidth
              variant="outlined"
              size="small"
              multiline
              rows={3}
              value={form.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">
                LINE ID
              </p>
              <TextField
                placeholder="ระบุ LINE ID"
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                value={form.lineId || ""}
                onChange={(e) => handleChange("lineId", e.target.value)}
              />
            </div>
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-1">
                Facebook
              </p>
              <TextField
                placeholder="ระบุ Facebook"
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                value={form.facebook || ""}
                onChange={(e) => handleChange("facebook", e.target.value)}
              />
            </div>
          </div>

          <div>
            <p className="block text-sm font-bold text-gray-700 mb-1">
              แหล่งที่มา <span className="text-red-500">*</span>
            </p>
            <FormControl error={!!errors.source}>
              <RadioGroup
                row
                value={sourceType}
                onChange={(e) => {
                  const val = e.target.value;
                  setSourceType(val);
                  if (val !== "other") {
                    handleChange("source", val);
                  } else {
                    handleChange("source", "");
                  }
                }}
              >
                {sourceList.map((src) => (
                  <FormControlLabel
                    key={src}
                    value={src}
                    control={<Radio />}
                    label={<span className="text-sm">{src}</span>}
                  />
                ))}
                <FormControlLabel
                  value="other"
                  control={<Radio />}
                  label={<span className="text-sm">อื่นๆ</span>}
                />
              </RadioGroup>
              {errors.source && (
                <FormHelperText>{errors.source}</FormHelperText>
              )}
            </FormControl>
            {sourceType === "other" && (
              <div className="mt-2">
                <TextField
                  placeholder="ระบุแหล่งที่มาเพิ่มเติม"
                  fullWidth
                  variant="outlined"
                  size="small"
                  autoComplete="off"
                  value={form.source || ""}
                  onChange={(e) => handleChange("source", e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <p className="block text-sm font-bold text-gray-700 mb-1">Tag</p>
            <FormGroup row>
              {tagsList.map((tag) => {
                const currentTags = form.tag ? form.tag.split(",") : [];
                const isChecked = currentTags.includes(tag);
                return (
                  <FormControlLabel
                    key={tag}
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => handleTagChange(tag, e.target.checked)}
                      />
                    }
                    label={<span className="text-sm">{tag}</span>}
                  />
                );
              })}
            </FormGroup>
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
            บันทึกข้อมูล และซื้อคอร์ส
          </Button>
        </div>
      </div>
    </DialogCustom>
  );
};

export default ModalCreate;
