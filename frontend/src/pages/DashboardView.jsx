import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileImage,
  Files,
  FileText,
  Grid2x2,
  List,
  LogOut,
  Tag,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fileAPI } from '../services/api';
import FileUpload from '../components/FileUpload';
import FileLibrary from '../components/FileLibrary';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';

const DashboardView = () => {
  const [activeMenu, setActiveMenu] = useState('all');
  const [allFiles, setAllFiles] = useState([]);
  const [displayedFiles, setDisplayedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalFiles: 0, totalSize: 0 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState('grid');
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [allFiles, activeMenu, selectedCategory, activeTag, searchQuery]);

  const loadFiles = async () => {
    setLoading(true);

    try {
      const data = await fileAPI.listFiles();
      setAllFiles(data);

      const uniqueCategories = [...new Set(data.map((file) => file.category).filter(Boolean))];
      setCategories(uniqueCategories);

      const totalSize = data.reduce((sum, file) => sum + file.file_size, 0);
      setStats({
        totalFiles: data.length,
        totalSize
      });
    } catch (error) {
      console.error('Failed to load files', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFiles = () => {
    let filtered = [...allFiles];

    if (activeMenu === 'images') {
      filtered = filtered.filter((file) => file.mime_type?.startsWith('image/'));
    } else if (activeMenu === 'documents') {
      filtered = filtered.filter(
        (file) =>
          file.mime_type?.includes('pdf') ||
          file.mime_type?.includes('document') ||
          file.mime_type?.includes('text')
      );
    }

    if (activeTag) {
      filtered = filtered.filter((file) => {
        if (!file.tags) return false;

        try {
          const parsed = JSON.parse(file.tags);
          return Array.isArray(parsed)
            ? parsed.some((tag) => tag.toLowerCase() === activeTag)
            : file.tags.toLowerCase().includes(activeTag);
        } catch {
          return file.tags.toLowerCase().includes(activeTag);
        }
      });
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((file) => file.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.original_filename.toLowerCase().includes(searchTerm) ||
          file.tags?.toLowerCase().includes(searchTerm) ||
          file.extracted_text?.toLowerCase().includes(searchTerm) ||
          file.category?.toLowerCase().includes(searchTerm)
      );
    }

    setDisplayedFiles(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';

    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** index).toFixed(2)} ${units[index]}`;
  };

  const menuItems = useMemo(
    () => [
      {
        id: 'all',
        label: 'All files',
        count: allFiles.length,
        icon: Files
      },
      {
        id: 'images',
        label: 'Images',
        count: allFiles.filter((file) => file.mime_type?.startsWith('image/')).length,
        icon: FileImage
      },
      {
        id: 'documents',
        label: 'Documents',
        count: allFiles.filter(
          (file) =>
            file.mime_type?.includes('pdf') ||
            file.mime_type?.includes('document') ||
            file.mime_type?.includes('text')
        ).length,
        icon: FileText
      }
    ],
    [allFiles]
  );

  const statCards = [
    {
      label: 'Files stored',
      value: stats.totalFiles,
      note: 'Across documents, media, and archives'
    },
    {
      label: 'Storage used',
      value: formatBytes(stats.totalSize),
      note: 'Visible across your workspace'
    },
    {
      label: 'Categories',
      value: categories.length,
      note: activeTag ? `Filtered by #${activeTag}` : 'AI groups help keep things tidy'
    }
  ];

  const FileSkeleton = () => (
    <div className="surface-panel-soft animate-pulse space-y-4 p-4">
      <div className="h-5 w-1/3 rounded bg-white/8" />
      <div className="h-4 w-2/3 rounded bg-white/6" />
      <div className="h-4 w-1/2 rounded bg-white/6" />
    </div>
  );

  return (
    <div className="relative z-10 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <aside className="surface-panel hidden w-72 shrink-0 self-start p-5 lg:sticky lg:top-4 lg:block">
          <div className="border-b border-white/8 pb-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Workspace</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">AI Drive</h1>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Keep your uploads organized, searchable, and easier to review.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {menuItems.map(({ id, label, count, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveMenu(id)}
                className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-3 text-left transition ${
                  activeMenu === id
                    ? 'border-cyan-300/24 bg-cyan-300/10 text-white'
                    : 'border-white/8 bg-white/4 text-slate-300 hover:border-white/14 hover:bg-white/6 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-medium">{label}</span>
                    <span className="block text-xs text-slate-500">{count} items</span>
                  </span>
                </span>
                <span className="text-xs text-slate-500">{count}</span>
              </button>
            ))}
          </div>

          <div className="surface-panel-soft mt-6 p-4">
            <p className="text-sm font-medium text-white">{user?.username}</p>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Search smarter, upload quickly, and clean up what you no longer need.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6 pb-10">
          <section className="surface-panel overflow-hidden p-6 sm:p-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Dashboard</p>
                <h2 className="mt-3 text-4xl font-semibold text-white">
                  Welcome back, <span className="text-gradient">{user?.username}</span>
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Your storage workspace is ready. Upload new files, revisit tagged content, or narrow the view by category.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_35px_rgba(56,189,248,0.22)] transition hover:-translate-y-0.5"
                >
                  <Upload className="h-4 w-4" />
                  Upload file
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
              {menuItems.map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveMenu(id)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    activeMenu === id
                      ? 'border-cyan-300/24 bg-cyan-300/10 text-white'
                      : 'border-white/8 bg-white/4 text-slate-300 hover:bg-white/6'
                  }`}
                >
                  {label} | {count}
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map((card) => (
              <div key={card.label} className="surface-panel-soft p-5">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-500">{card.label}</p>
                <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">{card.note}</p>
              </div>
            ))}
          </section>

          <FileUpload onUploadComplete={loadFiles} />

          <section className="surface-panel p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
              </div>

              <div className="surface-panel-soft flex items-center gap-1 self-start rounded-full p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    view === 'grid'
                      ? 'bg-cyan-300/12 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Grid2x2 className="h-4 w-4" />
                    Grid
                  </span>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    view === 'list'
                      ? 'bg-cyan-300/12 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    List
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {categories.length > 0 && (
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              )}

              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/8 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/14"
                >
                  <Tag className="h-4 w-4" />
                  Active tag: #{activeTag}
                </button>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Library</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {activeMenu === 'all' && 'All Files'}
                  {activeMenu === 'images' && 'Images'}
                  {activeMenu === 'documents' && 'Documents'}
                </h3>
              </div>
              <p className="text-sm text-slate-400">{displayedFiles.length} result(s)</p>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <FileSkeleton />
                <FileSkeleton />
                <FileSkeleton />
              </div>
            ) : (
              <FileLibrary
                files={displayedFiles}
                onDelete={loadFiles}
                view={view}
                onTagClick={setActiveTag}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardView;
