import DashboardIcon from "@mui/icons-material/Dashboard";
// import DescriptionIcon from "@mui/icons-material/Description";
// import { getLoginStorage } from "@/helpers/set-storage";
// import { CryptoHelper } from "@/helpers/encrypt-decrypt";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import StoreMallDirectoryIcon from "@mui/icons-material/StoreMallDirectory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

export interface IMenuItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  path?: string;
  relatedPaths?: string[];
  subMenu?: IMenuItem[];
}

const menuItemFull = (): IMenuItem[] => {
  // ผู้ดูแลระบบ
  // const profile = getLoginStorage()?.profile;
  // const idEmp = encodeURIComponent(CryptoHelper.encrypt(profile?.id));
  return [
    // { id: "0", label: "หน้าหลัก", icon: HomeOutlinedIcon, path: "/" },

    {
      id: "1",
      label: "ข้อมูลลูกค้า",
      icon: PeopleIcon,
      path: `/customer/search`,
      relatedPaths: [
        "/customer/search",
        "/customer/create",
        "/customer/information",
      ],
      //   relatedPaths: [`/checkin-checkout`, `/checkin-checkout-history`],
      // subMenu: [
      //   {
      //     id: "2.1",
      //     label: "ลงชื่อ เข้างาน-ออกงาน",
      //     icon: PermContactCalendarIcon,
      //     path: `/checkin-checkout/${idEmp}`,
      //     relatedPaths: [`/checkin-checkout`],
      //   },
      //   {
      //     id: "2.2",
      //     label: "ประวัติเวลาการเข้างาน-ออกงาน",
      //     icon: EventNoteIcon,
      //     path: `/checkin-checkout-history/${idEmp}`,
      //     relatedPaths: [`/checkin-checkout-history`],
      //   },
      // ],
    },
    {
      id: "2",
      label: "ขายสินค้า",
      icon: LocalGroceryStoreIcon,
      path: `/sale-product`,
      relatedPaths: [`/sale-product`],
    },
    {
      id: "3",
      label: "รายการขายสินค้า",
      icon: ReceiptLongIcon,
      path: `/sale-list`,
      relatedPaths: [`/sale-list`],
    },
    {
      id: "4",
      label: "ปฏิทินนัดหมาย",
      icon: CalendarMonthIcon,
      path: `/calendar-due`,
      relatedPaths: [`/calendar-due`],
    },
    {
      id: "5",
      label: "Dashboard",
      icon: DashboardIcon,
      path: `/dashboard`,
      relatedPaths: ["/dashboard"],
    },

    {
      id: "000",
      label: "จัดการข้อมูลระบบ",
    },

    {
      id: "6",
      label: "คลังสินค้า",
      icon: StoreMallDirectoryIcon,
      path: `/stock`,
      relatedPaths: [`/stock`],
    },
  ];
};

export { menuItemFull };
