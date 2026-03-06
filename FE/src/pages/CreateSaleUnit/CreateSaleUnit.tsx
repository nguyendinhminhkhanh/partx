import { MainLayout } from "../../components/Layout";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
// import { useState } from "react";
import request from "../../api/request";
import { useForm } from "react-hook-form";

interface CreateSaleUnitFormData {
  companyName: string;
  address: string;
  phone: string;
  taxCode: string;
  email: string;
  website: string;
}
export default function CreateSaleUnit() {
  const { register, handleSubmit } = useForm<CreateSaleUnitFormData>();
  // const [formData, setFormData] = useState({
  //   companyName: "",
  //   address: "",
  //   phone: "",
  //   taxCode: "",
  //   email: "",
  //   website: "",
  //   image: null,
  // });

  // const handleChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  // ) => {
  //   const { name, value, files } = e.target as HTMLInputElement;

  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: files ? files[0] : value,
  //   }));
  // };

  const onSubmit = async (data: CreateSaleUnitFormData) => {
    const { companyName, address, phone, taxCode, email, website } = data;
    console.log("DATA SUBMIT:", data.companyName);
    try {
      const res = await request({
        method: "POST",
        url: "/saleunit/create",
        data: { companyName, address, phone, taxCode, email, website },
      });
      console.log("Sale unit created successfully:", res);
    } catch (error) {
      console.error("Error creating sale unit:", error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto mt-6 px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex justify-center pb-10"
        >
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Tạo đơn vị bán hàng
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* GRID FORM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên công ty */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Tên công ty</Label>
                  <Input
                    id="companyName"
                    {...register("companyName")}
                    placeholder="Tên công ty"
                  />
                </div>

                {/* SĐT */}
                <div className="space-y-2">
                  <Label htmlFor="phone">SĐT</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="Số điện thoại"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    {...register("email")}
                    placeholder="example@gmail.com"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...register("website")}
                    placeholder="example.com"
                  />
                </div>

                {/* Mã số thuế */}
                <div className="space-y-2">
                  <Label htmlFor="taxCode">Mã số thuế</Label>
                  <Input
                    id="taxCode"
                    {...register("taxCode")}
                    placeholder="Mã số thuế"
                  />
                </div>

                {/* Address full width */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Textarea
                    id="address"
                    {...register("address")}
                    placeholder="Địa chỉ"
                    className="min-h-[90px]"
                  />
                </div>

                {/* Image Upload */}
                {/* <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image">Logo / Image</Label>

                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted transition"
                  >
                    <span className="text-sm text-muted-foreground">
                      Click hoặc kéo ảnh vào đây
                    </span>

                    <span className="text-xs text-muted-foreground mt-1">
                      PNG, JPG tối đa 5MB
                    </span>
                  </label>

                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register("image")}
                  />
                </div> */}
              </div>

              {/* SUBMIT */}
              <Button type="submit" className="w-full md:w-auto">
                Lưu thông tin
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
