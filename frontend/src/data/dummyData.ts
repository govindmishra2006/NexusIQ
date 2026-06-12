export interface SalesPoint {
  day: string;
  revenue: number;
}

export const salesData: SalesPoint[] = [
  { day: "Jun 1", revenue: 18200 },
  { day: "Jun 2", revenue: 21500 },
  { day: "Jun 3", revenue: 19800 },
  { day: "Jun 4", revenue: 16400 },
  { day: "Jun 5", revenue: 23100 },
  { day: "Jun 6", revenue: 25600 },
  { day: "Jun 7", revenue: 22400 },
  { day: "Jun 8", revenue: 28900 },
  { day: "Jun 9", revenue: 27100 },
  { day: "Jun 10", revenue: 31200 },
  { day: "Jun 11", revenue: 29800 },
  { day: "Jun 12", revenue: 33400 },
  { day: "Jun 13", revenue: 30600 },
  { day: "Jun 14", revenue: 35700 },
];

export interface KPI {
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  compare: string;
  gradientFrom: string;
}

export const kpis: KPI[] = [
  {
    label: "Total Revenue",
    value: "$284,712",
    trend: "+12.4%",
    trendDirection: "up",
    compare: "vs. prior 14 days",
    gradientFrom: "from-[#00F5FF]/40",
  },
  {
    label: "Total Orders",
    value: "3,847",
    trend: "+8.1%",
    trendDirection: "up",
    compare: "vs. prior 14 days",
    gradientFrom: "from-[#7C3AED]/40",
  },
  {
    label: "Avg. Order Value",
    value: "$74.02",
    trend: "-3.2%",
    trendDirection: "down",
    compare: "vs. prior 14 days",
    gradientFrom: "from-[#F59E0B]/40",
  },
];

export interface AnomalySKU {
  rank: number;
  id: string;
  category: string;
  value: string;
  valueColor: string;
  rankBg: string;
}

export const anomalySKUs: AnomalySKU[] = [
  {
    rank: 1,
    id: "SKU-0192",
    category: "Apparel · T-Shirts",
    value: "$1,204",
    valueColor: "text-[#FF4560]",
    rankBg: "bg-[#FF4560]/20 text-[#FF4560]",
  },
  {
    rank: 2,
    id: "SKU-0847",
    category: "Accessories · Bags",
    value: "$847",
    valueColor: "text-[#F59E0B]",
    rankBg: "bg-[#F59E0B]/20 text-[#F59E0B]",
  },
  {
    rank: 3,
    id: "SKU-1203",
    category: "Footwear · Sneakers",
    value: "$632",
    valueColor: "text-[#F59E0B]",
    rankBg: "bg-[#F59E0B]/20 text-[#F59E0B]",
  },
];
