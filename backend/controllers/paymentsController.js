import mongoose from "mongoose";
import { Payment } from "../models/Payments.js";
import { User } from "../models/Users.js";
import {
  constructStripeEvent,
  createCheckoutSession,
  getStripePaymentMode,
  isStripeConfigured,
  isStripeWebhookConfigured,
  retrieveSession,
} from "../utils/services.js";

// credit packages
export const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 50,
    amount: 499,
    currency: "usd",
    perCredit: "$0.10",
    tagline: "Try a few new projects",
  },
  {
    id: "popular",
    name: "Popular",
    credits: 200,
    amount: 1499,
    currency: "usd",
    perCredit: "$0.075",
    tagline: "Best for active creators",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 500,
    amount: 2999,
    currency: "usd",
    perCredit: "$0.06",
    tagline: "For agencies and power users",
  },
];

// to return list of packages and check for Stripe setup
export function listPackages(req, res) {
  res.json({
    packages: PACKAGES,
    configured: isStripeConfigured() && isStripeWebhookConfigured(),
    paymentMode: getStripePaymentMode(),
  });
}

// to check a Stripe checkout session
export async function createSession(req, res, next) {
  try {
    if (!isStripeConfigured() || !isStripeWebhookConfigured()) {
      return res.status(503).json({
        error: "Payments require STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in backend/.env.",
      });
    }

    const packageId = req.body.packageId;
    if (!packageId) {
      return res.status(400).json({ error: "PackageId is required." });
    }

    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return res.status(400).json({ error: "Unknown Package." });
    }

    const origin = req.headers.origin || "http://localhost:3000";
    const { id, url } = await createCheckoutSession({
      pkg,
      user: req.user,
      successUrl: `${origin}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/pricing?cancelled=1`,
    });

    await Payment.create({
      user: req.user._id,
      packageId: pkg.id,
      creditsPurchased: pkg.credits,
      amount: pkg.amount,
      currency: pkg.currency,
      stripeSessionId: id,
      status: "created",
    });

    res.json({ url, sessionId: id });
  } catch (err) {
    next(err);
  }
}

async function fulfillPaidSession(stripeSession, ownerId = null) {
  if (stripeSession.payment_status !== "paid") {
    const error = new Error("Payment not completed yet");
    error.status = 400;
    throw error;
  }

  const dbSession = await mongoose.startSession();
  let result;
  try {
    await dbSession.withTransaction(async () => {
      const query = { stripeSessionId: stripeSession.id };
      if (ownerId) query.user = ownerId;
      const payment = await Payment.findOne(query).session(dbSession);
      if (!payment) {
        const error = new Error("Payment session not found");
        error.status = 404;
        throw error;
      }

      const userId = payment.user.toString();
      const credits = Number(payment.creditsPurchased);
      const metadata = stripeSession.metadata || {};
      const detailsMatch =
        stripeSession.client_reference_id === userId &&
        metadata.userId === userId &&
        metadata.packageId === payment.packageId &&
        Number(metadata.credits) === credits &&
        stripeSession.amount_total === payment.amount &&
        stripeSession.currency?.toLowerCase() === payment.currency.toLowerCase();

      if (!detailsMatch || !Number.isFinite(credits) || credits <= 0) {
        const error = new Error("Stripe session details do not match the stored payment");
        error.status = 400;
        throw error;
      }

      const user = await User.findById(payment.user).session(dbSession);
      if (!user) {
        const error = new Error("Payment owner no longer exists");
        error.status = 404;
        throw error;
      }

      if (payment.status === "paid") {
        result = { alreadyCredited: true, creditsAdded: 0, user: user.toClient() };
        return;
      }
      if (payment.status !== "created") {
        const error = new Error("Payment is not eligible for credit fulfillment");
        error.status = 409;
        throw error;
      }

      payment.status = "paid";
      payment.stripePaymentIntentId = stripeSession.payment_intent || null;
      await payment.save({ session: dbSession });

      user.credits = (user.credits || 0) + credits;
      await user.save({ session: dbSession });
      result = { alreadyCredited: false, creditsAdded: credits, user: user.toClient() };
    });
  } finally {
    await dbSession.endSession();
  }
  return result;
}

export async function verifySession(req, res, next) {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({ error: "Stripe is not configured." });
    }

    const sessionId = req.body.sessionId;
    if (!sessionId || String(sessionId).length < 5) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const payment = await Payment.findOne({
      stripeSessionId: sessionId,
      user: req.user._id,
    });
    if (!payment) return res.status(404).json({ error: "Session not found" });

    const stripeSession = await retrieveSession(sessionId);
    const fulfillment = await fulfillPaidSession(stripeSession, req.user._id);
    return res.json({ ok: true, ...fulfillment });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    return next(err);
  }
}

export async function stripeWebhook(req, res) {
  if (!isStripeWebhookConfigured()) {
    return res.status(503).json({ error: "Stripe webhook is not configured." });
  }

  let event;
  try {
    event = constructStripeEvent(req.body, req.headers["stripe-signature"]);
  } catch (err) {
    return res.status(400).json({ error: `Invalid Stripe webhook signature: ${err.message}` });
  }

  try {
    if (
      ["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type) &&
      event.data.object.payment_status === "paid"
    ) {
      await fulfillPaidSession(event.data.object);
    } else if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      await Payment.updateOne(
        { stripeSessionId: event.data.object.id, status: "created" },
        { $set: { status: "failed" } },
      );
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook fulfillment failed:", err.message);
    return res.status(500).json({ error: "Payment fulfillment failed; Stripe will retry." });
  }
}

// to get history of payment
export async function listHistory(req, res, next) {
  try {
    const list = await Payment.find({ user: req.user._id, status: "paid" })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ payment: list.map((p) => p.toClient()) });
  } catch (err) {
    next(err);
  }
}