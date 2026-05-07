import { useEffect, useState } from "react";
import { IconButton, TextField, InputAdornment, Button } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { _MasterUserApi, _MasterUserKey } from "@/api/controller/master-user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLoading } from "@/context/loading-context";
import { getLoginStorage, setLoginStorage } from "@/helpers/set-storage";
import { useAlert } from "@/context/alert-context";
import { BaseQueryModel } from "@/api/interface";
import LockIcon from "@mui/icons-material/Lock";

interface formProps {
  password: string;
  confirmPassword: string;
}

interface showPasswordProps {
  password: boolean;
  confirmPassword: boolean;
}

const PageChangePassword = (): JSX.Element => {
  const { setAlertContext } = useAlert();
  const { setLoadingContext } = useLoading();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<showPasswordProps>({
    password: false,
    confirmPassword: false,
  });
  const [form, setForm] = useState<formProps>({
    password: "",
    confirmPassword: "",
  });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const { mutate: onActionChangePassword, isPending: isLoadingChangePassword } =
    useMutation({
      mutationFn: async ({
        id,
        payload,
      }: {
        id: number;
        payload: { password: string };
      }) => {
        return await _MasterUserApi().updatePassword(id, payload);
      },
      onSuccess: (response: BaseQueryModel) => {
        const token = getLoginStorage().token;
        queryClient.invalidateQueries({ queryKey: [_MasterUserKey().search] });
        setLoginStorage(response.data as Record<string, any>, token as string);
        navigate("/");
      },
      onError: (error: any) => {
        setAlertContext({
          message: error.message,
          type: "warning",
        });
      },
      onSettled: () => {
        setLoadingContext(false);
      },
    });

  const onSubmitLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setAlertContext({
        message: "รหัสผ่านไม่ตรงกัน",
        type: "warning",
      });
    }

    const passwordRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      return setAlertContext({
        message: "รหัสผ่านต้องมีตัวเลขและตัวอักษรอย่างน้อย 8 ตัว",
        type: "warning",
      });
    }

    const profile = getLoginStorage().profile;
    const id = profile?.id;
    const payload = {
      password: form.password,
    };
    onActionChangePassword({ id: Number(id), payload });
  };

  const onToggleShowPassword = (
    state: "password" | "confirmPassword",
  ): void => {
    setShowPassword({
      ...showPassword,
      [state]: !showPassword[state],
    });
  };

  useEffect(() => {
    setLoadingContext(isLoadingChangePassword);
  }, [setLoadingContext, isLoadingChangePassword]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-[1000px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden min-h-[600px]">
        {/* Left Side (Grey) */}
        <div className="flex-1 bg-[#e1e1e1] p-10 md:p-14 relative overflow-hidden flex flex-col justify-between">
          {/* Subtle gradient/blur effects mapping the reference image */}
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#ececec] rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#cfcfcf] rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-[#cf1f5c] rounded-[10px] flex items-center justify-center text-white shadow-md shadow-pink-500/20">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="7" width="18" height="13" rx="2" ry="2"></rect>
                  <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <path d="M12 11v4"></path>
                  <path d="M10 13h4"></path>
                </svg>
              </div>
              <span className="font-bold text-[#cf1f5c] tracking-widest text-[13px] uppercase">
                Cleoskin Medical
              </span>
            </div>

            <h1 className="text-[40px] md:text-[44px] font-extrabold text-[#3a3a3a] leading-[1.15] mb-1">
              เปลี่ยนรหัสผ่าน
            </h1>
            <h1 className="text-[40px] md:text-[44px] font-extrabold text-[#cf1f5c] leading-[1.15] mb-6">
              ความปลอดภัย
            </h1>
            <p className="text-[#646464] text-[15px] font-medium leading-relaxed max-w-[340px]">
              กรุณากำหนดรหัสผ่านใหม่เพื่อความปลอดภัยของบัญชีผู้ใช้งานของคุณ
            </p>
          </div>
        </div>

        {/* Right Side (White Form) */}
        <div className="flex-1 bg-white p-10 md:p-14 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-[360px] w-full mx-auto">
            <h2 className="text-[28px] font-extrabold text-[#2a2a2a] mb-2">
              ตั้งรหัสผ่านใหม่
            </h2>
            <p className="text-[14px] text-[#7a7a7a] font-medium mb-10">
              รหัสผ่านต้องมีตัวเลขและตัวอักษรอย่างน้อย 8 ตัว
            </p>

            <form onSubmit={onSubmitLogin}>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[13px] font-bold text-[#4a4a4a]">
                    รหัสผ่าน
                  </label>
                </div>
                <TextField
                  fullWidth
                  variant="outlined"
                  type={showPassword.password ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChangeInput}
                  placeholder="••••••••"
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon
                            sx={{ fontSize: 20, color: "#a0a0a0", ml: 0.5 }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => onToggleShowPassword("password")}
                            sx={{ color: "#a0a0a0", mr: 0.5 }}
                          >
                            {showPassword.password ? (
                              <VisibilityOff sx={{ fontSize: 20 }} />
                            ) : (
                              <Visibility sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "0.75rem",
                      "& fieldset": {
                        borderColor: "#ebebeb",
                        borderWidth: "1.5px",
                      },
                      "&:hover fieldset": { borderColor: "#d4d4d4" },
                      "&.Mui-focused fieldset": {
                        borderColor: "#cf1f5c",
                        borderWidth: "1.5px",
                      },
                    },
                    "& .MuiInputBase-input": {
                      padding: "16px 16px 16px 8px",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#3a3a3a",
                      letterSpacing: showPassword.password ? "normal" : "3px",
                      "&::placeholder": {
                        color: "#c0c0c0",
                        opacity: 1,
                        letterSpacing: "normal",
                      },
                    },
                  }}
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[13px] font-bold text-[#4a4a4a]">
                    ยืนยันรหัสผ่าน
                  </label>
                </div>
                <TextField
                  fullWidth
                  variant="outlined"
                  type={showPassword.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChangeInput}
                  placeholder="••••••••"
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon
                            sx={{ fontSize: 20, color: "#a0a0a0", ml: 0.5 }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() =>
                              onToggleShowPassword("confirmPassword")
                            }
                            sx={{ color: "#a0a0a0", mr: 0.5 }}
                          >
                            {showPassword.confirmPassword ? (
                              <VisibilityOff sx={{ fontSize: 20 }} />
                            ) : (
                              <Visibility sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "0.75rem",
                      "& fieldset": {
                        borderColor: "#ebebeb",
                        borderWidth: "1.5px",
                      },
                      "&:hover fieldset": { borderColor: "#d4d4d4" },
                      "&.Mui-focused fieldset": {
                        borderColor: "#cf1f5c",
                        borderWidth: "1.5px",
                      },
                    },
                    "& .MuiInputBase-input": {
                      padding: "16px 16px 16px 8px",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#3a3a3a",
                      letterSpacing: showPassword.confirmPassword
                        ? "normal"
                        : "3px",
                      "&::placeholder": {
                        color: "#c0c0c0",
                        opacity: 1,
                        letterSpacing: "normal",
                      },
                    },
                  }}
                />
              </div>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{
                  borderRadius: "0.75rem",
                  padding: "16px 16px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                ยืนยันการตั้งรหัสผ่านใหม่
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageChangePassword;
