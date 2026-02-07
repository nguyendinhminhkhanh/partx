import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../../components/ui/sheet";
import { Menu } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

const NAV_ITEMS = [
  { label: "Trang chủ", to: "/" },
  {
    label: "Hóa đơn",
    children: [
      { label: "Hóa đơn nhập", to: "/invoicelist" },
      { label: "Đơn vị bán hàng", to: "/createsaleunit" },
    ],
  },
  { label: "Xuất hàng", to: "/123" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isParentActive = (children?: { to: string }[]) => {
    if (!children) return false;
    return children.some((child) => location.pathname.startsWith(child.to));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/" className="text-lg font-bold tracking-tight">
          PARTX
        </NavLink>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger
                  className={`text-sm font-medium transition-colors ${
                    isParentActive(item.children)
                      ? "text-primary"
                      : "text-muted-foreground"
                  } hover:text-primary`}
                >
                  {item.label}
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.to} asChild>
                      <NavLink to={child.to}>{child.label}</NavLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  } hover:text-primary`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex gap-2">
          <Button>
            <Link to="/login">Đăng xuất</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72 p-6">
            <SheetHeader>
              <SheetTitle>User Name</SheetTitle>
              <SheetDescription>
                Chỗ này cần điền mô tả gì đó
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4">
              {NAV_ITEMS.map((item) =>
                item.children ? (
                  <Accordion
                    key={item.label}
                    type="single"
                    collapsible
                    defaultValue={
                      isParentActive(item.children) ? item.label : undefined
                    }
                  >
                    <AccordionItem value={item.label}>
                      <AccordionTrigger
                        className={`text-base font-medium ${
                          isParentActive(item.children) ? "text-primary" : ""
                        }`}
                      >
                        {item.label}
                      </AccordionTrigger>

                      <AccordionContent className="flex flex-col gap-2 pl-4">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={() => setOpen(false)}
                            className="text-sm text-muted-foreground hover:text-primary"
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium"
                  >
                    {item.label}
                  </NavLink>
                ),
              )}

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
