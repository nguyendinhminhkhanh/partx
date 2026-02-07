import { MainLayout } from "../../components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useEffect, useState } from "react";
import request from "../../api/request";
// "_id": "697a2d8662f992fad52b561f",
// "productCode": "",
// "productName": "RAM đồng bộ DDR4 4G",
// "quantity": 9,
// "price": 280000,
// "totalAmount": 2520000,
// "guarantee": 1,
// "createdBy": {
//     "_id": "697a26073c7ee231f34c1442",
//     "companyName": "Công ty TNHH Máy Tính Đỗ Phong",
//     "address": "Số 60 Ngõ 181 Trường Chinh, Phương Liệt- Hà Nội",
//     "taxCode": "0109967349",
//     "email": "",
//     "website": "dophongpc.com",
//     "phone": "0965567124",
//     "createdAt": "2026-01-28T15:06:47.820Z",
//     "updatedAt": "2026-01-28T15:06:47.820Z",
//     "__v": 0
// },
// "createdAt": "2026-01-28T15:38:46.901Z",
// "updatedAt": "2026-01-28T15:38:46.901Z",
// "__v": 0
interface Invoice {
  _id: string;
  productCode: string;
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
  createdAt?: string;
  // bạn có thể thêm các field khác nếu cần
}
export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const formatVND = (value: number) => {
    return value?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await request({
          method: "GET",
          url: "/invoice",
        });
        setInvoices(res.data);
        console.log("danh sach hao donw ", res.data);
      } catch (error) {
        console.log("Lỗi lấy hóa đơn!!!", error);
      }
    };
    fetchInvoice();
  }, []);
  //   const invoices = [
  //     {
  //       id: "HD001",
  //       customer: "Công ty A",
  //       total: "12.000.000đ",
  //       date: "01/02/2026",
  //     },
  //     {
  //       id: "HD002",
  //       customer: "Công ty B",
  //       total: "8.500.000đ",
  //       price: "8.500.000đ",
  //       date: "02/02/2026",
  //     },
  //   ];
  //   console.log(invoices);

  return (
    <MainLayout>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã HĐ</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Đơn giá</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {invoices.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell className="text-right">{item.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {invoices.map((item) => (
          <div
            key={item._id}
            className="rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            {/* ID + Date */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="truncate max-w-[60%]">{item._id}</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
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
    </MainLayout>
  );
}
