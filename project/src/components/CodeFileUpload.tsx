import React, { useRef } from 'react';
import { Upload, FileCode, X } from 'lucide-react';

interface CodeFileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
}

export function CodeFileUpload({ onFileContent }: CodeFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const supportedExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', 
    '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.html', '.css', '.sql'
  ];

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileContent(content, file.name);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (supportedExtensions.includes(extension)) {
        handleFileRead(file);
      } else {
        alert('Please upload a supported code file format.');
      }
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileRead(file);
    }
  };

  const clearFile = () => {
    setFileName(null);
    onFileContent('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={supportedExtensions.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {!fileName ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleFileSelect}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            Supported: {supportedExtensions.slice(0, 8).join(', ')} and more
          </p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">{fileName}</span>
            </div>
            <button
              onClick={clearFile}
              className="p-1 hover:bg-gray-200 rounded-full transition-all duration-200"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}