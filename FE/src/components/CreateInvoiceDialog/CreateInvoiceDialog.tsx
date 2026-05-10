import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Field, FieldGroup } from "../../components/ui/field";
import { Command, CommandItem, CommandList } from "../../components/ui/command";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { X, Plus } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import request from "../../api/request";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
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
export default function CreateInvoiceDialog({ children }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const { register, handleSubmit, reset, setValue, watch, control } =
    useForm<Invoice>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    try {
      setIsSubmitting(true);
      const { items, createdBy } = data;
      const imageUrl = await uploadImage();
      console.log({ imageUrl, createdBy, items });
      const res = await request({
        method: "POST",
        url: "/invoice/create",
        data: {
          imageUrl,
          createdBy,
          items,
        },
      });
      if (res.success) {
        reset();
        setKeyCompanyName("");
        setResultFindCom([]);
        toast.success("Tạo hóa đơn thành công");
        setTimeout(() => {
          navigate(0);
        }, 500);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-green-600">Tạo hóa đơn</DialogTitle>
          <DialogDescription>Hóa đơn nhập hàng</DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                    <button type="button" onClick={handleRemoveImage}>
                      <X />
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
            <div className="space-y-4">
              <h3 className="font-semibold">Danh sách sản phẩm</h3>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Sản phẩm {index + 1}</p>

                    {fields.length > 1 && (
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => remove(index)}
                      >
                        <X />
                      </button>
                    )}
                  </div>

                  <Input
                    placeholder="Tên sản phẩm"
                    {...register(`items.${index}.productName`, {
                      required: true,
                    })}
                  />

                  <Input
                    type="number"
                    placeholder="Bảo hành (tháng)"
                    {...register(`items.${index}.guarantee`)}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Số lượng"
                      {...register(`items.${index}.quantity`)}
                    />

                    <Input
                      type="number"
                      placeholder="Giá"
                      {...register(`items.${index}.price`)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  productName: "",
                  guarantee: undefined,
                  quantity: undefined,
                  price: undefined,
                })
              }
            >
              <Plus /> Thêm sản phẩm
            </Button>

            <Field>
              <div className="flex justify-between items-center border-t pt-4">
                <p className="text-muted-foreground">Tổng tiền:</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatVND(totalAmount)}
                </p>
              </div>
            </Field>

            {isSubmitting ? (
              <div className="flex justify-end">
                <Button variant="secondary" disabled>
                  Đang tạo...
                  <Spinner data-icon="inline-start" />
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-800 w-full md:w-auto"
                >
                  Tạo hóa đơn
                </Button>
              </div>
            )}
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
