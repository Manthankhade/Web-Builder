import { useEffect, useState } from "react";
import { Plus, FolderOpen, Eye, RefreshCw, X, LoaderCircle, Globe, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ProjectThumbnail } from "../assets/ui";
import { safePreviewHtml } from "../utils/safePreview";
import { createProject, generateProject, getProjects, deployToVercel, apiError } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading, updateUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [deployingProjectId, setDeployingProjectId] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      getProjects()
        .then((data) => setProjects(data.project || []))
        .catch((err) => setMessage(apiError(err)));
    }
  }, [user, loading, navigate]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setBusy(true);
    setMessage("");
    let savedProject = false;

    try {
      const data = await createProject({ prompt: prompt.trim() });
      const project = data.project;
      savedProject = true;
      setProjects((prev) => [project, ...prev]);
      setPrompt("");
      const generated = await generateProject(project.id, project.prompt || prompt.trim());
      setProjects((prev) => prev.map((item) => (item.id === generated.project.id ? generated.project : item)));
      if (generated.user) updateUser(generated.user);
      if (generated.project.html) setSelectedProject(generated.project);
      setMessage("Project created and content generated successfully.");
    } catch (err) {
      setMessage(
        savedProject
          ? `Project saved, but website generation failed: ${apiError(err)}`
          : `Project creation failed: ${apiError(err)}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async (project) => {
    setDeployingProjectId(project.id);
    setMessage("");
    try {
      const result = await deployToVercel(project.id, {});
      setProjects((currentProjects) =>
        currentProjects.map((item) =>
          item.id === project.id
            ? { ...item, deployUrl: result.url, deployedAt: new Date().toISOString() }
            : item,
        ),
      );
      setMessage(`Published. Your public website is available at ${result.url}`);
    } catch (err) {
      const error = apiError(err);
      setMessage(
        error.includes("No Vercel token")
          ? "Add VERCEL_TOKEN to backend/.env and restart the backend to enable free Vercel publishing."
          : `Publishing failed: ${error}`,
      );
    } finally {
      setDeployingProjectId("");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#08090a] text-white">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-orange-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/38">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">My Projects</h1>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/80">
            Credits: <span className="font-semibold text-orange-300">{user.credits ?? 0}</span>
          </div>
        </div>

        <form onSubmit={handleCreateProject} className="mb-8 rounded-3xl border border-white/8 bg-[#0d0f12] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <label className="mb-2 block text-sm text-white/70">Describe the website you want to build</label>
            <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
              placeholder="Create a welcoming hostel landing page for college students near Pune University. Include a booking hero, room options and prices, amenities, food, safety, location, student testimonials, FAQs, and contact details. Make it warm, trustworthy, and mobile-friendly."
            className="w-full rounded-2xl border border-white/10 bg-[#111316] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-orange-400/50"
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-white/55">{prompt.trim().length}/2000</div>
            <button
              type="submit"
              disabled={busy || !prompt.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "Generating..." : "Create project"}
              <Plus className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>

        {message && <p className="mb-5 text-sm text-orange-200">{message}</p>}

        <div className="grid gap-5 md:grid-cols-3">
          {projects.length === 0 ? (
            <div className="md:col-span-3 rounded-3xl border border-dashed border-white/10 bg-[#0d0f12] p-8 text-center text-white/55">
              No projects yet. Create your first one above.
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="flex flex-col rounded-2xl border border-white/8 bg-[#0d0f12] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                <ProjectThumbnail html={project.html} className="mb-4 rounded-xl" />
                <div className="mb-5 flex items-center justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300 ring-1 ring-white/8">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/4 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                    {project.published ? "Published" : "Draft"}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-white">{project.name || "Untitled"}</h2>
                <p className="mt-2 text-sm text-white/55">{project.prompt || "No prompt set yet."}</p>

                {project.html ? (
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-orange-300 hover:text-orange-200"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePublish(project)}
                      disabled={Boolean(deployingProjectId)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300 hover:text-emerald-200 disabled:opacity-50"
                    >
                      {deployingProjectId === project.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                      {deployingProjectId === project.id ? "Publishing..." : "Publish free"}
                    </button>
                    {project.deployUrl && (
                      <a
                        href={project.deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open live site
                      </a>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      setMessage("");
                      try {
                        const generated = await generateProject(project.id, project.prompt);
                        setProjects((prev) => prev.map((item) => item.id === project.id ? generated.project : item));
                        if (generated.user) updateUser(generated.user);
                        setSelectedProject(generated.project);
                      } catch (err) {
                        setMessage(apiError(err));
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-orange-300 hover:text-orange-200 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry generation
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {selectedProject?.html && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-[#08090a]" role="dialog" aria-modal="true" aria-label={`${selectedProject.name} website preview`}>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
            <div className="min-w-0 truncate text-sm font-medium text-white">{selectedProject.name}</div>
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="Close website preview"
              className="ml-4 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/75 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <iframe
            title={`${selectedProject.name} preview`}
            srcDoc={safePreviewHtml(selectedProject.html)}
            sandbox="allow-scripts allow-forms"
            className="min-h-0 w-full flex-1 border-0 bg-white"
          />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
