import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cloud, LogOut, Loader, Upload } from 'lucide-react';
import { fileAPI } from '../services/api';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
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
  
  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [allFiles, selectedCategory, activeMenu]);

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

    if (activeTag) {
      filtered = filtered.filter(file =>
        file.tags && file.tags.toLowerCase().includes(activeTag)
      );
    } 
    else if (activeMenu === "documents") {
      filtered = filtered.filter(file =>
        file.mime_type?.includes("pdf") ||
        file.mime_type?.includes("document") ||
        file.mime_type?.includes("text")
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(file => file.category === selectedCategory);
    }

    setDisplayedFiles(filtered);
  };

  const handleSearch = (query) => {
    const searchTerm = query.toLowerCase();
    const filtered = allFiles.filter(file =>
      file.original_filename.toLowerCase().includes(searchTerm) ||
      file.tags?.toLowerCase().includes(searchTerm) ||
      file.extracted_text?.toLowerCase().includes(searchTerm) ||
      file.category?.toLowerCase().includes(searchTerm)
    );
    setDisplayedFiles(filtered);
    setSelectedCategory('all');
  };

  const handleClearSearch = () => {
    filterFiles();
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

  const FileSkeleton = () => (
    <div className="p-4 rounded-xl animate-pulse space-y-3 glass">
      <div className="h-4 w-1/3 bg-white/10 rounded" />
      <div className="h-3 w-1/2 bg-white/10 rounded" />
      <div className="h-3 w-1/4 bg-white/10 rounded" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0b0f12] text-gray-200 relative overflow-hidden">

      {/* Glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/10 blur-[120px] bottom-[-100px] right-[-100px]" />

      {/* Sidebar */}
      <div className="w-64 bg-[#0e141a] border-r border-cyan-500/10 p-6 flex flex-col z-10">
        <h2 className="text-xl font-bold text-cyan-400 mb-8">AI Drive</h2>

        <div className="space-y-3 text-gray-300">
          {["all", "images", "documents"].map(item => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${
                activeMenu === item
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "hover:bg-cyan-500/10 hover:text-cyan-400"
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
      <div className="flex-1 flex flex-col z-10">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-cyan-500/10">
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 animate-fadeIn">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#0f1720]/80 border border-cyan-500/20 backdrop-blur-xl">
              <p className="text-sm text-cyan-400">Total Files</p>
              <p className="text-3xl font-bold text-white">{stats.totalFiles}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f1720]/80 border border-cyan-500/20 backdrop-blur-xl">
              <p className="text-sm text-cyan-400">Storage Used</p>
              <p className="text-3xl font-bold text-white">
                {formatBytes(stats.totalSize)}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30">
            <div className="glass hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition rounded-2xl p-3">
              <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
            </div>
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
              <div className="space-y-4">
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