import { useState } from "react"
import axios from "axios"
import { motion } from "framer-motion"

function UploadCard({ setDatasetInfo }) {
    const [selectedFile, setSelectedFile] = useState(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0])
    }

    const uploadFile = async () => {
        if (!selectedFile) {
            alert("Please select a CSV file.")
            return
        }

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", selectedFile)

        try {
            const response = await axios.post("http://127.0.0.1:8000/upload", formData)
            setDatasetInfo(response.data)
        } catch (error) {
            console.log(error)
            alert("Upload Failed")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-10 shadow-2xl"
        >
            <h2 className="text-3xl font-bold text-white">
                Upload Business Dataset
            </h2>
            <p className="text-gray-400 mt-3">
                Upload your CSV to begin AI analysis
            </p>

            <label
                className="
                mt-8 
                border-2 
                border-dashed 
                border-slate-500/50 
                bg-slate-900/30
                rounded-2xl 
                p-10 
                flex 
                flex-col 
                items-center 
                justify-center 
                cursor-pointer 
                hover:border-blue-500 
                hover:bg-slate-800/50 
                transition-all 
                duration-300
                group
                "
            >
                <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    📁
                </span>
                <span className="text-2xl mt-4 font-semibold text-gray-200">
                    Click to Upload CSV
                </span>
                <span className="text-gray-500 mt-2">
                    Supported format: .csv
                </span>
                <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </label>

            {selectedFile && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-emerald-400 text-lg font-medium"
                >
                    ✅ {selectedFile.name}
                </motion.div>
            )}

            <button
                onClick={uploadFile}
                disabled={isUploading}
                className="
                mt-8 
                bg-blue-600 
                hover:bg-blue-500 
                disabled:bg-slate-600
                px-8 
                py-4 
                rounded-xl 
                text-xl 
                font-semibold 
                text-white
                shadow-[0_0_20px_rgba(37,99,235,0.4)]
                hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]
                transition-all 
                duration-300 
                hover:-translate-y-1
                "
            >
                {isUploading ? "Analyzing..." : "Analyze Dataset"}
            </button>
        </motion.div>
    )
}

export default UploadCard