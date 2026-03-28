// src/pages/LandingPage.jsx
import { Link } from "react-router-dom";
import { Cloud } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full flex flex-col">

      {/* Navbar */}
      <nav className="glass w-full flex justify-between items-center py-6 px-8">
        <div className="flex items-center gap-2">
          <Cloud className="h-8 w-8 text-cyan-400" />
          <span className="text-xl font-semibold tracking-wide">AI Cloud Storage</span>
        </div>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition font-medium"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-5 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 backdrop-blur transition font-medium"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-1 justify-center items-center px-6">
        <div className="glass max-w-4xl p-10 text-center">

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          Store Smarter.  
          <br />
          Search Faster.  
          <br />
          Powered by AI.
        </h1>

        <p className="text-gray-400 text-lg mt-6 max-w-2xl">
          “Your memories, documents, and ideas — beautifully organized with AI.  
          Let intelligence handle the chaos while you focus on what matters.”
        </p>

        <Link
          to="/register"
          className="mt-10 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 shadow-cyan-900/40 "
        >
          Get Started →
        </Link>
      </div></div>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} AI Cloud Storage • All rights reserved.
      </footer>
    </div>
  );
}
