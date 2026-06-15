import React, { useState } from 'react';
import axios from '../api/client';

export default function Import() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: confirm
  const [report, setReport] = useState(null);
  
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('/import/preview', formData);
      setPreview(res.data);
      setStep(2);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const acceptedRows = preview.rows.filter(r => r.accepted);
      const res = await axios.post('/import/confirm', { confirmed_rows: acceptedRows });
      setReport(res.data);
      setStep(3);
    } catch (err) {
      alert('Import failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Import Expenses CSV</h1>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4"
          />
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upload & Preview'}
          </button>
        </div>
      </div>
    );
  }
  
  if (step === 2 && preview) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Import Preview</h1>
        
        {/* Anomaly Summary */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-2">Anomalies Detected ({preview.total_rows - preview.accepted_count})</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(preview.anomalies_by_type).map(([type, count]) => (
              <div key={type}>{type}: {count}</div>
            ))}
          </div>
        </div>
        
        {/* Rejected Rows */}
        {preview.rows.filter(r => !r.accepted).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-red-800 mb-2">Rejected Rows ({preview.rows.filter(r => !r.accepted).length})</h2>
            <div className="text-sm space-y-2">
              {preview.rows.filter(r => !r.accepted).map((row, idx) => (
                <div key={idx} className="border-b border-red-100 pb-2">
                  <div>Row {row.row_number}: {row.original_row.description}</div>
                  <div className="text-red-600 text-xs">
                    {row.anomalies.map(a => a.message).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Accepted Preview */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Accepted Rows (Preview)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Paid By</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Currency</th>
                </tr>
              </thead>
              <tbody>
                {preview.preview_data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{row.date}</td>
                    <td className="p-2 border">{row.description}</td>
                    <td className="p-2 border">{row.paid_by}</td>
                    <td className="p-2 border">{row.amount}</td>
                    <td className="p-2 border">{row.currency || 'INR'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => setStep(1)}
            className="bg-gray-300 px-6 py-2 rounded-lg"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            {loading ? 'Importing...' : `Confirm Import (${preview.accepted_count} rows)`}
          </button>
        </div>
      </div>
    );
  }
  
  if (step === 3 && report) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-green-800 mb-4">Import Complete!</h1>
          <p className="text-lg mb-2">Successfully imported {report.imported_count} expenses</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-4"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return null;
}