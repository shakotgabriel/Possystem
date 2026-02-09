import DatePicker from "react-datepicker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import "react-datepicker/dist/react-datepicker.css"

export interface CalendarProps {
  selected?: Date | null
  onChange?: (date: Date | null) => void
  className?: string
  showTimeSelect?: boolean
  isClearable?: boolean
  placeholder?: string
  minDate?: Date | null
  maxDate?: Date | null
  disabled?: boolean
}

function Calendar({
  selected,
  onChange,
  className,
  showTimeSelect = false,
  isClearable = false,
  placeholder = "Select date",
  minDate,
  maxDate,
  disabled = false,
  
}: CalendarProps) {
  return (
    <DatePicker
      {...(selected ? { selected } : {})}
      {...(minDate ? { minDate } : {})}
      {...(maxDate ? { maxDate } : {})}
      onChange={onChange}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      dateFormat="MMM d, yyyy"
      showTimeSelect={showTimeSelect}
      isClearable={isClearable}
      placeholderText={placeholder}
      disabled={disabled}
      nextMonthButtonLabel="Next Month"
      previousMonthButtonLabel="Previous Month"
      popperClassName="react-datepicker-popper"
      popperModifiers={[
        {
          name: "offset",
          options: {
            offset: [0, 8]
          },
          fn: ({ x, y }) => ({ x, y })                                        
        }
      ]}
      renderCustomHeader={({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled
      }) => (
        <div className="flex items-center justify-between px-2 py-2">
          <button
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            type="button"
            className={cn(
              "p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-medium">
            {date.toLocaleString("default", { month: "long", year: "numeric" })}
          </div>
          <button
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            type="button"
            className={cn(
              "p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
