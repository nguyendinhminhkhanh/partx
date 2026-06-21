import { useForm } from "react-hook-form";
import { toast } from "sonner";
import request from "../../api/request";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Link, useNavigate } from "react-router-dom";

interface Login {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: number;
}

export default function Register() {
  const { register, handleSubmit } = useForm<Login>();
  const navigator = useNavigate();
  const onSubmit = async (data: Login) => {
    const { username, password, fullName, email, phone } = data;
    try {
      const res = await request({
        method: "POST",
        url: "/auth/register",
        data: { username, password, fullName, email, phone },
      });
      if (res.success) {
        toast.success("Đăng ký thành công! Vui lòng chờ admin duyệt tài khoản trước khi đăng nhập.");
        navigator("/login");
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Đăng ký thất bại.";
      toast.error(message);
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>
            Đăng nhập để tiếp tục sử dụng hệ thống
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* FullNam */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                type="text"
                {...register("fullName", { required: true })}
              />
            </div>
            {/* User name */}
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                {...register("username", { required: true })}
                placeholder="example"
              />
            </div>
            {/* email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: true })}
                placeholder="example@gmail.com"
              />
            </div>

            {/* email */}
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="text"
                {...register("phone", { required: true })}
                placeholder="+84"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                {...register("password", { required: true })}
                placeholder="••••••••"
              />
            </div>

            {/* Button */}
            <Button type="submit" className="w-full">
              Đăng kí
            </Button>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
