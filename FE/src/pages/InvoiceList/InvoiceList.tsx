import { MainLayout } from "../../components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useEffect, useState } from "react";
import request from "../../api/request";
import { PriceInput } from "../../components/ui/price-input";
import { toast } from "sonner";
import { ScrollArea } from "../../components/ui/scroll-area";
import ActionMenu from "../../components/ActionMenu";
import { Plus, Search, X } from "lucide-react";
import CreateInvoiceDialog from "../../components/CreateInvoiceDialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { Field, FieldGroup } from "../../components/ui/field";
import { Command, CommandItem, CommandList } from "../../components/ui/command";
import { Tooltip, TooltipProvider } from "../../components/ui/tooltip";

interface InvoiceItem {
  _id?: string;
  productCode?: string;
  productName: string;
  guarantee?: number;
  quantity?: number;
  price?: number;
  total?: number;
}

interface Invoice {
  _id: string;
  imageUrl: string;
  items?: InvoiceItem[];
  totalAmount: number;
  createdBy?: {
    _id: string;
    address: string;
    companyName: string;
  };
  createdAt: string;
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<Invoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyCompanyName, setKeyCompanyName] = useState("");
  const [resultFindCom, setResultFindCom] = useState<any[]>([]);

  // Tìm kiếm & lọc
  const [keyword, setKeyword] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const formatVND = (value: number) =>
    value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const { register, handleSubmit, reset, setValue, watch, control } =
    useForm<Invoice>();
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items");
  const editTotal = (watchedItems ?? []).reduce(
    (sum, item) =>
      sum + (Number(item?.quantity) || 0) * (Number(item?.price) || 0),
    0,
  );

  const fetchInvoices = async (kw = keyword, from = dateFrom, to = dateTo) => {
    try {
      const params = new URLSearchParams();
      if (kw.trim()) params.set("keyword", kw.trim());
      if (from) params.set("dateFrom", from);
      if (to) params.set("dateTo", to);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await request({ method: "GET", url: `/invoice${query}` });
      setInvoices(res.data);
    } catch (error) {
      console.log("Lỗi lấy hóa đơn:", error);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchInvoices(), 400);
    return () => clearTimeout(t);
  }, [keyword]);

  useEffect(() => { fetchInvoices(); }, [dateFrom, dateTo]);

  // Tìm công ty khi sửa
  useEffect(() => {
    if (!keyCompanyName.trim()) { setResultFindCom([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await request({ method: "GET", url: `/saleunit/${keyCompanyName}` });
        setResultFindCom(res.data);
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(t);
  }, [keyCompanyName]);

  const handleEdit = (item: Invoice) => {
    setEditTarget(item);
    reset({ createdBy: item.createdBy as any, items: item.items ?? [] });
    setKeyCompanyName(item.createdBy?.companyName ?? "");
    setResultFindCom([]);
    setOpenEdit(true);
  };

  const onSubmitEdit = async (data: Invoice) => {
    if (!editTarget) return;
    try {
      setIsSubmitting(true);
      const res = await request({
        method: "PUT",
        url: `/invoice/${editTarget._id}`,
        data: { imageUrl: editTarget.imageUrl, createdBy: data.createdBy, items: data.items },
      });
      if (res.success) {
        setOpenEdit(false);
        setEditTarget(null);
        toast.success("Cập nhật hóa đơn thành công!");
        fetchInvoices();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const invoiceRes = await request({ method: "GET", url: `/invoice/${id}` });
      const imageUrl = invoiceRes.data?.imageUrl;
      if (imageUrl) {
        await request({ method: "DELETE", url: "/upload", data: { imageUrl } });
      }
      await request({ method: "DELETE", url: `/invoice/${id}` });
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      toast.success("Đã xoá hóa đơn!");
    } catch (error) {
      toast.error("Xóa hóa đơn thất bại!");
    }
  };

  const hasFilter = keyword || dateFrom || dateTo;

  return (
    <MainLayout>
      {/* ── Dialog sửa hóa đơn ── */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-green-600">Sửa hóa đơn</DialogTitle>
            <DialogDescription>Cập nhật thông tin hóa đơn</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            <FieldGroup>
              <Command className="border rounded-md">
                <Input
                  placeholder="Tìm công ty..."
                  value={keyCompanyName}
                  onChange={(e) => setKeyCompanyName(e.target.value)}
                />
                <CommandList>
                  {resultFindCom.length === 0 && keyCompanyName.trim() && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">Không tìm thấy công ty</p>
                  )}
                  {resultFindCom.map((c) => (
                    <CommandItem key={c._id} onSelect={() => { setValue("createdBy", c._id); setKeyCompanyName(c.companyName); setResultFindCom([]); }}>
                      <div className="flex flex-col">
                        <span className="font-medium">{c.companyName}</span>
                        <span className="text-xs text-muted-foreground">{c.address}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>

              <div className="space-y-4">
                <h3 className="font-semibold">Danh sách sản phẩm</h3>
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">Sản phẩm {index + 1}</p>
                      {fields.length > 1 && (
                        <button type="button" className="text-red-500 hover:text-red-700" onClick={() => remove(index)}>
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Tên sản phẩm</Label>
                      <Input placeholder="Tên sản phẩm" {...register(`items.${index}.productName`, { required: true })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Bảo hành (tháng)</Label>
                      <Input type="number" placeholder="Số tháng" {...register(`items.${index}.guarantee`)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Số lượng</Label>
                        <Controller control={control} name={`items.${index}.quantity`}
                          render={({ field }) => <PriceInput value={field.value} onChange={field.onChange} />}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Đơn giá</Label>
                        <Controller control={control} name={`items.${index}.price`}
                          render={({ field }) => <PriceInput value={field.value} onChange={field.onChange} showCurrency />}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="button" variant="outline" className="w-full"
                onClick={() => append({ productName: "", guarantee: undefined, quantity: undefined, price: undefined })}>
                <Plus className="w-4 h-4 mr-1" /> Thêm sản phẩm
              </Button>

              <Field>
                <div className="flex justify-between items-center border-t pt-4">
                  <p className="text-muted-foreground">Tổng tiền:</p>
                  <p className="text-lg font-semibold text-green-600">{formatVND(editTotal)}</p>
                </div>
              </Field>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpenEdit(false)}>Hủy</Button>
                {isSubmitting ? (
                  <Button variant="secondary" disabled className="flex-1">Đang lưu... <Spinner data-icon="inline-start" /></Button>
                ) : (
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-800">Lưu thay đổi</Button>
                )}
              </div>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Header: nút tạo + tìm kiếm ── */}
      <div className="p-4 space-y-3">
        {/* Nút tạo hóa đơn */}
        <div className="flex justify-end">
          <CreateInvoiceDialog>
            <Button className="bg-green-600 hover:bg-green-800 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" /> Tạo Hóa Đơn
            </Button>
          </CreateInvoiceDialog>
        </div>

        {/* Thanh tìm kiếm & lọc ngày */}
        <div className="flex flex-col gap-2">
          {/* Ô tìm kiếm */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Lọc ngày */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Label className="text-sm whitespace-nowrap text-muted-foreground w-6">Từ</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Label className="text-sm whitespace-nowrap text-muted-foreground w-6">Đến</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1" />
            </div>
            {hasFilter && (
              <Button variant="outline" size="sm" className="shrink-0"
                onClick={() => { setKeyword(""); setDateFrom(""); setDateTo(""); }}>
                <X className="w-3 h-3 mr-1" /> Xóa lọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Danh sách hóa đơn: Table (md+) / Card (mobile) ── */}
      {invoices.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Không có hóa đơn nào</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Đơn vị bán hàng</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((item) => (
                  <TableRow key={item._id} className="cursor-pointer"
                    onClick={() => { setSelectedInvoice(item); setOpenDetail(true); }}>
                    <TableCell className="text-sm">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>{item.createdBy?.companyName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        {item.items?.map((i, idx) => (
                          <span key={idx} className="truncate max-w-[200px] text-sm">{i.productName}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatVND(item.totalAmount)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <ActionMenu onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item._id)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3 px-4 pb-6">
            {invoices.map((item) => (
              <div key={item._id}
                onClick={() => { setSelectedInvoice(item); setOpenDetail(true); }}
                className="rounded-xl border border-border bg-background p-4 shadow-sm active:opacity-80 cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{item.createdBy?.companyName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <ActionMenu onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item._id)} />
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="mt-2 space-y-1">
                  {item.items?.map((product, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="truncate max-w-[65%] text-foreground">{product.productName}</span>
                      <span className="text-muted-foreground shrink-0">x{product.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Tổng tiền */}
                <div className="mt-3 pt-2 border-t flex justify-end">
                  <span className="font-semibold text-green-600 text-sm">
                    {formatVND(item.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Dialog chi tiết ── */}
      <TooltipProvider>
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] p-0">
          <ScrollArea className="max-h-[90vh] p-4 md:p-6">
            {selectedInvoice && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-base md:text-lg font-semibold">
                    Chi tiết hóa đơn
                  </DialogTitle>
                  <DialogDescription className="text-xs md:text-sm">
                    {new Date(selectedInvoice.createdAt).toLocaleString("vi-VN")}
                  </DialogDescription>
                </DialogHeader>

                {selectedInvoice.imageUrl && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={selectedInvoice.imageUrl}
                      alt="hóa đơn"
                      className="max-h-48 md:max-h-64 w-auto object-contain rounded-lg border shadow-sm"
                    />
                  </div>
                )}

                <div className="space-y-3 mt-4 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-muted-foreground text-xs">Mã hóa đơn</p>
                    <p className="font-medium break-all text-xs">{selectedInvoice._id}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-muted-foreground text-xs">Đơn vị bán</p>
                    <p className="font-medium">{selectedInvoice.createdBy?.companyName}</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Danh sách sản phẩm</p>
                    <div className="border rounded-lg overflow-x-auto">
                      <table className="w-full text-xs md:text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Tên SP</th>
                            <th className="p-2 text-center">SL</th>
                            <th className="p-2 text-right">Đơn giá</th>
                            <th className="p-2 text-right">Tổng</th>
                            <th className="p-2 text-center">BH</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvoice.items?.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2 max-w-[100px]">
                                <Tooltip content={item.productName}>
                                  <span className="block truncate cursor-pointer">
                                    {item.productName}
                                  </span>
                                </Tooltip>
                              </td>
                              <td className="p-2 text-center">{item.quantity}</td>
                              <td className="p-2 text-right">{formatVND(item.price ?? 0)}</td>
                              <td className="p-2 text-right font-medium text-green-600">{formatVND(item.total ?? 0)}</td>
                              <td className="p-2 text-center">{item.guarantee}T</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <p className="text-muted-foreground">Tổng tiền</p>
                    <p className="font-semibold text-green-600 text-base">
                      {formatVND(selectedInvoice.totalAmount)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
      </TooltipProvider>
    </MainLayout>
  );
}
