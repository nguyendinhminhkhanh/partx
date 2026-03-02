import { MainLayout } from "../../components/Layout";
import { useContext } from "react";
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
import { UserIcon, MailIcon, IdCardIcon, PhoneCall } from "lucide-react";

export default function Profile() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext must be used within AuthProvider");
  }

  const { user, status } = auth;

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

  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[80vh] p-6">
        <Card className="w-full max-w-2xl shadow-xl rounded-2xl">
          <CardHeader className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 ring-2 ring-primary ring-offset-2">
              <AvatarImage src="https://i.pravatar.cc/150?img=12" />
              <AvatarFallback className="text-2xl">
                {user.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>

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
                <p className="text-sm text-muted-foreground"> Phone </p>
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

            <div className="flex justify-end">
              <Button variant="outline">Chỉnh sửa hồ sơ</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
