import type React from "react";
import { Input } from "@/components/ui/input";
import { MS_PER_MIN, MS_PER_SECOND } from "@/lib/utils/time";
import {
  MAX_MIN,
  MAX_SEC,
} from "@/app/dashboard/schemas/create-activity-schema";

type DurationInputProps = {
  id: string;
  value: number;
  onChange: (value: number) => void;
};

export function DurationInput({ id, value, onChange }: DurationInputProps) {
  const minutes = Math.floor(value / MS_PER_MIN);
  const seconds = Math.floor((value % MS_PER_MIN) / MS_PER_SECOND);

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = Math.min(
      MAX_MIN,
      Math.max(0, Number.parseInt(e.target.value) || 0)
    );
    updateDuration(newMinutes, seconds);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeconds = Math.min(
      MAX_SEC,
      Math.max(0, Number.parseInt(e.target.value) || 0)
    );
    updateDuration(minutes, newSeconds);
  };

  const updateDuration = (minutes: number, seconds: number) => {
    onChange(minutes * MS_PER_MIN + seconds * MS_PER_SECOND);
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        id={id}
        type="number"
        value={minutes}
        onChange={handleMinutesChange}
        className="w-16 text-center"
        min={0}
        max={MAX_MIN}
      />
      <span>min</span>
      <Input
        type="number"
        value={seconds}
        onChange={handleSecondsChange}
        className="w-16 text-center"
        min={0}
        max={MAX_SEC}
      />
      <span>s</span>
    </div>
  );
}
