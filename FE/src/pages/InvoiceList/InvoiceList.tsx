import { MainLayout } from "../../components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Command, CommandItem, CommandList } from "../../components/ui/command";
import { Button } from "../../components/ui/button";
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
import { useEffect, useRef, useState } from "react";
import request from "../../api/request";
// import { toast } from "sonner";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router";
import { toast } from "sonner";
// "_id": "697a2d8662f992fad52b561f",
// "productCode": "",
// "productName": "RAM đồng bộ DDR4 4G",
// "quantity": 9,
// "price": 280000,
// "totalAmount": 2520000,
// "guarantee": 1,
// "createdBy": {
//     "_id": "697a26073c7ee231f34c1442",
//     "companyName": "Công ty TNHH Máy Tính Đỗ Phong",
//     "address": "Số 60 Ngõ 181 Trường Chinh, Phương Liệt- Hà Nội",
//     "taxCode": "0109967349",
//     "email": "",
//     "website": "dophongpc.com",
//     "phone": "0965567124",
//     "createdAt": "2026-01-28T15:06:47.820Z",
//     "updatedAt": "2026-01-28T15:06:47.820Z",
//     "__v": 0
// },
// "createdAt": "2026-01-28T15:38:46.901Z",
// "updatedAt": "2026-01-28T15:38:46.901Z",
// "__v": 0
interface Invoice {
  _id: string;
  productCode: string;
  productName: string;
  quantity: string;
  guarantee: number;
  price: number;
  totalAmount: number;
  createdBy?: {
    _id: string;
    address: string;
    companyName: string;
  };
  createdAt: string;
}
export default function InvoiceList() {
  const [open, setOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const { register, handleSubmit, reset, setValue, watch } = useForm<Invoice>();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const quantity = watch("quantity");
  const price = watch("price");
  const totalAmount = (Number(quantity) || 0) * (Number(price) || 0);

  const formatVND = (value: number) => {
    return value?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const [keyCompanyName, setKeyCompanyName] = useState("");
  const [resutlFindCom, setResultFindCom] = useState<any[]>([]);

  const handleCompanyChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setKeyCompanyName(value);
    if (!value.trim()) {
      setResultFindCom([]);
      return;
    }
  };

  useEffect(() => {
    if (!keyCompanyName.trim()) return;
    // clear debounce cũ
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await request({
          method: "GET",
          url: `/saleunit/${keyCompanyName}`,
        });

        console.log("company:", res.data);
        setResultFindCom(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 200);

    // cleanup khi unmount / keyword đổi
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [keyCompanyName]);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await request({
          method: "GET",
          url: "/invoice",
        });
        setInvoices(res.data);
        console.log("danh sach hao donw ", res.data);
      } catch (error) {
        console.log("Lỗi lấy hóa đơn!!!", error);
      }
    };
    fetchInvoice();
  }, []);

  const onSubmit = async (data: Invoice) => {
    setIsSubmitting(true);
    const { productName, quantity, price, guarantee, createdBy } = data;
    console.log(productName, quantity, price, guarantee, createdBy);
    try {
      const res = await request({
        method: "POST",
        url: "/invoice/create",
        data: { productName, quantity, price, guarantee, createdBy },
      });
      if (res.success) {
        // 1. reset form
        reset();

        // 2. reset các state phụ
        setKeyCompanyName("");
        setResultFindCom([]);

        // 3. đóng form
        setOpen(false);

        // 4. chuyển trang
        navigate("/invoicelist");
        setIsSubmitting(false);
        toast.success("Tạo hóa đơn thành công");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // chưa thấy đóng khi submit forem

  return (
    <MainLayout>
      <div className="hidden md:block">
        <Dialog open={open} onOpenChange={setOpen}>
          <div className="flex justify-end m-4 text-sm">
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-800">
                Tạo Hóa Đơn
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className=" w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-green-600">Tạo hóa đơn</DialogTitle>
              <DialogDescription>Hóa đơn nhập hàng</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Command className="border rounded-md">
                  <Input
                    placeholder="Tìm công ty..."
                    value={keyCompanyName}
                    onChange={handleCompanyChange}
                  />
                  <CommandList>
                    {resutlFindCom.length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        Không tìm thấy công ty
                      </p>
                    )}

                    {resutlFindCom.map((c) => (
                      <CommandItem
                        key={c._id}
                        onSelect={() => {
                          setValue("createdBy", c._id, {
                            shouldValidate: true,
                          });
                          setKeyCompanyName(c.companyName);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{c.companyName}</span>
                          <span className="text-xs text-muted-foreground">
                            {c.address}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
                <Field>
                  <Label htmlFor="image">Hình ảnh</Label>
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted transition"
                  >
                    <span className="text-sm text-muted-foreground">
                      Click to upload image
                    </span>
                  </label>
                </Field>
                <Field>
                  <Label htmlFor="productName">Sản phẩm:</Label>
                  <Input
                    id="productName"
                    {...register("productName", { required: true })}
                    placeholder="Tên sản phẩm"
                  />
                </Field>
                <Field>
                  <Label htmlFor="guarantee">Bảo hành:</Label>
                  <Input
                    id="guarantee"
                    {...register("guarantee", { required: true })}
                    placeholder="Tháng"
                  />
                </Field>
                <Field className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Số lượng:</Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...register("quantity", { required: true })}
                      placeholder="Số lượng"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Giá:</Label>
                    <Input
                      id="price"
                      type="number"
                      {...register("price", { required: true })}
                      placeholder="VND"
                    />
                  </div>
                </Field>
                <Field>
                  <div className="space-y-2">
                    <Label className="text-green-600" htmlFor="totalAmount">
                      Tổng tiền: {formatVND(totalAmount)}
                    </Label>
                  </div>
                </Field>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang tạo..." : "Tạo hóa đơn"}
                </Button>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã HĐ</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Đơn vị bán hàng</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {invoices.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">{item._id}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </TableCell>
                <TableCell>{item.createdBy?.companyName}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatVND(item.price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatVND(item.totalAmount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* //mobile */}
      <div className="md:hidden space-y-3 m-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <div className="">
            <DialogTrigger asChild>
              <Button className="bg-green-600 ">Tạo Hóa Đơn</Button>
            </DialogTrigger>
          </div>
          <DialogContent className=" w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-green-600">Tạo hóa đơn</DialogTitle>
              <DialogDescription>Hóa đơn nhập hàng</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Command className="border rounded-md">
                  <Input
                    placeholder="Tìm công ty..."
                    value={keyCompanyName}
                    onChange={handleCompanyChange}
                  />
                  <CommandList>
                    {resutlFindCom.length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        Không tìm thấy công ty
                      </p>
                    )}

                    {resutlFindCom.map((c) => (
                      <CommandItem
                        key={c._id}
                        onSelect={() => {
                          setValue("createdBy", c._id, {
                            shouldValidate: true,
                          });
                          setKeyCompanyName(c.companyName);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{c.companyName}</span>
                          <span className="text-xs text-muted-foreground">
                            {c.address}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
                <Field>
                  <Label htmlFor="image">Hình ảnh</Label>
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted transition"
                  >
                    <span className="text-sm text-muted-foreground">
                      Click to upload image
                    </span>
                  </label>
                </Field>
                <Field>
                  <Label htmlFor="productName">Sản phẩm:</Label>
                  <Input
                    id="productName"
                    {...register("productName", { required: true })}
                    placeholder="Tên sản phẩm"
                  />
                </Field>
                <Field>
                  <Label htmlFor="guarantee">Bảo hành:</Label>
                  <Input
                    id="guarantee"
                    {...register("guarantee", { required: true })}
                    placeholder="Tháng"
                  />
                </Field>
                <Field className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Số lượng:</Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...register("quantity", { required: true })}
                      placeholder="Số lượng"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Giá:</Label>
                    <Input
                      id="price"
                      type="number"
                      {...register("price", { required: true })}
                      placeholder="VND"
                    />
                  </div>
                </Field>
                <Field>
                  <div className="space-y-2">
                    <Label className="text-green-600" htmlFor="totalAmount">
                      Tổng tiền: {formatVND(totalAmount)}
                    </Label>
                  </div>
                </Field>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-800"
                >
                  Tạo hóa đơn
                </Button>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
        {invoices.map((item) => (
          <div
            key={item._id}
            className="rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            {/* ID + Date */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="truncate max-w-[60%]">{item._id}</span>
              <span>
                {/* {new Date(item.createdAt).toLocaleDateString("vi-VN")} */}
                {new Date(item.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>

            {/* Company */}
            <div className="mt-1 text-base font-semibold text-foreground">
              {item.createdBy?.companyName}
            </div>

            {/* Product + Quantity */}
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-foreground">{item.productName}</span>
              <span className="text-muted-foreground">
                SL:{" "}
                <span className="font-medium text-foreground">
                  {item.quantity}
                </span>
              </span>
            </div>

            {/* Price + Total */}
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-muted-foreground">
                Đơn giá:{" "}
                <span className="font-medium text-foreground">
                  {formatVND(item.price)}
                </span>
              </span>

              <span className="font-semibold text-primary">
                Tổng: {formatVND(item.totalAmount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
