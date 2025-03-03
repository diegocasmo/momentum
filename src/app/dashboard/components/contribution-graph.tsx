"use client";

import { useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  subMonths,
  isBefore,
  isSameDay,
  startOfMonth,
  eachMonthOfInterval,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ActivityContribution } from "@/types";

type ContributionGraphProps = {
  contributions: ActivityContribution[];
};

export function ContributionGraph({ contributions }: ContributionGraphProps) {
  const [_, setHoveredDate] = useState<string | null>(null);

  // Create a map of date to count for easier lookup
  const contributionMap = new Map(
    contributions.map(({ date, count }) => [date, count])
  );

  // Get the max count to determine the intensity scale
  const maxCount = Math.max(...contributions.map((c) => c.count));

  // Calculate the date range for the graph (last 12 months, ending today)
  const today = new Date();
  const endDate = today;
  const startDate = startOfMonth(subMonths(today, 12));

  // Generate weeks (rows) and days (cells) for the graph
  const weeks: Date[][] = [];
  let currentDate = startOfWeek(startDate, { weekStartsOn: 1 }); // Start on Monday

  while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(currentDate, i);
      if (isBefore(date, startDate)) continue;
      if (isBefore(date, endDate) || isSameDay(date, endDate)) {
        week.push(date);
      }
    }
    if (week.length > 0) {
      weeks.push(week);
    }
    currentDate = addDays(currentDate, 7);
  }

  // Function to determine cell color based on activity count
  const getCellColor = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";

    // Calculate intensity (0-4) based on the count relative to max
    const intensity = Math.min(
      4,
      Math.ceil((count / Math.max(maxCount, 1)) * 4)
    );

    switch (intensity) {
      case 1:
        return "bg-emerald-100 dark:bg-emerald-900";
      case 2:
        return "bg-emerald-300 dark:bg-emerald-700";
      case 3:
        return "bg-emerald-500 dark:bg-emerald-500";
      case 4:
        return "bg-emerald-700 dark:bg-emerald-300";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  // Generate month labels
  const monthLabels = eachMonthOfInterval({ start: startDate, end: endDate });

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-end mb-2">
        <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground">
          <span className="mr-1 hidden sm:inline">Less</span>
          <div className="flex gap-1">
            <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
            <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-sm bg-emerald-100 dark:bg-emerald-900" />
            <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-sm bg-emerald-300 dark:bg-emerald-700" />
            <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-sm bg-emerald-500" />
            <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-sm bg-emerald-700 dark:bg-emerald-300" />
          </div>
          <span className="ml-1 hidden sm:inline">More</span>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <div className="min-w-[750px]">
          <div className="flex w-full">
            <div className="mr-2 flex flex-col justify-between text-[10px] sm:text-xs text-muted-foreground">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>
            <div className="flex gap-1 flex-grow">
              {weeks.map((days, weekIndex) => (
                <div
                  key={weekIndex}
                  className="flex flex-col gap-1 flex-grow items-center"
                >
                  {days.map((date) => {
                    const dateString = format(date, "yyyy-MM-dd");
                    const count = contributionMap.get(dateString) || 0;

                    return (
                      <TooltipProvider key={dateString}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`h-2 w-2 sm:h-3 sm:w-3 rounded-sm ${getCellColor(
                                count
                              )} cursor-pointer transition-colors`}
                              onMouseEnter={() => setHoveredDate(dateString)}
                              onMouseLeave={() => setHoveredDate(null)}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">
                            <div className="text-xs">
                              <p className="font-medium">
                                {format(date, "MMM d, yyyy")}
                              </p>
                              <p>
                                {count} completed{" "}
                                {count === 1 ? "activity" : "activities"}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex w-full text-[10px] sm:text-xs text-muted-foreground mt-1">
            <div className="mr-2 w-4" />
            <div className="flex w-full">
              {monthLabels.map((date, index) => (
                <span key={index} className="flex-grow text-center">
                  {format(date, "MMM")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
