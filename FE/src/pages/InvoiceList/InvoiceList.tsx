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
import { useEffect, useRef, useState } from "react";
import request from "../../api/request";
// import { toast } from "sonner";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router";
import { toast } from "sonner";
// import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";

interface Invoice {
  _id: string;
  productCode: string;
  imageUrl: string;
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const [openDetail, setOpenDetail] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const { register, handleSubmit, reset, setValue, watch } = useForm<Invoice>();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // const imageFile = watch("imageUrl");

  // const previewImage = useMemo(() => {
  //   if (!imageFile || imageFile.length === 0) return null;
  //   return URL.createObjectURL(imageFile[0]);
  // }, [imageFile]);

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
        // console.log("danh sach hao donw ", res.data);
      } catch (error) {
        console.log("Lỗi lấy hóa đơn!!!", error);
      }
    };
    fetchInvoice();
  }, []);

  //button clear imagr
  const handleRemoveImage = () => {
    setPreview(null);
    setImageFile(null);

    // reset input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // upload image function cloudinary
  const uploadImage = async () => {
    const formData = new FormData();
    if (imageFile) {
      formData.append("file", imageFile);
      try {
        const res = await request({
          method: "POST",
          url: "/upload",
          data: formData,
        });
        return res.url;
      } catch (error) {
        console.log(error);
      }
      // console.log("Image name:", imageFile.name);
      // console.log("Image size:", imageFile.size);
      // console.log("Image type:", imageFile.type);
    }
  };

  const onSubmit = async (data: Invoice) => {
    setIsSubmitting(true);
    const { productName, quantity, price, guarantee, createdBy } = data;
    const imageUrl = await uploadImage();

    console.log(imageUrl, productName, quantity, price, guarantee, createdBy);
    // upload file image
    // console.log("Image file:", imageFile);
    // const formData = new FormData();
    // if (imageFile) {
    //   formData.append("file", imageFile);
    //   try {
    //     const res = await request({
    //       method: "POST",
    //       url: "/upload",
    //       data: formData,
    //     });
    //     console.log("Image Url: ", res);

    //   } catch (error) {
    //     console.log(error);
    //   }
    //   // console.log("Image name:", imageFile.name);
    //   // console.log("Image size:", imageFile.size);
    //   // console.log("Image type:", imageFile.type);
    // }

    try {
      const res = await request({
        method: "POST",
        url: "/invoice/create",
        data: { imageUrl, productName, quantity, price, guarantee, createdBy },
      });
      if (res.success) {
        // 1. reset form
        reset();

        // 2. reset các state phụ
        setKeyCompanyName("");
        setResultFindCom([]);

        // 3. đóng form
        // setOpen(false);

        // 4. chuyển trang
        toast.success("Tạo hóa đơn thành công");
        setIsSubmitting(false);
        setTimeout(() => {
          navigate(0);
        }, 500);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MainLayout>
      <div className="hidden md:block">
        <Dialog>
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

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  {preview ? (
                    <div style={{ marginTop: 20 }}>
                      <img src={preview} alt="preview" width="200" />

                      <div style={{ marginTop: 10 }}>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className=" bg-black bg-opacity-60 text-white rounded-full px-2"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted transition"
                      >
                        {/* {previewImage ? (
                      <img
                        src={previewImage}
                        alt="preview"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                    ) : ( */}
                        <span className="text-sm text-muted-foreground">
                          Click to upload image
                        </span>
                        {/* )} */}
                      </label>
                    </button>
                  )}
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
                    type="number"
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

                {isSubmitting ? (
                  <Button variant="secondary" disabled>
                    Đang tạo...
                    <Spinner data-icon="inline-start" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-800"
                  >
                    Tạo hóa đơn
                  </Button>
                )}
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
              <TableRow
                key={item._id}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedInvoice(item);
                  setOpenDetail(true);
                }}
              >
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
        <Dialog
        //  open={open} onOpenChange={setOpen}
        >
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

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  {preview ? (
                    <div style={{ marginTop: 20 }}>
                      <img src={preview} alt="preview" width="200" />

                      <div style={{ marginTop: 10 }}>
                        <Button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-1 text-white rounded"
                        >
                          Hủy ảnh
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted transition"
                      >
                        <span className="text-sm text-muted-foreground">
                          Click to upload image
                        </span>
                      </label>
                    </button>
                  )}
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
                    type="number"
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

        {invoices.map((item) => (
          <div
            key={item._id}
            onClick={() => {
              setSelectedInvoice(item);
              setOpenDetail(true);
            }}
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

      {/* //chi tiết sản phẩm */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] p-0">
          <ScrollArea className="max-h-[90vh] p-6 md:pr-4">
            {selectedInvoice && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl font-semibold text-center md:text-left">
                    Chi tiết hóa đơn
                  </DialogTitle>

                  <DialogDescription className="text-sm text-center md:text-left w-full">
                    <span className="font-medium text-primary break-all">
                      {new Date(selectedInvoice.createdAt).toLocaleString(
                        "vi-VN",
                      )}
                    </span>
                  </DialogDescription>
                </DialogHeader>

                {/* IMAGE */}
                <div className="mt-4 flex justify-center">
                  <img
                    src={selectedInvoice.imageUrl}
                    alt={selectedInvoice.productName}
                    className="max-h-[60vh] w-auto object-contain rounded-lg border shadow-sm"
                  />
                </div>

                {/* INFO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Mã hóa đơn</p>
                    <p className="font-medium break-all">
                      {selectedInvoice._id}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground">Đơn vị bán</p>
                    <p className="font-medium break-words">
                      {selectedInvoice.createdBy?.companyName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground">Sản phẩm</p>
                    <p className="font-medium break-words">
                      {selectedInvoice.productName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground">Số lượng</p>
                    <p className="font-medium">{selectedInvoice.quantity}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground">Đơn giá</p>
                    <p className="font-medium">
                      {formatVND(selectedInvoice.price)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground">Tổng tiền</p>
                    <p className="font-semibold text-green-600">
                      {formatVND(selectedInvoice.totalAmount)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
