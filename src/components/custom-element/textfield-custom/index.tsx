import { TextField, InputAdornment } from "@mui/material";

const TextFieldCustom = ({
  label,
  value,
  startAdornment,
  onChange,
  type,
  InputLabelProps,
  error,
  helperText,
  multiline,
  rows,
}: {
  label?: string;
  value?: string;
  startAdornment?: React.ReactNode;
  onChange?: (v: string) => void;
  type?: string;
  InputLabelProps?: any;
  error?: boolean;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
}) => (
  <div className="mb-4 w-full">
    {label && (
      <p className="text-sm text-[#4E5D78] font-medium mb-1.5">{label}</p>
    )}
    <TextField
      fullWidth
      variant="outlined"
      type={type}
      InputLabelProps={InputLabelProps}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      error={error}
      helperText={helperText}
      multiline={multiline || false}
      rows={rows || 1}
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

export default TextFieldCustom;
