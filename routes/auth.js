const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Transporteur email (Brevo SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_KEY,
  },
  connectionTimeout: 10000, // 10s max pour se connecter
  greetingTimeout: 10000,
});



// inscription
router.post('/register', async (req, res) => {
  try {
    const { nom, email, motDePasse, classe } = req.body;

    const existe = await Utilisateur.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const motDePasseHashe = await bcrypt.hash(motDePasse, 10);
    const utilisateur = new Utilisateur({ nom, email, motDePasse: motDePasseHashe, classe });
    await utilisateur.save();

    const token = jwt.sign(
      { id: utilisateur._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        classe: utilisateur.classe,
        solde: utilisateur.solde,
        role: utilisateur.role,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// connexion
router.post('/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const utilisateur = await Utilisateur.findOne({ email });

    if (!utilisateur) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const valide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);

    if (!valide) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: utilisateur._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        classe: utilisateur.classe,
        solde: utilisateur.solde,
        role: utilisateur.role,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// mot de passe oublié — envoie un email avec un lien de réinitialisation
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      // Répondre toujours OK pour ne pas révéler si l'email existe
      return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    }

    // Générer un token sécurisé (64 hex chars)
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // expire dans 1 heure

    utilisateur.resetToken = token;
    utilisateur.resetTokenExpiry = expiry;
    await utilisateur.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"CantineApp 🍽️" <${process.env.BREVO_FROM_EMAIL}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe — CantineApp',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;background:#f9f9f9;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="background:#E8001C;padding:32px;text-align:center;">
            <div style="font-size:2.5rem;">🍽️</div>
            <h1 style="color:white;margin:10px 0 0;font-size:1.4rem;font-weight:800;">CantineApp</h1>
          </div>
          <div style="padding:36px;">
            <h2 style="color:#2d2d2d;font-size:1.15rem;margin-bottom:8px;">Réinitialisation du mot de passe</h2>
            <p style="color:#555;line-height:1.7;margin-bottom:8px;">Bonjour <strong>${utilisateur.nom}</strong>,</p>
            <p style="color:#555;line-height:1.7;">Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte CantineApp. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetLink}"
                 style="background:#E8001C;color:white;padding:15px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:1rem;display:inline-block;">
                🔑 Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color:#888;font-size:0.85rem;line-height:1.6;">
              Ce lien est valable <strong>1 heure</strong>.<br>
              Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe ne changera pas.
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
            <p style="color:#bbb;font-size:0.78rem;text-align:center;">CantineApp — Système de gestion de cantine scolaire</p>
          </div>
        </div>
      `,
    });

    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (err) {
    console.error('Erreur forgot-password:', err);
    res.status(500).json({ message: `Erreur SMTP: ${err.message || err}` });
  }
});

// réinitialiser le mot de passe avec le token reçu par email
router.post('/reset-password', async (req, res) => {
  try {
    const { token, nouveauMotDePasse } = req.body;

    if (!token || !nouveauMotDePasse) {
      return res.status(400).json({ message: 'Token et nouveau mot de passe requis.' });
    }

    if (nouveauMotDePasse.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const utilisateur = await Utilisateur.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!utilisateur) {
      return res.status(400).json({ message: 'Lien invalide ou expiré. Veuillez refaire une demande.' });
    }

    utilisateur.motDePasse = await bcrypt.hash(nouveauMotDePasse, 10);
    utilisateur.resetToken = null;
    utilisateur.resetTokenExpiry = null;
    await utilisateur.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;