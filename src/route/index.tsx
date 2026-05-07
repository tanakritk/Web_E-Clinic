import { Navigate, Route, Routes } from "react-router-dom";
import PageNotFound from "@/pages/page-not-found";
import PageLogin from "@/pages/login";
import PageDashboard from "@/pages/dashboard";
import PageMasterUser from "@/pages/master/user";
import PageCustomerSearch from "@/pages/customer/search";
import PageCalendarDue from "@/pages/calendar-due";
import PageSaleProduct from "@/pages/sale-product";
import PageCustomerInfo from "@/pages/customer/information";
import PageMasterBranch from "@/pages/master/branch";
import PageMasterProduct from "@/pages/master/product";
import PageChangePassword from "@/pages/change-password";
import PageMasterCourses from "@/pages/master/courses";
import PageStock from "@/pages/stock";
import PageSaleList from "@/pages/sale-list";
import PageBillDetail from "@/pages/bill-detail";

// interface RouteType {
//     path: string;
//     component: React.ComponentType;
// }

const GetRoute = () => {
  // const data: RouteType[] = [
  //     { path: '/', component: PageMain },
  //     { path: '/strategic-map', component: PageMapStrategy },
  //     { path: '/strategic-map/target/:id', component: PageTarget },

  //     { path: '/strategic-map/target/:id/project/:projectId', component: PageNotFound },

  //     { path: '*', component: PageNotFound },
  // ]

  // return data
  return (
    <Routes>
      <Route path="/login" element={<PageLogin />} />
      <Route path="/change-password" element={<PageChangePassword />} />

      <Route path="/" element={<Navigate to="/customer/search" replace />} />

      <Route path="/dashboard" element={<PageDashboard />} />

      <Route path="/calendar-due" element={<PageCalendarDue />} />
      <Route path="/sale-product" element={<PageSaleProduct />} />
      <Route path="/sale-list" element={<PageSaleList />} />
      <Route path="/bill-detail/:id" element={<PageBillDetail />} />

      {/* --------------- customer --------------- */}
      <Route path="/customer/search" element={<PageCustomerSearch />} />
      <Route path="/customer/information/:id" element={<PageCustomerInfo />} />
      {/* -------------------------------------- */}

      {/* --------------- stock --------------- */}
      <Route path="/stock" element={<PageStock />} />
      {/* -------------------------------------- */}

      {/* --------------- master --------------- */}
      <Route path="/master/branch" element={<PageMasterBranch />} />
      <Route path="/master/user" element={<PageMasterUser />} />
      <Route path="/master/product" element={<PageMasterProduct />} />
      <Route path="/master/courses" element={<PageMasterCourses />} />
      {/* -------------------------------------- */}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default GetRoute;
