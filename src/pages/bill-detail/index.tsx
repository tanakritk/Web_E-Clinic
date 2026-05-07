import ContentLayout from "@/layout/content-layout";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { _SaleApi, _SaleKey, SearchSaleModel } from "@/api/controller/trn-sale";
import { useLoading } from "@/context/loading-context";
import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import { Button, Divider, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import logo from "@/assets/img/logo.png";
import { CryptoHelper } from "@/helpers/encrypt-decrypt";

const PageBillDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setLoadingContext } = useLoading();

  const printRef = useRef<HTMLDivElement>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: [_SaleKey().search, id],
    queryFn: async () => {
      const decryptedId = CryptoHelper.decrypt(decodeURIComponent(id || ""));
      if (!decryptedId || isNaN(Number(decryptedId))) return null;

      const payload: SearchSaleModel = {
        page: 1,
        limit: 1,
        filterOperator: "and",
        relation: [
          "mas_customer",
          "mas_branch",
          "mas_user",
          //   "trn_sale_item",
          "trn_sale_item.mas_product",
          "trn_sale_item.mas_courses",
        ],
        filter: [{ field: "id", operator: "=", value: Number(decryptedId) }],
      };
      return await _SaleApi().search(payload);
    },
    enabled: !!id,
  });

  useEffect(() => {
    setLoadingContext(isLoading);
  }, [isLoading, setLoadingContext]);

  const bill = rows?.data?.[0];

  const handlePrint = () => {
    window.print();
  };

  if (!bill && !isLoading) {
    return (
      <ContentLayout titlePage="ใบเสร็จ" subTitlePage="">
        <div className="flex flex-col items-center justify-center py-20">
          <Typography variant="h6" color="textSecondary">
            ไม่พบข้อมูลใบเสร็จ
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/sale-list")}
            sx={{ mt: 2 }}
          >
            กลับหน้ารายการขาย
          </Button>
        </div>
      </ContentLayout>
    );
  }

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
          }
        `}
      </style>
      <ContentLayout titlePage="รายละเอียดใบเสร็จ" subTitlePage="">
        <div className="flex justify-between items-center mb-6 no-print">
          <Button
            startIcon={<ArrowBackIcon color="primary" />}
            onClick={() => navigate("/sale-list")}
            variant="outlined"
            color="primary"
          >
            ย้อนกลับ
          </Button>
          <Button
            startIcon={<PrintIcon sx={{ color: "white" }} />}
            onClick={handlePrint}
            variant="contained"
            color="primary"
          >
            พิมพ์ใบเสร็จ
          </Button>
        </div>

        {bill && (
          <div
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto print-area"
            ref={printRef}
          >
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
                CleoSkin สาขา {bill.mas_branch?.name || "-"}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                className="font-['Sarabun',sans-serif]"
              >
                {bill.mas_branch?.address || ""}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                className="mt-4 font-['Sarabun',sans-serif]"
              >
                ใบเสร็จรับเงิน / Receipt
              </Typography>
            </div>

            <Divider className="my-4 border-gray-200 border-dashed" />

            {/* Bill Info */}
            <div className="flex justify-between mb-6 font-['Sarabun',sans-serif] text-sm">
              <div>
                <div className="flex gap-2 mb-1">
                  <span className="font-semibold w-24">เลขที่ใบเสร็จ:</span>
                  <span>{bill.receiptNo}</span>
                </div>
                <div className="flex gap-2 mb-1">
                  <span className="font-semibold w-24">ลูกค้า:</span>
                  <span>
                    {bill.mas_customer?.firstname} {bill.mas_customer?.surname}
                    {bill.mas_customer?.nickname
                      ? " (" + bill.mas_customer?.nickname + ")"
                      : ""}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex gap-2 justify-end mb-1">
                  <span className="font-semibold">วันที่:</span>
                  <span>{dayjs(bill.saleDate).format("DD/MM/BBBB HH:mm")}</span>
                </div>
                <div className="flex gap-2 justify-end mb-1">
                  <span className="font-semibold">พนักงานขาย:</span>
                  <span>
                    {bill.mas_user?.firstname || bill.mas_user?.username || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full text-sm font-['Sarabun',sans-serif]">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="py-2 text-left w-16">ลำดับ</th>
                    <th className="py-2 text-left">รายการ</th>
                    <th className="py-2 text-right w-24">จำนวน</th>
                    <th className="py-2 text-right w-32">ราคา/หน่วย</th>
                    <th className="py-2 text-right w-32">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bill.trn_sale_item?.map((item: any, index: number) => {
                    const name =
                      item.itemType === "Course"
                        ? item.mas_courses?.name
                        : item.mas_product?.name;
                    return (
                      <tr key={index}>
                        <td className="py-3 text-center">{index + 1}</td>
                        <td className="py-3">
                          {name || "-"}{" "}
                          {item.itemType === "Course" ? "(คอร์ส)" : ""}
                        </td>
                        <td className="py-3 text-right">{item.quantity}</td>
                        <td className="py-3 text-right">
                          {item.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          {item.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Divider className="my-4 border-gray-200" />

            {/* Summary */}
            <div className="flex justify-end font-['Sarabun',sans-serif] text-sm">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">ยอดรวม (Subtotal)</span>
                  <span>{bill.amount?.toLocaleString()} บาท</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span className="font-semibold">ส่วนลด (Discount)</span>
                    <span>-{bill.discount?.toLocaleString()} บาท</span>
                  </div>
                )}
                {bill.vat > 0 && (
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      ภาษีมูลค่าเพิ่ม (VAT 7%)
                    </span>
                    <span>{bill.vat?.toLocaleString()} บาท</span>
                  </div>
                )}
                <Divider className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>ยอดสุทธิ (Total)</span>
                  <span>{bill.totalAmount?.toLocaleString()} บาท</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>ชำระโดย:</span>
                  <span>{bill.payment}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center text-sm font-['Sarabun',sans-serif] text-gray-500">
              <p>ขอบคุณที่ใช้บริการ</p>
              <p>Thank you for your business</p>
            </div>
          </div>
        )}
      </ContentLayout>
    </>
  );
};

export default PageBillDetail;
