import { MainLayout } from "../../components/Layout";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import { useEffect, useState } from "react";
import request from "../../api/request";
import { PriceInput } from "../../components/ui/price-input";
import { toast } from "sonner";
import { ScrollArea } from "../../components/ui/scroll-area";
import ActionMenu from "../../components/ActionMenu";
import { Download, Plus, Printer, Search, X } from "lucide-react";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { Field, FieldGroup } from "../../components/ui/field";
import { Tooltip, TooltipProvider } from "../../components/ui/tooltip";
import { Textarea } from "../../components/ui/textarea";
import { exportSaleInvoiceCSV, printSaleInvoice } from "../../lib/exportSaleInvoice";

// ── Types ──────────────────────────────────────────────────
interface SaleInvoiceItem {
  _id?: string;
  productCode?: string;
  productName: string;
  quantity?: number;
  price?: number;
  total?: number;
  guarantee?: number;
}

interface SaleInvoice {
  _id: string;
  buyerName: string;
  buyerPhone?: string;
  buyerAddress?: string;
  items?: SaleInvoiceItem[];
  totalAmount: number;
  imageUrl?: string;
  note?: string;
  createdByUser?: {
    _id: string;
    fullName: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

interface SaleInvoiceForm {
  buyerName: string;
  buyerPhone?: string;
  buyerAddress?: string;
  note?: string;
  items: SaleInvoiceItem[];
}

function formatVND(value: number) {
  return value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

// ── Form fields — tách ra ngoài để tránh re-mount ──────────
interface FormFieldsProps {
  register: UseFormRegister<SaleInvoiceForm>;
  control: Control<SaleInvoiceForm>;
  fields: { id: string }[];
  total: number;
  onAppend: () => void;
  onRemove: (i: number) => void;
}

function SaleInvoiceFormFields({
  register, control, fields, total, onAppend, onRemove,
}: FormFieldsProps) {
  return (
    <FieldGroup>
      {/* Thông tin người mua */}
      <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
        <h3 className="font-semibold text-sm">Thông tin người mua</h3>
        <Field>
          <Label>Tên người mua <span className="text-red-500">*</span></Label>
          <Input placeholder="Nguyễn Văn A" {...register("buyerName", { required: true })} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field>
            <Label>Số điện thoại</Label>
            <Input placeholder="+84..." {...register("buyerPhone")} />
          </Field>
          <Field>
            <Label>Địa chỉ</Label>
            <Input placeholder="Địa chỉ (tuỳ chọn)" {...register("buyerAddress")} />
          </Field>
        </div>
        <Field>
          <Label>Ghi chú</Label>
          <Textarea placeholder="Ghi chú thêm..." {...register("note")} rows={2} />
        </Field>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Danh sách sản phẩm</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-3 space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-medium text-sm">Sản phẩm {index + 1}</p>
              {fields.length > 1 && (
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onRemove(index)}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-1">
              <Label>Tên sản phẩm</Label>
              <Input
                placeholder="Tên sản phẩm"
                {...register(`items.${index}.productName`, { required: true })}
              />
            </div>

            <div className="space-y-1">
              <Label>Bảo hành (tháng)</Label>
              <Input
                type="number"
                placeholder="0"
                {...register(`items.${index}.guarantee`)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Số lượng</Label>
                <Controller
                  control={control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <PriceInput value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label>Đơn giá</Label>
                <Controller
                  control={control}
                  name={`items.${index}.price`}
                  render={({ field }) => (
                    <PriceInput value={field.value} onChange={field.onChange} showCurrency />
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={onAppend}>
        <Plus className="w-4 h-4 mr-1" /> Thêm sản phẩm
      </Button>

      <Field>
        <div className="flex justify-between items-center border-t pt-4">
          <p className="text-muted-foreground">Tổng tiền:</p>
          <p className="text-lg font-semibold text-green-600">{formatVND(total)}</p>
        </div>
      </Field>
    </FieldGroup>
  );
}

// ── Main component ─────────────────────────────────────────
export default function SaleInvoiceList() {
  const [invoices, setInvoices] = useState<SaleInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<SaleInvoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Form tạo mới
  const createForm = useForm<SaleInvoiceForm>({
    defaultValues: { items: [{ productName: "", quantity: undefined, price: undefined }] },
  });
  const { fields: createFields, append: createAppend, remove: createRemove } =
    useFieldArray({ control: createForm.control, name: "items" });
  const createItems = createForm.watch("items");
  const createTotal = (createItems ?? []).reduce(
    (s, i) => s + (Number(i?.quantity) || 0) * (Number(i?.price) || 0), 0,
  );

  // Form sửa
  const editForm = useForm<SaleInvoiceForm>();
  const { fields: editFields, append: editAppend, remove: editRemove } =
    useFieldArray({ control: editForm.control, name: "items" });
  const editItems = editForm.watch("items");
  const editTotal = (editItems ?? []).reduce(
    (s, i) => s + (Number(i?.quantity) || 0) * (Number(i?.price) || 0), 0,
  );

  const fetchInvoices = async (kw = keyword, from = dateFrom, to = dateTo) => {
    try {
      const params = new URLSearchParams();
      if (kw.trim()) params.set("keyword", kw.trim());
      if (from) params.set("dateFrom", from);
      if (to) params.set("dateTo", to);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await request({ method: "GET", url: `/saleinvoice${query}` });
      setInvoices(res.data);
    } catch (error) {
      console.log("Lỗi lấy hóa đơn xuất:", error);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchInvoices(), 400);
    return () => clearTimeout(t);
  }, [keyword]);
  useEffect(() => { fetchInvoices(); }, [dateFrom, dateTo]);

  const onSubmitCreate = async (data: SaleInvoiceForm) => {
    try {
      setIsSubmitting(true);
      const res = await request({
        method: "POST",
        url: "/saleinvoice/create",
        data: {
          buyerName: data.buyerName,
          buyerPhone: data.buyerPhone,
          buyerAddress: data.buyerAddress,
          note: data.note,
          items: data.items,
        },
      });
      if (res.success) {
        createForm.reset({ items: [{ productName: "", quantity: undefined, price: undefined }] });
        setOpenCreate(false);
        toast.success("Tạo hóa đơn xuất thành công!");
        fetchInvoices();
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: SaleInvoice) => {
    setEditTarget(item);
    editForm.reset({
      buyerName: item.buyerName,
      buyerPhone: item.buyerPhone,
      buyerAddress: item.buyerAddress,
      note: item.note,
      items: item.items ?? [],
    });
    setOpenEdit(true);
  };

  const onSubmitEdit = async (data: SaleInvoiceForm) => {
    if (!editTarget) return;
    try {
      setIsSubmitting(true);
      const res = await request({
        method: "PUT",
        url: `/saleinvoice/${editTarget._id}`,
        data: {
          buyerName: data.buyerName,
          buyerPhone: data.buyerPhone,
          buyerAddress: data.buyerAddress,
          note: data.note,
          items: data.items,
          imageUrl: editTarget.imageUrl,
        },
      });
      if (res.success) {
        setOpenEdit(false);
        setEditTarget(null);
        toast.success("Cập nhật hóa đơn xuất thành công!");
        fetchInvoices();
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request({ method: "DELETE", url: `/saleinvoice/${id}` });
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      toast.success("Đã xoá hóa đơn xuất!");
    } catch {
      toast.error("Xóa hóa đơn thất bại!");
    }
  };

  const hasFilter = keyword || dateFrom || dateTo;

  return (
    <MainLayout>
      {/* ── Dialog tạo mới ── */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-green-600">Tạo hóa đơn xuất</DialogTitle>
            <DialogDescription>Thông tin hóa đơn bán hàng</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
            <SaleInvoiceFormFields
              register={createForm.register}
              control={createForm.control}
              fields={createFields}
              total={createTotal}
              onAppend={() => createAppend({ productName: "", quantity: undefined, price: undefined })}
              onRemove={createRemove}
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpenCreate(false)}>
                Hủy
              </Button>
              {isSubmitting ? (
                <Button variant="secondary" disabled className="flex-1">
                  Đang tạo... <Spinner data-icon="inline-start" />
                </Button>
              ) : (
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-800">
                  Tạo hóa đơn
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog sửa ── */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-green-600">Sửa hóa đơn xuất</DialogTitle>
            <DialogDescription>Cập nhật thông tin hóa đơn</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
            <SaleInvoiceFormFields
              register={editForm.register}
              control={editForm.control}
              fields={editFields}
              total={editTotal}
              onAppend={() => editAppend({ productName: "", quantity: undefined, price: undefined })}
              onRemove={editRemove}
            />
            <div className="flex gap-2">
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

      {/* ── Header ── */}
      <div className="p-4 space-y-3">
        <div className="flex justify-end">
          <Button
            className="bg-green-600 hover:bg-green-800 w-full sm:w-auto"
            onClick={() => setOpenCreate(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Tạo Hóa Đơn Xuất
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên sản phẩm hoặc người mua..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>
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

      {/* ── Danh sách ── */}
      {invoices.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Không có hóa đơn xuất nào</p>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Người mua</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((item) => (
                  <TableRow key={item._id} className="cursor-pointer"
                    onClick={() => { setSelectedInvoice(item); setOpenDetail(true); }}>
                    <TableCell className="text-sm">{new Date(item.createdAt).toLocaleString("vi-VN")}</TableCell>
                    <TableCell className="font-medium">{item.buyerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.buyerPhone ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        {item.items?.map((i, idx) => (
                          <span key={idx} className="truncate max-w-[180px] text-sm">{i.productName}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatVND(item.totalAmount)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <ActionMenu
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item._id)}
                        onExport={() => printSaleInvoice(item)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3 px-4 pb-6">
            {invoices.map((item) => (
              <div key={item._id}
                onClick={() => { setSelectedInvoice(item); setOpenDetail(true); }}
                className="rounded-xl border border-border bg-background p-4 shadow-sm cursor-pointer active:opacity-80">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{item.buyerName}</p>
                    {item.buyerPhone && <p className="text-xs text-muted-foreground">{item.buyerPhone}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <ActionMenu
                      onEdit={() => handleEdit(item)}
                      onDelete={() => handleDelete(item._id)}
                      onExport={() => printSaleInvoice(item)}
                    />
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {item.items?.map((product, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="truncate max-w-[65%]">{product.productName}</span>
                      <span className="text-muted-foreground shrink-0">x{product.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t flex justify-end">
                  <span className="font-semibold text-green-600 text-sm">{formatVND(item.totalAmount)}</span>
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
                      Chi tiết hóa đơn xuất
                    </DialogTitle>
                    <DialogDescription className="text-xs md:text-sm">
                      {new Date(selectedInvoice.createdAt).toLocaleString("vi-VN")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 mt-4 text-sm">
                    <div className="p-3 border rounded-lg bg-muted/30 space-y-1.5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Người mua</p>
                      <p className="font-semibold">{selectedInvoice.buyerName}</p>
                      {selectedInvoice.buyerPhone && (
                        <p className="text-sm text-muted-foreground">📞 {selectedInvoice.buyerPhone}</p>
                      )}
                      {selectedInvoice.buyerAddress && (
                        <p className="text-sm text-muted-foreground">📍 {selectedInvoice.buyerAddress}</p>
                      )}
                    </div>

                    {selectedInvoice.note && (
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-muted-foreground">Ghi chú</p>
                        <p className="text-sm">{selectedInvoice.note}</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-0.5">
                      <p className="text-muted-foreground text-xs">Mã hóa đơn</p>
                      <p className="font-medium break-all text-xs">{selectedInvoice._id}</p>
                    </div>

                    {selectedInvoice.createdByUser && (
                      <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-muted/40 border">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {selectedInvoice.createdByUser.fullName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Người tạo</p>
                          <p className="text-sm font-medium truncate">
                            {selectedInvoice.createdByUser.fullName}
                            <span className="text-muted-foreground font-normal ml-1">
                              @{selectedInvoice.createdByUser.username}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

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
                                    <span className="block truncate cursor-pointer">{item.productName}</span>
                                  </Tooltip>
                                </td>
                                <td className="p-2 text-center">{item.quantity}</td>
                                <td className="p-2 text-right">{formatVND(item.price ?? 0)}</td>
                                <td className="p-2 text-right font-medium text-green-600">{formatVND(item.total ?? 0)}</td>
                                <td className="p-2 text-center">{item.guarantee ?? 0}T</td>
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

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1"
                        onClick={() => exportSaleInvoiceCSV(selectedInvoice)}>
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Xuất Excel
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1"
                        onClick={() => printSaleInvoice(selectedInvoice)}>
                        <Printer className="w-3.5 h-3.5 mr-1.5" /> In / PDF
                      </Button>
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
