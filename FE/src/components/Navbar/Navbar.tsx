import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { Menu } from "lucide-react";
import { NavLink, Link } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Trang chủ", to: "/" },
  { label: "Hóa đơn nhập", to: "/createinvoice" },
  { label: "Đơn vị bán hàng", to: "/createsaleunit" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/" className="text-lg font-bold tracking-tight">
          PARTX
        </NavLink>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `
                text-sm font-medium transition-colors
                ${isActive ? "text-primary" : "text-muted-foreground"}
                md:hover:text-primary
              `
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex gap-2">
          <Button>
            <Link to="/login">Đăng nhập</Link>
          </Button>
          <Button>Đăng ký</Button>
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72 p-6">
            <div className="flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `
                    text-base font-medium
                    ${isActive ? "text-primary" : ""}
                  `
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-6 flex flex-col gap-2">
                <Link to="/login">
                  <Button>Đăng nhập</Button>
                </Link>
                <Link to="/register">
                  <Button>Đăng ký</Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
