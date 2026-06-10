import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import KpiCard from "./components/KpiCard";
import UploadCard from "./components/UploadCard";
import AIInsightCard from "./components/AIInsight";
import ChartsSection from "./components/ChartsSection";
import RevenueChart from "./components/RevenueChart";
import { useState } from "react";

function App() {
  const chartData = [
    {
      name: "100",
      value: 1,
    },

    {
      name: "150",
      value: 1,
    },

    {
      name: "200",
      value: 1,
    },

    {
      name: "300",
      value: 1,
    },
  ];
  const [datasetInfo, setDatasetInfo] = useState({
    rows: 0,

    columns: 0,

    numerical_columns: [],

    categorical_columns: [],
  });
  return (
    <div className="min-h-screen bg-black px-10">
      <Navbar />

      <Hero />

      <div className="grid grid-cols-4 gap-6">
        <KpiCard title="Rows" value={datasetInfo.rows} />

        <KpiCard title="Columns" value={datasetInfo.columns} />

        <KpiCard
          title="Numerical"
          value={datasetInfo.numerical_columns.length}
        />

        <KpiCard
          title="Categorical"
          value={datasetInfo.categorical_columns.length}
        />
      </div>

      <UploadCard setDatasetInfo={setDatasetInfo} />

      <AIInsightCard datasetInfo={datasetInfo} />
      <RevenueChart data={chartData} />

      <ChartsSection />
    </div>
  );
}

export default App;
