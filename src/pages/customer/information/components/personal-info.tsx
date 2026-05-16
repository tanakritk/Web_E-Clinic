import CardCustom from "@/components/custom-element/card-custom";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Checkbox,
  FormGroup,
  FormHelperText,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "dayjs/locale/th";

import TextFieldCustom from "@/components/custom-element/textfield-custom";

export interface PersonalInfoForm {
  title?: string;
  firstname?: string;
  surname?: string;
  nickname?: string;
  phone?: string;
  phone2?: string;
  birthday?: string;
  idCardNumber?: string;
  address?: string;
  lineId?: string;
  facebook?: string;
  source?: string;
  tag?: string;
}

const prefixes = [
  { value: "นาย", label: "นาย" },
  { value: "นาง", label: "นาง" },
  { value: "นางสาว", label: "นางสาว" },
];

const tagsList = ["ลูกค้าใหม่", "ลูกค้าเก่า", "VIP"];
const sourceList = ["Facebook", "TikTok", "Walk-in", "ลูกค้าแนะนำ"];

interface PersonalInfoProps {
  data?: PersonalInfoForm;
  onChange?: (form: PersonalInfoForm) => void;
  errors?: Record<string, string>;
  setErrors?: (errors: Record<string, string>) => void;
}

const PersonalInfo = ({
  data,
  onChange,
  errors,
  setErrors,
}: PersonalInfoProps): JSX.Element => {
  const [sourceType, setSourceType] = useState<string>("");

  useEffect(() => {
    setSourceType((prev) => {
      if (data?.source) {
        if (!sourceList.includes(data.source)) {
          return "other";
        }
        return data.source;
      }
      if (prev === "other") return prev;
      return "";
    });
  }, [data?.source]);

  const handleChange = (field: keyof PersonalInfoForm) => (value: string) => {
    onChange?.({ ...data, [field]: value });
    if (errors?.[field]) {
      setErrors?.({ ...errors, [field]: "" });
    }
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const currentTags = data?.tag ? data.tag.split(",").filter(Boolean) : [];
    let newTags = [];
    if (checked) {
      newTags = [...currentTags, tag];
    } else {
      newTags = currentTags.filter((t) => t !== tag);
    }
    onChange?.({ ...data, tag: newTags.join(",") });
  };

  return (
    <CardCustom className="p-0 border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6 ">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">ข้อมูลส่วนตัว</h2>
        </div>
      </div>

      <div className="mb-4 w-full">
        <p className="text-sm text-[#4E5D78] font-medium mb-1.5">
          คำนำหน้าชื่อ
        </p>
        <FormControl>
          <RadioGroup
            row
            value={data?.title || ""}
            onChange={(e) => handleChange("title")(e.target.value)}
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

      <div className="flex gap-4">
        <TextFieldCustom
          label="ชื่อ"
          value={data?.firstname}
          onChange={handleChange("firstname")}
          error={!!errors?.firstname}
          helperText={errors?.firstname}
        />
        <TextFieldCustom
          label="นามสกุล"
          value={data?.surname}
          onChange={handleChange("surname")}
          error={!!errors?.surname}
          helperText={errors?.surname}
        />
      </div>

      <TextFieldCustom
        label="ชื่อเล่น"
        value={data?.nickname}
        onChange={handleChange("nickname")}
      />

      <TextFieldCustom
        label="เบอร์โทรศัพท์"
        value={data?.phone}
        onChange={handleChange("phone")}
        startAdornment={<PhoneIcon sx={{ color: "#A0A0A0", fontSize: 20 }} />}
        error={!!errors?.phone}
        helperText={errors?.phone}
      />

      <TextFieldCustom
        label="เบอร์ติดต่อญาติ"
        value={data?.phone2}
        onChange={handleChange("phone2")}
        startAdornment={<PhoneIcon sx={{ color: "#A0A0A0", fontSize: 20 }} />}
        error={!!errors?.phone2}
        helperText={errors?.phone2}
      />

      <TextFieldCustom
        label="เลขที่บัตรประชาชน"
        value={data?.idCardNumber}
        onChange={handleChange("idCardNumber")}
      />

      <div className="mb-4 w-full">
        <p className="text-sm text-[#4E5D78] font-medium mb-1.5">
          วันเดือนปีเกิด
        </p>
        <DatePicker
          format="DD/MM/YYYY"
          value={data?.birthday ? dayjs(data.birthday) : null}
          onChange={(newValue) => {
            if (newValue) {
              handleChange("birthday")(newValue.format("YYYY-MM-DD"));
            } else {
              handleChange("birthday")("");
            }
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: "outlined",
              sx: {
                backgroundColor: "#F5F2F5",
                borderRadius: "12px",
                color: "#1A1A1A",
                "& fieldset": { border: "none" },
                fontFamily: "inherit",
                fontWeight: 500,
                fontSize: "15px",
              },
            },
          }}
        />
      </div>

      <TextFieldCustom
        label="ที่อยู่"
        value={data?.address}
        onChange={handleChange("address")}
        multiline={true}
        rows={3}
      />

      <div className="flex gap-4">
        <TextFieldCustom
          label="LINE ID"
          value={data?.lineId}
          onChange={handleChange("lineId")}
        />
        <TextFieldCustom
          label="Facebook"
          value={data?.facebook}
          onChange={handleChange("facebook")}
        />
      </div>

      <div className="mb-4 w-full">
        <p className="text-sm text-[#4E5D78] font-medium mb-1.5">แหล่งที่มา</p>
        <FormControl error={!!errors?.source}>
          <RadioGroup
            row
            value={sourceType}
            onChange={(e) => {
              const val = e.target.value;
              setSourceType(val);
              if (val !== "other") {
                handleChange("source")(val);
              } else {
                handleChange("source")("");
              }
            }}
          >
            {sourceList.map((src) => (
              <FormControlLabel
                key={src}
                value={src}
                control={<Radio size="small" />}
                label={<span className="text-sm">{src}</span>}
              />
            ))}
            <FormControlLabel
              value="other"
              control={<Radio size="small" />}
              label={<span className="text-sm">อื่นๆ</span>}
            />
          </RadioGroup>
          {errors?.source && <FormHelperText>{errors.source}</FormHelperText>}
        </FormControl>
        {sourceType === "other" && (
          <div className="mt-2">
            <TextFieldCustom
              value={data?.source}
              onChange={handleChange("source")}
            />
          </div>
        )}
      </div>

      <div className="mb-4 w-full">
        <p className="text-sm text-[#4E5D78] font-medium mb-1.5">Tag</p>
        <FormGroup row>
          {tagsList.map((tag) => {
            const currentTags = data?.tag ? data.tag.split(",") : [];
            const isChecked = currentTags.includes(tag);
            return (
              <FormControlLabel
                key={tag}
                control={
                  <Checkbox
                    size="small"
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
    </CardCustom>
  );
};

export default PersonalInfo;
