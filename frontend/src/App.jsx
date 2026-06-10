import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import KpiCard from "./components/KpiCard"
import UploadCard from "./components/UploadCard"
import AIInsightCard from "./components/AIInsight"
import ChartsSection from "./components/ChartsSection"

function App() {
    return (
        <div className="min-h-screen bg-black px-10">

            <Navbar />

            <Hero />

            <div className="grid grid-cols-4 gap-6">

                <KpiCard
                    title="Revenue"
                    value="+12%"
                />

                <KpiCard
                    title="Profit"
                    value="+8%"
                />

                <KpiCard
                    title="Retention"
                    value="-4%"
                />

                <KpiCard
                    title="AI Status"
                    value="Ready"
                />

            </div>

            <UploadCard />

            <AIInsightCard />

            <ChartsSection />

        </div>
    )
}

export default App