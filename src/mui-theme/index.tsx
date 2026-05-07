import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#E91E63",
    },
    warning: {
      main: "#ff870f",
      contrastText: "#fff",
    },
    error: {
      main: "#f15950",
    },
    secondary: {
      main: "#C84C69",
    },
    success: {
      main: "#008C47",
    },
    // white: {
    //   main: '#fff',
    // }
  },

  typography: {
    fontFamily: ["IBM Plex Sans Thai", "sans-serif"].join(","),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          //   borderRadius: "8px",
          //   fontWeight: 400,
          //   boxShadow: "none",
          borderRadius: "12px", // ปรับความโค้งมนให้ใกล้เคียงรูป
          //   fontWeight: 700, // ให้ตัวหนังสือดูหนาเด่นชัด
          boxShadow: "none",
          //   padding: "10px 24px", // ปรับระยะห่างให้ดูพอดี
          //   fontSize: "1.1rem", // ขนาดตัวอักษร
          //   "&:hover": {
          //     boxShadow: "none",
          //   },
        },

        containedPrimary: {
          backgroundColor: "#E91E63", // สีชมพูหลัก
          color: "#fff",
          "&:hover": {
            backgroundColor: "#da074dff", // สีตอน Hover ให้เข้มขึ้นนิดหน่อย
          },
        },
        // สไตล์สำหรับปุ่มเส้นขอบชมพู (ด้านขวา)
        outlinedPrimary: {
          color: "#E91E63",
          borderColor: "#E91E63",
          borderWidth: "1px",
          backgroundColor: "white",
          "&:hover": {
            borderWidth: "1px",
            backgroundColor: "rgba(232, 162, 169, 0.04)", // สีพื้นอ่อนๆ ตอน Hover
            borderColor: "#da074dff",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          "& .MuiInputBase-root.Mui-disabled": {
            backgroundColor: "#eeeeee",
          },
          "& .MuiInputBase-input.Mui-disabled": {
            opacity: 1, // ป้องกันการจาง
            "-webkit-text-fill-color": "#000000 !important", // บังคับให้สีตัวหนังสือเป็นสีดำ
          },
          borderRadius: "16px",
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            backgroundColor: "#eeeeee", // พื้นหลังเมื่อ disabled
            color: "#000000", // สีตัวอักษรเมื่อ disabled
            opacity: 1, // ปิดการทำให้สีจาง
          },
          borderRadius: "16px",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "16px", // ความโค้งมนแบบแคปซูล
          backgroundColor: "#f5f5f5", // สีเทาอ่อนสถานะปกติ
          transition: "background-color 0.2s, box-shadow 0.2s",

          // เมื่อ Disabled
          "&.Mui-disabled": {
            backgroundColor: "rgb(218, 217, 217) !important", // สีเทา
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "transparent", // สีเส้นขอบตอน disabled
              borderWidth: "0px !important",
            },
          },

          // จัดการสีเส้นขอบ (ไม่มีเส้นขอบ)
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "&:hover": {
            backgroundColor: "#eeeeee",
          },
          "&.Mui-focused": {
            backgroundColor: "#f5f5f5",
            boxShadow: "0 0 0 2px rgba(233, 30, 99, 0.2)",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          },
        },
        input: {
          padding: "16px 16px 16px 12px", // ระยะขอบด้านใน
          fontSize: "14px",
          fontWeight: 500,
          color: "#3a3a3a",
          "&.Mui-disabled": {
            WebkitTextFillColor: "#666666", // สีตัวอักษรตอน disabled
          },
          "&::placeholder": {
            color: "#a0a0a0",
            opacity: 1,
          },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        textAlignLeft: {
          "&::before": {
            display: "none",
          },
          "&::after": {
            flex: 1,
          },
        },
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#E91E63",
            color: "white",
            "&:hover": {
              backgroundColor: "#E91E63",
            },
          },
        },
      },
    },
  },
});

export { theme };
