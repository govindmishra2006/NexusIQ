function UploadCard() {
    return (
        <div className="bg-gray-900 rounded-2xl p-8 mt-8">
            <h2 className="text-2xl font-bold text-white">
                Upload Business Dataset
            </h2>

            <p className="text-gray-400 mt-2">
                CSV upload will be connected to the backend soon.
            </p>

            <button className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-white">
                Upload Dataset
            </button>
        </div>
    )
}

export default UploadCard