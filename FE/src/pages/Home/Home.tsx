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
import { FileText, TrendingUp, Calendar, DollarSign } from "lucide-react";
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

const dailyChartConfig = {
  count: { label: "Số hóa đơn", color: "#16a34a" },
} satisfies ChartConfig;

const monthlyChartConfig = {
  total: { label: "Tổng tiền (₫)", color: "#2563eb" },
} satisfies ChartConfig;

function formatVND(value: number) {
  if (value >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000)
    return `${(value / 1_000_000).toFixed(1)}Tr`;
  if (value >= 1_000)
    return `${(value / 1_000).toFixed(0)}N`;
  return String(value);
}

function formatVNDFull(value: number) {
  return value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await request({
          method: "GET",
          url: "/invoice/stats/overview",
        });
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error("Lỗi lấy thống kê:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
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

  const summary = stats?.summary;

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-xl font-bold">Tổng quan</h1>

        {/* ── 4 thẻ tóm tắt ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tổng hóa đơn</p>
                  <p className="text-xl font-bold">{summary?.totalInvoices ?? 0}</p>
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
                  <p className="text-xl font-bold">{formatVND(summary?.totalAmount ?? 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tháng này</p>
                  <p className="text-xl font-bold">{summary?.thisMonthCount ?? 0} Hoá đơn</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Giá trị tháng này</p>
                  <p className="text-xl font-bold">{formatVND(summary?.thisMonthAmount ?? 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Biểu đồ số hóa đơn theo ngày (30 ngày) ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Số hóa đơn theo ngày</CardTitle>
            <CardDescription>30 ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dailyChartConfig} className="h-52 w-full">
              <BarChart
                data={stats?.daily ?? []}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval={4}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value} hóa đơn`, "Số lượng"]}
                    />
                  }
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* ── Biểu đồ tổng tiền theo tháng (12 tháng) ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tổng giá trị theo tháng</CardTitle>
            <CardDescription>12 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyChartConfig} className="h-52 w-full">
              <LineChart
                data={stats?.monthly ?? []}
                margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatVND}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [
                        formatVNDFull(Number(value)),
                        "Tổng tiền",
                      ]}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-total)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-total)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* ── Bảng top 5 ngày gần nhất có hóa đơn ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
            <CardDescription>Các ngày có hóa đơn trong 30 ngày qua</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.daily.filter((d) => d.count > 0).length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có hóa đơn nào trong 30 ngày qua
              </p>
            ) : (
              <div className="space-y-2">
                {stats?.daily
                  .filter((d) => d.count > 0)
                  .slice(-5)
                  .reverse()
                  .map((d) => (
                    <div
                      key={d.date}
                      className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <span className="text-muted-foreground">{d.date}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{d.count} hóa đơn</span>
                        <span className="text-green-600 font-semibold">
                          {formatVNDFull(d.total)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
