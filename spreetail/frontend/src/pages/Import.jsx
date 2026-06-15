import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Loader2,
  ArrowLeft,
  Download,
  TrendingUp,
  Database
} from 'lucide-react';
import axios from '../api/client';
import toast from 'react-hot-toast';

export default function Import() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [report, setReport] = useState(null);
  
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file first');
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('/import/preview', formData);
      setPreview(res.data);
      setStep(2);
      toast.success(`Found ${res.data.accepted_count} valid expenses to import`);
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.error || err.message));
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
      toast.success(`Successfully imported ${res.data.imported_count} expenses!`);
    } catch (err) {
      toast.error('Import failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  if (step === 1) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-6 md:p-8 animate-slide-up">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Database className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Import Expenses</h1>
              <p className="text-gray-500">Upload your CSV file and we'll detect any issues</p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-500 transition-all bg-white/50">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <FileText className="h-14 w-14 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-2">
                  {file ? file.name : 'Click to select or drag and drop'}
                </p>
                <p className="text-sm text-gray-400">CSV files only • Max 10MB</p>
              </label>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.history.back()}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Processing...
                  </>
                ) : (
                  'Upload & Preview'
                )}
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                We'll automatically detect duplicates, missing payers, and currency issues
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (step === 2 && preview) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setStep(1)} className="text-white hover:text-white/80 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Import Preview</h1>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4">
              <p className="text-gray-500 text-sm">Total Rows</p>
              <p className="text-2xl font-bold text-gray-800">{preview.total_rows}</p>
            </div>
            <div className="glass-card p-4 border-l-4 border-green-500">
              <p className="text-green-600 text-sm">Accepted</p>
              <p className="text-2xl font-bold text-green-700">{preview.accepted_count}</p>
            </div>
            <div className="glass-card p-4 border-l-4 border-red-500">
              <p className="text-red-600 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-700">{preview.rejected_count}</p>
            </div>
            <div className="glass-card p-4 border-l-4 border-yellow-500">
              <p className="text-yellow-600 text-sm">Anomalies</p>
              <p className="text-2xl font-bold text-yellow-700">{preview.total_rows - preview.accepted_count}</p>
            </div>
          </div>
          
          {Object.keys(preview.anomalies_by_type).length > 0 && (
            <div className="glass-card p-6 mb-6 bg-yellow-50/80">
              <h2 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Anomalies Detected
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(preview.anomalies_by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm bg-white rounded-lg p-2 px-3">
                    <span className="text-yellow-700 capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-yellow-800 bg-yellow-100 px-2 rounded">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {preview.rows.filter(r => !r.accepted).length > 0 && (
            <div className="glass-card p-6 mb-6 bg-red-50/80">
              <h2 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Rejected Rows ({preview.rows.filter(r => !r.accepted).length})
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {preview.rows.filter(r => !r.accepted).map((row, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="font-medium text-gray-800">Row {row.row_number + 1}: {row.original_row.description || 'No description'}</p>
                    <p className="text-sm text-red-600 mt-1">{row.anomalies.map(a => a.message).join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="glass-card p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Accepted Rows Preview ({Math.min(10, preview.accepted_count)} of {preview.accepted_count})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Paid By</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-left">Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview_data.map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50 transition-all">
                      <td className="p-3">{row.date}</td>
                      <td className="p-3 font-medium">{row.description}</td>
                      <td className="p-3">{row.paid_by}</td>
                      <td className="p-3 text-right font-semibold">₹{row.amount}</td>
                      <td className="p-3">{row.currency || 'INR'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="btn-secondary">
              Back
            </button>
            <button onClick={handleConfirm} disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Importing...
                </>
              ) : (
                `Confirm Import (${preview.accepted_count} rows)`
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (step === 3 && report) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8 text-center animate-slide-up">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Import Complete! 🎉</h1>
            <p className="text-gray-500 mb-6">Successfully imported {report.imported_count} expenses</p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
              <p className="text-sm text-green-600 mb-2">Import Summary</p>
              <p className="text-3xl font-bold text-green-700">{report.imported_count} rows added</p>
              <p className="text-xs text-gray-500 mt-2">Your expenses are now ready to view</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.location.href = '/'} className="btn-primary flex-1">
                Go to Dashboard
              </button>
              <button onClick={() => window.location.href = '/expenses'} className="btn-secondary">
                View Expenses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}