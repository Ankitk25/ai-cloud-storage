import {
  ArrowRight,
  BrainCircuit,
  Cloud,
  FolderKanban,
  Search,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: "Private by default",
      description: "Keep uploads secure while still making them easy to revisit."
    },
    {
      icon: BrainCircuit,
      title: "AI-assisted organization",
      description: "Tags, categories, and search cues help your library stay findable."
    },
    {
      icon: FolderKanban,
      title: "One calm workspace",
      description: "Upload, review, and manage every file from a single focused dashboard."
    }
  ];

  return (
    <div className="relative z-10">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <nav className="surface-panel flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-200">
              <Cloud className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-semibold text-white">CloudDrive</p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                AI file workspace
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <a href="#features" className="rounded-full px-4 py-2 hover:bg-white/6">
              Features
            </a>
            <a href="#preview" className="rounded-full px-4 py-2 hover:bg-white/6">
              Preview
            </a>
            <Link to="/login" className="rounded-full px-4 py-2 hover:bg-white/6">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/18"
            >
              Create account
            </Link>
          </div>
        </nav>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.1fr,0.9fr] lg:py-16">
          <div className="max-w-2xl">
            <span className="pill-chip inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-100/80">
              <BrainCircuit className="h-4 w-4" />
              Smart storage without the clutter
            </span>

            <h1 className="mt-6 text-5xl leading-[0.96] font-semibold sm:text-6xl lg:text-7xl">
              Find your files
              <span className="text-gradient block">before the folder hunt starts.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Store documents, screenshots, and media in one calm workspace with
              AI-generated tags, quick previews, and faster search.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_35px_rgba(56,189,248,0.22)] transition hover:-translate-y-0.5"
              >
                Launch your workspace
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="surface-panel-soft p-4">
                <p className="text-3xl font-semibold text-white">3x</p>
                <p className="mt-2 text-sm text-slate-400">
                  faster retrieval with cleaner tagging and search.
                </p>
              </div>
              <div className="surface-panel-soft p-4">
                <p className="text-3xl font-semibold text-white">1 hub</p>
                <p className="mt-2 text-sm text-slate-400">
                  for images, docs, media, and archived files.
                </p>
              </div>
              <div className="surface-panel-soft p-4">
                <p className="text-3xl font-semibold text-white">AI ready</p>
                <p className="mt-2 text-sm text-slate-400">
                  organize uploads as soon as they land.
                </p>
              </div>
            </div>
          </div>

          <div id="preview" className="surface-panel relative overflow-hidden p-5 sm:p-6">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />

            <div className="surface-panel-soft flex items-center gap-3 px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-200">
                <Search className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  Search by tags, file names, or extracted text
                </p>
                <p className="text-xs text-slate-400">
                  "invoice april" finds your documents immediately.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="surface-panel-soft p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/12 text-blue-200">
                      <FolderKanban className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-medium text-white">Q2-financial-report.pdf</p>
                      <p className="mt-1 text-sm text-slate-400">2.4 MB | updated today</p>
                    </div>
                  </div>
                  <span className="pill-chip px-3 py-1 text-xs text-cyan-100">
                    Financial
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["invoice", "quarterly", "finance"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-cyan-200/14 bg-cyan-300/8 px-3 py-1 text-xs text-cyan-100/85"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="surface-panel-soft p-4">
                  <p className="text-sm font-medium text-white">Upload status</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" />
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    AI analysis is tagging new screenshots automatically.
                  </p>
                </div>

                <div className="surface-panel-soft p-4">
                  <p className="text-sm font-medium text-white">Storage overview</p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-3xl font-semibold text-white">128</span>
                    <span className="pb-1 text-sm text-slate-400">files indexed</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    Smart categories keep the dashboard tidy as it grows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="grid gap-4 border-t border-white/8 py-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {highlights.map(({ icon: Icon, title, description }) => (
            <div key={title} className="surface-panel-soft p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
