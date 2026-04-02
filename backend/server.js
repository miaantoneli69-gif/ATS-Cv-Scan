const express = require('express');
const cors = require('cors');
const { analyzeCV } = require('./analyzer');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Simple in-memory storage to simulate user quotas (1 per week)
const userQuotas = new Map();

// Helper to check and update quota
function checkQuota(userId) {
  const now = Date.now();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

  if (!userQuotas.has(userId)) {
    // First time user, gets 1 free
    userQuotas.set(userId, { uses: 1, lastReset: now });
    return { allowed: true, creditsRemaining: 0 };
  }

  const userData = userQuotas.get(userId);
  if (now - userData.lastReset > ONE_WEEK) {
    // Week has passed, reset quota
    userData.uses = 1;
    userData.lastReset = now;
    return { allowed: true, creditsRemaining: 0 };
  }

  if (userData.uses > 0) {
    // Still have uses this week
    userData.uses -= 1;
    return { allowed: true, creditsRemaining: userData.uses };
  }

  // No uses left
  return { allowed: false, creditsRemaining: 0 };
}

// Endpoint to simulate adding credits (Payment mockup)
app.post('/api/pay', (req, res) => {
  const userId = req.body.userId || req.ip;
  const creditsToBuy = req.body.credits || 10;
  
  if (!userQuotas.has(userId)) {
    userQuotas.set(userId, { uses: creditsToBuy, lastReset: Date.now() });
  } else {
    userQuotas.get(userId).uses += creditsToBuy;
  }
  
  res.json({ success: true, message: `${creditsToBuy} crédits ajoutés avec succès !`, credits: userQuotas.get(userId).uses });
});

// Endpoint for analysis
app.post('/api/analyze', (req, res) => {
  const cvText = req.body.cvText;
  const userId = req.body.userId || req.ip;

  if (!cvText) {
    return res.status(400).json({ error: "Aucun texte de CV fourni." });
  }

  // Check quota
  const quotaStatus = checkQuota(userId);
  if (!quotaStatus.allowed) {
    return res.status(403).json({ 
      error: "Quota épuisé", 
      message: "Votre analyse gratuite hebdomadaire a déjà été utilisée. Veuillez recharger vos crédits." 
    });
  }

  // Run analyzing logic
  const analysisResult = analyzeCV(cvText);

  // Add credit info to response
  analysisResult.creditsRemaining = quotaStatus.creditsRemaining;

  // Small artificial delay to mock "deep AI processing"
  setTimeout(() => {
    res.json(analysisResult);
  }, 2000); 
});

app.listen(port, () => {
  console.log(`ATS-Scanner Backend running logic on http://localhost:${port}`);
});
