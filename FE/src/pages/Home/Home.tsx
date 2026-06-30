import { useEffect, useState } from "react";
import { MainLayout } from "../../components/Layout";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import request from "../../api/request";
import { FileText, TrendingUp, Calendar, DollarSign, ShoppingCart, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface Stats {
  summary: {
    totalInvoices: number;
    totalAmount: number;
    thisMonthCount: number;
    thisMonthAmount: number;
  };
  daily: { date: string; label: string; count: number; total: number }[];
  monthly: { label: string; count: number; total: number }[];
}

// Dữ liệu kết hợp nhập + xuất cho biểu đồ so sánh
interface CombinedDay {
  label: string;
  nhap: number;
  xuat: number;
}

interface CombinedMonth {
  label: string;
  nhap: number;
  xuat: number;
}

const combinedMonthlyConfig = {
  nhap: { label: "Nhập", color: "#2563eb" },
  xuat: { label: "Xuất", color: "#16a34a" },
} satisfies ChartConfig;

function formatVND(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

function formatVNDFull(value: number) {
  return value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function Home() {
  const [importStats, setImportStats] = useState<Stats | null>(null);
  const [exportStats, setExportStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [importRes, exportRes] = await Promise.all([
          request({ method: "GET", url: "/invoice/stats/overview" }),
          request({ method: "GET", url: "/saleinvoice/stats/overview" }),
        ]);
        if (importRes.success) setImportStats(importRes.data);
        if (exportRes.success) setExportStats(exportRes.data);
      } catch (err) {
        console.error("Lỗi lấy thống kê:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Đang tải...
        </div>
      </MainLayout>
    );
  }

  const imp = importStats?.summary;
  const exp = exportStats?.summary;

  // Kết hợp dữ liệu tháng để so sánh
  const combinedMonthly: CombinedMonth[] = (importStats?.monthly ?? []).map((m, i) => ({
    label: m.label,
    nhap: m.total,
    xuat: exportStats?.monthly[i]?.total ?? 0,
  }));

  // Kết hợp dữ liệu ngày để so sánh
  const combinedDaily: CombinedDay[] = (importStats?.daily ?? []).map((d, i) => ({
    label: d.label,
    nhap: d.count,
    xuat: exportStats?.daily[i]?.count ?? 0,
  }));

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-xl font-bold">Tổng quan</h1>

        {/* ── Thẻ tóm tắt: 2 cột nhập / xuất ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nhập */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-sm text-blue-600">Hóa đơn nhập</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tổng HĐ</p>
                      <p className="text-xl font-bold">{imp?.totalInvoices ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tổng giá trị</p>
                      <p className="text-xl font-bold">{formatVND(imp?.totalAmount ?? 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tháng này</p>
                      <p className="text-xl font-bold">{imp?.thisMonthCount ?? 0} HĐ</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Giá trị tháng</p>
                      <p className="text-xl font-bold">{formatVND(imp?.thisMonthAmount ?? 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Xuất */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-sm text-green-600">Hóa đơn xuất</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tổng HĐ</p>
                      <p className="text-xl font-bold">{exp?.totalInvoices ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tổng giá trị</p>
                      <p className="text-xl font-bold">{formatVND(exp?.totalAmount ?? 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tháng này</p>
                      <p className="text-xl font-bold">{exp?.thisMonthCount ?? 0} HĐ</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Giá trị tháng</p>
                      <p className="text-xl font-bold">{formatVND(exp?.thisMonthAmount ?? 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* ── Biểu đồ so sánh số HĐ theo ngày ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Số hóa đơn theo ngày</CardTitle>
            <CardDescription>30 ngày gần nhất — nhập (xanh dương) vs xuất (xanh lá)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={combinedMonthlyConfig} className="h-52 w-full">
              <BarChart data={combinedDaily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        `${value} hóa đơn`,
                        name === "nhap" ? "Nhập" : "Xuất",
                      ]}
                    />
                  }
                />
                <Bar dataKey="nhap" fill="var(--color-nhap)" radius={[3, 3, 0, 0]} maxBarSize={16} />
                <Bar dataKey="xuat" fill="var(--color-xuat)" radius={[3, 3, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* ── Biểu đồ so sánh tổng tiền theo tháng ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tổng giá trị theo tháng</CardTitle>
            <CardDescription>12 tháng gần nhất — nhập (xanh dương) vs xuất (xanh lá)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={combinedMonthlyConfig} className="h-52 w-full">
              <LineChart data={combinedMonthly} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatVND} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        formatVNDFull(Number(value)),
                        name === "nhap" ? "Nhập" : "Xuất",
                      ]}
                    />
                  }
                />
                <Line type="monotone" dataKey="nhap" stroke="var(--color-nhap)" strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-nhap)" }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="xuat" stroke="var(--color-xuat)" strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-xuat)" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* ── Hoạt động gần đây: 2 cột ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nhập */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-blue-600" /> Nhập gần đây
              </CardTitle>
              <CardDescription>Các ngày có HĐ nhập trong 30 ngày qua</CardDescription>
            </CardHeader>
            <CardContent>
              {(importStats?.daily.filter((d) => d.count > 0).length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Chưa có hóa đơn nhập</p>
              ) : (
                <div className="space-y-2">
                  {importStats?.daily
                    .filter((d) => d.count > 0)
                    .slice(-5)
                    .reverse()
                    .map((d) => (
                      <div key={d.date} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <span className="text-muted-foreground">{d.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{d.count} HĐ</span>
                          <span className="text-blue-600 font-semibold">{formatVNDFull(d.total)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Xuất */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-green-600" /> Xuất gần đây
              </CardTitle>
              <CardDescription>Các ngày có HĐ xuất trong 30 ngày qua</CardDescription>
            </CardHeader>
            <CardContent>
              {(exportStats?.daily.filter((d) => d.count > 0).length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Chưa có hóa đơn xuất</p>
              ) : (
                <div className="space-y-2">
                  {exportStats?.daily
                    .filter((d) => d.count > 0)
                    .slice(-5)
                    .reverse()
                    .map((d) => (
                      <div key={d.date} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                          <span className="text-muted-foreground">{d.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{d.count} HĐ</span>
                          <span className="text-green-600 font-semibold">{formatVNDFull(d.total)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
