import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
import { fileAPI } from '../services/api';
import FileUpload from '../components/FileUpload';
import FileLibrary from '../components/FileLibrary';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState("all");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [allFiles, setAllFiles] = useState([]);
  const [displayedFiles, setDisplayedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalFiles: 0, totalSize: 0 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState("grid");
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [allFiles, selectedCategory, activeMenu, activeTag, searchQuery]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fileAPI.listFiles();
      setAllFiles(data);

      const uniqueCategories = [...new Set(data.map(f => f.category).filter(Boolean))];
      setCategories(uniqueCategories);

      const totalSize = data.reduce((sum, file) => sum + file.file_size, 0);
      setStats({
        totalFiles: data.length,
        totalSize: totalSize
      });
    } catch (err) {
      console.error('Failed to load files', err);
    } finally {
      setLoading(false);
    }
  };

  const filterFiles = () => {
    let filtered = [...allFiles];

    if (activeMenu === "images") {
      filtered = filtered.filter((file) => file.mime_type?.startsWith("image/"));
    } else if (activeMenu === "documents") {
      filtered = filtered.filter(file =>
        file.mime_type?.includes("pdf") ||
        file.mime_type?.includes("document") ||
        file.mime_type?.includes("text")
      );
    }

    if (activeTag) {
      filtered = filtered.filter((file) => {
        if (!file.tags) return false;

        try {
          const parsedTags = JSON.parse(file.tags);
          return Array.isArray(parsedTags)
            ? parsedTags.some((tag) => tag.toLowerCase() === activeTag)
            : file.tags.toLowerCase().includes(activeTag);
        } catch {
          return file.tags.toLowerCase().includes(activeTag);
        }
      });
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(file => file.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();

      filtered = filtered.filter((file) =>
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
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
    <div className="flex min-h-screen bg-dashboardBg">

      {/* Glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/10 blur-[120px] bottom-[-100px] right-[-100px]" />

      {/* Sidebar */}
      <div className="w-64 bg-[#1f1f2e] text-gray-300 flex flex-col p-6">
        <h2 className="text-lg font-semibold text-white mb-6">AI Drive</h2>

        <div className="space-y-3 text-gray-300">
          {["all", "images", "documents"].map(item => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`w-64 bg-[#1f1f2e] text-gray-300 flex flex-col p-6 ${
                activeMenu === item
                  ? "bg-white/10 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              {item === "all" && "📁 All Files"}
              {item === "images" && "🖼 Images"}
              {item === "documents" && "📄 Documents"}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 bg-[#F3F3F3] p-6">

        <div className="flex justify-between items-center mb-6">

          {/* Upload Button */}
          <button
            onClick={() => document.getElementById('file-upload-input')?.click()}
            className="bg-cyan-500 text-white px-6 py-2 rounded-md hover:bg-cyan-600"
          >
            Upload
          </button>

          {/* Search */}
          <input
            type="text"
            placeholder="Search here..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-72 p-2 border rounded-md bg-white"
          />

        </div>

        {/* Header */}
        {/* <div className="flex justify-between items-center px-6 py-4 border-b border-cyan-500/10">
          <div className="flex items-center gap-3">
            <Cloud className="h-7 w-7 text-cyan-400" />
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AI Cloud Storage
              </h1>
              <p className="text-xs text-gray-400">Welcome, {user?.username}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-cyan-500 to-blue-700 px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition"
          >
            Logout
          </button>
        </div> */}

        {/* Content */}
        <div className="p-6 space-y-6 animate-fadeIn">

          {/* Stats
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">Total Files</p>
              <p className="text-2xl font-bold text-black">{stats.totalFiles}</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">Storage Used</p>
              <p className="text-2xl font-bold text-black">
                {formatBytes(stats.totalSize)}
              </p>
            </div>
          </div> */}

          {/* Search */}
          
            <div className="transition rounded-2xl p-3">
              <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
            </div>

          {/* Filters */}
          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}

          {/* Files */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-white">
              {activeMenu === "all" && "All Files"}
              {activeMenu === "images" && "Images"}
              {activeMenu === "documents" && "Documents"}
            </h2>

            {loading ? (
              <div className="bg-white rounded-lg shadow-sm">
                <FileSkeleton />
                <FileSkeleton />
                <FileSkeleton />
              </div>
            ) : (
              <FileList
                files={displayedFiles}
                onDelete={loadFiles}
                view={view}
                onTagClick={setActiveTag}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Upload */}
      <button
        onClick={() => document.getElementById('file-upload-input')?.click()}
        className="fixed bottom-6 right-6
                  bg-gradient-to-r from-cyan-500 to-blue-600
                  p-4 rounded-full
                  shadow-[0_0_20px_rgba(0,255,255,0.4)]
                  hover:scale-110 hover:shadow-[0_0_35px_rgba(0,255,255,0.6)]
                  transition-all duration-300
                  z-50">
        <Upload className="w-6 h-6 text-white" />
      </button>

      {/* Hidden Upload */}
      <div className="hidden">
        <FileUpload onUploadComplete={loadFiles} />
      </div>
    </div>
  );
};

export default Dashboard;
