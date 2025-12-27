import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";
import { ko } from "date-fns/locale";

interface DatePickerCalendarProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  reservedDates: Date[];
  minDate?: Date;
  className?: string;
}

export function DatePickerCalendar({
  selectedDate,
  onSelectDate,
  reservedDates,
  minDate,
  className,
}: DatePickerCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const emptyDays = Array(startDay).fill(null);

  const isDateReserved = (date: Date) => {
    return reservedDates.some((reservedDate) => isSameDay(reservedDate, date));
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    const min = minDate ? startOfDay(minDate) : today;
    return isBefore(date, min) || isDateReserved(date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className={cn("p-3 bg-white rounded-lg shadow-lg border", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold text-[#222222]">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn(
              "text-center text-xs font-medium py-1",
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-[#666666]"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-9" />
        ))}
        {days.map((day) => {
          const reserved = isDateReserved(day);
          const disabled = isDateDisabled(day);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);
          const dayOfWeek = day.getDay();

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelectDate(day)}
              className={cn(
                "h-9 w-full rounded-md text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-[#654E32] focus:ring-offset-1",
                selected && "bg-[#654E32] text-white",
                today && !selected && "ring-2 ring-[#654E32] ring-inset",
                reserved && "bg-[#555555] text-white cursor-not-allowed opacity-80",
                disabled && !reserved && "text-[#CCCCCC] cursor-not-allowed",
                !disabled && !selected && !reserved && "hover:bg-[#F0EDE8]",
                !disabled && !selected && !reserved && dayOfWeek === 0 && "text-red-500",
                !disabled && !selected && !reserved && dayOfWeek === 6 && "text-blue-500",
                !disabled && !selected && !reserved && dayOfWeek !== 0 && dayOfWeek !== 6 && "text-[#222222]"
              )}
              data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t flex items-center justify-center gap-4 text-xs text-[#666666]">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-[#555555]" />
          <span>예약됨</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-[#654E32]" />
          <span>선택됨</span>
        </div>
      </div>
    </div>
  );
}
