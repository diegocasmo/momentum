import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MS_PER_MIN, MS_PER_SECOND } from "@/lib/utils/time";
import {
  MAX_MIN,
  MAX_SEC,
} from "@/app/dashboard/schemas/create-activity-schema";

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / MS_PER_MIN);
  const seconds = Math.floor((ms % MS_PER_MIN) / MS_PER_SECOND);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function parseInput(input: string): { minutes: number; seconds: number } {
  const [minutes, seconds] = input.split(":").map(Number);
  return {
    minutes: isNaN(minutes) ? 0 : Math.min(minutes, MAX_MIN),
    seconds: isNaN(seconds) ? 0 : Math.min(seconds, MAX_SEC),
  };
}

type DurationInputProps = {
  id: string;
  value: number;
  onChange: (value: number) => void;
};

export function DurationInput({ id, value, onChange }: DurationInputProps) {
  const [inputValue, setInputValue] = useState(formatDuration(value));

  useEffect(() => {
    setInputValue(formatDuration(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^\d:]/g, "");

    if (newValue.length > 5) return;

    if (newValue.length === 2 && !newValue.includes(":")) {
      newValue += ":";
    }

    setInputValue(newValue);

    if (newValue.length === 5) {
      const { minutes, seconds } = parseInput(newValue);
      const totalMs = minutes * MS_PER_MIN + seconds * MS_PER_SECOND;
      onChange(totalMs);
    }
  };

  const handleBlur = () => {
    const { minutes, seconds } = parseInput(inputValue);
    const formattedValue = formatDuration(
      minutes * MS_PER_MIN + seconds * MS_PER_SECOND
    );
    setInputValue(formattedValue);
    onChange(minutes * MS_PER_MIN + seconds * MS_PER_SECOND);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const { minutes, seconds } = parseInput(inputValue);
      let totalSeconds = minutes * 60 + seconds;
      const increment = e.shiftKey ? 10 : 1;

      if (e.key === "ArrowUp") {
        totalSeconds = Math.min(
          totalSeconds + increment,
          MAX_MIN * 60 + MAX_SEC
        );
      } else {
        totalSeconds = Math.max(totalSeconds - increment, 0);
      }

      const newMinutes = Math.floor(totalSeconds / 60);
      const newSeconds = totalSeconds % 60;
      const newValue = formatDuration(
        newMinutes * MS_PER_MIN + newSeconds * MS_PER_SECOND
      );
      setInputValue(newValue);
      onChange(newMinutes * MS_PER_MIN + newSeconds * MS_PER_SECOND);
    }
  };

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="MM:ss"
      maxLength={5}
      aria-label="Duration in minutes and seconds"
      aria-describedby={`${id}-description`}
    />
  );
}
