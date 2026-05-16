import {
  Dialog,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import dayjs from "dayjs";
import "dayjs/locale/th";
import logo from "@/assets/img/logo.png";
import { getLoginStorage } from "@/helpers/set-storage";
import { useEffect, useState } from "react";
import {
  _SaleScheduleApi,
  BillDetailModel,
} from "@/api/controller/trn-sale-schedule";
import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";

interface ModalBillProps {
  open: boolean;
  onClose: () => void;
  eventData: any;
}

const ModalBill = ({ open, onClose, eventData }: ModalBillProps) => {
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const profile = getLoginStorage()?.profile;
  const [billDetail, setBillDetail] = useState<BillDetailModel | null>(null);
  const operatorName = profile
    ? `${profile.firstname} ${profile.surname}`
    : "-";

  const branchName = profile?.mas_branch?.name || "-";
  const receiptNo = eventData?.receiptNo;
  const saleItemId = eventData?.saleItemId;

  const onGetBillDetail = async () => {
    setLoadingContext(true);
    try {
      const result: any = await _SaleScheduleApi().getBillDetail(saleItemId);
      if (result.statusCode === 200) {
        console.log("result--> ", result);
        setBillDetail(result.data as BillDetailModel);
      }
    } catch (error) {
      setAlertContext({
        message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
        type: "warning",
      });
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    if (open && saleItemId) {
      onGetBillDetail();
    }
  }, [open, saleItemId]);

  if (!eventData) return null;

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .no-print {
              display: none !important;
            }
            /* Hide MUI Dialog backdrop and adjust paper for printing */
            .MuiDialog-root {
              position: absolute !important;
              z-index: auto !important;
            }
            .MuiBackdrop-root {
              display: none !important;
            }
            .MuiDialog-container {
              position: static !important;
              display: block !important;
            }
            .MuiDialog-paper {
              box-shadow: none !important;
              margin: 0 !important;
              max-width: 100% !important;
              width: 100% !important;
            }
          }
        `}
      </style>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <Box className="print-area bg-white p-8 rounded-xl font-['Sarabun',sans-serif]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Logo" className="h-20 object-contain" />
            </div>
            <Typography
              variant="h5"
              fontWeight="bold"
              className="mb-2 font-['Sarabun',sans-serif]"
            >
              CleoSkin สาขา {branchName}
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              className="mt-4 font-['Sarabun',sans-serif]"
            >
              ใบเสร็จทำรายการ / Usage Receipt
            </Typography>
          </div>

          <Divider className="my-4 border-gray-200 border-dashed" />

          {/* Info */}
          <div className="flex justify-between mb-6 text-sm mt-2">
            <div>
              <div className="flex gap-2 mb-1 ">
                <span className="font-semibold w-30">
                  อ้างอิงเลขที่ใบเสร็จ:
                </span>
                <span>{receiptNo}</span>
              </div>
              <div className="flex gap-2 mb-1 ">
                <span className="font-semibold w-14">ลูกค้า:</span>
                <span>{eventData.customerName}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-2 justify-end mb-1">
                <span className="font-semibold">วันที่ทำรายการ:</span>
                <span>{dayjs().format("DD/MM/BBBB HH:mm")}</span>
              </div>
              <div className="flex gap-2 justify-end mb-1">
                <span className="font-semibold">ผู้ทำรายการ:</span>
                <span>{operatorName}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="py-2 text-center w-16">ลำดับ</th>
                  <th className="py-2 text-left">รายการ</th>
                  <th className="py-2 text-center w-24">จำนวนทั้งหมด</th>
                  <th className="py-2 text-center w-24">ใช้ไปแล้ว</th>
                  <th className="py-2 text-center w-24">คงเหลือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 text-center">1</td>
                  <td className="py-4 font-semibold">
                    {billDetail?.courseName}
                  </td>
                  <td className="py-4 text-center">
                    {billDetail?.scheduleAll} ครั้ง
                  </td>
                  <td className="py-4 text-center">
                    {billDetail?.scheduleSuccess} ครั้ง
                  </td>
                  <td className="py-4 text-center font-bold text-red-500">
                    {billDetail?.scheduleRemaining} ครั้ง
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Divider className="my-4 border-gray-200" />

          {/* Summary / Next Appt */}
          <div className="flex justify-end text-sm">
            <div className="w-[400px] space-y-2">
              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                <span className="font-semibold text-pink-700">
                  นัดหมายถัดไป
                </span>
                <span className="font-bold text-gray-800">
                  {billDetail?.nextScheduleDate
                    ? `${dayjs(billDetail.nextScheduleDate).locale("th").format("D MMMM")} ${dayjs(billDetail.nextScheduleDate).year() + 543}`
                    : ""}{" "}
                </span>
                <span className="font-semibold text-pink-700">เวลา</span>
                <span className="font-bold text-gray-800">
                  {billDetail?.nextScheduleTime}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-gray-500">
            <p>ขอบคุณที่ใช้บริการ</p>
            <p>Thank you for your business</p>
          </div>
        </Box>

        <DialogActions
          className="no-print"
          sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", gap: 1 }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ borderRadius: 2, py: 1, px: 4 }}
          >
            ปิดหน้าต่าง
          </Button>
          <Button
            onClick={() => window.print()}
            variant="contained"
            startIcon={<PrintIcon sx={{ color: "white" }} />}
            sx={{ borderRadius: 2, py: 1, px: 4 }}
          >
            พิมพ์ใบเสร็จ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModalBill;
