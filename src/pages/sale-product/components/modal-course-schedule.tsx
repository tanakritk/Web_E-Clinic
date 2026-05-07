import DialogCustom from "@/components/custom-element/dialog-custom";
import { Button, Chip, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

dayjs.extend(buddhistEra);
dayjs.locale("th");

export interface Schedule {
  date: string;
  time: string;
  isFree: boolean;
}

interface ModalCourseScheduleProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (schedules: Schedule[]) => void;
  course: any;
}

const ModalCourseSchedule = ({
  open,
  onClose,
  onSubmit,
  course,
}: ModalCourseScheduleProps) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && course) {
      const times = course.numberOfTimes || 1;
      const initialSchedules = Array.from({ length: times }, () => ({
        date: "",
        time: "",
        isFree: false,
      }));
      setSchedules(initialSchedules);
      setErrors({});
    }
  }, [open, course]);

  const handleScheduleChange = (index: number, date: string, time: string) => {
    const newSchedules = [...schedules];
    newSchedules[index].date = date;
    newSchedules[index].time = time;
    setSchedules(newSchedules);

    // Clear error for this field
    if (errors[`${index}-dateTime`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-dateTime`];
      setErrors(newErrors);
    }
  };

  const handleAddFree = () => {
    setSchedules((prev) => [
      ...prev,
      { date: "", time: "", isFree: true },
    ]);
  };

  const handleRemoveFree = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
    // Clear errors for removed index
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${index}-dateTime`];
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    schedules.forEach((schedule, index) => {
      if (!schedule.date || !schedule.time) {
        newErrors[`${index}-dateTime`] = "กรุณาระบุวันและเวลา";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSubmit(schedules);
    }
  };

  if (!course) return null;

  return (
    <DialogCustom
      status={open}
      returnOnClose={onClose}
      hideHeader={true}
      size="md"
    >
      <div className="p-2 sm:p-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              ระบุวันและเวลาของคอร์สเสริมความงาม
            </h2>
            <p className="text-sm text-gray-500 ">
              {course?.name} ({course?.numberOfTimes || 0} ครั้ง)
            </p>
          </div>
          <div className="bg-pink-100 p-3 rounded-2xl flex items-center justify-center text-primary relative">
            <EventAvailableIcon />
          </div>
        </div>

        <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-2 pb-2 hide-scrollbar">
          {schedules.map((schedule, index) => (
            <div
              key={index}
              className={`border rounded-2xl p-4 flex flex-col gap-3 ${
                schedule.isFree
                  ? "bg-amber-50 border-amber-200"
                  : "bg-[#fcfcfc] border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-[13px] font-bold ${
                      schedule.isFree ? "text-amber-600" : "text-primary"
                    }`}
                  >
                    ครั้งที่ {index + 1}
                  </p>
                  {schedule.isFree && (
                    <Chip
                      icon={<CardGiftcardIcon sx={{ fontSize: 14 }} />}
                      label="แถม"
                      size="small"
                      sx={{
                        backgroundColor: "#fef3c7",
                        color: "#d97706",
                        fontWeight: 700,
                        fontSize: "11px",
                        height: "20px",
                        border: "1px solid #fcd34d",
                        "& .MuiChip-icon": { color: "#d97706" },
                      }}
                    />
                  )}
                </div>
                {schedule.isFree && (
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFree(index)}
                    sx={{
                      color: "#ef4444",
                      bgcolor: "#fee2e2",
                      width: 24,
                      height: 24,
                      "&:hover": { bgcolor: "#fecaca" },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="sm:col-span-1">
                  <p className="block text-sm font-bold text-gray-700 mb-1">
                    วันและเวลา <span className="text-red-500">*</span>
                  </p>
                  <DateTimePicker
                    ampm={false}
                    value={
                      schedule.date && schedule.time
                        ? dayjs(`${schedule.date}T${schedule.time}`)
                        : null
                    }
                    onChange={(newValue) => {
                      if (newValue) {
                        handleScheduleChange(
                          index,
                          newValue.format("YYYY-MM-DD"),
                          newValue.format("HH:mm"),
                        );
                      } else {
                        handleScheduleChange(index, "", "");
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        error: !!errors[`${index}-dateTime`],
                        helperText: errors[`${index}-dateTime`],
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 mt-8 pt-4 border-t border-gray-100">
          <Button
            size="medium"
            variant="outlined"
            onClick={handleAddFree}
            fullWidth
            startIcon={<CardGiftcardIcon />}
            sx={{
              borderRadius: "16px",
              padding: "10px",
              fontWeight: 800,
              textTransform: "none",
              borderColor: "#fcd34d",
              color: "#d97706",
              backgroundColor: "#fffbeb",
              "&:hover": {
                borderColor: "#f59e0b",
                backgroundColor: "#fef3c7",
              },
            }}
          >
            แถม (เพิ่มครั้งพิเศษ)
          </Button>

          <div className="flex gap-4">
            <Button
              size="large"
              variant="outlined"
              onClick={onClose}
              fullWidth
              sx={{
                borderRadius: "16px",
                padding: "12px",
                fontWeight: 800,
                textTransform: "none",
              }}
            >
              ยกเลิก
            </Button>
            <Button
              size="large"
              variant="contained"
              fullWidth
              onClick={handleSave}
              sx={{
                borderRadius: "16px",
                padding: "12px",
                fontWeight: 800,
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              ยืนยันเวลาคอร์ส
            </Button>
          </div>
        </div>
      </div>
    </DialogCustom>
  );
};

export default ModalCourseSchedule;
