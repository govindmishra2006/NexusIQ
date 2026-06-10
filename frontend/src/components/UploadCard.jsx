import { useState } from "react"
import API from "../services/api"

function UploadCard({setDatasetInfo}) {

    const [file, setFile] = useState(null)

    const uploadFile = async () => {

        if (!file) {
            alert("Please select a file")
            return
        }

        const formData = new FormData()

        formData.append("file", file)

        try {

            const response = await API.post(
                "/upload",
                formData
            )

            setDatasetInfo(response.data)

            alert("Dataset uploaded successfully!")

        }

        catch (error) {

            console.log(error)

            alert("Upload failed.")

        }

    }

    return (

        <div className="bg-gray-900 rounded-2xl p-8 mt-8">

            <h2 className="text-2xl font-bold text-white">

                Upload Business Dataset

            </h2>

            <p className="text-gray-400 mt-2">

                Upload your CSV to begin AI analysis.

            </p>

            <input

                className="mt-6 text-white"

                type="file"

                onChange={
                    (e) => setFile(
                        e.target.files[0]
                    )
                }

            />

            <button

                onClick={uploadFile}

                className="
                mt-6
                block
                bg-blue-600
                hover:bg-blue-700
                px-6
                py-3
                rounded-xl
                text-white
                "

            >

                Upload Dataset

            </button>

        </div>

    )

}

export default UploadCard