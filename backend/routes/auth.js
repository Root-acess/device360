import express from "express";
import { db, auth } from "../firebase.js"; // ⚠️ note .js extension

const router = express.Router();

// ─── SEND OTP ─────────────────────────────────────────────
router.post("/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber is required" });
    }

    const e164Regex = /^\+[1-9]\d{7,14}$/;
    if (!e164Regex.test(phoneNumber)) {
      return res.status(400).json({
        error: "phoneNumber must be in E.164 format",
      });
    }

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

    res.json({
      success: true,
      message: "Proceed with Firebase OTP on frontend",
    });
  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── VERIFY OTP ─────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "idToken is required" });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, phone_number: phoneNumber } = decodedToken;

    if (!phoneNumber) {
      return res.status(400).json({ error: "No phone number in token" });
    }

    await db.collection("users").doc(phoneNumber).set(
      {
        uid,
        phoneNumber,
        otpVerified: true,
        verifiedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    res.json({
      success: true,
      uid,
      phoneNumber,
    });
  } catch (err) {
    console.error("verify-otp error:", err);

    if (err.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "OTP expired" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET USER ─────────────────────────────────────────────
router.get("/user/:phoneNumber", async (req, res) => {
  try {
    const phoneNumber = decodeURIComponent(req.params.phoneNumber);

    const userSnap = await db.collection("users").doc(phoneNumber).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user: userSnap.data() });
  } catch (err) {
    console.error("get-user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;