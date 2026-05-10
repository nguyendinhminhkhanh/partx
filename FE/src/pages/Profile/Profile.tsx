import { MainLayout } from "../../components/Layout";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../hook/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { UserIcon, MailIcon, IdCardIcon, PhoneCall, Camera, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import request from "../../api/request";

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=12";

interface UpdateProfileForm {
  fullName: string;
  email: string;
  phone: string;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const auth = useContext(AuthContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPwd, setIsLoadingPwd] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!auth) {
    throw new Error("AuthContext must be used within AuthProvider");
  }

  const { user, setUser, status } = auth;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileForm>({
    values: {
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      phone: String(user?.phone ?? ""),
    },
  });

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    formState: { errors: errorsPwd },
    reset: resetPwd,
    watch,
  } = useForm<ChangePasswordForm>();

  if (status !== "idle" && status !== "done") {
    return (
      <MainLayout>
        <div className="p-6">Loading...</div>
      </MainLayout>
    );
  }

  if (!user) {
    return <div className="p-6">Không có thông tin người dùng</div>;
  }

  // Đổi ảnh đại diện
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPG, PNG hoặc GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await request({
        method: "POST",
        url: "/upload",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!uploadRes.success) {
        toast.error("Upload ảnh thất bại.");
        return;
      }

      const avatarUrl = uploadRes.url;
      const updateRes = await request({
        method: "PUT",
        url: "/auth/update",
        data: { avatar: avatarUrl },
      });

      if (updateRes.success) {
        setUser({ ...user, avatar: avatarUrl });
        toast.success("Cập nhật ảnh đại diện thành công.");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Cập nhật ảnh thất bại, thử lại sau.";
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Cập nhật thông tin hồ sơ
  const onSubmit = async (data: UpdateProfileForm) => {
    setIsLoading(true);
    try {
      const res = await request({
        method: "PUT",
        url: "/auth/update",
        data,
      });
      if (res.success) {
        setUser({ ...user, ...res.data });
        toast.success("Cập nhật hồ sơ thành công.");
        setOpenDialog(false);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Cập nhật thất bại, thử lại sau.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Đổi mật khẩu
  const onSubmitPassword = async (data: ChangePasswordForm) => {
    setIsLoadingPwd(true);
    try {
      const res = await request({
        method: "PUT",
        url: "/auth/change-password",
        data: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
      });
      if (res.success) {
        toast.success("Đổi mật khẩu thành công.");
        setOpenPasswordDialog(false);
        resetPwd();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Đổi mật khẩu thất bại, thử lại sau.";
      toast.error(message);
    } finally {
      setIsLoadingPwd(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[80vh] p-6">
        <Card className="w-full max-w-2xl shadow-xl rounded-2xl">
          <CardHeader className="flex flex-col items-center gap-4">
            {/* Avatar có thể click để đổi ảnh */}
            <div className="relative group">
              <Avatar className="w-24 h-24 ring-2 ring-primary ring-offset-2">
                <AvatarImage
                  src={user.avatar || DEFAULT_AVATAR}
                  className="object-contain"
                />
                <AvatarFallback className="text-2xl">
                  {user.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                aria-label="Thay đổi ảnh đại diện"
              >
                {isUploadingAvatar ? (
                  <span className="text-white text-xs">Đang tải...</span>
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-white" />
                    <span className="text-white text-xs mt-1">Đổi ảnh</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <CardTitle className="text-2xl">{user.fullName}</CardTitle>

            <Badge variant="outline">
              {new Date(user.createdAt).toLocaleString("vi-VN")}
            </Badge>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MailIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email || "Chưa cập nhật"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{user.phone || "Chưa cập nhật"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IdCardIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium">{user._id}</p>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenPasswordDialog(true)}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Đổi mật khẩu
              </Button>
              <Button variant="outline" onClick={() => setOpenDialog(true)}>
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog chỉnh sửa hồ sơ */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                {...register("fullName", {
                  required: "Họ và tên không được để trống",
                  minLength: { value: 3, message: "Tối thiểu 3 ký tự" },
                })}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email không được để trống",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không hợp lệ",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone", {
                  required: "Số điện thoại không được để trống",
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: "Số điện thoại không hợp lệ (10-15 chữ số)",
                  },
                })}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog đổi mật khẩu */}
      <Dialog
        open={openPasswordDialog}
        onOpenChange={(open) => {
          setOpenPasswordDialog(open);
          if (!open) resetPwd();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmitPwd(onSubmitPassword)}
            className="space-y-4 pt-2"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...registerPwd("currentPassword", {
                  required: "Vui lòng nhập mật khẩu hiện tại",
                })}
              />
              {errorsPwd.currentPassword && (
                <p className="text-sm text-destructive">
                  {errorsPwd.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...registerPwd("newPassword", {
                  required: "Vui lòng nhập mật khẩu mới",
                  minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
                })}
              />
              {errorsPwd.newPassword && (
                <p className="text-sm text-destructive">
                  {errorsPwd.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...registerPwd("confirmPassword", {
                  required: "Vui lòng xác nhận mật khẩu mới",
                  validate: (value) =>
                    value === watch("newPassword") || "Mật khẩu xác nhận không khớp",
                })}
              />
              {errorsPwd.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errorsPwd.confirmPassword.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenPasswordDialog(false);
                  resetPwd();
                }}
                disabled={isLoadingPwd}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoadingPwd}>
                {isLoadingPwd ? "Đang lưu..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
