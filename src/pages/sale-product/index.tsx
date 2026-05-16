import ContentLayout from "@/layout/content-layout";
import { CustomerSection } from "./components/customer-section";
import { ProductSelection } from "./components/product-selection";
import {
  IItemsOrder,
  ISalePayload,
  OrderSummary,
} from "./components/order-summary";
import { useEffect, useState } from "react";
import {
  _MasterCustomerApi,
  _MasterCustomerKey,
  MasterCustomerModel,
  SearchMasterCustomerModel,
} from "@/api/controller/master-customer";
import { useAlert } from "@/context/alert-context";
import { getLoginStorage } from "@/helpers/set-storage";
import { _SaleApi, _SaleKey, CreateSaleModel } from "@/api/controller/trn-sale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { _StockKey } from "@/api/controller/trn-stock";
import { useNavigate, useParams } from "react-router-dom";
import { CryptoHelper } from "@/helpers/encrypt-decrypt";
import { useLoading } from "@/context/loading-context";

const PageSaleProduct = (): JSX.Element => {
  const { customerId } = useParams();
  const customerIdDeCode = CryptoHelper.decrypt(
    decodeURIComponent(customerId || ""),
  );

  const { setAlertContext } = useAlert();
  const { setLoadingContext } = useLoading();
  const profile = getLoginStorage().profile;
  const [customerSelect, setCustomerSelect] = useState<
    MasterCustomerModel | undefined
  >(undefined);
  const [itemsOrderList, setItemsOrderList] = useState<IItemsOrder[]>([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // --- Query: ข้อมูลลูกค้า (กรณีส่ง customerId มาทาง URL) ---
  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: [_MasterCustomerKey().search, customerIdDeCode],
    queryFn: async () => {
      const payload: SearchMasterCustomerModel = {
        page: 1,
        limit: 1,
        filterOperator: "and",
        filter: [{ field: "id", operator: "=", value: customerIdDeCode }],
      };
      try {
        const result = await _MasterCustomerApi().search(payload);
        return result?.data?.[0] ?? null;
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า",
          type: "warning",
        });
        return null;
      }
    },
    enabled: !!customerIdDeCode,
  });

  useEffect(() => {
    if (customerData) {
      setCustomerSelect(customerData);
    }
  }, [customerData]);

  useEffect(() => {
    setLoadingContext(isLoadingCustomer);
  }, [isLoadingCustomer, setLoadingContext]);

  const onAddItemOrder = (item: IItemsOrder) => {
    setItemsOrderList([...itemsOrderList, item]);
  };

  const onUpdateQuantity = (index: number, change: number) => {
    setItemsOrderList((prev) => {
      const newList = [...prev];
      const newQuantity = newList[index].quantity + change;
      if (newQuantity <= 0) {
        newList.splice(index, 1);
      } else {
        newList[index] = { ...newList[index], quantity: newQuantity };
      }
      return newList;
    });
  };

  const validate = () => {
    if (!customerSelect) {
      setAlertContext({
        message: "กรุณาเลือกลูกค้าก่อนทำรายการ",
        type: "warning",
      });
      return false;
    }
    if (itemsOrderList.length === 0) {
      setAlertContext({
        message: "กรุณาเลือกคอร์สหรือสินค้าอย่างน้อย 1 รายการ",
        type: "warning",
      });
      return false;
    }
    return true;
  };

  const onSave = async (summary: ISalePayload) => {
    const payload = {
      amount: summary.amount,
      vat: summary.vat,
      discount: summary.discount,
      totalAmount: summary.totalAmount,
      saleDate: new Date().toISOString(),
      customerId: customerSelect?.id || 0,
      branchId: profile?.mas_branch?.id || 0,
      items: itemsOrderList.map((item) => ({
        itemType: item.itemType,
        courseId: item.courseId || 0,
        productId: item.productId || 0,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: item.totalPrice || 0,
        schedules: item.schedules || [],
      })),
      payment: summary.payment,
    };

    try {
      const result = await _SaleApi().create(payload as CreateSaleModel);
      if (result.statusCode === 200) {
        setAlertContext({
          message: "บันทึกข้อมูลสำเร็จ",
          type: "success",
        });
        queryClient.invalidateQueries({ queryKey: [_StockKey().search] });
        queryClient.invalidateQueries({ queryKey: [_SaleKey().search] });

        if (result.data?.id) {
          const curentId = encodeURIComponent(
            CryptoHelper.encrypt(result.data.id),
          );
          navigate(`/bill-detail/${curentId}`);
        }
      }
    } catch (err: any) {
      setAlertContext({
        message: err.message,
        type: "warning",
      });
    }
  };
  return (
    <>
      <ContentLayout titlePage="ซื้อขายคอร์สและสินค้า" subTitlePage="">
        <div className="mt-6 flex flex-col lg:flex-row gap-8 w-full items-start">
          {/* Left Column (Main Content) */}
          <div className="flex-1 flex flex-col w-full min-w-0 bg-transparent">
            {/* Customer Info */}
            <CustomerSection
              customer={customerSelect}
              onSelect={(customer) => setCustomerSelect(customer)}
            />

            {/* Additional Products Selection */}
            <ProductSelection onAddItem={onAddItemOrder} />
          </div>

          {/* Right Column (Order Summary) */}
          <div className="w-full lg:w-[380px] shrink-0 xl:w-[420px]">
            <OrderSummary
              itemsOrder={itemsOrderList}
              onUpdateQuantity={onUpdateQuantity}
              onClickSave={onSave}
              onValidate={validate}
            />
          </div>
        </div>
      </ContentLayout>
    </>
  );
};

export default PageSaleProduct;
