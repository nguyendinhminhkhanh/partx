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
interface Props {
  children: React.ReactNode;
  form: any;
}

export default function CreateInvoiceDialog({ children, form }: Props) {
  const {
    handleSubmit,
    onSubmit,
    register,
    fields,
    append,
    remove,
    setValue,
    keyCompanyName,
    setKeyCompanyName,
    handleCompanyChange,
    resutlFindCom,
    fileInputRef,
    preview,
    handleFileChange,
    handleRemoveImage,
    formatVND,
    totalAmount,
    isSubmitting,
  } = form;
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
