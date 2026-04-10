import React, { useEffect, useRef, useState } from 'react';
import {
  Archive,
  CalendarClock,
  Download,
  Eye,
  File,
  FileText,
  Image,
  Loader,
  Music,
  Tag,
  Trash2,
  Video
} from 'lucide-react';
import { fileAPI } from '../services/api';

const initialPreviewState = {
  file: null,
  url: '',
  loading: false,
  error: ''
};

const FileLibrary = ({ files, onDelete, view, onTagClick }) => {
  const [expandedFile, setExpandedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewState, setPreviewState] = useState(initialPreviewState);
  const previewCleanupRef = useRef(null);

  useEffect(() => {
    setSelectedFiles((previous) =>
      previous.filter((fileId) => files.some((file) => file.id === fileId))
    );
  }, [files]);

  useEffect(
    () => () => {
      if (previewCleanupRef.current) {
        previewCleanupRef.current();
      }
    },
    []
  );

  const cleanupPreview = () => {
    if (previewCleanupRef.current) {
      previewCleanupRef.current();
      previewCleanupRef.current = null;
    }
  };

  const toggleSelect = (fileId) => {
    setSelectedFiles((previous) =>
      previous.includes(fileId)
        ? previous.filter((id) => id !== fileId)
        : [...previous, fileId]
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';

    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const sizeIndex = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );

    return `${Math.round((bytes / 1024 ** sizeIndex) * 100) / 100} ${units[sizeIndex]}`;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

  const parseTags = (tagsValue) => {
    if (!tagsValue) return [];
    if (Array.isArray(tagsValue)) return tagsValue.filter(Boolean);

    try {
      const parsed = JSON.parse(tagsValue);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return tagsValue
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  };

  const supportsPreview = (mimeType) =>
    Boolean(
      mimeType &&
        (mimeType.startsWith('image/') ||
          mimeType.startsWith('video/') ||
          mimeType.includes('pdf'))
    );

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <File className="h-6 w-6 text-slate-300" />;
    if (mimeType.startsWith('image/')) return <Image className="h-6 w-6 text-cyan-100" />;
    if (mimeType.startsWith('video/')) return <Video className="h-6 w-6 text-violet-200" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-6 w-6 text-emerald-200" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return <FileText className="h-6 w-6 text-amber-200" />;
    }
    if (mimeType.includes('zip') || mimeType.includes('archive')) {
      return <Archive className="h-6 w-6 text-orange-200" />;
    }

    return <File className="h-6 w-6 text-slate-300" />;
  };

  const getCategoryBadge = (category) => {
    if (!category) return null;

    const tones = {
      photo: 'border-cyan-300/24 bg-cyan-300/10 text-cyan-100',
      document: 'border-amber-300/24 bg-amber-300/10 text-amber-100',
      screenshot: 'border-violet-300/24 bg-violet-300/10 text-violet-100',
      nature: 'border-emerald-300/24 bg-emerald-300/10 text-emerald-100',
      people: 'border-fuchsia-300/24 bg-fuchsia-300/10 text-fuchsia-100',
      financial: 'border-sky-300/24 bg-sky-300/10 text-sky-100',
      legal: 'border-slate-300/24 bg-slate-300/10 text-slate-100',
      report: 'border-indigo-300/24 bg-indigo-300/10 text-indigo-100'
    };

    const tone = tones[category.toLowerCase()] || 'border-white/10 bg-white/8 text-slate-100';

    return (
      <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${tone}`}>
        {category}
      </span>
    );
  };

  const getAIProcessingStatus = (status) => {
    const statuses = {
      0: {
        text: 'AI pending',
        tone: 'text-slate-400',
        icon: <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
      },
      1: {
        text: 'Analyzing',
        tone: 'text-cyan-200',
        icon: <Loader className="h-4 w-4 animate-spin" />
      },
      2: {
        text: 'AI ready',
        tone: 'text-emerald-200',
        icon: <span className="h-2 w-2 rounded-full bg-emerald-300" />
      },
      3: {
        text: 'AI failed',
        tone: 'text-rose-200',
        icon: <span className="h-2 w-2 rounded-full bg-rose-300" />
      }
    };

    return statuses[status] || statuses[0];
  };

  const handleDownload = async (file) => {
    try {
      await fileAPI.downloadFile(file.id, file.original_filename, file.mime_type);
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file from your storage?')) {
      return;
    }

    try {
      await fileAPI.deleteFile(fileId);
      onDelete();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedFiles.length) return;
    if (!window.confirm(`Delete ${selectedFiles.length} selected file(s)?`)) return;

    try {
      await Promise.all(selectedFiles.map((fileId) => fileAPI.deleteFile(fileId)));
      setSelectedFiles([]);
      onDelete();
    } catch (error) {
      console.error('Bulk delete failed', error);
    }
  };

  const toggleExpand = (fileId) => {
    setExpandedFile((current) => (current === fileId ? null : fileId));
  };

  const closePreview = () => {
    cleanupPreview();
    setPreviewState(initialPreviewState);
  };

  const openPreview = async (file) => {
    if (!supportsPreview(file.mime_type)) {
      setPreviewState({
        file,
        url: '',
        loading: false,
        error: 'Preview is not available for this file type.'
      });
      return;
    }

    cleanupPreview();
    setPreviewState({
      file,
      url: '',
      loading: true,
      error: ''
    });

    try {
      const asset = await fileAPI.resolveFileAsset(file.id, file.mime_type);
      previewCleanupRef.current = asset.cleanup;

      setPreviewState({
        file,
        url: asset.url,
        loading: false,
        error: ''
      });
    } catch (error) {
      console.error('Preview failed', error);
      setPreviewState({
        file,
        url: '',
        loading: false,
        error: 'Preview could not be loaded.'
      });
    }
  };

  if (!files.length) {
    return (
      <div className="surface-panel p-10 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-300/14 bg-cyan-300/10 text-cyan-100">
            <File className="h-8 w-8" />
          </span>
          <h3 className="mt-5 text-2xl font-semibold text-white">No files to show</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Upload your first file or clear the current filters to bring your library back into view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedFiles.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-cyan-300/24 bg-slate-950/92 px-5 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur">
          <span className="text-sm text-cyan-100">{selectedFiles.length} selected</span>
          <button
            onClick={handleBulkDelete}
            className="rounded-full bg-rose-400/14 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20"
          >
            Delete selected
          </button>
          <button
            onClick={() => setSelectedFiles([])}
            className="rounded-full px-3 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      <div
        className={
          view === 'grid'
            ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
            : 'space-y-3'
        }
      >
        {files.map((file) => {
          const tags = parseTags(file.tags);
          const isExpanded = expandedFile === file.id;
          const aiStatus =
            file.ai_processed === undefined || file.ai_processed === null
              ? null
              : getAIProcessingStatus(file.ai_processed);
          const previewable = supportsPreview(file.mime_type);

          return (
            <article
              key={file.id}
              className={`surface-panel-soft overflow-hidden p-4 transition duration-300 ${
                view === 'grid'
                  ? 'hover:-translate-y-1 hover:border-cyan-300/20'
                  : 'hover:border-white/14'
              }`}
            >
              {view === 'grid' ? (
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => toggleSelect(file.id)}
                        className="h-4 w-4 rounded border-white/15 bg-transparent accent-cyan-300"
                      />
                      Select
                    </label>

                    <button
                      onClick={() => openPreview(file)}
                      disabled={!previewable}
                      className={`rounded-full p-2 transition ${
                        previewable
                          ? 'bg-white/6 text-slate-200 hover:bg-cyan-300/16 hover:text-white'
                          : 'cursor-not-allowed bg-white/5 text-slate-600'
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-cyan-300/12 bg-cyan-300/8">
                      {getFileIcon(file.mime_type)}
                    </span>
                    <div className="min-w-0">
                      <button
                        onClick={() => previewable && openPreview(file)}
                        className={`block truncate text-left text-base font-semibold ${
                          previewable ? 'text-white hover:text-cyan-100' : 'text-white'
                        }`}
                      >
                        {file.original_filename}
                      </button>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span className="flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {formatDate(file.uploaded_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {getCategoryBadge(file.category)}
                    {aiStatus && (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs ${aiStatus.tone}`}
                      >
                        {aiStatus.icon}
                        {aiStatus.text}
                      </span>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.slice(0, 4).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => onTagClick?.(tag.toLowerCase())}
                          className="rounded-full border border-cyan-300/14 bg-cyan-300/8 px-3 py-1 text-xs text-cyan-100 transition hover:bg-cyan-300/14"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-3 pt-4">
                    <button
                      onClick={() => toggleExpand(file.id)}
                      className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
                    >
                      {isExpanded ? 'Hide details' : 'Details'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(file)}
                        className="rounded-full bg-white/6 p-2 text-slate-200 transition hover:bg-cyan-300/16 hover:text-white"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="rounded-full bg-white/6 p-2 text-slate-200 transition hover:bg-rose-400/16 hover:text-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => toggleSelect(file.id)}
                      className="mt-2 h-4 w-4 rounded border-white/15 bg-transparent accent-cyan-300"
                    />

                    <span className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-cyan-300/12 bg-cyan-300/8">
                      {getFileIcon(file.mime_type)}
                    </span>

                    <div className="min-w-0">
                      <button
                        onClick={() => previewable && openPreview(file)}
                        className={`block truncate text-left text-base font-semibold ${
                          previewable ? 'text-white hover:text-cyan-100' : 'text-white'
                        }`}
                      >
                        {file.original_filename}
                      </button>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>{formatDate(file.uploaded_at)}</span>
                        {file.category && getCategoryBadge(file.category)}
                        {aiStatus && (
                          <span className={`inline-flex items-center gap-2 ${aiStatus.tone}`}>
                            {aiStatus.icon}
                            {aiStatus.text}
                          </span>
                        )}
                      </div>
                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tags.slice(0, 5).map((tag) => (
                            <button
                              key={tag}
                              onClick={() => onTagClick?.(tag.toLowerCase())}
                              className="rounded-full border border-cyan-300/14 bg-cyan-300/8 px-3 py-1 text-xs text-cyan-100 transition hover:bg-cyan-300/14"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:shrink-0">
                    <button
                      onClick={() => toggleExpand(file.id)}
                      className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
                    >
                      {isExpanded ? 'Hide details' : 'Details'}
                    </button>
                    <button
                      onClick={() => openPreview(file)}
                      disabled={!previewable}
                      className={`rounded-full p-2 transition ${
                        previewable
                          ? 'bg-white/6 text-slate-200 hover:bg-cyan-300/16 hover:text-white'
                          : 'cursor-not-allowed bg-white/5 text-slate-600'
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      className="rounded-full bg-white/6 p-2 text-slate-200 transition hover:bg-cyan-300/16 hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="rounded-full bg-white/6 p-2 text-slate-200 transition hover:bg-rose-400/16 hover:text-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {isExpanded && (
                <div className="mt-4 rounded-[18px] border border-white/8 bg-black/18 p-4 text-sm text-slate-300">
                  <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.22em] text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5" />
                      File details
                    </span>
                    {file.mime_type && <span>{file.mime_type}</span>}
                  </div>
                  <p className="mt-3 leading-7 text-slate-400">
                    {file.extracted_text
                      ? file.extracted_text
                      : 'Expanded details are ready for future AI summaries and extracted text.'}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {previewState.file && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={closePreview}
        >
          <div
            className="surface-panel animate-fadeIn w-full max-w-5xl p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">File preview</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {previewState.file.original_filename}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {formatFileSize(previewState.file.file_size)} | {formatDate(previewState.file.uploaded_at)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewState.file)}
                  className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Download
                </button>
                <button
                  onClick={closePreview}
                  className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-5 min-h-[420px] rounded-[24px] border border-white/8 bg-slate-950/55 p-4">
              {previewState.loading ? (
                <div className="flex h-[420px] items-center justify-center text-slate-300">
                  <Loader className="mr-3 h-5 w-5 animate-spin" />
                  Loading preview...
                </div>
              ) : previewState.error ? (
                <div className="flex h-[420px] items-center justify-center text-center text-slate-400">
                  {previewState.error}
                </div>
              ) : previewState.file.mime_type?.startsWith('image/') ? (
                <div className="flex h-[420px] items-center justify-center">
                  <img
                    src={previewState.url}
                    alt={previewState.file.original_filename}
                    className="max-h-[420px] w-auto rounded-[20px] object-contain"
                  />
                </div>
              ) : previewState.file.mime_type?.startsWith('video/') ? (
                <video
                  src={previewState.url}
                  controls
                  className="h-[420px] w-full rounded-[20px] bg-black object-contain"
                />
              ) : previewState.file.mime_type?.includes('pdf') ? (
                <iframe
                  src={previewState.url}
                  title={previewState.file.original_filename}
                  className="h-[420px] w-full rounded-[20px]"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-center text-slate-400">
                  Preview is not supported for this file type.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileLibrary;
