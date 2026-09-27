import { useEffect, useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { createCheckoutSession, getPackages, verifySession, apiError } from "../utils/api";

const PricingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateUser } = useAuth();
  const sessionId = searchParams.get("session_id");
  const [packages, setPackages] = useState([]);
  const [configured, setConfigured] = useState(false);
  const [paymentMode, setPaymentMode] = useState("test");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(0);
  const [checkoutPackage, setCheckoutPackage] = useState("");
  const [verificationAttempt, setVerificationAttempt] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(() =>
    sessionId ? "Confirming your payment and adding credits..." : "",
  );
  const [verifyingPayment, setVerifyingPayment] = useState(Boolean(sessionId));
  const [paymentError, setPaymentError] = useState(false);

  useEffect(() => {
    let active = true;
    getPackages()
      .then((data) => {
        if (!active) return;
        setPackages(data.packages || []);
        setConfigured(Boolean(data.configured));
        setPaymentMode(data.paymentMode || "test");
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

  useEffect(() => {
    if (!sessionId) return undefined;

    let active = true;
    verifySession(sessionId)
      .then((data) => {
        if (!active) return;
        updateUser(data.user);
        setPaymentStatus(
          data.alreadyCredited
            ? "Payment confirmed. Your credit balance is up to date."
            : `${data.creditsAdded} credits added to your account.`,
        );
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("session_id");
        setSearchParams(nextParams, { replace: true });
      })
      .catch((err) => {
        if (active) {
          setPaymentError(true);
          setPaymentStatus(apiError(err));
        }
      })
      .finally(() => {
        if (active) setVerifyingPayment(false);
      });

    return () => {
      active = false;
    };
  }, [sessionId, verificationAttempt, updateUser, searchParams, setSearchParams]);

  const buyPackage = async (packageId) => {
    setCheckoutPackage(packageId);
    setMessage("");
    try {
      const data = await createCheckoutSession(packageId);
      if (data.url) window.location.assign(data.url);
      else setMessage("Checkout session created successfully.");
    } catch (err) {
      setMessage(apiError(err));
    } finally {
      setCheckoutPackage("");
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/38">Pricing</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">Choose your plan</h1>
        </div>

        {paymentStatus && (
          <div className={`mx-auto mb-6 flex max-w-2xl flex-wrap items-center justify-center gap-3 rounded-xl border px-4 py-3 ${paymentError ? "border-red-400/25 bg-red-400/5" : "border-emerald-400/25 bg-emerald-400/5"}`} role={paymentError ? "alert" : "status"} aria-live="polite">
            <p className={`text-center text-sm ${paymentError ? "text-red-200" : "text-emerald-200"}`}>{paymentStatus}</p>
            {sessionId && !verifyingPayment && (
              <button
                type="button"
                onClick={() => {
                  setVerifyingPayment(true);
                  setPaymentError(false);
                  setPaymentStatus("Confirming your payment and adding credits...");
                  setVerificationAttempt((attempt) => attempt + 1);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5"
              >
                <RefreshCw className="h-4 w-4" />
                Retry confirmation
              </button>
            )}
          </div>
        )}

        {message && (
          <div className="mx-auto mb-6 flex max-w-2xl flex-wrap items-center justify-center gap-3 rounded-xl border border-orange-400/25 bg-orange-400/5 px-4 py-3" role="alert">
            <p className="text-center text-sm text-orange-200">{message}</p>
            {!configured && (
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
            )}
          </div>
        )}

        {!configured && !loading && (
          <p className="mb-6 text-center text-sm text-white/60">
            Payments need a Stripe secret key and webhook signing secret in the backend environment before checkout can be enabled.
          </p>
        )}

        {configured && paymentMode === "test" && (
          <p className="mb-6 text-center text-sm text-amber-200">
            Test mode is active. Payments are simulated and no real money will be charged.
          </p>
        )}

        {loading ? (
          <p className="text-center text-white/60">Loading packages...</p>
        ) : (
          packages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-sm text-white/60">
              No plans are available right now.
            </div>
          ) : (
          <div className="grid items-stretch gap-5 md:grid-cols-3">
            {packages.map((plan) => (
              <div
                key={plan.id}
                className={`flex h-full flex-col rounded-2xl border p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] ${
                  plan.highlighted ? "border-orange-400/50 bg-orange-500/5" : "border-white/8 bg-[#0d0f12]"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4 inline-block rounded-full border border-orange-400/30 bg-orange-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-orange-200">
                    Most popular
                  </div>
                )}

                <h2 className="text-2xl font-semibold">{plan.name}</h2>
                <p className="mt-2 text-sm text-white/60">{plan.tagline}</p>

                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-semibold tracking-[-0.05em]">${(plan.amount / 100).toFixed(2)}</span>
                  <span className="pb-1 text-sm text-white/50">/ one-time</span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  <li className="flex items-center gap-2 text-sm text-white/75">
                    <Check className="h-4 w-4 text-orange-300" />
                    {plan.credits} credits included
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/75">
                    <Check className="h-4 w-4 text-orange-300" />
                    Instant activation
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/75">
                    <Check className="h-4 w-4 text-orange-300" />
                    Flexible project generation
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => buyPackage(plan.id)}
                  disabled={!configured || Boolean(checkoutPackage)}
                  className="mt-7 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkoutPackage === plan.id ? "Opening checkout..." : configured ? "Select plan" : "Unavailable"}
                </button>
              </div>
            ))}
          </div>
          )
        )}
      </main>
    </div>
  );
};

export default PricingPage;
