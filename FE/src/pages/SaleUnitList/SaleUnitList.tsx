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

interface SaleUnit {
  _id: string;
  companyName: string;
  address: string;
  taxCode: string;
  email: string;
  website: string;
  phone: number;
}
export default function SaleUnitList() {
  const [saleUnits, setSaleUnits] = useState<SaleUnit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, watch } =
    useForm<SaleUnit>();
  const onSubmit = async (data: SaleUnit) => {
    const { companyName, address, taxCode, email, website, phone } = data;
    try {
      const res = await request({
        method: "POST",
        url: "/saleunit/create",
        data: { companyName, address, taxCode, email, website, phone },
      });
      if (res.success) {
        // 1. reset form
        reset();

        // 3. đóng form
        // setOpen(false);

        // 4. chuyển trang
        toast.success("Tạo đơn vị bán hàng thành công!");
        setIsSubmitting(false);
        setTimeout(() => {
          navigate(0);
        }, 500);
      }
    } catch (error) {
      console.log("Lỗi thêm đơn vị bán hàng:", error);
    }
  };

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
        <Dialog>
          <div className="flex justify-end m-4 text-sm">
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-800">
                Thêm đơn vị bán hàng
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className=" w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-green-600">
                Thêm đơn vị bán hàng
              </DialogTitle>
              <DialogDescription>Thông tin đơn vị bán hàng</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <Label htmlFor="companyName">Tên công ty:</Label>
                  <Input
                    id="companyName"
                    {...register("companyName", { required: true })}
                    placeholder="Tên công ty"
                  />
                </Field>
                <Field>
                  <Label htmlFor="address">Địa chỉ:</Label>
                  <Input
                    id="address"
                    {...register("address", { required: true })}
                    placeholder="Địa chỉ"
                  />
                </Field>
                <Field className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email:</Label>
                    <Input
                      id="email"
                      {...register("email")}
                      placeholder="example@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone:</Label>
                    <Input
                      id="phone"
                      type="text"
                      {...register("phone", { required: true })}
                      placeholder="+84"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website:</Label>
                    <Input
                      id="website"
                      type="text"
                      {...register("website")}
                      placeholder="https://wwww"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxCode">Mã số thuế:</Label>
                    <Input
                      id="taxCode"
                      type="text"
                      {...register("taxCode")}
                      placeholder="xxxx"
                    />
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
                    {isSubmitting ? "Đang tạo..." : "Tạo"}
                  </Button>
                )}
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
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
              <DialogTitle className="text-green-600">
                Thêm đơn vị bán hàng
              </DialogTitle>
              <DialogDescription>Thông tin đơn vị bán hàng</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <Label htmlFor="companyName">Tên công ty:</Label>
                  <Input
                    id="companyName"
                    {...register("companyName", { required: true })}
                    placeholder="Tên công ty"
                  />
                </Field>
                <Field>
                  <Label htmlFor="address">Địa chỉ:</Label>
                  <Input
                    id="address"
                    {...register("address", { required: true })}
                    placeholder="Địa chỉ"
                  />
                </Field>
                <Field className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email:</Label>
                    <Input
                      id="email"
                      {...register("email")}
                      placeholder="example@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone:</Label>
                    <Input
                      id="phone"
                      type="number"
                      {...register("phone", { required: true })}
                      placeholder="+84 "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website:</Label>
                    <Input
                      id="website"
                      type="text"
                      {...register("website")}
                      placeholder="https://... "
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxCode">Mã số thuế:</Label>
                    <Input
                      id="taxCode"
                      type="text"
                      {...register("taxCode")}
                      placeholder="xxxx"
                    />
                  </div>
                </Field>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang tạo..." : "Tạo"}
                </Button>
              </FieldGroup>
            </form>
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
              <span className="truncate max-w-[60%]">{item.phone}</span>
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
