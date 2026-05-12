import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    // KHÔNG dùng disableHoverableContent để chuột có thể di vào tooltip
    <TooltipPrimitive.Provider delayDuration={100}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export function Tooltip({
  children,
  content,
  className,
}: {
  children: React.ReactNode;
  content: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();

    // navigator.clipboard chỉ hoạt động trên HTTPS/localhost
    // Fallback dùng execCommand cho môi trường HTTP (truy cập qua IP)
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    } else {
      const el = document.createElement("textarea");
      el.value = content;
      el.style.position = "fixed";
      el.style.top = "0";
      el.style.left = "0";
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      document.body.appendChild(el);
      el.focus();
      el.select();
      el.setSelectionRange(0, el.value.length); // đảm bảo chọn hết trên mọi browser
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  return (
    <TooltipPrimitive.Root
      open={open}
      onOpenChange={setOpen}
      // Cho phép chuột di vào nội dung tooltip mà không đóng
      disableHoverableContent={false}
    >
      <TooltipPrimitive.Trigger
        asChild
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="top"
          sideOffset={8}
          // Chỉ đóng khi click ra ngoài, không đóng khi chuột rời trigger
          onPointerDownOutside={() => setOpen(false)}
          onEscapeKeyDown={() => setOpen(false)}
          className={cn(
            "z-50 max-w-[260px] break-words rounded-xl border border-border bg-background shadow-lg",
            "text-sm font-medium text-foreground leading-snug",
            "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95",
            "data-[side=top]:slide-in-from-bottom-1",
            className,
          )}
        >
          {/* Nội dung */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-[10px] font-normal text-muted-foreground mb-0.5 uppercase tracking-wide">
              Tên sản phẩm
            </p>
            <p>{content}</p>
          </div>

          {/* Nút copy — chỉ hiện trên desktop */}
          <div className="hidden md:flex items-center justify-end border-t border-border px-3 py-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          <TooltipPrimitive.Arrow className="fill-border" width={12} height={6} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
