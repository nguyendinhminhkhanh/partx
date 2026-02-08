import { useMemo, useState } from "react";
import { MainLayout } from "../components/Layout";
import { Button } from "../components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Field, FieldGroup } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
// mock/companies.ts
export const MOCK_COMPANIES = [
  {
    _id: "c1",
    name: "Công ty TNHH Thành Đạt",
    address: "Quận 1, TP.HCM",
  },
  {
    _id: "c2",
    name: "Công ty CP Công Nghệ Sao Việt",
    address: "Quận Cầu Giấy, Hà Nội",
  },
  {
    _id: "c3",
    name: "Cửa hàng máy tính Minh Phát",
    address: "Thủ Đức, TP.HCM",
  },
  {
    _id: "c4",
    name: "Công ty Phần Mềm Ánh Dương",
    address: "Đà Nẵng",
  },
  {
    _id: "c5",
    name: "Công ty Thương Mại Hoàng Long",
    address: "Bình Dương",
  },
];

export default function PageTest() {
  const [companyName, setCompanyName] = useState("");
  const results = useMemo(() => {
    if (!companyName.trim()) return [];

    return MOCK_COMPANIES.filter((c) =>
      c.name.toLowerCase().includes(companyName.toLowerCase()),
    );
  }, [companyName]);
  return (
    <MainLayout>
      <Dialog>
        <form>
          <div className="flex justify-end m-4 text-sm">
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-800">
                Tạo Hóa Đơn
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className=" w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg">
            <DialogHeader>
              <DialogTitle>Tạo hóa đơn</DialogTitle>
              <DialogDescription>Hóa đơn nhập hàng</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Label htmlFor="companyName">Đơn vị bán hàng:</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Tên công ty"
                />
              </Field>
              
              <Command className="border rounded-md">
                <CommandInput
                  placeholder="Tìm công ty..."
                  value={companyName}
                  onValueChange={setCompanyName}
                />

                <CommandList>
                  {results.length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      Không tìm thấy công ty
                    </p>
                  )}

                  {results.map((c) => (
                    <CommandItem
                      key={c._id}
                      onSelect={() => {
                        setCompanyName(c.name);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.address}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>

              <Field>
                <Label htmlFor="productName">Sản phẩm:</Label>
                <Input
                  id="productName"
                  name="productName"
                  placeholder="Tên sản phẩm"
                />
              </Field>
              <Field>
                <Label htmlFor="guarantee">Bảo hành:</Label>
                <Input id="guarantee" name="guarantee" placeholder="Tháng" />
              </Field>
              <Field className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Số lượng:</Label>
                  <Input id="quantity" name="quantity" placeholder="Số lượng" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Giá:</Label>
                  <Input id="price" name="price" placeholder="VND" />
                </div>
              </Field>
              <Field>
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Tổng tiền: </Label>
                  {/* <Input
                    id="totalAmount"
                    name="totalAmount"
                    placeholder="VND"
                  /> */}
                </div>
              </Field>

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
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" className="bg-green-600 hover:bg-green-800">
                Tạo hóa đơn
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </MainLayout>
  );
}
