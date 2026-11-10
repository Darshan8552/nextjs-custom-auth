"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;
const CELL_KEYS = ["one", "two", "three", "four", "five", "six"];

function splitValue(value: string) {
  return Array.from({ length: LENGTH }, (_, index) => value[index] ?? "");
}

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
};

export function OtpInput({
  value,
  onChange,
  onBlur,
  name,
  autoFocus,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: OtpInputProps) {
  const inputs = React.useRef<Array<HTMLInputElement | null>>([]);
  const [slots, setSlots] = React.useState<string[]>(() => splitValue(value));

  React.useEffect(() => {
    setSlots((current) =>
      current.join("") === value ? current : splitValue(value),
    );
  }, [value]);

  React.useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  function commit(next: string[]) {
    setSlots(next);
    onChange(next.join(""));
  }

  function focusCell(index: number) {
    const cell = inputs.current[Math.min(Math.max(index, 0), LENGTH - 1)];
    cell?.focus();
    cell?.select();
  }

  function handleInput(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");

    if (!digits) {
      const next = [...slots];
      next[index] = "";
      commit(next);
      return;
    }

    const next = [...slots];
    let cursor = index;
    for (const digit of digits) {
      if (cursor >= LENGTH) break;
      next[cursor] = digit;
      cursor += 1;
    }

    commit(next);
    if (cursor < LENGTH) focusCell(cursor);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...slots];

      if (next[index]) {
        next[index] = "";
        commit(next);
        return;
      }

      if (index > 0) {
        next[index - 1] = "";
        commit(next);
        focusCell(index - 1);
      }
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      const next = [...slots];
      next[index] = "";
      commit(next);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusCell(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusCell(index + 1);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH);

    if (!digits) return;
    event.preventDefault();

    const next = splitValue("");
    const chars = digits.split("");
    for (const [index, digit] of chars.entries()) {
      next[index] = digit;
    }

    commit(next);
    if (chars.length < LENGTH) focusCell(chars.length);
  }

  return (
    <fieldset
      className={cn(
        "m-0 grid min-w-0 grid-cols-6 gap-1.5 border-0 p-0",
        className,
      )}
    >
      <legend className="sr-only">6-digit code</legend>
      {CELL_KEYS.map((cell, index) => (
        <input
          key={cell}
          ref={(node) => {
            inputs.current[index] = node;
          }}
          value={slots[index] ?? ""}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={handlePaste}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={onBlur}
          name={index === 0 ? name : undefined}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of 6`}
          aria-invalid={ariaInvalid ? true : undefined}
          className={cn(
            "h-12 w-full min-w-0 rounded-[4px] border border-input bg-background text-center font-mono text-[22px] font-medium text-foreground caret-transparent transition-[border-color,box-shadow] outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 dark:bg-input/15 dark:aria-invalid:border-destructive/70 dark:aria-invalid:ring-destructive/25",
            slots[index] ? "border-foreground/35" : "",
          )}
        />
      ))}
    </fieldset>
  );
}
