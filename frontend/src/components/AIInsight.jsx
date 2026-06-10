function AIInsightCard({ datasetInfo }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-white">AI Insights</h2>
      {datasetInfo.rows === 0 ? (
        <p className="text-gray-400 mt-4">
          Upload a dataset to begin business analysis.
        </p>
      ) : (
        <div className="text-gray-300 mt-4 space-y-2">
          <p>✅ Dataset uploaded successfully</p>

          <p>Rows detected: {datasetInfo.rows}</p>

          <p>Columns detected: {datasetInfo.columns}</p>

          <p>Ready for AI business analysis.</p>
        </div>
      )}
    </div>
  );
}

export default AIInsightCard;
