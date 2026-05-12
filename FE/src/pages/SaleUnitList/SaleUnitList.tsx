import { MainLayout } from "../../components/Layout";
import ActionMenu from "../../components/ActionMenu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Field, FieldGroup } from "../../components/ui/field";
import { useEffect, useState } from "react";
import request from "../../api/request";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Plus, Search, X } from "lucide-react";

interface SaleUnit {
  _id: string;
  companyName: string;
  address: string;
  taxCode: string;
  email: string;
  website: string;
  phone: number;
  createdAt: string;
}

export default function SaleUnitList() {
  const [saleUnits, setSaleUnits] = useState<SaleUnit[]>([]);
  const [allSaleUnits, setAllSaleUnits] = useState<SaleUnit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editTarget, setEditTarget] = useState<SaleUnit | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm<SaleUnit>();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm<SaleUnit>();

  const onSubmit = async (data: SaleUnit) => {
    const { companyName, address, taxCode, email, website, phone } = data;
    try {
      setIsSubmitting(true);
      const res = await request({
        method: "POST",
        url: "/saleunit/create",
        data: { companyName, address, taxCode, email, website, phone },
      });
      if (res.success) {
        reset();
        toast.success("Tạo đơn vị bán hàng thành công!");
        setTimeout(() => navigate(0), 500);
      }
    } catch (error) {
      console.log("Lỗi thêm đơn vị bán hàng:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitEdit = async (data: SaleUnit) => {
    if (!editTarget) return;
    try {
      setIsSubmitting(true);
      const res = await request({
        method: "PUT",
        url: `/saleunit/${editTarget._id}`,
        data: {
          companyName: data.companyName,
          address: data.address,
          taxCode: data.taxCode,
          email: data.email,
          website: data.website,
          phone: data.phone,
        },
      });
      if (res.success) {
        setOpenEdit(false);
        setEditTarget(null);
        toast.success("Cập nhật đơn vị bán hàng thành công!");
        const updated = allSaleUnits.map((u) =>
          u._id === editTarget._id ? res.data : u,
        );
        setAllSaleUnits(updated);
        setSaleUnits(
          keyword.trim()
            ? updated.filter((u) =>
                u.companyName.toLowerCase().includes(keyword.toLowerCase()),
              )
            : updated,
        );
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchSaleUnits = async () => {
      try {
        const res = await request({ method: "GET", url: "/saleunit" });
        setAllSaleUnits(res.data);
        setSaleUnits(res.data);
      } catch (error) {
        console.log("Lỗi lấy đơn vị bán hàng:", error);
      }
    };
    fetchSaleUnits();
  }, []);

  // Lọc client-side theo keyword
  useEffect(() => {
    if (!keyword.trim()) {
      setSaleUnits(allSaleUnits);
      return;
    }
    const kw = keyword.toLowerCase();
    setSaleUnits(
      allSaleUnits.filter(
        (u) =>
          u.companyName?.toLowerCase().includes(kw) ||
          u.address?.toLowerCase().includes(kw) ||
          String(u.phone)?.includes(kw),
      ),
    );
  }, [keyword, allSaleUnits]);

  const handleEdit = (item: SaleUnit) => {
    setEditTarget(item);
    resetEdit({
      companyName: item.companyName,
      address: item.address,
      taxCode: item.taxCode,
      email: item.email,
      website: item.website,
      phone: item.phone,
    });
    setOpenEdit(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await request({ method: "DELETE", url: `/saleunit/${id}` });
      const updated = allSaleUnits.filter((u) => u._id !== id);
      setAllSaleUnits(updated);
      setSaleUnits(updated.filter((u) =>
        !keyword.trim() ||
        u.companyName?.toLowerCase().includes(keyword.toLowerCase()),
      ));
      toast.success("Đã xoá đơn vị bán hàng!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa");
    }
  };

  // Form fields dùng chung
  const SaleUnitFormFields = ({
    reg,
  }: {
    reg: typeof register | typeof registerEdit;
  }) => (
    <FieldGroup>
      <Field>
        <Label htmlFor="companyName">Tên công ty:</Label>
        <Input
          id="companyName"
          {...reg("companyName", { required: true })}
          placeholder="Tên công ty"
        />
      </Field>
      <Field>
        <Label htmlFor="address">Địa chỉ:</Label>
        <Input id="address" {...reg("address")} placeholder="Địa chỉ" />
      </Field>
      <Field className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email:</Label>
          <Input id="email" {...reg("email")} placeholder="example@gmail.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại:</Label>
          <Input id="phone" type="text" {...reg("phone")} placeholder="+84" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website:</Label>
          <Input id="website" type="text" {...reg("website")} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxCode">Mã số thuế:</Label>
          <Input id="taxCode" type="text" {...reg("taxCode")} placeholder="xxxx" />
        </div>
      </Field>
    </FieldGroup>
  );

  return (
    <MainLayout>
      {/* Dialog sửa */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-green-600">Sửa đơn vị bán hàng</DialogTitle>
            <DialogDescription>Cập nhật thông tin đơn vị bán hàng</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
            <SaleUnitFormFields reg={registerEdit} />
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpenEdit(false)}>
                Hủy
              </Button>
              {isSubmitting ? (
                <Button variant="secondary" disabled className="flex-1">
                  Đang lưu... <Spinner data-icon="inline-start" />
                </Button>
              ) : (
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-800">
                  Lưu thay đổi
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header: nút thêm + tìm kiếm */}
      <div className="p-4 space-y-3">
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-800 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-1" /> Thêm đơn vị bán hàng
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-4 md:p-6">
              <DialogHeader>
                <DialogTitle className="text-green-600">Thêm đơn vị bán hàng</DialogTitle>
                <DialogDescription>Thông tin đơn vị bán hàng</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <SaleUnitFormFields reg={register} />
                <div className="mt-4">
                  {isSubmitting ? (
                    <Button variant="secondary" disabled className="w-full">
                      Đang tạo... <Spinner data-icon="inline-start" />
                    </Button>
                  ) : (
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-800">
                      Tạo
                    </Button>
                  )}
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên công ty, địa chỉ, SĐT..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-9"
          />
          {keyword && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setKeyword("")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Số kết quả */}
        {keyword && (
          <p className="text-xs text-muted-foreground">
            Tìm thấy {saleUnits.length} kết quả cho &quot;{keyword}&quot;
          </p>
        )}
      </div>

      {/* Danh sách */}
      {saleUnits.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {keyword ? `Không tìm thấy kết quả cho "${keyword}"` : "Chưa có đơn vị bán hàng nào"}
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Tên công ty</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleUnits.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="text-sm">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="font-medium">{item.companyName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.address}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <ActionMenu
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item._id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3 px-4 pb-6">
            {saleUnits.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-border bg-background p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{item.companyName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <ActionMenu
                      onEdit={() => handleEdit(item)}
                      onDelete={() => handleDelete(item._id)}
                    />
                  </div>
                </div>
                {item.address && (
                  <p className="mt-2 text-sm text-muted-foreground truncate">{item.address}</p>
                )}
                {item.phone && (
                  <p className="mt-1 text-sm">{item.phone}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </MainLayout>
  );
}
