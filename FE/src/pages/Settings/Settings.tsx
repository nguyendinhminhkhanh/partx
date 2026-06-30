import { useContext, useState } from "react";
import { MainLayout } from "../../components/Layout";
import { AuthContext } from "../../hook/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { BellRing, Lock, MonitorSmartphone, MoonStar, Palette, ShieldCheck, SunMedium } from "lucide-react";
import { toast } from "sonner";
import useTheme from "../../hook/useTheme";

export default function Settings() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext must be used within AuthProvider");
  }

  const { user } = auth;
  const { theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [language, setLanguage] = useState("vi");

  if (!user) {
    return (
      <MainLayout>
        <div className="p-6">Không có thông tin người dùng</div>
      </MainLayout>
    );
  }

  const handleSave = () => {
    toast.success("Đã lưu cài đặt thành công");
  };

  return (
    <MainLayout>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Cài đặt</p>
          <h1 className="text-2xl font-semibold tracking-tight">Quản lý cài đặt tài khoản</h1>
          <p className="text-sm text-muted-foreground">
            Tuỳ chỉnh trải nghiệm làm việc và bảo mật cho tài khoản của bạn.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Bảo mật tài khoản
              </CardTitle>
              <CardDescription>
                Cập nhật thông tin đăng nhập và bảo mật cơ bản.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input id="fullName" defaultValue={user.fullName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user.email} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" defaultValue={user.phone?.toString() ?? ""} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Đổi mật khẩu</p>
                    <p className="text-xs text-muted-foreground">Bảo vệ tài khoản bằng mật khẩu mới.</p>
                  </div>
                </div>
                <Button variant="outline">Đổi ngay</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Giao diện
                </CardTitle>
                <CardDescription>Tuỳ chỉnh cách hiển thị hệ thống.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    {theme === "dark" ? (
                      <MoonStar className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <SunMedium className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Chế độ giao diện</p>
                      <p className="text-xs text-muted-foreground">
                        {theme === "dark" ? "Đang dùng dark mode" : "Đang dùng light mode"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={toggleTheme}>
                    {theme === "dark" ? "Chuyển sang light" : "Chuyển sang dark"}
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Chế độ thu gọn</p>
                    <p className="text-xs text-muted-foreground">Giảm bớt khoảng cách trên màn hình.</p>
                  </div>
                  <Button
                    variant={compactMode ? "default" : "outline"}
                    onClick={() => setCompactMode((prev) => !prev)}
                  >
                    {compactMode ? "Bật" : "Tắt"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellRing className="h-5 w-5" />
                  Thông báo
                </CardTitle>
                <CardDescription>Điều chỉnh các thông báo hệ thống.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Thông báo đẩy</p>
                      <p className="text-xs text-muted-foreground">Nhận thông báo trên thiết bị.</p>
                    </div>
                  </div>
                  <Button
                    variant={notificationsEnabled ? "default" : "outline"}
                    onClick={() => setNotificationsEnabled((prev) => !prev)}
                  >
                    {notificationsEnabled ? "Bật" : "Tắt"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/20 p-4">
          <div>
            <p className="text-sm font-medium">Sẵn sàng lưu thay đổi?</p>
            <p className="text-xs text-muted-foreground">Các tuỳ chọn sẽ được áp dụng ngay sau khi lưu.</p>
          </div>
          <Button onClick={handleSave}>Lưu cài đặt</Button>
        </div>
      </div>
    </MainLayout>
  );
}
