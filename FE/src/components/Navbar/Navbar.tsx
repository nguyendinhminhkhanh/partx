import { useContext, useState } from "react";
import { AuthContext } from "../../hook/useAuth";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../../components/ui/sheet";
import {
  CreditCardIcon,
  LogOutIcon,
  Menu,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  { label: "PageTEst", to: "/pagetest" },
];

export default function Navbar() {
  const auth = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  if (auth === null) {
    // Có thể return null, loading, hoặc throw error
    throw new Error("AuthContext must be used within AuthProvider");
  }
  const { user, setUser } = auth;
  // console.log("User in Navbar:", user);

  const isParentActive = (children?: { to: string }[]) => {
    if (!children) return false;
    return children.some((child) => location.pathname.startsWith(child.to));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // console.log("Logout");
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {user ? (
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition"
                >
                  <Avatar className="w-9 h-9 ring-2 ring-border">
                    <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {user?.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium">
                      {user?.fullName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.username}
                    </span>
                  </div>
                </Button>
              ) : (
                <Button variant="outline">Đăng nhập</Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <UserIcon />
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOutIcon />
                <Link to="/login">Đăng xuất</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72 p-6">
            <SheetHeader className="flex flex-col items-center text-center gap-3 pb-4">
              <Link to="/profile">
                <Avatar className="w-16 h-16 ring-2 ring-primary ring-offset-2">
                  <AvatarImage
                    src="https://i.pravatar.cc/150?img=12"
                    alt="Demo User"
                  />
                  <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <Link to="/profile">
                <div className="flex flex-col items-center">
                  <SheetTitle className="text-base font-semibold">
                    {user?.fullName}
                  </SheetTitle>

                  <SheetDescription className="text-xs text-muted-foreground">
                    Quản trị viên
                  </SheetDescription>
                </div>
              </Link>
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
              <DropdownMenuSeparator />
              <div className="flex flex-col gap-2">
                <Link to="/login">
                  <Button
                    onClick={handleLogout}
                    className="!px-0 text-red-600 focus:text-red-600 bg-inherit"
                  >
                    <LogOutIcon />
                    Đăng xuất
                  </Button>
                </Link>
                {/* <Link to="/login">
                  <Button>Đăng nhập</Button>
                </Link>
                <Link to="/register">
                  <Button>Đăng ký</Button>
                </Link> */}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
