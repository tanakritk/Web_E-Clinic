import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const WidgetHighlights = () => {
  return (
    <div className="bg-[#FAF3F5] rounded-[32px] p-6 shadow-sm">
      <h3 className="text-[#333] font-bold text-lg mb-4">จำนวนจองวันนี้</h3>
      <div className="flex flex-col gap-3">
        <div className="bg-white rounded-[20px] p-4 flex flex-row items-center gap-4 shadow-sm border border-[#fff]">
          <div className="w-12 h-12 rounded-[14px] bg-[#FDECF2] flex items-center justify-center text-[#E91E63]">
            <CalendarTodayIcon />
          </div>
          <div>
            <div className="text-[12px] text-gray-500 font-medium">จองแล้ว</div>
            <div className="text-xl font-bold text-gray-800">18 ลูกค้า</div>
          </div>
        </div>
        {/* <div className="bg-white rounded-[20px] p-4 flex flex-row items-center gap-4 shadow-sm border border-[#fff]">
          <div className="w-12 h-12 rounded-[14px] bg-[#FDECF2] flex items-center justify-center text-[#E91E63]">
            <TrendingUpIcon />
          </div>
          <div>
            <div className="text-[12px] text-gray-500 font-medium">
              การใช้งานคอร์ส
            </div>
            <div className="text-xl font-bold text-gray-800 leading-tight">
              85% ของ<br />ความจุ
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default WidgetHighlights;
