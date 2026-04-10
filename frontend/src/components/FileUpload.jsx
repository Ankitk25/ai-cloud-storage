import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle, Copy } from 'lucide-react';
import { fileAPI } from '../services/api';

const FileUpload = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await uploadFile(files[0], false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await uploadFile(files[0]);
    }

    e.target.value = ''; // Reset file input
  };

  const uploadFile = async (file, forceUpload=false) => {
    if (!file) return;

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const response = await fileAPI.uploadFile(file, setProgress, forceUpload);

      console.log('Upload response:', response); // DEBUG

      if (response.status === 'duplicate_found') {
        setUploading(false);
        setShowDuplicateModal(true);
        setDuplicateInfo(response); 
        setPendingFile(file);
        return;
      }
    
      if (response.status === 'success' || response.file) {
      setUploading(false);
      setProgress(0);
      setError('');
      onUploadComplete(); // This refreshes the file list
      return;
    }
    
    // If we reach here, something unexpected happened
    throw new Error('Unexpected response format');

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Upload failed');
      setUploading(false);
    }
  };

  const handleKeepBoth = async () => {
    setShowDuplicateModal(false);
    setDuplicateInfo(null);
    
    if (pendingFile) {
      await uploadFile(pendingFile, true); // Force upload
      setPendingFile(null);
    }
  };

  const handleSkipUpload = () => {
    setShowDuplicateModal(false);
    setPendingFile(null);
    setDuplicateInfo(null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="surface-panel overflow-hidden p-5 sm:p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          surface-panel-soft
          border-2 border-dashed
          rounded-[26px] p-8 text-center
          transition-all duration-300
          ${
            isDragging
              ? 'border-cyan-300 bg-cyan-300/6 shadow-[0_0_30px_rgba(34,211,238,0.16)]'
              : uploading
              ? 'cursor-not-allowed border-white/10 opacity-75'
              : 'cursor-pointer border-cyan-300/18 hover:border-cyan-300/35 hover:bg-white/[0.03]'
          }
        `}
      >
        <span
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-300/15 bg-cyan-300/10 transition ${
            isDragging ? 'text-cyan-200' : 'text-cyan-100'
          }`}
        >
          <Upload className="h-8 w-8" />
        </span>

        <p className="text-2xl font-semibold text-white">
          {uploading ? 'Uploading your file...' : 'Drop files here or browse'}
        </p>
        
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Add images, documents, videos, or archives. New uploads are ready for search and cleanup faster.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Choose file
          </button>
          <span className="rounded-full border border-white/8 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-400">
            AI tagging enabled
          </span>
        </div>

        {uploading && (
          <div className="mx-auto mt-6 max-w-xl">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-cyan-100">{progress}% complete</p>
          </div>
        )}

        {error && (
          <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}
      </div>

      <input
        id="file-upload-input"
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {showDuplicateModal && duplicateInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="surface-panel max-w-md w-full p-6 shadow-[0_0_40px_rgba(34,211,238,0.14)]">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full border border-amber-300/20 bg-amber-300/12 p-3">
                <AlertTriangle className="w-8 h-8 text-amber-200" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {duplicateInfo.duplicate_type === 'exact' ? 'Duplicate File Detected' : 'Similar File Found'}
            </h2>
            
            <p className="text-slate-400 text-center mb-6">
              {duplicateInfo.duplicate_type === 'exact' 
                ? 'This exact file already exists in your storage.'
                : 'A visually similar image was found in your storage.'}
            </p>

            <div className="surface-panel-soft rounded-2xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Copy className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {duplicateInfo.existing_file?.filename || 'Unknown file'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {formatFileSize(duplicateInfo.existing_file?.size)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Uploaded: {formatDate(duplicateInfo.existing_file?.uploaded_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleKeepBoth}
                className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition"
              >
                Keep Both Files
              </button>
              
              <button
                onClick={handleSkipUpload}
                className="w-full py-3 rounded-lg font-semibold
                          bg-white/10 text-slate-300
                          hover:bg-white/20 transition">
                Skip Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
