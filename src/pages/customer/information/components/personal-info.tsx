import CardCustom from "@/components/custom-element/card-custom";
import { InputAdornment, TextField } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";

const InputCustom = ({
  label,
  value,
  startAdornment,
  onChange,
}: {
  label?: string;
  value?: string;
  startAdornment?: React.ReactNode;
  onChange?: (v: string) => void;
}) => (
  <div className="mb-4 w-full">
    {label && (
      <p className="text-sm text-[#4E5D78] font-medium mb-1.5">{label}</p>
    )}
    <TextField
      fullWidth
      variant="outlined"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      slotProps={{
        input: {
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : null,
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
);

export interface PersonalInfoForm {
  firstname?: string;
  surname?: string;
  nickname?: string;
  phone?: string;
}

interface PersonalInfoProps {
  data?: PersonalInfoForm;
  onChange?: (form: PersonalInfoForm) => void;
}

const PersonalInfo = ({ data, onChange }: PersonalInfoProps): JSX.Element => {
  const handleChange = (field: keyof PersonalInfoForm) => (value: string) => {
    onChange?.({ ...data, [field]: value });
  };

  return (
    <CardCustom className="p-0 border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6 ">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">ข้อมูลส่วนตัว</h2>
        </div>
      </div>

      <div className="flex gap-4">
        <InputCustom
          label="ชื่อ"
          value={data?.firstname}
          onChange={handleChange("firstname")}
        />
        <InputCustom
          label="นามสกุล"
          value={data?.surname}
          onChange={handleChange("surname")}
        />
      </div>

      <InputCustom
        label="ชื่อเล่น"
        value={data?.nickname}
        onChange={handleChange("nickname")}
      />

      <InputCustom
        label="เบอร์โทรศัพท์"
        value={data?.phone}
        onChange={handleChange("phone")}
        startAdornment={<PhoneIcon sx={{ color: "#A0A0A0", fontSize: 20 }} />}
      />
    </CardCustom>
  );
};

export default PersonalInfo;
