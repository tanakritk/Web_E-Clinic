import LogoutIcon from "@mui/icons-material/Logout";
import useConfirm from "../drawer-confirm";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupIcon from "@mui/icons-material/Group";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";

const MENU_ITEMS = [
  {
    path: "/master/branch",
    label: "จัดการข้อมูลสาขา",
    icon: <FmdGoodIcon fontSize="small" sx={{ color: "#64748b" }} />,
  },
  {
    path: "/master/user",
    label: "จัดการข้อมูลผู้ใช้งาน",
    icon: <GroupIcon fontSize="small" sx={{ color: "#64748b" }} />,
  },
  {
    path: "/master/product",
    label: "จัดการข้อมูลสินค้า",
    icon: <InventoryIcon fontSize="small" sx={{ color: "#64748b" }} />,
  },
  {
    path: "/master/courses",
    label: "จัดการข้อมูลคอร์สผิวสวยไร้ฝ้ากระ",
    icon: (
      <FaceRetouchingNaturalIcon fontSize="small" sx={{ color: "#64748b" }} />
    ),
  },
];

interface AppBarProps {
  returnLogout: () => void;
}

const AppBar = ({ returnLogout }: AppBarProps) => {
  const [confirm, ConfirmDialog] = useConfirm();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onLogout = async () => {
    const resultConfirm = await confirm("ท่านต้องการออกจากระบบใช่หรือไม่ ?");
    if (resultConfirm) {
      return returnLogout();
    }
  };

  return (
    <>
      <div className="flex w-full bg-white h-20 shadow items-center px-6">
        <div className="flex w-full justify-between">
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-primary">Cleoskin Medical</p>
            <p className="text-sm font-semibold text-gray-600">สำนักงานใหญ่</p>
          </div>
          <div className="flex space-x-4 items-center">
            <IconButton onClick={handleMenuClick}>
              <SettingsIcon color="action" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.12))",
                  mt: 1.5,
                  borderRadius: 3,
                  minWidth: 260,
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
            >
              <div className="px-5 py-3 focus:outline-none cursor-default">
                <p className="text-[14px] font-bold text-slate-800">
                  ตั้งค่าระบบ (Master)
                </p>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  จัดการข้อมูลพื้นฐานของระบบ
                </p>
              </div>
              <Divider sx={{ my: 0.5 }} />

              {MENU_ITEMS.map((menu, index) => (
                <MenuItem
                  key={index}
                  onClick={() => navigate(menu.path)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    mx: 1,
                    borderRadius: 1.5,
                    mb: 0.5,
                    "&:hover": { bgcolor: "#f1f5f9" },
                  }}
                >
                  <ListItemIcon>{menu.icon}</ListItemIcon>
                  <span className="text-sm font-semibold text-slate-700">
                    {menu.label}
                  </span>
                </MenuItem>
              ))}
            </Menu>

            <IconButton onClick={onLogout}>
              <LogoutIcon color="error" />
            </IconButton>
          </div>
        </div>
      </div>

      {ConfirmDialog}
    </>
  );
};

export default AppBar;
