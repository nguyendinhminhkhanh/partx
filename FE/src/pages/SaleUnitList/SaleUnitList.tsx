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

interface SaleUnitList {
  _id: string;
  companyName: string;
  address: string;
  taxCode: string;
  email: string;
  website: number;
  phone: number;
  createdAt: string;
}
export default function SaleUnitList() {
  const [saleUnits, setSaleUnits] = useState<SaleUnitList[]>([]);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await request({
          method: "GET",
          url: "/saleunit",
        });
        setSaleUnits(res.data);
        // console.log("danh sach hao donw ", res.data);
      } catch (error) {
        console.log("Lỗi lấy hóa đơn!!!", error);
      }
    };
    fetchInvoice();
  }, []);
  return (
    <MainLayout>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Đơn vị bán hàng</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>SDT</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {saleUnits.map((item) => (
              <TableRow
                key={item._id}
                className="cursor-pointer"
                // onClick={() => {
                //   setSelectedInvoice(item);
                //   setOpenDetail(true);
                // }}
              >
                <TableCell>
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </TableCell>
                <TableCell>{item.companyName}</TableCell>
                <TableCell>{item.address}</TableCell>
                <TableCell>{item.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3 m-3">
        <Dialog
        //  open={open} onOpenChange={setOpen}
        >
          <div className="">
            <DialogTrigger asChild>
              <Button className="bg-green-600 ">Thêm đơn vị bán hàng</Button>
            </DialogTrigger>
          </div>
          <DialogContent className=" w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-green-600">Thêm đơn vị bán hàng</DialogTitle>
              <DialogDescription>Hóa đơn nhập hàng</DialogDescription>
            </DialogHeader>
            {/* <form onSubmit={handleSubmit(onSubmit)}>
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
            </form> */}
          </DialogContent>
        </Dialog>

        {saleUnits.map((item) => (
          <div
            key={item._id}
            // onClick={() => {
            //   setSelectedInvoice(item);
            //   setOpenDetail(true);
            // }}
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
              {item.companyName}
            </div>

            {/* Product + Quantity */}
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-foreground">{item.address}</span>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
