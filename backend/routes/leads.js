const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

// ─── POST /api/leads ──────────────────────────────────────────────────────────
// Saves a full booking/lead to Firestore and returns a bookingId
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      timeSlot,
      brand,
      model,
      issue,
      price,
      estimatedTime,
      doorstepPickup,
      isLiveRepair,
    } = req.body;

    // Basic validation
    if (!name || !phone || !brand || !model || !issue) {
      return res.status(400).json({ error: "Missing required fields: name, phone, brand, model, issue" });
    }

    const bookingData = {
      name,
      phone,
      address: address || "",
      timeSlot: timeSlot || "",
      brand,
      model,
      issue,
      price: price || 0,
      estimatedTime: estimatedTime || "",
      doorstepPickup: doorstepPickup || true,
      isLiveRepair: isLiveRepair || false,
      status: "pending",        // pending | confirmed | in_progress | completed | cancelled
      videoLink: null,          // filled by technician later
      technicianId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore — auto-generate document ID
    const docRef = await db.collection("leads").add(bookingData);

    return res.status(201).json({
      success: true,
      bookingId: docRef.id,
      message: "Booking created successfully",
    });
  } catch (err) {
    console.error("create-lead error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/leads ───────────────────────────────────────────────────────────
// Fetch all leads — used by Dashboard
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("leads")
      .orderBy("createdAt", "desc")
      .get();

    const leads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ success: true, leads });
  } catch (err) {
    console.error("get-leads error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/leads/:id ───────────────────────────────────────────────────────
// Fetch a single lead by booking ID
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("leads").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.json({ success: true, lead: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error("get-lead error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /api/leads/:id ─────────────────────────────────────────────────────
// Update lead status or video link (used by Dashboard/technician)
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id", async (req, res) => {
  try {
    const { status, videoLink, technicianId } = req.body;
    const updates = { updatedAt: new Date().toISOString() };

    if (status) updates.status = status;
    if (videoLink) updates.videoLink = videoLink;
    if (technicianId) updates.technicianId = technicianId;

    await db.collection("leads").doc(req.params.id).update(updates);

    return res.json({ success: true, message: "Booking updated" });
  } catch (err) {
    console.error("update-lead error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
