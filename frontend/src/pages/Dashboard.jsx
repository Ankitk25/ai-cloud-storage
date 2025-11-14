import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cloud, LogOut, Loader } from 'lucide-react';
import { fileAPI } from '../services/api';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalFiles: 0, totalSize: 0 });

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fileAPI.listFiles();
      setFiles(data);
      
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Cloud className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">AI Cloud Storage</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow px-6 py-5">
            <div className="text-sm font-medium text-gray-500">Total Files</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalFiles}</div>
          </div>
          <div className="bg-white rounded-lg shadow px-6 py-5">
            <div className="text-sm font-medium text-gray-500">Storage Used</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{formatBytes(stats.totalSize)}</div>
          </div>
        </div>

        {/* Upload */}
        <div className="mb-8">
          <FileUpload onUploadComplete={loadFiles} />
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Files</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <FileList files={files} onDelete={loadFiles} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;