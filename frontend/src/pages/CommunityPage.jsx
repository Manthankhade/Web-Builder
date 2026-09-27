import { useEffect, useState } from "react";
import { Heart, MessageCircle, Sparkles, LoaderCircle, RefreshCw } from "lucide-react";
import Navbar from "../components/Navbar";
import { getCommunity, likeCommunityProject, apiError } from "../utils/api";

const CommunityPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    getCommunity()
      .then((data) => {
        if (active) setItems(data.project || []);
      })
      .catch((err) => {
        if (active) setMessage(apiError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  const toggleLike = async (id) => {
    try {
      await likeCommunityProject(id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, likedByMe: !item.likedByMe, likes: item.likedByMe ? Math.max(0, item.likes - 1) : item.likes + 1 }
            : item,
        ),
      );
    } catch (err) {
      setMessage(apiError(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/38">Browse</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">Community</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-orange-200/80">
            <Sparkles className="h-3.5 w-3.5" />
            Featured
          </div>
        </div>

        {message && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-400/25 bg-orange-400/5 px-4 py-3" role="alert">
            <p className="text-sm text-orange-200">{message}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setMessage("");
                setReload((current) => current + 1);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-orange-300" />
          </div>
        ) : (
          items.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center">
              <Sparkles className="mb-4 h-8 w-8 text-orange-300" />
              <h2 className="text-lg font-semibold">No shared projects yet</h2>
              <p className="mt-2 max-w-sm text-sm text-white/55">Published projects from the community will appear here.</p>
            </div>
          ) : (
            <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="flex min-h-64 flex-col rounded-2xl border border-white/8 bg-[#0d0f12] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                  <div className="mb-4 h-36 shrink-0 rounded-xl bg-gradient-to-br from-orange-500/20 via-violet-500/10 to-transparent" />
                  <h2 className="text-lg font-semibold text-white">{item.name || "Community project"}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/55">{item.prompt || "Shared project from the community."}</p>

                  <div className="mt-auto flex items-center gap-5 pt-5 text-sm text-white/60">
                    <button
                      type="button"
                      onClick={() => toggleLike(item.id)}
                      aria-label={`${item.likedByMe ? "Unlike" : "Like"} ${item.name || "community project"}`}
                      className={`inline-flex items-center gap-1.5 ${item.likedByMe ? "text-pink-300" : "text-white/60"}`}
                    >
                      <Heart className={`h-4 w-4 ${item.likedByMe ? "fill-current" : ""}`} />
                      {item.likes || 0}
                    </button>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4 text-sky-300" />
                      {item.comments || 0}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default CommunityPage;
