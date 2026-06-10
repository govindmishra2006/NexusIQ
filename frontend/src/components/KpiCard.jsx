function KpiCard({ title, value }) {

    return (

        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">

            <h3 className="text-gray-400">

                {title}

            </h3>

            <p className="text-3xl font-bold text-white mt-2">

                {value}

            </p>

        </div>

    )

}

export default KpiCard