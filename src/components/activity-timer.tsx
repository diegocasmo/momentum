"use client";

import { useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import type { ActivityWithTasksAndTimeEntries } from "@/types";
import { formatTimeHHMMss } from "@/lib/utils/time";
import { getActivityTotalDuration } from "@/lib/utils/time";
import { useGetActivityRemainingTime } from "@/hooks/use-get-activity-remaining-time";

type ActivityTimerProps = {
  activity: ActivityWithTasksAndTimeEntries;
};

export function ActivityTimer({ activity }: ActivityTimerProps) {
  const totalDurationMs = getActivityTotalDuration(activity);
  const remainingTime = useGetActivityRemainingTime({ activity });

  useEffect(() => {
    document.title = `Momentum (${formatTimeHHMMss(remainingTime)})`;
    return () => {
      document.title = "Momentum | Small wins. Big progress.";
    };
  }, [remainingTime, activity.name]);

  const progress = Math.max(
    0,
    Math.min(100, (remainingTime / totalDurationMs) * 100)
  );

  return (
    <div
      className="flex flex-col items-center"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="relative w-[180px] h-[180px]">
        <CircularProgressbar
          value={progress}
          strokeWidth={4}
          styles={buildStyles({
            strokeLinecap: "round",
            pathColor: "currentColor",
            trailColor: "rgba(255, 255, 255, 0.2)",
            rotation: 1,
          })}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="text-3xl font-bold"
            aria-label={`${formatTimeHHMMss(remainingTime)} remaining`}
          >
            {formatTimeHHMMss(remainingTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
