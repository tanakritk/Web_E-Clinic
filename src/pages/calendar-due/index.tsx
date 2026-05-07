import { useEffect, useMemo, useState } from "react";
import ContentLayout from "@/layout/content-layout";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { useQuery } from "@tanstack/react-query";
import {
  _SaleScheduleApi,
  _SaleScheduleKey,
} from "@/api/controller/trn-sale-schedule";

dayjs.extend(buddhistEra);
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-style.css";
import { IconButton, Button } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";
import ModalManage from "./components/modal-manage";
import ModalDayEvents from "./components/modal-day-events";

// Setup Thai locale
dayjs.locale("th");
const localizer = dayjsLocalizer(dayjs);

const CustomToolbar = () => {
  return null;
};

const CustomEvent = ({ event }: any) => {
  const parts = event.title.split("\n");
  const isSuccess = event.status === "Success";

  return (
    <div
      className={isSuccess ? "custom-event-success" : "custom-event-pending"}
    >
      <div className="flex justify-between items-start mb-0.5">
        <div className="font-bold text-[11px] truncate" title={parts[0]}>
          {parts[0]}
        </div>
        {isSuccess && (
          <div className="bg-green-600 text-white text-[8px] px-1 rounded uppercase font-bold">
            SUCCESS
          </div>
        )}
      </div>
      {parts[1] && (
        <div
          className="text-[10px] font-medium leading-tight truncate"
          title={parts[1]}
        >
          {parts[1]}
        </div>
      )}
      <div className="text-[9px] mt-1 opacity-70 flex items-center gap-1">
        <svg
          className="w-2.5 h-2.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        {dayjs(event.start).format("HH:mm น.")}
      </div>
    </div>
  );
};

// React 18 JSX mismatch workaround
const BigCalendar = Calendar as any;

const PageCalendarDue = () => {
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const [viewState] = useState<any>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [dayEventsModal, setDayEventsModal] = useState<{
    open: boolean;
    date: Date | null;
    events: any[];
  }>({ open: false, date: null, events: [] });

  const startDate = dayjs(currentDate)
    .startOf("month")
    .startOf("week")
    .format("YYYY-MM-DD");
  const endDate = dayjs(currentDate)
    .endOf("month")
    .endOf("week")
    .format("YYYY-MM-DD");

  // Calculate calendar height dynamically to keep rows equal across 5- and 6-week months
  const calendarHeight = useMemo(() => {
    const firstDay = dayjs(currentDate).startOf("month").startOf("week");
    const lastDay = dayjs(currentDate).endOf("month").endOf("week");
    const numWeeks = lastDay.diff(firstDay, "week") + 1;
    const ROW_HEIGHT = 210;
    const HEADER_HEIGHT = 50;
    return numWeeks * ROW_HEIGHT + HEADER_HEIGHT;
  }, [currentDate]);

  const {
    data: scheduleQuery,
    isLoading: isLoadingSchedule,
    // refetch: refetchSchedule,
  } = useQuery({
    queryKey: [_SaleScheduleKey().search, startDate, endDate],
    queryFn: async () => {
      try {
        return await _SaleScheduleApi().search({
          page: 1,
          limit: 1000,
          filterOperator: "and",
          relation: [
            "trn_sale_item",
            "trn_sale_item.trn_sale",
            "trn_sale_item.trn_sale.mas_customer",
            "trn_sale_item.mas_courses",
            "trn_sale_item.mas_product",
          ],
          filter: [
            {
              field: "scheduleDate",
              operator: "between",
              value: [startDate, endDate],
            },
          ],
        });
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
          type: "warning",
        });
      }
    },
  });

  const events = useMemo(() => {
    return (
      scheduleQuery?.data?.map((item: any) => {
        const datePart = item.scheduleDate.split("T")[0];
        const start = dayjs(`${datePart} ${item.scheduleTime}`).toDate();
        const end = dayjs(start).add(1, "hour").toDate();
        const customer = item.trn_sale_item?.trn_sale?.mas_customer;
        const customerName = customer
          ? `${customer.firstname} ${customer.surname}`
          : "ไม่ระบุชื่อ";
        const itemName =
          item.trn_sale_item?.mas_courses?.name ||
          item.trn_sale_item?.mas_product?.name ||
          "ไม่ระบุรายการ";

        return {
          id: item.id,
          title: `${customerName}\n${itemName}`,
          start,
          end,
          type: item.status === "Success" ? "highlight" : "normal",
          customerName,
          itemName,
          scheduleDate: item.scheduleDate,
          scheduleTime: item.scheduleTime,
          status: item.status,
          sessionNumber: item.sessionNumber,
          saleItemId: item.saleItemId,
        };
      }) || []
    );
  }, [scheduleQuery?.data]);

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setOpenModal(true);
  };

  const handleShowMore = (eventsOnDay: any[], date: Date) => {
    setDayEventsModal({ open: true, date, events: eventsOnDay });
  };

  // Custom date cell header — needs closure access to `events` and `handleShowMore`
  const CustomDateHeader = ({ date, label }: any) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const dayEvents = (events ?? []).filter(
      (e: any) => dayjs(e.start).format("YYYY-MM-DD") === dateStr,
    );
    const extra = dayEvents.length - 2;
    return (
      <div className="flex justify-between items-center px-3 pt-2 pb-1">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {extra > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShowMore(dayEvents, date);
            }}
            className="text-[10px] font-bold text-pink-500 bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded-full transition-colors"
          >
            +{extra} ดูทั้งหมด
          </button>
        )}
      </div>
    );
  };

  const handlePrev = () => {
    setCurrentDate(dayjs(currentDate).subtract(1, "month").toDate());
  };

  const handleNext = () => {
    setCurrentDate(dayjs(currentDate).add(1, "month").toDate());
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const HeaderRight = () => null;

  const TitleHeader = () => {
    const titleText = dayjs(currentDate).format("MMMM BBBB");

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-xl bg-primary flex items-center justify-center">
            <CalendarMonthIcon sx={{ color: "white", fontSize: 20 }} />
          </div>
          <p className="font-bold text-[22px] text-gray-800 tracking-tight">
            ปฏิทินนัดหมาย
          </p>
        </div>
        <div className="flex items-center gap-5 mt-1 ml-1">
          <span className="text-[16px] font-extrabold tracking-tight text-pink-600 bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 shadow-sm">
            {titleText}
          </span>
          <div className="flex items-center gap-3 mt-0.5">
            <Button
              variant="outlined"
              size="small"
              onClick={handleToday}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                color: "#E91E63",
                borderColor: "rgba(233, 30, 99, 0.5)",
                fontWeight: 600,
                padding: "4px 16px",
                fontSize: "13px",
                minWidth: "auto",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: "#fdf2f8",
                  borderColor: "#E91E63",
                },
              }}
            >
              วันนี้
            </Button>
            <div className="flex items-center bg-white rounded-[10px] shadow-sm border border-gray-200 p-0.5">
              <IconButton
                onClick={handlePrev}
                size="small"
                sx={{
                  color: "#666",
                  padding: "4px",
                  "&:hover": { color: "#E91E63", backgroundColor: "#fdf2f8" },
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
              <IconButton
                onClick={handleNext}
                size="small"
                sx={{
                  color: "#666",
                  padding: "4px",
                  "&:hover": { color: "#E91E63", backgroundColor: "#fdf2f8" },
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const finalLoad = isLoadingSchedule;
    setLoadingContext(finalLoad);
  }, [setLoadingContext, isLoadingSchedule]);

  return (
    <ContentLayout
      titlePage={<TitleHeader />}
      subTitlePage=""
      headRightLayout={<HeaderRight />}
    >
      <div className="flex flex-col lg:flex-row gap-8 mt-6 pb-12 w-full h-full  mx-auto">
        {/* Left Column: Calendar */}
        <div className="flex-1 bg-white rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: calendarHeight }}
            date={currentDate}
            view={viewState}
            popup={false}
            scrollToTime={dayjs().hour(7).minute(0).toDate()}
            onShowMore={handleShowMore}
            views={["month"]}
            onNavigate={(date: Date) => setCurrentDate(date)}
            onSelectEvent={handleSelectEvent}
            messages={{
              showMore: (total: number) => `+${total} ดูทั้งหมด`,
            }}
            components={{
              toolbar: CustomToolbar,
              event: CustomEvent,
              month: { dateHeader: CustomDateHeader },
            }}
            formats={{
              weekdayFormat: (date: Date) => {
                const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
                return days[date.getDay()];
              },
            }}
            className="clinic-calendar"
          />
        </div>

        {/* Right Column: Widgets */}
        {/* <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0">
          <WidgetHighlights />
          <WidgetToCare />
        </div> */}
      </div>

      <ModalManage
        open={openModal}
        onClose={() => setOpenModal(false)}
        eventData={selectedEvent}
      />

      <ModalDayEvents
        open={dayEventsModal.open}
        date={dayEventsModal.date}
        events={dayEventsModal.events}
        onClose={() =>
          setDayEventsModal({ open: false, date: null, events: [] })
        }
        onSelectEvent={handleSelectEvent}
      />
    </ContentLayout>
  );
};

export default PageCalendarDue;
