const express = require("express");
const router = express.Router();
const { db, auth } = require("../firebase");

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
// Validates phone number and registers it in Firestore.
// The actual SMS is sent by the Firebase client SDK on the frontend.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber is required" });
    }

    // E.164 format check e.g. +919876543210
    const e164Regex = /^\+[1-9]\d{7,14}$/;
    if (!e164Regex.test(phoneNumber)) {
      return res.status(400).json({
        error: "phoneNumber must be in E.164 format, e.g. +919876543210",
      });
    }

    // Create or reset user record in Firestore
    const userRef = db.collection("users").doc(phoneNumber);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      await userRef.set({
        phoneNumber,
        createdAt: new Date().toISOString(),
        otpVerified: false,
      });
    } else {
      await userRef.update({
        otpVerified: false,
        updatedAt: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      message: "Phone number registered. Proceed with Firebase client-side OTP.",
    });
  } catch (err) {
    console.error("send-otp error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/verify-otp ───────────────────────────────────────────────
// Receives the Firebase ID token after the user confirms OTP on the frontend.
// Verifies it server-side and marks the user as verified in Firestore.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "idToken is required" });
    }

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, phone_number: phoneNumber } = decodedToken;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Token does not contain a phone number" });
    }

    // Mark user as verified in Firestore
    await db.collection("users").doc(phoneNumber).set(
      {
        uid,
        phoneNumber,
        otpVerified: true,
        verifiedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return res.json({
      success: true,
      message: "Phone number verified successfully",
      uid,
      phoneNumber,
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    if (err.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "OTP session expired. Please resend." });
    }
    if (err.code === "auth/argument-error" || err.code === "auth/invalid-id-token") {
      return res.status(401).json({ error: "Invalid token. Please try again." });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/auth/user/:phoneNumber ─────────────────────────────────────────
// Fetch a user record from Firestore by phone number
// ─────────────────────────────────────────────────────────────────────────────
router.get("/user/:phoneNumber", async (req, res) => {
  try {
    const phoneNumber = decodeURIComponent(req.params.phoneNumber);
    const userSnap = await db.collection("users").doc(phoneNumber).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ success: true, user: userSnap.data() });
  } catch (err) {
    console.error("get-user error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
