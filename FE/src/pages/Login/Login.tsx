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
import { useContext } from "react";
import { AuthContext } from "../../hook/useAuth";

interface Login {
  username: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit } = useForm<Login>();
  const navigate = useNavigate();

  const user = useContext(AuthContext);
  if (!user) {
    throw new Error("AuthContext must be used within AuthProvider");
  }

  const { setUser } = user;

  const onSubmit = async (data: Login) => {
    const { username, password } = data;
    try {
      const res = await request({
        method: "POST",
        url: "/auth/login",
        data: { username, password },
      });
      toast.success("Đăng nhập thành công.");
      // console.log("res: ", res);
      if (res.success) {
        const { token, fullName, _id, username, email, phone, createdAt } =
          res.data;
        // console.log("ten: ", fullName,username ,email,phone,createdAt);
        localStorage.setItem("token", token);
        setUser({ _id, fullName, username, email, phone, createdAt });
      }
      navigate("/");
    } catch (error) {
      toast.error("Thông tin đăng nhập không chính xác.");
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
            {/* UserName */}
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                {...register("username", { required: true })}
                placeholder="example"
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
                autoComplete="current-password"
              />
            </div>

            {/* Button */}
            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Đăng ký
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
