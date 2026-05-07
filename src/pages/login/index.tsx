import { useEffect, useState } from "react";
import { IconButton, TextField, InputAdornment, Button } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import _AuthApi, {
  LoginRequestModel,
  LoginResponseModel,
} from "@/api/controller/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLoading } from "@/context/loading-context";
import { setLoginStorage } from "@/helpers/set-storage";
import { useAlert } from "@/context/alert-context";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import Logo from "@/assets/img/logo.png";

const PageLogin = (): JSX.Element => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setAlertContext } = useAlert();
  const { setLoadingContext } = useLoading();
  const [payload, setPayload] = useState<LoginRequestModel>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const onToggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const { mutate: onLogin, isPending: loadLogin } = useMutation({
    mutationFn: (payload: LoginRequestModel) => _AuthApi().login(payload),
    onSuccess: (response: LoginResponseModel) => {
      const isRefactorPassword = response.profile?.isRefactorPassword;
      setLoginStorage(
        response.profile as Record<string, any>,
        response.token as string,
      );
      queryClient.clear();
      if (!isRefactorPassword) {
        return navigate("/change-password/");
      }
      setLoadingContext(false);
      navigate(`/customer/search`);
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

  const onSubmitLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin(payload);
  };

  useEffect(() => {
    setLoadingContext(loadLogin);
  }, [loadLogin, setLoadingContext]);
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
              <div className="flex flex-col">
                {/* <span className="font-bold text-[#cf1f5c] tracking-widest text-[13px] uppercase">
                  Cleoskin Medical
                </span> */}
                <span className="font-bold text-[#cf1f5c] tracking-widest text-[20px] uppercase">
                  Cleo Clinic
                </span>
              </div>
            </div>

            {/* <h1 className="text-[40px] md:text-[44px] font-extrabold text-[#3a3a3a] leading-[1.15] mb-1">
              Cleo Clinic
            </h1> */}
            <div className="h-full flex items-center">
              <img src={Logo} className="mt-10" />
            </div>
          </div>
        </div>

        {/* Right Side (White Form) */}
        <div className="flex-1 bg-white p-10 md:p-14 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-[360px] w-full mx-auto">
            <h2 className="text-[28px] font-extrabold text-[#2a2a2a] mb-2">
              ยินดีต้อนรับกลับมา
            </h2>
            <p className="text-[16px] text-[#7a7a7a] font-medium mb-10">
              กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบการจัดการของคุณ
            </p>

            <form onSubmit={onSubmitLogin}>
              <div className="mb-6">
                <label className="block text-[16px] font-bold text-[#4a4a4a] mb-2">
                  ชื่อผู้ใช้งาน
                </label>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="username"
                  value={payload.username}
                  onChange={onChangeInput}
                  placeholder="ชื่อผู้ใช้งาน"
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <span className="text-[#a0a0a0] font-sans font-medium text-[18px] ml-1 mr-[-4px]">
                            <PersonIcon />
                          </span>
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
                      padding: "16px 16px 16px 12px",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#3a3a3a",
                      "&::placeholder": {
                        color: "#c0c0c0",
                        opacity: 1,
                      },
                    },
                  }}
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[16px] font-bold text-[#4a4a4a]">
                    รหัสผ่าน
                  </label>
                </div>
                <TextField
                  fullWidth
                  variant="outlined"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={payload.password}
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
                            onClick={onToggleShowPassword}
                            sx={{ color: "#a0a0a0", mr: 0.5 }}
                          >
                            {showPassword ? (
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
                      letterSpacing: showPassword ? "normal" : "3px",
                      "&::placeholder": {
                        color: "#c0c0c0",
                        opacity: 1,
                        letterSpacing: "normal",
                      },
                    },
                  }}
                />
              </div>

              {/* <button
                type="submit"
                className="w-full text-white bg-[#cf1f5c] hover:bg-[#b01a4e] focus:ring-4 focus:outline-none focus:ring-pink-300 font-bold rounded-xl text-[15px] px-5 py-[16px] text-center flex justify-center items-center gap-2 transition-colors shadow-lg shadow-pink-500/25"
              >
                เข้าสู่ระบบ <span>→</span>
              </button> */}
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
                เข้าสู่ระบบ
              </Button>

              <div className="mt-10 text-center text-[13px] font-bold text-[#8a8a8a]">
                ยังไม่มีบัญชีผู้ใช้งาน?{" "}
                <a href="#" className="text-[#cf1f5c] hover:underline ml-1">
                  ติดต่อผู้ดูแลระบบ
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;
