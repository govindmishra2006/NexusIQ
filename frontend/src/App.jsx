import { useState } from "react";

import Navbar from "./components/Navbar";
import KpiCard from "./components/KpiCard";
import UploadCard from "./components/UploadCard";
import RevenueChart from "./components/RevenueChart";
import ProductPieChart from "./components/ProductPieChart";
import AIInsight from "./components/AIInsight";
import Footer from "./components/Footer";

function App() {
  const [datasetInfo, setDatasetInfo] = useState({
    rows: 0,

    columns: 0,

    numerical_columns: [],

    categorical_columns: [],

    chart_data: [],
  });

  const pieData = [
    {
      name: "Laptop",
      value: 3,
    },

    {
      name: "Phone",
      value: 2,
    },

    {
      name: "Tablet",
      value: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Navbar />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 w-full">
          <KpiCard title="Rows" value={datasetInfo.rows} delay={0.1} />
          <KpiCard title="Columns" value={datasetInfo.columns} delay={0.2} />
          <KpiCard
            title="Numerical"
            value={datasetInfo.numerical_columns.length}
            delay={0.3}
          />
          <KpiCard
            title="Categorical"
            value={datasetInfo.categorical_columns.length}
            delay={0.4}
          />
        </div>
        <div className="mt-8">
          <UploadCard setDatasetInfo={setDatasetInfo} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <RevenueChart data={datasetInfo.chart_data} />

          <ProductPieChart data={pieData} />
        </div>
        <div className="mt-8">
          <AIInsight datasetInfo={datasetInfo} />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
