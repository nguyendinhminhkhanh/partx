interface SaleInvoiceItem {
  productCode?: string;
  productName: string;
  quantity?: number;
  price?: number;
  total?: number;
  guarantee?: number;
}

interface SaleInvoice {
  _id: string;
  buyerName: string;
  buyerPhone?: string;
  buyerAddress?: string;
  items?: SaleInvoiceItem[];
  totalAmount: number;
  note?: string;
  createdAt: string;
}

function formatVND(value: number) {
  return value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export function exportSaleInvoiceCSV(invoice: SaleInvoice) {
  const rows: string[][] = [];

  rows.push(["Mã hóa đơn", invoice._id]);
  rows.push(["Người mua", invoice.buyerName]);
  rows.push(["SĐT", invoice.buyerPhone ?? ""]);
  rows.push(["Địa chỉ", invoice.buyerAddress ?? ""]);
  rows.push(["Ngày tạo", new Date(invoice.createdAt).toLocaleString("vi-VN")]);
  if (invoice.note) rows.push(["Ghi chú", invoice.note]);
  rows.push([]);
  rows.push(["Tên sản phẩm", "Mã SP", "Số lượng", "Đơn giá", "Thành tiền", "Bảo hành (tháng)"]);

  invoice.items?.forEach((item) => {
    rows.push([
      item.productName,
      item.productCode ?? "",
      String(item.quantity ?? 0),
      String(item.price ?? 0),
      String(item.total ?? 0),
      String(item.guarantee ?? 0),
    ]);
  });

  rows.push([]);
  rows.push(["Tổng tiền", String(invoice.totalAmount)]);

  const csv =
    "\uFEFF" +
    rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hoadon_xuat_${invoice._id.slice(-6)}_${new Date(invoice.createdAt).toLocaleDateString("vi-VN").replace(/\//g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printSaleInvoice(invoice: SaleInvoice) {
  const itemRows = (invoice.items ?? [])
    .map(
      (item, i) => `
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:8px 12px">${i + 1}</td>
        <td style="padding:8px 12px">${item.productName}</td>
        <td style="padding:8px 12px;text-align:center">${item.productCode ?? "—"}</td>
        <td style="padding:8px 12px;text-align:center">${item.quantity ?? 0}</td>
        <td style="padding:8px 12px;text-align:right">${formatVND(item.price ?? 0)}</td>
        <td style="padding:8px 12px;text-align:right;color:#16a34a;font-weight:600">${formatVND(item.total ?? 0)}</td>
        <td style="padding:8px 12px;text-align:center">${item.guarantee ?? 0} tháng</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <title>Hóa đơn xuất ${invoice._id.slice(-6)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 32px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .brand { font-size: 22px; font-weight: 700; color: #16a34a; letter-spacing: -0.5px; }
    .brand span { color: #111; }
    .badge { display: inline-block; background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 6px; padding: 2px 10px; font-size: 11px; font-weight: 600; margin-top: 6px; }
    .invoice-title { font-size: 28px; font-weight: 700; color: #111; text-align: right; }
    .invoice-meta { text-align: right; color: #6b7280; margin-top: 4px; font-size: 12px; }
    .divider { border: none; border-top: 2px solid #e5e7eb; margin: 20px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .info-block label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; display: block; margin-bottom: 4px; }
    .info-block p { font-weight: 600; font-size: 14px; }
    .info-block .sub { font-weight: 400; font-size: 12px; color: #6b7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f9fafb; }
    thead th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    .total-row { display: flex; justify-content: flex-end; }
    .total-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 24px; min-width: 240px; }
    .total-box .label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .total-box .amount { font-size: 22px; font-weight: 700; color: #16a34a; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; }
    @media print { body { padding: 16px; } @page { margin: 16mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Part<span>X</span></div>
      <div class="badge">HÓA ĐƠN XUẤT HÀNG</div>
    </div>
    <div>
      <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>
      <div class="invoice-meta">#${invoice._id.slice(-8).toUpperCase()}</div>
      <div class="invoice-meta">${new Date(invoice.createdAt).toLocaleString("vi-VN")}</div>
    </div>
  </div>

  <hr class="divider"/>

  <div class="info-grid">
    <div class="info-block">
      <label>Người mua</label>
      <p>${invoice.buyerName}</p>
      ${invoice.buyerPhone ? `<p class="sub">📞 ${invoice.buyerPhone}</p>` : ""}
      ${invoice.buyerAddress ? `<p class="sub">📍 ${invoice.buyerAddress}</p>` : ""}
    </div>
    <div class="info-block" style="text-align:right">
      <label>Mã hóa đơn</label>
      <p style="font-size:12px;font-family:monospace">${invoice._id}</p>
      ${invoice.note ? `<p class="sub" style="margin-top:8px">Ghi chú: ${invoice.note}</p>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:36px">#</th>
        <th>Tên sản phẩm</th>
        <th style="text-align:center">Mã SP</th>
        <th style="text-align:center">SL</th>
        <th style="text-align:right">Đơn giá</th>
        <th style="text-align:right">Thành tiền</th>
        <th style="text-align:center">Bảo hành</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="total-row">
    <div class="total-box">
      <div class="label">Tổng cộng</div>
      <div class="amount">${formatVND(invoice.totalAmount)}</div>
    </div>
  </div>

  <div class="footer">
    Tài liệu được tạo tự động bởi PartX &bull; ${new Date().toLocaleString("vi-VN")}
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
