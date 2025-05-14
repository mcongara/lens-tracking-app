import React from "react";
import { useTranslation } from "react-i18next";
import { getEntryForDate } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Glasses, Circle } from "lucide-react";

interface CalendarProps {
  month: number;
  year: number;
  onChangeDate: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ month, year, onChangeDate }) => {
  const { t } = useTranslation();
  
  const monthNames = [
    t('months.january'),
    t('months.february'),
    t('months.march'),
    t('months.april'),
    t('months.may'),
    t('months.june'),
    t('months.july'),
    t('months.august'),
    t('months.september'),
    t('months.october'),
    t('months.november'),
    t('months.december')
  ];
  
  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Create calendar grid
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayOffset = i - firstDayOfMonth + 1;
    
    if (dayOffset < 1 || dayOffset > daysInMonth) {
      return { day: 0, date: "" };
    }
    
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayOffset).padStart(2, "0")}`;
    return { day: dayOffset, date };
  });
  
  // Split into weeks
  const weeks = [];
  for (let i = 0; i < 6; i++) {
    weeks.push(calendarDays.slice(i * 7, (i + 1) * 7));
  }

  const currentDate = new Date();
  const isCurrentMonth = currentDate.getMonth() === month && currentDate.getFullYear() === year;
  const today = isCurrentMonth ? currentDate.getDate() : -1;
  
  // Check if the week has any days
  const hasAnyDaysInWeek = (week: Array<{ day: number; date: string }>) => {
    return week.some(({ day }) => day > 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{monthNames[month]} {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 text-center mb-2">
          {[
            t('calendar.weekDays.sunday'),
            t('calendar.weekDays.monday'),
            t('calendar.weekDays.tuesday'),
            t('calendar.weekDays.wednesday'),
            t('calendar.weekDays.thursday'),
            t('calendar.weekDays.friday'),
            t('calendar.weekDays.saturday')
          ].map((day, i) => (
            <div key={i} className="text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="space-y-1">
          {weeks.filter(hasAnyDaysInWeek).map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map(({ day, date }, dayIndex) => {
                if (day === 0) {
                  return <div key={dayIndex} />;
                }
                
                const entry = date ? getEntryForDate(date) : null;
                const isToday = day === today;
                
                return (
                  <button
                    key={dayIndex}
                    onClick={() => onChangeDate(date)}
                    className={cn(
                      "aspect-square p-1 flex flex-col items-center justify-center text-sm relative rounded hover:bg-accent",
                      isToday && "ring-1 ring-primary",
                      entry?.wearType === "lenses" && "bg-secondary"
                    )}
                  >
                    <span className="absolute top-1 left-1 text-xs">{day}</span>
                    {entry && (
                      <div className="mt-2">
                        {entry.wearType === "glasses" ? (
                          <Glasses className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;
