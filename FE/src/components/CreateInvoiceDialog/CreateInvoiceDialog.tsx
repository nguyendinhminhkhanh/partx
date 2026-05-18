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
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { PriceInput } from "../ui/price-input";
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

  const MAX_SIZE_MB = 5; // Giới hạn sau khi nén
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // Nén ảnh bằng Canvas nếu vượt quá giới hạn
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;

        // Giảm kích thước nếu quá lớn
        const MAX_DIM = 1920;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Không thể xử lý ảnh"));
        ctx.drawImage(img, 0, 0, width, height);

        // Thử nén với quality giảm dần cho đến khi đủ nhỏ
        const tryCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Không thể nén ảnh"));
              if (blob.size <= MAX_SIZE_BYTES || quality <= 0.1) {
                const compressed = new File([blob], file.name, { type: "image/jpeg" });
                resolve(compressed);
              } else {
                tryCompress(Math.max(quality - 0.1, 0.1));
              }
            },
            "image/jpeg",
            quality,
          );
        };
        tryCompress(0.8);
      };
      img.onerror = () => reject(new Error("Không thể đọc file ảnh"));
      img.src = url;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const WARN_SIZE_MB = 10;
    if (file.size > WARN_SIZE_MB * 1024 * 1024) {
      toast.warning(`Ảnh lớn hơn ${WARN_SIZE_MB}MB, đang nén lại...`);
    }

    try {
      const processed = file.size > MAX_SIZE_BYTES
        ? await compressImage(file)
        : file;

      const sizeMB = (processed.size / 1024 / 1024).toFixed(1);
      if (processed !== file) {
        toast.success(`Đã nén ảnh xuống còn ${sizeMB}MB`);
      }

      setImageFile(processed);
      setPreview(URL.createObjectURL(processed));
    } catch (err) {
      toast.error("Không thể xử lý ảnh, vui lòng chọn ảnh khác");
    }
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

  const watchedItems = watch("items");
  const totalAmount = (watchedItems ?? []).reduce((sum, item) => {
    return sum + (Number(item?.quantity) || 0) * (Number(item?.price) || 0);
  }, 0);

  const formatVND = (value: number) => {
    return value?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const [keyCompanyName, setKeyCompanyName] = useState("");
  const [resutlFindCom, setResultFindCom] = useState<any[]>([]);
  // true khi người dùng gõ tên nhưng chưa chọn từ danh sách
  const [isNewCompany, setIsNewCompany] = useState(false);

  const handleCompanyChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setKeyCompanyName(value);
    // Người dùng đang gõ → chưa chọn từ danh sách → đánh dấu là công ty mới
    setIsNewCompany(true);
    if (!value.trim()) {
      setResultFindCom([]);
      setIsNewCompany(false);
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
  const uploadImage = async (): Promise<string | undefined> => {
    if (!imageFile) return undefined;
    const formData = new FormData();
    formData.append("file", imageFile);
    const res = await request({
      method: "POST",
      url: "/upload",
      data: formData,
    });
    return res.url;
  };

  const onSubmit = async (data: Invoice) => {
    try {
      setIsSubmitting(true);
      const { items } = data;
      let { createdBy } = data;

      // Nếu người dùng gõ tên công ty mới (không chọn từ danh sách) → tạo SaleUnit trước
      if (isNewCompany && keyCompanyName.trim()) {
        try {
          const newUnit = await request({
            method: "POST",
            url: "/saleunit/create",
            data: { companyName: keyCompanyName.trim() },
          });
          createdBy = newUnit.data._id;
          toast.info(`Đã tạo công ty "${keyCompanyName.trim()}"`);
        } catch (err: any) {
          // 409: công ty đã tồn tại → tìm và lấy _id
          if (err?.response?.status === 409 || err?.status === 409) {
            const found = await request({
              method: "GET",
              url: `/saleunit/${keyCompanyName.trim()}`,
            });
            if (found.data && found.data.length > 0) {
              createdBy = found.data[0]._id;
            } else {
              toast.error("Không tìm thấy công ty, vui lòng thử lại");
              return;
            }
          } else {
            toast.error("Không thể tạo công ty, vui lòng thử lại");
            return;
          }
        }
      }

      if (!createdBy) {
        toast.error("Vui lòng chọn hoặc nhập tên công ty");
        return;
      }

      const imageUrl = await uploadImage();
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
        setIsNewCompany(false);
        toast.success("Tạo hóa đơn thành công");
        setTimeout(() => {
          navigate(0);
        }, 500);
      }
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
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
              <div className="relative">
                <Input
                  placeholder="Tìm công ty..."
                  value={keyCompanyName}
                  onChange={handleCompanyChange}
                />
                {isNewCompany && keyCompanyName.trim() && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-amber-100 text-amber-700 border border-amber-300 rounded px-1.5 py-0.5">
                    Tạo mới
                  </span>
                )}
              </div>
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
                      setIsNewCompany(false); // đã chọn từ danh sách → không tạo mới
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

                  <div className="space-y-1">
                    <Label htmlFor={`items.${index}.productName`}>Tên sản phẩm</Label>
                    <Input
                      id={`items.${index}.productName`}
                      placeholder="Tên sản phẩm"
                      {...register(`items.${index}.productName`, {
                        required: true,
                      })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`items.${index}.guarantee`}>Bảo hành (tháng)</Label>
                    <Input
                      id={`items.${index}.guarantee`}
                      type="number"
                      placeholder="Số tháng bảo hành"
                      {...register(`items.${index}.guarantee`)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor={`items.${index}.quantity`}>Số lượng</Label>
                      <Controller
                        control={control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <PriceInput
                            id={`items.${index}.quantity`}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="0"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`items.${index}.price`}>Đơn giá</Label>
                      <Controller
                        control={control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <PriceInput
                            id={`items.${index}.price`}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="0"
                            showCurrency
                          />
                        )}
                      />
                    </div>
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
