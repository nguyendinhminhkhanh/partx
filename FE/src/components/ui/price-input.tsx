import { useEffect, useState } from "react";
import { Input } from "./input";

interface PriceInputProps {
  value: number | undefined;
  onChange: (val: number | undefined) => void;
  placeholder?: string;
  showCurrency?: boolean;
  id?: string;
  className?: string;
}

/**
 * Input nhập số tiền/số lượng với format VND.
 * - Khi focus: hiển thị số thuần để dễ xóa và gõ lại
 * - Khi blur: format lại với dấu phân cách hàng nghìn
 * - Chỉ chấp nhận chữ số, không cho nhập ký tự khác
 */
export function PriceInput({
  value,
  onChange,
  placeholder = "0",
  showCurrency = false,
  id,
  className,
}: PriceInputProps) {
  const [display, setDisplay] = useState(
    value != null ? value.toLocaleString("vi-VN") : "",
  );
  const [isFocused, setIsFocused] = useState(false);

  // Sync từ ngoài vào chỉ khi không đang focus (tránh ghi đè khi người dùng đang gõ)
  useEffect(() => {
    if (!isFocused) {
      setDisplay(value != null ? value.toLocaleString("vi-VN") : "");
    }
  }, [value, isFocused]);

  return (
    <div className="relative">
      <Input
        id={id}
        inputMode="numeric"
        placeholder={placeholder}
        className={`${showCurrency ? "pr-8" : ""} ${className ?? ""}`}
        value={display}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, "");
          setDisplay(raw);
          onChange(raw ? Number(raw) : 0);
        }}
        onFocus={() => {
          setIsFocused(true);
          // Hiển thị số thuần khi focus để dễ sửa
          setDisplay(value != null ? String(value) : "");
        }}
        onBlur={() => {
          setIsFocused(false);
          // Format lại khi blur
          if (value != null) {
            setDisplay(value.toLocaleString("vi-VN"));
          } else {
            setDisplay("");
          }
        }}
      />
      {showCurrency && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          ₫
        </span>
      )}
    </div>
  );
}
