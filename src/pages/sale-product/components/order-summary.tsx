import { useState } from "react";
import { ModalConfirmOrder } from "./modal-confirm-order";
import { useQuery } from "@tanstack/react-query";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MoneyIcon from "@mui/icons-material/Money";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Button, TextField } from "@mui/material";
import _SystemApi from "@/api/controller/system";
import { BaseSearchModel } from "@/api/interface";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra);
dayjs.locale("th");

interface IProduct {
  id: number;
  name: string;
  code: string;
  quantity: number;
}

export interface IItemsOrder {
  itemType: "Course" | "Product";
  courseId?: number;
  productId?: number;
  name: string;
  unitPrice: string;
  numberOfTimes: number;
  quantity: number;
  totalPrice?: number;
  mas_product?: IProduct[];
  schedules?: { date: string; time: string; isFree: boolean }[];
}

export interface ISalePayload {
  amount: number;
  vat: number;
  discount: number;
  totalAmount: number;
  payment: string;
}

interface OrderSummaryProps {
  itemsOrder: IItemsOrder[];
  onUpdateQuantity?: (index: number, change: number) => void;
  onClickSave: (payload: ISalePayload) => void;
  onValidate?: () => boolean;
}

export const OrderSummary = ({
  itemsOrder,
  onUpdateQuantity,
  onClickSave,
  onValidate,
}: OrderSummaryProps) => {
  const [paymentMethod, setPaymentMethod] = useState("QR Code");
  const [discount, setDiscount] = useState<number>(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<ISalePayload | null>(
    null,
  );

  const { data: systemData } = useQuery({
    queryKey: ["SystemSearchForVat"],
    queryFn: async () => {
      const payload: BaseSearchModel = {
        limit: 100,
        page: 1,
        filterOperator: "and",
        filter: [],
      };
      return await _SystemApi().search(payload);
    },
  });
  const vatSetting = systemData?.data?.find((item: any) => item.key === "vat");
  const vatPercentage =
    vatSetting && !isNaN(Number(vatSetting.value))
      ? Number(vatSetting.value)
      : 7;
  const vatRate = vatPercentage / 100;
  const subtotal = itemsOrder.reduce((acc, item) => {
    const price = Number(String(item.unitPrice).replace(/,/g, "")) || 0;
    return acc + price * item.quantity;
  }, 0);

  const amountAfterDiscount = Math.max(0, subtotal - discount);
  const tax = amountAfterDiscount * vatRate;
  const total = amountAfterDiscount + tax;

  return (
    <>
      <div className="flex flex-col  rounded-[24px]  overflow-hidden sticky h-full">
        {/* Header and Items Container */}
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center  py-5">
            <span className="font-extrabold text-[17px] text-gray-800">
              รายการสั่งซื้อ
            </span>
            <span className="bg-pink-100 text-primary px-3 py-1 rounded-full text-[11px] font-bold">
              {itemsOrder.length} รายการ
            </span>
          </div>

          {/* Order Items */}

          {itemsOrder.map((item: IItemsOrder, index: number) => (
            <div key={"order" + index} className="flex flex-col gap-4  pb-5">
              {item.itemType === "Course" ? (
                <div className="bg-white rounded-[16px] p-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-[13px] text-gray-800">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        คอร์ส {item.numberOfTimes} ครั้ง
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-[14px] text-primary">
                        ฿
                        {Number(
                          String(item.unitPrice).replace(/,/g, ""),
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[12px] font-bold text-gray-800 text-center">
                          จำนวน {item.quantity}
                        </span>
                        <div
                          onClick={() =>
                            onUpdateQuantity &&
                            onUpdateQuantity(index, -item.quantity)
                          }
                          className="w-[24px] h-[24px] flex items-center justify-center bg-red-50 rounded-full cursor-pointer hover:bg-red-100 transition-colors"
                        >
                          <DeleteOutlineIcon
                            sx={{ fontSize: 14, color: "#ef4444" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    key={"prod" + index}
                    className="bg-[#fcfcfc] border border-gray-50 rounded-[12px] p-3 flex flex-col gap-2 mt-1"
                  >
                    {item?.schedules && item.schedules.length > 0 && (
                      <div className="mb-2 border-b border-gray-100 pb-2">
                        <span className="text-[10px] font-bold text-gray-800 block mb-1">
                          ตารางเวลาคอร์ส:
                        </span>
                        {item.schedules.map((schedule, sIndex) => (
                          <div
                            key={"sched" + sIndex}
                            className="flex justify-between mt-1 items-center"
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-gray-600">
                                ครั้งที่ {sIndex + 1}
                              </span>
                              {schedule.isFree && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-600 border border-amber-300 rounded-full px-1.5 py-0.5 leading-none">
                                  แถม
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-800 font-medium">
                              {dayjs(schedule.date).format("DD/MM/BBBB")}{" "}
                              {schedule.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-gray-800">
                      รายการที่รวมในคอร์ส:
                    </span>
                    {item?.mas_product?.map((prod: IProduct, index: number) => (
                      <div
                        key={"orderB" + index}
                        className="flex justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon
                            color="primary"
                            sx={{ fontSize: 14 }}
                          />

                          <span className="text-[11px] text-primary font-medium">
                            {prod.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-gray-400 mt-0.5">
                            {prod.quantity} ชิ้น
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[16px] p-4 flex flex-col shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-[13px] text-gray-800">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-[14px] text-primary">
                        ฿
                        {Number(
                          String(item.unitPrice).replace(/,/g, ""),
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          onClick={() =>
                            onUpdateQuantity && onUpdateQuantity(index, -1)
                          }
                          className="w-[22px] h-[22px] flex items-center justify-center bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200"
                        >
                          <RemoveIcon sx={{ fontSize: 14, color: "#666" }} />
                        </div>
                        <span className="text-[12px] font-bold text-gray-800 w-3 text-center">
                          {item.quantity}
                        </span>
                        <div
                          onClick={() =>
                            onUpdateQuantity && onUpdateQuantity(index, 1)
                          }
                          className="w-[22px] h-[22px] flex items-center justify-center bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200"
                        >
                          <AddIcon sx={{ fontSize: 14, color: "#666" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="bg-white px-6 py-6 rounded-t-[24px] shadow-[0_-4px_15px_rgba(0,0,0,0.03)] flex flex-col gap-5 mt-auto relative z-10">
          {/* Calculation */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500 font-bold">ยอดรวม</span>
              <span className="text-gray-800 font-extrabold">
                ฿
                {subtotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-gray-500 font-bold">ส่วนลด</span>
              <div className="w-24">
                <TextField
                  variant="standard"
                  autoComplete="off"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  type="number"
                  inputProps={{
                    min: 0,
                    style: {
                      textAlign: "right",
                      fontWeight: 800,
                      fontSize: "13px",
                    },
                  }}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500 font-bold">
                ภาษี ({vatPercentage}%)
              </span>
              <span className="text-gray-800 font-extrabold">
                ฿
                {tax.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-1 mb-1">
            <span className="font-extrabold text-gray-800 text-[15px]">
              ยอดสุทธิ
            </span>
            <span className="font-black text-[24px] text-primary">
              ฿
              {total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col gap-3">
            <span className="text-[12px] font-bold text-gray-500">
              ช่องทางการชำระเงิน
            </span>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: "QR Code",
                  icon: <QrCode2Icon sx={{ fontSize: 24 }} />,
                  label: "QR Code",
                },
                {
                  id: "เงินสด",
                  icon: <MoneyIcon sx={{ fontSize: 24 }} />,
                  label: "เงินสด",
                },
                {
                  id: "บัตรเครดิต",
                  icon: <CreditCardIcon sx={{ fontSize: 24 }} />,
                  label: "บัตรเครดิต",
                },
              ].map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-[16px] border-[1.5px] cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? "border-pink-500 bg-pink-50 text-primary"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {method.icon}
                  <span
                    className={`text-[11px] mt-1.5 font-bold ${paymentMethod === method.id ? "text-primary" : "text-gray-600"}`}
                  >
                    {method.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Button */}
          <Button
            onClick={() => {
              if (onValidate && !onValidate()) return;
              const payload: ISalePayload = {
                amount: subtotal,
                vat: tax,
                discount: discount,
                totalAmount: total,
                payment: paymentMethod,
              };
              setPendingPayload(payload);
              setConfirmOpen(true);
            }}
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "16px",
              padding: "14px",
              marginTop: "4px",
              textTransform: "none",
              fontFamily: "inherit",
              fontWeight: 800,
              fontSize: "15px",
              boxShadow: "none",
            }}
          >
            ยืนยันรายการ
          </Button>
        </div>
      </div>

      {/* Confirm Order Modal */}
      {pendingPayload && (
        <ModalConfirmOrder
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={(payload) => {
            setConfirmOpen(false);
            onClickSave(payload);
          }}
          itemsOrder={itemsOrder}
          payload={pendingPayload}
          vatPercentage={vatPercentage}
        />
      )}
    </>
  );
};
