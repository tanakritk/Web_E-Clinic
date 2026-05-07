import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { Pagination, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  _MasterCoursesApi,
  _MasterCoursesKey,
} from "@/api/controller/master-courses";
import {
  _MasterProductApi,
  _MasterProductKey,
} from "@/api/controller/master-product";
import {
  BaseSearchModel,
  BaseSearchQueryModel,
  PaginationModel,
} from "@/api/interface";
import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";
import faceImg from "@/assets/img/face.png";
import { IItemsOrder } from "./order-summary";
import ModalCourseSchedule, { Schedule } from "./modal-course-schedule";

interface ProductSelectionProps {
  onAddItem: (itemOrder: IItemsOrder) => void;
}

export const ProductSelection = ({ onAddItem }: ProductSelectionProps) => {
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const [activeTab, setActiveTab] = useState<"Courses" | "Product">("Courses");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isModalScheduleOpen, setIsModalScheduleOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationModel>({
    page: 1,
    limit: 9,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search, debouncedSearch]);

  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: [
      _MasterCoursesKey().search,
      pagination.page,
      debouncedSearch,
      activeTab,
    ],
    queryFn: async (): Promise<BaseSearchQueryModel> => {
      const payload: BaseSearchModel = {
        page: pagination.page,
        limit: pagination.limit,
        filterOperator: "or",
        relation: ["courses_product.mas_product"],
        filter: debouncedSearch
          ? [
              { field: "name", operator: "like", value: debouncedSearch },
              { field: "code", operator: "like", value: debouncedSearch },
            ]
          : [],
      };
      try {
        return await _MasterCoursesApi().search(payload);
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
          type: "warning",
        });
        return {
          statusCode: 0,
          message: "",
          data: [],
          paginationData: {
            page: pagination.page,
            limit: pagination.limit,
            totalPages: 1,
            totalItems: 0,
          },
        };
      }
    },
    enabled: activeTab === "Courses",
  });

  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: [
      _MasterProductKey().search,
      pagination.page,
      debouncedSearch,
      activeTab,
    ],
    queryFn: async (): Promise<BaseSearchQueryModel> => {
      const payload: BaseSearchModel = {
        page: pagination.page,
        limit: pagination.limit,
        filterOperator: "or",
        filter: debouncedSearch
          ? [
              { field: "name", operator: "like", value: debouncedSearch },
              { field: "code", operator: "like", value: debouncedSearch },
            ]
          : [],
      };
      try {
        return await _MasterProductApi().SearchForSale(payload);
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
          type: "warning",
        });
        return {
          statusCode: 0,
          message: "",
          data: [],
          paginationData: {
            page: pagination.page,
            limit: pagination.limit,
            totalPages: 1,
            totalItems: 0,
          },
        };
      }
    },
    enabled: activeTab === "Product",
  });

  const onChangeTab = (tabValue: "Courses" | "Product") => {
    setPagination({
      ...pagination,
      page: 1,
    });
    setActiveTab(tabValue);
  };

  const onAddProduct = (product: any) => {
    console.log("product--> ", product);

    if (activeTab === "Courses") {
      setSelectedCourse(product);
      setIsModalScheduleOpen(true);
    } else if (activeTab === "Product") {
      const orderItemsModel: IItemsOrder = {
        itemType: "Product",
        productId: product.id,
        name: product.name,
        unitPrice: String(product.price || 0),
        numberOfTimes: 1,
        quantity: 1,
        totalPrice: product.price || 0,
      };
      onAddItem(orderItemsModel);
    }
  };

  const onCourseScheduleSubmit = (schedules: Schedule[]) => {
    if (selectedCourse) {
      const orderItemsModel: IItemsOrder = {
        itemType: "Course",
        courseId: selectedCourse.id,
        name: selectedCourse.name,
        unitPrice: String(selectedCourse.price || 0),
        numberOfTimes: selectedCourse.numberOfTimes || 0,
        quantity: 1,
        totalPrice: selectedCourse.price || 0,
        mas_product:
          selectedCourse.courses_product?.map((item: any) => ({
            id: item.mas_product?.id,
            name: item.mas_product?.name,
            code: item.mas_product?.code,
            quantity: Number(item.quantity || 0),
          })) || [],
        schedules: schedules,
      };
      onAddItem(orderItemsModel);
    }
    setIsModalScheduleOpen(false);
    setSelectedCourse(null);
  };

  useEffect(() => {
    const finalLoad = isLoadingCourses || isLoadingProduct;
    setLoadingContext(finalLoad);
  }, [setLoadingContext, isLoadingCourses, isLoadingProduct]);

  const displayData =
    activeTab === "Courses" ? coursesData?.data : productData?.data;
  const currentPagination =
    activeTab === "Courses"
      ? coursesData?.paginationData
      : productData?.paginationData;

  return (
    <div className="flex flex-col gap-6 w-full h-full mt-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <h1 className="text-xl font-extrabold">ซื้อขายคอร์สและสินค้า</h1>
        {/* <span className="text-[13px] font-bold text-gray-500 mb-1">
          รายการทั้งหมด 142 รายการ
        </span> */}
      </div>

      {/* Tabs and Search Area */}
      <div className="bg-[#f8f8f9] rounded-[20px] p-4 flex flex-wrap items-center gap-6 shadow-sm border border-gray-50">
        <div className="lg:basis-2/5 basis-full flex gap-2">
          <TextField
            fullWidth
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหารหัส หรือ ชื่อ..."
            className="w-full sm:w-64 md:w-80 flex-1 sm:flex-none"
            InputProps={{
              startAdornment: (
                <div className="mr-2 flex items-center text-gray-400">
                  <SearchIcon fontSize="small" />
                </div>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                borderRadius: "1rem", // rounded-2xl
                paddingLeft: "12px",
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // shadow-sm
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "transparent" },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                  borderWidth: "1px",
                },
              },
              "& .MuiInputBase-input": {
                padding: "18px 16px 18px 0", // Increased padding to make it taller
                fontSize: "15px",
              },
            }}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center ">
          <div
            onClick={() => onChangeTab("Courses")}
            className={`px-10 h-[57px] rounded-[16px] flex items-center justify-center cursor-pointer  ${
              activeTab === "Courses"
                ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100"
                : "hover:bg-gray-100"
            }`}
          >
            <span
              className={`text-[16px] font-bold text-center leading-[1.3] ${
                activeTab === "Courses" ? "text-primary" : "text-gray-500"
              }`}
            >
              คอร์สเสริมความงาม
            </span>
          </div>

          <div
            onClick={() => onChangeTab("Product")}
            className={`px-10 h-[57px] rounded-[16px] flex items-center justify-center cursor-pointer  ${
              activeTab === "Product"
                ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100"
                : "hover:bg-gray-100"
            }`}
          >
            <span
              className={`text-[16px] font-bold text-center ${
                activeTab === "Product" ? "text-primary" : "text-gray-600"
              }`}
            >
              สินค้า
            </span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------------- */}

      {/* Product List */}
      <div className="flex flex-wrap gap-y-3">
        {(displayData || []).map((p: any, index: number) => (
          <div
            className="basis-full sm:basis-1/2 lg:basis-1/3 px-3"
            key={"listA" + index}
          >
            <div className=" bg-white rounded-[24px] p-3 flex flex-col gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-50 hover:shadow-md transition-shadow ">
              <div className="h-[140px] w-full rounded-[16px] overflow-hidden bg-white relative">
                <img
                  src={
                    activeTab === "Product"
                      ? p.base64
                        ? `${p.base64}`
                        : ""
                      : faceImg
                  }
                  alt={p.name || ""}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col px-1">
                <span className="text-[10px] font-extrabold text-primary tracking-wider mb-1 uppercase">
                  {activeTab === "Courses" ? "COURSE" : "PRODUCT"}
                </span>
                <span className="text-[13px] font-bold text-gray-800 leading-[1.3]  line-clamp-2 mb-1">
                  {p.name || ""}
                </span>
                <span className="text-[11px] text-gray-400 h-[34px] ">
                  คอร์ส {p.numberOfTimes || 0} ครั้ง
                </span>

                <div className="flex justify-between items-end mt-2">
                  <span className="text-primary font-extrabold text-[16px]">
                    ฿{p.price ? parseFloat(p.price).toLocaleString() : "0"}
                  </span>

                  <div
                    onClick={() => onAddProduct(p)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                      p.isActive !== false
                        ? "bg-pink-50 text-primary"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <AddIcon sx={{ fontSize: 18 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* -------------------------------------------------------------------------------------------- */}

      <div className="flex justify-end mt-6">
        <Pagination
          count={currentPagination?.totalPages || 1}
          page={pagination.page}
          shape="rounded"
          onChange={(_, page) => {
            setPagination((prev) => ({ ...prev, page }));
          }}
        />
      </div>

      <ModalCourseSchedule
        open={isModalScheduleOpen}
        onClose={() => {
          setIsModalScheduleOpen(false);
          setSelectedCourse(null);
        }}
        onSubmit={onCourseScheduleSubmit}
        course={selectedCourse}
      />
    </div>
  );
};
