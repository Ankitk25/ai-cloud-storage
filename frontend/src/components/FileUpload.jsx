import React, { useState, useRef } from 'react';
import { Flag, Upload, X } from 'lucide-react';
import { fileAPI } from '../services/api';
import { AlertTriangle, Copy } from "lucide-react";


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
    setShowDuplicateDialog(false);
    setDuplicateInfo(null);
    // setUploading(true);
    
   if (pendingFile) {
      await uploadFile(pendingFile, true); // Force upload
      setPendingFile(null);
    }
  };

  const handleSkipUpload = () => {
    setShowDuplicateDialog(false);
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
    <div className="mb-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          glass
          border-2 border-dashed
          rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${
            isDragging
              ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,255,255,0.4)]'
              : uploading
              ? 'border-gray-600 opacity-70 cursor-not-allowed'
              : 'border-cyan-400/30 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]'
          }
        `}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 transition ${isDragging ? 'text-cyan-400' : 'text-cyan-300'}`}/>
        {/* Main Status Text */}
        <p className="text-lg font-medium text-white mb-2">
          {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
        </p>
        
        <p className="text-sm text-gray-400 mt-2">
          Supports: Images, Documents, Videos, Archives
        </p>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4">
             <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-cyan-300 mt-2">{progress}%</p>

          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 glass border border-red-500/30 text-red-300 px-4 py-2 rounded-lg">
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

        {/* Duplicate Detection Dialog */}
        {showDuplicateModal && duplicateInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass max-w-md w-full p-6 shadow-[0_0_40px_rgba(0,255,255,0.2)]">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {duplicateInfo.duplicate_type === 'exact' ? 'Duplicate File Detected' : 'Similar File Found'}
            </h2>
            
            <p className="text-gray-400 text-center mb-6">
              {duplicateInfo.duplicate_type === 'exact' 
                ? 'This exact file already exists in your storage.'
                : 'A visually similar image was found in your storage.'}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Copy className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {duplicateInfo.existing_file?.filename || 'Unknown file'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(duplicateInfo.existing_file?.size)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
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
                          bg-white/10 text-gray-300
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