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
import { useRef, useState } from "react";
import request from "../../api/request";
export default function CreatePost() {
  const debounceRef = useRef<number | null>(null);
  const [checkComName, setCheckComName] = useState("");
  const [searchName, setSearchName] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    phone: "",
    taxCode: "",
    email: "",
    website: "",
    image: null,

    productCode: "",
    productName: "",
    quantity: "",
    price: "",
    totalAmount: "",
    guarantee: "",
  });

  // const handleCompanyNameChange = async (
  //   e: React.ChangeEvent<HTMLInputElement>,
  // ) => {
  //   const value = e.target.value;
  //   setSearchName(value);
  //   console.log("COMPANY NAME CHANGED:", value);
  //   if (!value) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       companyName: "",
  //       address: "",
  //       phone: "",
  //       taxCode: "",
  //       email: "",
  //       website: "",
  //     }));
  //     return;
  //   }
  //   try {
  //     const res = await request({
  //       method: "GET",
  //       url: `/saleunit/${value}`,
  //     });
  //     if (!res.data || res.data.length === 0) {
  //       console.log("No sales unit data found for company:", value);
  //       return;
  //     }
  //     setFormData((prev) => ({
  //       ...prev,
  //       companyName: res.data[0].companyName || "",
  //       address: res.data[0].address || "",
  //       phone: res.data[0].phone || "",
  //       taxCode: res.data[0].taxCode || "",
  //       email: res.data[0].email || "",
  //       website: res.data[0].website || "",
  //     }));
  //   } catch (error) {
  //     console.error("Error fetching sales unit data:", error);
  //   }
  // };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchName(value);

    // console.log("COMPANY NAME CHANGED:", value);

    // Clear debounce cũ
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Nếu input rỗng → reset form & không gọi API
    if (!value.trim()) {
      setFormData((prev) => ({
        ...prev,
        companyName: "",
        address: "",
        phone: "",
        taxCode: "",
        email: "",
        website: "",
      }));
      return;
    }

    // Debounce 1000ms
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await request({
          method: "GET",
          url: `/saleunit/${value}`,
        });

        if (!res.data || res.data.length === 0) {
          // console.log("No sales unit data found for:", value);
   
          console.log("No sales unit data found");
          return;
        }

        const company = res.data[0];
        // console.log("FETCHED COMPANY DATA:", company);
        setFormData((prev) => ({
          ...prev,
          companyName: company.companyName || "",
          address: company.address || "",
          phone: company.phone || "",
          taxCode: company.taxCode || "",
          email: company.email || "",
          website: company.website || "",
        }));
      } catch (error) {
        console.error("Error fetching sales unit data:", error);
      }
    }, 500); // ⏱️ 1000ms
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("FORM DATA:", formData);
    //luuw ys -->
    if(formData.companyName===""){
      setCheckComName("Không thể để trống tên công ty");
      console.log("CHECK COMPANY NAME:", checkComName);
      return;
    }
    setFormData({
      //saleunit
      companyName: "",
      address: "",
      phone: "",
      taxCode: "",
      email: "",
      website: "",
      image: null,

      //invoice
      productCode: "",
      productName: "",
      quantity: "",
      price: "",
      totalAmount: "",
      guarantee: "",
    });
  };

  return (
    <div className="containe mt-4">
      <form onSubmit={handleSubmit} className="flex justify-center mt-10 pb-10">
        <Card className="w-full ">
          <CardHeader>
            <CardTitle className="text-xl">Hóa đơn nhập hàng</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
              {/* //cột lớn 1   Thông tin bên bán hàng */}

              <div className="grid grid-cols-2 gap-4 bg-amber-200">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="searchName" className="">
                    Tìm kiếm đơn vị bán hàng
                  </Label>
                  <Input
                    name="searchName"
                    id="searchName"
                    value={searchName}
                    onChange={handleCompanyNameChange}
                    placeholder="Tên công ty"
                  />
                </div>
                {/* Tên công ty */}
                <div className="space-y-2">
                  <Label>Tên công ty: {formData.companyName}</Label>
                </div>
                {/* SĐT */}
                <div className="space-y-2">
                  <Label htmlFor="phone">SĐT</Label>
                  {!formData.phone ? (
                    <Input
                      name="phone"
                      type="number"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="SDT"
                    />
                  ) : (
                    formData.phone
                  )}
                  {/* <Input
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Số điện thoại"
                  /> */}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    name="email"
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    name="website"
                    id="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="example.com"
                  />
                </div>

                {/* Mã số thuế */}
                <div className="space-y-2">
                  <Label htmlFor="taxCode">Mã số thuế</Label>
                  <Input
                    name="taxCode"
                    id="taxCode"
                    value={formData.taxCode}
                    onChange={handleChange}
                    placeholder="Mã số thuế"
                  />
                </div>

                {/* Button thêm công ty  */}
                {/* <div className="space-y-2 pt-5">
                  <Button type="submit" className="w-full" >
                    Thêm
                  </Button>
                </div> */}

                {/* Địa chỉ – chiếm 2 cột */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Textarea
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Địa chỉ"
                  />
                </div>
              </div>

              {/* //cột lớn 2 Thông tin sản phẩm */}
              <div className="grid grid-cols-2 gap-4 bg-amber-700/20">
                {/* Mã sản phẩm */}
                <div className="space-y-2">
                  <Label htmlFor="productCode">Mã sản phẩm</Label>
                  <Input
                    name="productCode"
                    id="productCode"
                    value={formData.productCode}
                    onChange={handleChange}
                    placeholder="Mã sản phẩm"
                  />
                </div>

                {/* Tển sản phẩm */}
                <div className="space-y-2">
                  <Label htmlFor="productName">Tên sản phẩm</Label>
                  <Input
                    name="productName"
                    id="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="Tên sản phẩm"
                  />
                </div>

                {/* Số lượng */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Số lượng</Label>
                  <Input
                    name="quantity"
                    type="number"
                    id="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Số lượng"
                  />
                </div>

                {/* Giá */}
                <div className="space-y-2">
                  <Label htmlFor="price">Giá</Label>
                  <Input
                    name="price"
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="VNĐ"
                  />
                </div>

                {/* Tổng Tiền */}
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Tổng tiền</Label>

                  <Input
                    name="totalAmount"
                    type="number"
                    id="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    placeholder="VNĐ"
                  />
                </div>

                {/* Bảo hành */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="guarantee">Bảo hành (Tháng)</Label>
                  <Input
                    name="guarantee"
                    type="number"
                    id="guarantee"
                    value={formData.guarantee}
                    onChange={handleChange}
                    placeholder="Tháng"
                  />
                </div>
              </div>

              {/* Image upload – chiếm 2 cột */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image">Image</Label>

                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted transition"
                >
                  <span className="text-sm text-muted-foreground">
                    Click to upload image
                  </span>
                </label>

                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Submit – full width */}
              <div className="md:col-span-2">
                <Button type="submit" className="w-full">
                  Lưu thông tin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
