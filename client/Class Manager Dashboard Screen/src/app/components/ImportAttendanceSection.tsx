import { Upload, Download } from 'lucide-react';

export function ImportAttendanceSection() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Import Attendance from Excel</h2>
          <p className="text-sm text-gray-600 mt-1">Upload an Excel file with student attendance information</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Export Template
        </button>
      </div>
      
      <div className="p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-900 mb-1">Drag and drop your Excel file here</p>
              <p className="text-sm text-gray-600">or click the button below to browse files</p>
            </div>
            <p className="text-xs text-gray-500">Supported formats: .xlsx, .xls • Max size: 5MB</p>
            <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4" />
              Import File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
