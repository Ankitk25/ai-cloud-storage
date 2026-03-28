import React, { useState } from 'react';
import {Download, Trash2, File, Image, FileText, Video, Music, Archive, Tag, Eye, Loader} from 'lucide-react';
import { fileAPI } from '../services/api';

const FileList = ({ files, onDelete, view  }) => {
  const [expandedFile, setExpandedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
    if (!mimeType) return <File className="w-6 h-6 text-gray-500" />;

    if (mimeType.startsWith('image/')) return <Image className="w-6 h-6 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-6 h-6 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-6 h-6 text-green-500" />;
    if (mimeType.includes('pdf') || mimeType.includes('document'))
      return <FileText className="w-6 h-6 text-red-500" />;
    if (mimeType.includes('zip') || mimeType.includes('archive'))
      return <Archive className="w-6 h-6 text-yellow-500" />;

    return <File className="w-6 h-6 text-gray-500" />;
  };

  const getCategoryBadge = (category) => {
    if (!category) return null;

    const colors = {
      photo: 'bg-blue-100 text-blue-800',
      document: 'bg-red-100 text-red-800',
      screenshot: 'bg-purple-100 text-purple-800',
      nature: 'bg-green-100 text-green-800',
      people: 'bg-yellow-100 text-yellow-800',
      financial: 'bg-orange-100 text-orange-800',
      legal: 'bg-gray-100 text-gray-800',
      report: 'bg-indigo-100 text-indigo-800'
    };

    const colorClass =
      colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800';

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${colorClass}`}
      >
        {category}
      </span>
    );
  };

  const getAIProcessingStatus = (status) => {
    const statuses = {
      0: {
        text: 'AI Pending',
        color: 'text-gray-400',
        icon: <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
      },
      1: {
        text: 'Analyzing',
        color: 'text-cyan-400',
        icon: <Loader className="w-4 h-4 animate-spin" />
      },
      2: {
        text: 'AI Ready',
        color: 'text-green-400',
        icon: <span className="w-2 h-2 rounded-full bg-green-400" />
      },
      3: {
        text: 'AI Failed',
        color: 'text-red-400',
        icon: <span className="w-2 h-2 rounded-full bg-red-400" />
      }
    };

    return statuses[status] || statuses[0];
  };

  const parseTags = (tagsString) => {
    if (!tagsString) return [];
    try {
      return JSON.parse(tagsString);
    } catch {
      return [];
    }
  };

  const handleDownload = async (file) => {
    try {
      await fileAPI.downloadFile(file.id, file.original_filename);
    } catch {
      alert('Download failed');
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await fileAPI.deleteFile(fileId);
        onDelete();
      } catch {
        alert('Delete failed');
      }
    }
  };

  const toggleExpand = (fileId) => {
    setExpandedFile(expandedFile === fileId ? null : fileId);
  };

  if (files.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No files yet. Upload your first file!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {files.map((file) => {
        const tags = parseTags(file.tags);
        const aiStatus = getAIProcessingStatus(file.ai_processed);
        const isExpanded = expandedFile === file.id;

        return (
          <div
            key={file.id}
            className="
            group relative p-4 rounded-2xl
            glass
            transition-all duration-300
            hover:scale-[1.03]
            hover:shadow-[0_0_25px_rgba(0,255,255,0.2)]
            "
          >

            {/* Main File Row */}
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="flex items-center justify-center h-full">
                  <div className="p-4 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition">
                    {getFileIcon(file.mime_type)}
                  </div>
                </div>

                <div>
                  <h3
                    onClick={() => setPreviewFile(file)}
                    className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 cursor-pointer">
                    {file.original_filename}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatFileSize(file.file_size)}
                  </p>

                  <div className="flex gap-2 mt-2 items-center flex-wrap">
                    {file.category && getCategoryBadge(file.category)}

                    {file.ai_processed !== undefined &&
                      file.ai_processed !== 2 && (
                        <span
                          className={`
                            absolute bottom-2 left-2
                            text-[10px] px-2 py-1 rounded-full
                            bg-cyan-500/10 text-cyan-300
                            ${aiStatus.color}
                          `}
                        >

                          {aiStatus.icon}
                          {aiStatus.text}
                        </span>
                      )}
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {file.extracted_text && (
                  <button
                    onClick={() => toggleExpand(file.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="View extracted text"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                <div
                  className="
                    absolute top-2 right-2 flex gap-2
                    opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 bg-[#0b0f12] rounded-lg hover:bg-cyan-500/20">
                    <Download className="w-4 h-4 text-white" />
                  </button>

                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 bg-[#0b0f12] rounded-lg hover:bg-red-500/20">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && file.extracted_text && (
              <div className="
                mt-4
                glass
                p-4
                text-sm text-gray-200
                max-h-52 overflow-y-auto">
                <h4 className="font-semibold mb-2 text-cyan-300">Extracted Text:</h4>
                {file.extracted_text}
              </div>
            )}
          </div>
        );
      })}

      {previewFile && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/70 backdrop-blur-md
            animate-fadeIn
          "
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="
              relative w-full max-w-3xl
              bg-[#0f1720]
              border border-cyan-500/20
              rounded-2xl
              shadow-[0_0_30px_rgba(0,255,255,0.15)]
              p-6
            "
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            
            {/* Close Button */}
            <button
              onClick={() => setPreviewFile(null)}
              className="
                absolute top-3 right-3
                text-gray-400 hover:text-white
                text-xl
              "
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-white text-lg font-semibold mb-4">
              {previewFile.original_filename}
            </h2>

            {/* Preview Content */}
            <div className="flex items-center justify-center">
              {previewFile.mime_type?.startsWith("image/") ? (
                <img
                  src={`http://localhost:8000/api/files/${previewFile.id}/download`}
                  alt=""
                  className="max-h-[70vh] rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <p className="text-lg">Preview not supported</p>
                  <p className="text-sm mt-2">
                    Download file to view it
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="
          absolute top-2 right-2 flex gap-2
          opacity-0 group-hover:opacity-100 transition
        ">
          <button
            onClick={() => handleDownload(file)}
            className="p-2 bg-[#0b0f12] rounded-lg hover:bg-cyan-500/20"
          >
            <Download className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={() => handleDelete(file.id)}
            className="p-2 bg-[#0b0f12] rounded-lg hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
      </div>

    </div>
  );
};

export default FileList;
