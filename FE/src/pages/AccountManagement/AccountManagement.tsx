import { useEffect, useState } from "react";
import { MainLayout } from "../../components/Layout";
import request from "../../api/request";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { CheckIcon, XIcon, MailIcon, PhoneIcon, ShieldIcon } from "lucide-react";

interface Account {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
  email: string;
  phone: string;
  role: string;
  status: "pending" | "active";
  createdAt: string;
}

const FILTER_LABELS = {
  all: "Tất cả",
  pending: "Chờ duyệt",
  active: "Đã duyệt",
} as const;

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "active">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await request({
        url: `/auth/accounts?status=${filter}`,
        method: "GET",
      });
      if (res.success) setAccounts(res.data);
    } catch {
      toast.error("Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [filter]);

  const handleUpdateStatus = async (id: string, status: "active" | "pending") => {
    setLoadingId(id);
    try {
      const res = await request({
        url: `/auth/accounts/${id}/status`,
        method: "PUT",
        data: { status },
      });
      if (res.success) {
        toast.success(res.message);
        setAccounts((prev) =>
          prev.map((acc) => (acc._id === id ? { ...acc, status } : acc))
        );
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Thao tác thất bại.");
    } finally {
      setLoadingId(null);
    }
  };

  const filtered =
    filter === "all" ? accounts : accounts.filter((a) => a.status === filter);

  const pendingCount = accounts.filter((a) => a.status === "pending").length;

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Quản lý tài khoản</h1>
            {pendingCount > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {pendingCount} tài khoản đang chờ duyệt
              </p>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(Object.keys(FILTER_LABELS) as Array<keyof typeof FILTER_LABELS>).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="relative"
              >
                {FILTER_LABELS[f]}
                {f === "pending" && pendingCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-xs rounded-full bg-destructive text-destructive-foreground">
                    {pendingCount}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-muted-foreground text-sm py-8 text-center">
            Đang tải...
          </p>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <p className="text-muted-foreground text-sm py-8 text-center">
            Không có tài khoản nào.
          </p>
        )}

        {/* Mobile: card list */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map((acc) => (
              <Card key={acc._id}>
                <CardContent className="p-4 space-y-3">
                  {/* Top row: avatar + name + badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={acc.avatar || acc.fullName.charAt(1).toUpperCase()} className="object-contain" />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {acc.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm leading-tight">{acc.fullName}</p>
                        <p className="text-xs text-muted-foreground">@{acc.username}</p>
                      </div>
                    </div>
                    <Badge
                      variant={acc.status === "active" ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {acc.status === "active" ? "Đã duyệt" : "Chờ duyệt"}
                    </Badge>
                  </div>

                  {/* Info rows */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MailIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{acc.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <PhoneIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{acc.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="capitalize">{acc.role}</span>
                      <span className="text-xs">·</span>
                      <span className="text-xs">
                        {new Date(acc.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {acc.status === "pending" && (
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={loadingId === acc._id}
                        onClick={() => handleUpdateStatus(acc._id, "active")}
                      >
                        <CheckIcon className="w-4 h-4 mr-1" />
                        {loadingId === acc._id ? "Đang duyệt..." : "Duyệt"}
                      </Button>
                    )}
                    {acc.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={loadingId === acc._id}
                        onClick={() => handleUpdateStatus(acc._id, "pending")}
                      >
                        <XIcon className="w-4 h-4 mr-1" />
                        {loadingId === acc._id ? "Đang xử lý..." : "Thu hồi"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Desktop: table */}
        {!loading && filtered.length > 0 && (
          <div className="hidden md:block rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((acc) => (
                  <TableRow key={acc._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={acc.avatar || acc.fullName.charAt(1).toUpperCase()} className="object-contain" />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {acc.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{acc.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      @{acc.username}
                    </TableCell>
                    <TableCell>{acc.email}</TableCell>
                    <TableCell>{acc.phone}</TableCell>
                    <TableCell className="capitalize">{acc.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant={acc.status === "active" ? "default" : "secondary"}
                      >
                        {acc.status === "active" ? "Đã duyệt" : "Chờ duyệt"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(acc.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {acc.status === "pending" && (
                          <Button
                            size="sm"
                            disabled={loadingId === acc._id}
                            onClick={() => handleUpdateStatus(acc._id, "active")}
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            {loadingId === acc._id ? "Đang duyệt..." : "Duyệt"}
                          </Button>
                        )}
                        {acc.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={loadingId === acc._id}
                            onClick={() => handleUpdateStatus(acc._id, "pending")}
                          >
                            <XIcon className="w-4 h-4 mr-1" />
                            {loadingId === acc._id ? "Đang xử lý..." : "Thu hồi"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
