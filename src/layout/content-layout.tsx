import { ReactNode, useEffect, useState } from "react";
import useWindowSize from "../components/use-window-size";
import SideBar from "../components/sidebar";
import { removeLoginStorage } from "../helpers/set-storage";
import BreadCrumbCustom, {
  BreadcrumbCustomList,
} from "../components/custom-element/breadcrumb-custom";
import { useNavigate } from "react-router-dom";
import AppBar from "../components/appbar";
import { useMediaQuery, useTheme } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

interface ContentLayoutProps {
  children: ReactNode;
  titlePage?: string | ReactNode;
  subTitlePage?: string;
  breadcrumbList?: BreadcrumbCustomList[];
  headRightLayout?: ReactNode;
}

const ContentLayout = ({
  children,
  titlePage,
  subTitlePage,
  breadcrumbList,
  headRightLayout,
}: ContentLayoutProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [isOpen, setIsOpen] = useState(isDesktop);
  const windowSize = useWindowSize();
  const pageWidthLimit = 770;
  //   const profile = getLoginStorage()?.profile;

  const toggleMenu = (event: any) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const onCloseSidebar = () => {
    if (windowSize.width <= pageWidthLimit) {
      setIsOpen(false);
    }
  };

  const onLogout = async () => {
    removeLoginStorage();
    queryClient.clear();

    //   window.location.href = `${import.meta.env.VITE_APP_URL_LOGIN}?Client_ID=${import.meta.env.VITE_APP_CLIENT_ID}&Secret_API=${import.meta.env.VITE_APP_SECRET_API}&RedirectUri=${import.meta.env.VITE_APP_REDIRECTURI}`;
    navigate("/login");
  };

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]); // ทำงานทุกครั้งที่ขนาดหน้าจอข้ามเส้นแบ่ง md

  return (
    <>
      <div className="bg-[#F5F2F5]">
        <AppBar returnLogout={onLogout} />
        <div className="w-full overflow-auto py h-[calc(100vh-80px)] flex ">
          <SideBar status={isOpen} toggleMenu={toggleMenu} />
          <div
            className="w-full  py-[1rem] h-[calc(100vh-80px)] overflow-auto"
            onClick={onCloseSidebar}
          >
            <div className="px-6 flex justify-between">
              <div className="flex flex-col">
                <p className="font-bold text-xl">{titlePage}</p>
                <p className="text-sm text-gray-500">{subTitlePage}</p>
                <BreadCrumbCustom list={breadcrumbList || []} />
              </div>
              <div>{headRightLayout}</div>
            </div>
            <div className="px-6 ">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentLayout;
