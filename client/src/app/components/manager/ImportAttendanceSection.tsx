import { Upload, Download, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export function ImportAttendanceSection({ classId }: { classId?: string }) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const getAuthHeader = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.token || localStorage.getItem('token') || '';
    } catch {
      return '';
    }
  };

  const handleExportTemplate = async () => {
    if (!classId) return alert('Select a course first');
    try {
      setIsExporting(true);
      const response = await fetch(`/api/attendance/export/${classId}`, {
        headers: {
          Authorization: `Bearer ${getAuthHeader()}`,
        }
      });
      
      if (!response.ok) throw new Error('Failed to export');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_template_${classId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(t('attendance.error') + ' / ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!classId) return alert('Select a course first');
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', new Date().toISOString().split('T')[0]);

    try {
      setIsUploading(true);
      const res = await fetch(`/api/attendance/import/${classId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthHeader()}`
        },
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }
      alert(t('attendance.success_import'));
    } catch(err: any) {
      alert(t('attendance.error') + ' / ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t('attendance.import_title')}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('attendance.import_subtitle')}</p>
        </div>
        <button 
          onClick={handleExportTemplate}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {t('attendance.export_template')}
        </button>
      </div>
      
      <div className="p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors relative">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={isUploading}
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-900 mb-1">{t('attendance.drag_drop')}</p>
            </div>
            <p className="text-xs text-gray-500">{t('attendance.supported_formats')}</p>
            <button 
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 pointer-events-none"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {t('attendance.import_btn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
