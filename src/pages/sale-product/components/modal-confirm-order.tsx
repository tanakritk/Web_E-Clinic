import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MoneyIcon from "@mui/icons-material/Money";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { IItemsOrder, ISalePayload } from "./order-summary";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { getLoginStorage } from "@/helpers/set-storage";
import _FileApi from "@/api/controller/file";
import CircularProgress from "@mui/material/CircularProgress";

dayjs.extend(buddhistEra);
dayjs.locale("th");

interface ModalConfirmOrderProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: ISalePayload) => void;
  itemsOrder: IItemsOrder[];
  payload: ISalePayload;
  vatPercentage: number;
}

const paymentIconMap: Record<string, React.ReactNode> = {
  "QR Code": <QrCode2Icon sx={{ fontSize: 18 }} />,
  เงินสด: <MoneyIcon sx={{ fontSize: 18 }} />,
  บัตรเครดิต: <CreditCardIcon sx={{ fontSize: 18 }} />,
};

export const ModalConfirmOrder = ({
  open,
  onClose,
  onConfirm,
  itemsOrder,
  payload,
  vatPercentage,
}: ModalConfirmOrderProps) => {
  const profile = getLoginStorage().profile;
  const pathQRCode = profile?.mas_branch?.qrFilePath;

  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    if (!open || payload.payment !== "QR Code" || !pathQRCode) {
      setQrImageUrl(null);
      return;
    }
    let cancelled = false;
    const fetchQR = async () => {
      setQrLoading(true);
      try {
        const res = await _FileApi().getFile({ path: pathQRCode });
        if (!cancelled) {
          // API คืน base64 string หรือ url ขึ้นอยู่กับ backend
          const data = res?.data;
          setQrImageUrl(data);
          // if (typeof data === "string") {
          //   setQrImageUrl(data.startsWith("data:") ? data : `data:image/png;base64,${data}`);
          // } else if (data?.url) {
          //   setQrImageUrl(data.url);
          // } else if (data?.base64) {
          //   setQrImageUrl(`data:image/png;base64,${data.base64}`);
          // }
        }
      } catch {
        if (!cancelled) setQrImageUrl(null);
      } finally {
        if (!cancelled) setQrLoading(false);
      }
    };
    fetchQR();
    return () => {
      cancelled = true;
    };
  }, [open, payload.payment, pathQRCode]);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
          color: "white",
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="flex items-center gap-2">
          <ReceiptLongIcon sx={{ fontSize: 22 }} />
          <span className="font-extrabold text-[16px] text-white">
            สรุปรายการสั่งซื้อ
          </span>
        </div>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3, bgcolor: "#fafafa" }}>
        {/* Items List */}
        <div className="flex flex-col gap-3 mb-4 mt-4">
          <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
            รายการสินค้า / คอร์ส
          </span>

          {itemsOrder.map((item, index) => (
            <div
              key={"modal-item-" + index}
              className="bg-white rounded-[16px] p-4 shadow-sm flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5 flex-1 mr-3">
                  <span className="font-bold text-[13px] text-gray-800">
                    {item.name}
                  </span>
                  {item.itemType === "Course" && (
                    <span className="text-[11px] text-gray-400">
                      คอร์ส {item.numberOfTimes} ครั้ง
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-extrabold text-[13px] text-pink-500">
                    ฿
                    {Number(
                      String(item.unitPrice).replace(/,/g, ""),
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <Chip
                    label={`x${item.quantity}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "11px",
                      fontWeight: 700,
                      bgcolor: "#fce7f3",
                      color: "#ec4899",
                    }}
                  />
                </div>
              </div>

              {/* Course schedule */}
              {item.itemType === "Course" &&
                item.schedules &&
                item.schedules.length > 0 && (
                  <div className="bg-pink-50 rounded-[10px] px-3 py-2 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-600">
                      ตารางเวลาคอร์ส:
                    </span>
                    {item.schedules.map((s, si) => (
                      <div key={si} className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-gray-500">
                            ครั้งที่ {si + 1}
                          </span>
                          {s.isFree && (
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-600 border border-amber-300 rounded-full px-1.5 py-0.5 leading-none">
                              แถม
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-700 font-medium">
                          {dayjs(s.date).format("DD/MM/BBBB")} {s.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              {/* Course products */}
              {item.itemType === "Course" &&
                item.mas_product &&
                item.mas_product.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {item.mas_product.map((prod, pi) => (
                      <div key={pi} className="flex items-center gap-2">
                        <CheckCircleIcon
                          color="primary"
                          sx={{ fontSize: 13 }}
                        />
                        <span className="text-[11px] text-pink-500 font-medium">
                          {prod.name}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-auto">
                          {prod.quantity} ชิ้น
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>

        <Divider sx={{ my: 2 }} />

        {/* Price Summary */}
        <div className="bg-white rounded-[16px] p-4 shadow-sm flex flex-col gap-2.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-500 font-bold">ยอดรวม</span>
            <span className="text-gray-800 font-extrabold">
              ฿{fmt(payload.amount)}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-500 font-bold">ส่วนลด</span>
            <span className="text-red-500 font-extrabold">
              -{fmt(payload.discount)}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-500 font-bold">
              ภาษี ({vatPercentage}%)
            </span>
            <span className="text-gray-800 font-extrabold">
              ฿{fmt(payload.vat)}
            </span>
          </div>
          <Divider sx={{ my: 0.5 }} />
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-gray-800 text-[15px]">
              ยอดสุทธิ
            </span>
            <span className="font-black text-[22px] text-pink-500">
              ฿{fmt(payload.totalAmount)}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mt-3 bg-white rounded-[16px] p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-gray-500">
              ช่องทางชำระเงิน
            </span>
            <div className="flex items-center gap-2 text-pink-500 font-bold text-[13px]">
              {paymentIconMap[payload.payment] ?? null}
              <span>{payload.payment}</span>
            </div>
          </div>

          {/* QR Code Image */}
          {payload.payment === "QR Code" && (
            <div className="flex flex-col items-center gap-2 pt-2">
              {qrLoading ? (
                <div className="flex items-center justify-center h-[180px]">
                  <CircularProgress size={36} sx={{ color: "#ec4899" }} />
                </div>
              ) : qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="QR Code ชำระเงิน"
                  className="w-[180px] h-[180px] object-contain rounded-[12px] border border-gray-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[180px] text-gray-400 gap-2">
                  <QrCode2Icon sx={{ fontSize: 48, color: "#d1d5db" }} />
                  <span className="text-[12px]">ไม่พบ QR Code</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-5">
          <Button
            onClick={onClose}
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: "14px",
              padding: "12px",
              textTransform: "none",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: "14px",
              borderColor: "#e5e7eb",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#d1d5db",
                bgcolor: "#f9fafb",
              },
            }}
          >
            แก้ไข
          </Button>
          <Button
            onClick={() => onConfirm(payload)}
            variant="contained"
            fullWidth
            startIcon={<ReceiptLongIcon sx={{ color: "white" }} />}
          >
            ยืนยันและพิมพ์ใบเสร็จ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
