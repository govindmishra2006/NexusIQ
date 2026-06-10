import {

    ResponsiveContainer,

    BarChart,

    Bar,

    XAxis,

    YAxis,

    Tooltip

} from "recharts"
function RevenueChart({data}) {
    
    return (
        <div className="bg-gray-900 rounded-2xl p-6 mt-8">
             <h2 className="text-2xl font-bold text-white mb-6">
                Revenue Distribution
             </h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey="name"/>
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" radius={[8, 8, 0, 0]}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default RevenueChart