import { Button } from "@mui/material";

const WidgetToCare = () => {
  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative overflow-hidden">
      <h3 className="text-[#333] font-bold text-lg mb-6 w-full leading-tight">
        รายการที่ต้องดูแล (วันนี้)
      </h3>

      <div className="flex flex-col gap-6">
        <div className="flex relative items-start">
          <div className="w-1 h-full absolute left-0 top-0 bottom-0 bg-[#E91E63] rounded-full"></div>
          <div className="pl-4 w-full">
            <div className="font-bold text-[14px] text-gray-800">
              Elena Rostova
            </div>
            <div className="text-[12px] text-gray-500">ทำโบท็อกซ์</div>
            <div className="flex justify-between items-center mt-2">
              <span className="bg-[#f5f5f5] text-gray-600 text-[10px] px-2 py-1 rounded-md font-medium tracking-wide">
                ครั้งที่ 14/15
              </span>
              <span className="text-[#E91E63] font-bold text-[11px]">
                10:00
              </span>
            </div>
          </div>
        </div>

        <div className="flex relative items-start">
          <div className="w-1 h-full absolute left-0 top-0 bottom-0 bg-[#f0f0f0] rounded-full"></div>
          <div className="pl-4 w-full">
            <div className="font-bold text-[14px] text-gray-800">
              David Smith
            </div>
            <div className="text-[12px] text-gray-500">ฉีดฟิลเลอร์</div>
            <div className="flex justify-between items-center mt-2">
              <span className="bg-[#f5f5f5] text-gray-600 text-[10px] px-2 py-1 rounded-md font-medium tracking-wide">
                ครั้งที่ 1/5
              </span>
              <span className="text-gray-500 font-bold text-[11px]">11:30</span>
            </div>
          </div>
        </div>

        <div className="flex relative items-start">
          <div className="w-1 h-full absolute left-0 top-0 bottom-0 bg-[#f0f0f0] rounded-full"></div>
          <div className="pl-4 w-full">
            <div className="font-bold text-[14px] text-gray-800">Jane Doe</div>
            <div className="text-[12px] text-gray-500">ผลัดเซลล์ผิว</div>
            <div className="flex justify-between items-center mt-2">
              <span className="bg-[#f5f5f5] text-gray-600 text-[10px] px-2 py-1 rounded-md font-medium tracking-wide">
                ครั้งที่ 3/3
              </span>
              <span className="text-gray-500 font-bold text-[11px]">13:00</span>
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="outlined"
        fullWidth
        sx={{
          marginTop: "28px",
          borderRadius: "16px",
          borderColor: "#eee",
          color: "#555",
          fontWeight: 600,
          textTransform: "none",
          padding: "8px",
          "&:hover": {
            borderColor: "#ccc",
            backgroundColor: "transparent",
          },
        }}
      >
        ดูรายชื่อรอพบทั้งหมด
      </Button>
    </div>
  );
};

export default WidgetToCare;
