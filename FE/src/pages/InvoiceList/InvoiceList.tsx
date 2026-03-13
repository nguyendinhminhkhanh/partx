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
import { useFieldArray, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import request from "../../api/request";
// import { toast } from "sonner";
import { useNavigate } from "react-router";
import { toast } from "sonner";
// import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import ActionMenu from "../../components/ActionMenu";
import { Plus } from "lucide-react";

import CreateInvoiceDialog from "../../components/CreateInvoiceDialog";

interface InvoiceItem {
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

  const { register, handleSubmit, reset, setValue, watch, control } =
    useForm<Invoice>({
      defaultValues: {
        items: [
          {
            productName: "",
            guarantee: undefined,
            quantity: undefined,
            price: undefined,
          },
        ],
      },
    });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

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

  const handleEdit = async (id: string) => {
    console.log("Edit Invoice:", id);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("Delete Invoice:", id);

      // 1. Lấy invoice
      const invoice = await request.get(`/invoice/${id}`);
      const imageUrl = invoice.data.imageUrl;

      // 2. Xoá ảnh Cloudinary (nếu có)
      if (imageUrl) {
        const deleteImage = await request.delete("/upload", {
          data: { imageUrl },
        });
        console.log("Delete image result:", deleteImage);
      }

      // 3. Xoá invoice
      await request.delete(`/invoice/${id}`);

      toast.success("Đã xoá hoá đơn nhập hàng!");

      setTimeout(() => {
        navigate(0);
      }, 500);
    } catch (error) {
      console.log("Lỗi xóa Invoice:", error);
      toast.error("Xóa hóa đơn thất bại!");
    }
  };

  return (
    <MainLayout>
      <div className="hidden md:block">
        <Dialog>
          <div className="flex justify-end m-4 text-sm">
            <DialogTrigger asChild>
              <CreateInvoiceDialog
                form={{
                  handleSubmit,
                  onSubmit,
                  register,
                  fields,
                  append,
                  remove,
                  setValue,
                  keyCompanyName,
                  handleCompanyChange,
                  resutlFindCom,
                  fileInputRef,
                  preview,
                  handleFileChange,
                  handleRemoveImage,
                  formatVND,
                  totalAmount,
                  isSubmitting,
                }}
              >
                <Button className="bg-green-600 hover:bg-green-800">
                  <Plus /> Tạo Hóa Đơn
                </Button>
              </CreateInvoiceDialog>
            </DialogTrigger>
          </div>
        </Dialog>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã HĐ</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Đơn vị bán hàng</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead></TableHead>
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
                <TableCell>
                  <div className="flex flex-col">
                    {item.items?.map((i, index) => (
                      <span key={index} className="truncate">
                        {i.productName}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatVND(item.totalAmount)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ActionMenu
                    onEdit={() => handleEdit(item._id)}
                    onDelete={() => handleDelete(item._id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* //mobile */}
      <div className="md:hidden space-y-3 m-3">
        <Dialog>
          <div className="">
            <DialogTrigger asChild>
              <CreateInvoiceDialog
                form={{
                  handleSubmit,
                  onSubmit,
                  register,
                  fields,
                  append,
                  remove,
                  setValue,
                  keyCompanyName,
                  handleCompanyChange,
                  resutlFindCom,
                  fileInputRef,
                  preview,
                  handleFileChange,
                  handleRemoveImage,
                  formatVND,
                  totalAmount,
                  isSubmitting,
                }}
              >
                <Button className="bg-green-600 w-full">
                  {" "}
                  <Plus /> Tạo Hóa Đơn
                </Button>
              </CreateInvoiceDialog>
            </DialogTrigger>
          </div>
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
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col text-sm text-muted-foreground">
                <span className="font-medium text-foreground truncate">
                  {item._id}
                </span>
                <span>
                  {/* {new Date(item.createdAt).toLocaleDateString("vi-VN")} */}
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <ActionMenu
                  onEdit={() => handleEdit(item._id)}
                  onDelete={() => handleDelete(item._id)}
                />
              </div>
            </div>

            {/* Company */}
            <div className="mt-1 text-base font-semibold text-foreground">
              {item.createdBy?.companyName}
            </div>

            {/* Product + Quantity */}
            {item.items.map((product) => (
              <div key={product._id} className="flex justify-between text-sm">
                <span className="text-foreground truncate  max-w-[70%]">
                  {product.productName}
                </span>
                <span className="font-medium text-foreground">
                  x{product.quantity}
                </span>
              </div>
            ))}

            {/* Price + Total */}
            <div className="flex justify-between mt-3 text-sm">
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
                <div className="space-y-4 mt-4 text-sm">
                  <div className="space-y-1 md:flex md:items-center md:gap-2 md:space-y-0">
                    <p className="text-muted-foreground">Mã hóa đơn:</p>
                    <p className="font-medium break-words">
                      {selectedInvoice._id}
                    </p>
                  </div>
                  <div className="space-y-1 md:flex md:items-center md:gap-2 md:space-y-0">
                    <p className="text-muted-foreground">Đơn vị bán:</p>
                    <p className="font-medium break-words">
                      {selectedInvoice.createdBy?.companyName}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="font-semibold mb-2">Danh sách sản phẩm</p>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Mã SP</th>
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
                              <td className="p-2">{item.productCode}</td>

                              <td className="p-2">{item.productName}</td>

                              <td className="p-2 text-center">
                                {item.quantity}
                              </td>

                              <td className="p-2 text-right">
                                {formatVND(item.price)}
                              </td>

                              <td className="p-2 text-right font-medium text-green-600">
                                {formatVND(item.total)}
                              </td>

                              <td className="p-2 text-center">
                                {item.guarantee} T
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground">
                      Tổng tiền:{" "}
                      <span className="font-semibold text-green-600">
                        {formatVND(selectedInvoice.totalAmount)}
                      </span>
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
