import * as React from "react";
import clsx from "clsx";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { SvgIconProps } from "@mui/material/SvgIcon";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2Root,
  TreeItem2GroupTransition,
} from "@mui/x-tree-view/TreeItem2";
import {
  useTreeItem2,
  UseTreeItem2Parameters,
} from "@mui/x-tree-view/useTreeItem2";
import { TreeItem2Provider } from "@mui/x-tree-view/TreeItem2Provider";
import { TreeItem2Icon } from "@mui/x-tree-view/TreeItem2Icon";
import { Link, useLocation } from "react-router-dom";
import { Divider } from "@mui/material";
import { IMenuItem, menuItemFull } from "./menu-item";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { getLoginStorage } from "@/helpers/set-storage";
import { MasterUserModel } from "@/api/controller/master-user";
dayjs.extend(timezone);
dayjs.extend(utc);

declare module "react" {
  interface CSSProperties {
    "--tree-view-color"?: string;
    "--tree-view-bg-color"?: string;
  }
}

interface StyledTreeItemProps
  extends Omit<UseTreeItem2Parameters, "rootRef">,
    React.HTMLAttributes<HTMLLIElement> {
  bgColor?: string;
  bgColorForDarkMode?: string;
  color?: string;
  colorForDarkMode?: string;
  labelIcon: React.ElementType<SvgIconProps>;
  labelInfo?: string;
}

const CustomTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  marginBottom: theme.spacing(0),
  color: "#475569",
  paddingRight: theme.spacing(1),
  fontWeight: theme.typography.fontWeightMedium,
  position: "relative",
  "&.expanded": {
    fontWeight: theme.typography.fontWeightRegular,
    color: "#475569",
  },
  "&:hover": {
    backgroundColor: "#f9f1f7ff",
    fontWeight: 500,
    color: "#1e293b",
  },
  "& .MuiTreeItem-content.Mui-selected": {
    background: "#f9f1f7ff",
  },
  "&.focused, &.selected, &.selected.focused": {
    backgroundColor: `#f9f1f7ff`,
    color: "#1e293b",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: "15%",
      bottom: "15%",
      width: "6px",
      backgroundColor: "#E91E63", // yellow color matching the design
      borderTopRightRadius: "6px",
      borderBottomRightRadius: "6px",
    },
  },
}));

const CustomTreeItemIconContainer = styled(TreeItem2IconContainer)(
  ({ theme }) => ({
    marginRight: theme.spacing(1),
  }),
);

const CustomTreeItemGroupTransition = styled(TreeItem2GroupTransition)(
  ({ theme }) => ({
    marginLeft: 0,
    [`& .content`]: {
      paddingLeft: theme.spacing(2),
    },
  }),
);

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: StyledTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const theme = useTheme();
  const {
    id,
    itemId,
    label,
    disabled,
    children,
    bgColor,
    color,
    labelIcon: LabelIcon,
    labelInfo,
    colorForDarkMode,
    bgColorForDarkMode,
    ...other
  } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

  const style = {
    "--tree-view-color":
      theme.palette.mode !== "dark" ? color : colorForDarkMode,
    "--tree-view-bg-color":
      theme.palette.mode !== "dark" ? bgColor : bgColorForDarkMode,
  };

  return (
    <TreeItem2Provider itemId={itemId}>
      <CustomTreeItemRoot {...getRootProps({ ...other, style })}>
        <CustomTreeItemContent
          {...getContentProps({
            className: clsx("content", {
              expanded: status.expanded,
              selected: status.selected,
              focused: status.focused,
            }),
          })}
        >
          <CustomTreeItemIconContainer {...getIconContainerProps()}>
            <TreeItem2Icon status={status} />
          </CustomTreeItemIconContainer>
          <Box
            sx={{
              display: "flex",
              flexGrow: 1,
              alignItems: "center",
              p: 1.5,
              pr: 0,
              "&:hover": {
                bgcolor: "#f9f1f7ff",
                "& .label-icon": {
                  color: "#E91E63",
                },
                "& .label-text": {
                  color: "#E91E63",
                },
              },
            }}
          >
            <Box
              component={LabelIcon}
              className="label-icon"
              sx={{ mr: 2, color: status.selected ? "#E91E63" : "#475569" }}
            />
            <Typography
              {...getLabelProps({
                className: "label-text",
                variant: "body1",
                sx: {
                  display: "flex",
                  fontWeight: status.selected ? 600 : 500,
                  flexGrow: 1,
                  color: status.selected ? "#E91E63" : "#475569",
                },
              })}
            />
            <Typography variant="caption" color="inherit">
              {labelInfo}
            </Typography>
          </Box>
        </CustomTreeItemContent>
        {children && (
          <CustomTreeItemGroupTransition {...getGroupTransitionProps()} />
        )}
      </CustomTreeItemRoot>
    </TreeItem2Provider>
  );
});

// function EndIcon() {
//   return <div style={{ width: 24 }} />;
// }

// --------------------------------------------------------------------------------------------------------------- //

const matchPath = (menuPath: string, currentPath: string) => {
  if (!menuPath) return false;
  const regex = new RegExp(`^${menuPath.replace(/:id/g, "[^/]+")}$`);
  return regex.test(currentPath);
};

const getParentIdByPath = (data: any[], currentPath: string) => {
  for (const item of data) {
    if (item.subMenu) {
      const hasMatch = item.subMenu.some((sub: any) => {
        const isMainMatch = matchPath(sub.path, currentPath);
        const isRelatedMatch = sub.relatedPaths?.some(
          (p: string) => currentPath === p || currentPath.startsWith(p + "/"),
        );
        return isMainMatch || isRelatedMatch;
      });
      if (hasMatch) return item.id;
    }
  }
  return null;
};

const MenuSideBar = () => {
  const { pathname } = useLocation();
  const profile: MasterUserModel = getLoginStorage().profile;
  let isAdmin = false;
  if (profile?.role === "Admin") {
    isAdmin = true;
  }
  const menuData: IMenuItem[] = isAdmin ? menuItemFull() : menuItemFull(); // ดึงข้อมูลเมนูทั้งหมด
  const initialParentId = getParentIdByPath(menuData, pathname);
  const [expandedItems, setExpandedItems] = React.useState<string[]>(
    initialParentId ? [initialParentId] : [],
  );

  // --- ควบคุมสถานะการกาง (Expanded) ---

  const selectedItemId = React.useMemo(() => {
    for (const item of menuData) {
      // เช็คทั้ง path หลัก และ relatedPaths
      const isMainMatch = item.path && matchPath(item.path, pathname);
      const isRelatedMatch = item.relatedPaths?.some(
        (p: string) => pathname === p || pathname.startsWith(p + "/"),
      );

      if (isMainMatch || isRelatedMatch) return item.id;

      if (item.subMenu) {
        const sub = item.subMenu.find((s: any) => {
          const isSubMainMatch = s.path && matchPath(s.path, pathname);
          const isSubRelatedMatch = s.relatedPaths?.some(
            (p: string) => pathname === p || pathname.startsWith(p + "/"),
          );
          return isSubMainMatch || isSubRelatedMatch;
        });
        if (sub) return sub.id;
      }
    }
    return null;
  }, [pathname, menuData]);

  // อัปเดตการกางเมนูเมื่อเปลี่ยนหน้า
  React.useEffect(() => {
    const currentParentId = getParentIdByPath(menuData, pathname);
    if (currentParentId) {
      setExpandedItems((prev) =>
        prev.includes(currentParentId) ? prev : [...prev, currentParentId],
      );
    }
  }, [pathname, menuData]);

  const handleExpandedItemsChange = (
    _: React.SyntheticEvent,
    itemIds: string[],
  ) => {
    setExpandedItems(itemIds);
  };

  return (
    <SimpleTreeView
      slots={{
        expandIcon: ArrowRightIcon,
        collapseIcon: ArrowDropDownIcon,
        // endIcon: EndIcon,
      }}
      sx={{ flexGrow: 1, maxWidth: 400 }}
      className="flex flex-col justify-between"
      // ใช้สถานะที่เราคำนวณมา
      selectedItems={selectedItemId}
      expandedItems={expandedItems}
      onExpandedItemsChange={handleExpandedItemsChange}
      expansionTrigger="content"
    >
      <div className="flex-1 overflow-y-auto">
        {menuData.map((item: any, index: number) => (
          <div key={"main-item-" + index}>
            {item.id === "000" ? (
              <Divider sx={{ marginTop: "30px", fontSize: "13px" }}>
                {item.label}
              </Divider>
            ) : item?.subMenu ? (
              /* --- กรณีเป็นเมนูที่มีลูก (Sub Menu) --- */
              <CustomTreeItem
                itemId={item.id}
                label={item.label}
                labelIcon={item?.icon}
              >
                {item.subMenu.map((sub: any, subKey: number) => (
                  <Link
                    key={"sub-" + subKey}
                    to={sub.path.replace(":id", "id")} // ปรับ ID จริงใส่ไปใน link
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <CustomTreeItem
                      itemId={sub.id}
                      label={sub.label}
                      labelIcon={sub?.icon}
                    />
                  </Link>
                ))}
              </CustomTreeItem>
            ) : (
              /* --- กรณีเป็นเมนูเดี่ยว (Single Menu) --- */
              <Link
                to={item.path || "#"}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <CustomTreeItem
                  itemId={item.id}
                  label={item.label}
                  labelIcon={item?.icon}
                />
              </Link>
            )}
          </div>
        ))}
      </div>
    </SimpleTreeView>
  );
};

export default MenuSideBar;
