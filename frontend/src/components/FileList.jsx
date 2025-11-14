import React from 'react';
import { Download, Trash2, File, Image, FileText, Video, Music, Archive } from 'lucide-react';
import { fileAPI } from '../services/api';

const FileList = ({ files, onDelete }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <File className="w-8 h-8 text-gray-400" />;
    
    if (mimeType.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-8 h-8 text-green-500" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-8 h-8 text-red-500" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="w-8 h-8 text-yellow-500" />;
    
    return <File className="w-8 h-8 text-gray-400" />;
  };

  const handleDownload = async (file) => {
    try {
      await fileAPI.downloadFile(file.id, file.original_filename);
    } catch (err) {
      alert('Download failed');
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await fileAPI.deleteFile(fileId);
        onDelete();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <File className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">No files yet. Upload your first file!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {getFileIcon(file.mime_type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.original_filename}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.file_size)} • {formatDate(file.uploaded_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDownload(file)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDelete(file.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;