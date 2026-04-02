// analyzer.js
// Logique basée sur les règles du prompt utilisateur

function analyzeCV(text) {
    const textLower = text.toLowerCase();
    
    let score = 0;
    const errors = [];
    const revisions = [];
    const keywordsToAdd = [];
    let layoutAdvice = "Votre CV devrait être sur une seule colonne standard. Évitez les zones de textes et icônes complexes.";

    // 1. Structure Linéaire (Base 20)
    // On simule une détection grossière de colonnes si on trouve beaucoup d'espaces multiples ou tabulations
    const hasTabs = (text.match(/\t/g) || []).length > 3;
    const hasMultipleSpaces = (text.match(/ {5,}/g) || []).length > 3;
    
    if (hasTabs || hasMultipleSpaces) {
        score += 5; // Malus appliqué (-15 points par rapport aux 20)
        errors.push("Structure complexe détectée (probablement des colonnes) qui perturbera le parsing ATS.");
        revisions.push({
            section: "Structure globale",
            problem: "Le CV présente des espaces inhabituels ou des tabulations, signalant un format multi-colonnes.",
            avant: "[Mise en page complexe visuelle]",
            apres: "[Format linéaire de haut en bas sans colonnes latérales]",
            pourquoi: "Les ATS lisent le texte de gauche à droite et de haut en bas continuellement. Les colonnes mélangent souvent les titres de section avec les descriptions."
        });
        layoutAdvice = "Passez d'un format deux colonnes à une colonne simple pour garantir 100% de lisibilité robotique.";
    } else {
        score += 20;
    }

    // 2. Absence de Graphiques (+10 pts)
    // Simulons l'analyse : si le texte est très court mais censé être un CV, peut-être y a-t-il des images au lieu du texte ? On accorde 10 par défaut.
    score += 10;
    if (text.includes("🔧") || text.includes("🎓") || text.includes("✉️")) {
        score -= 10;
        errors.push("Présence d'icônes ou symboles non-standards détectée.");
        revisions.push({
            section: "Éléments visuels",
            problem: "Emojis ou symboles complexes utilisés.",
            avant: "🎓 Formation",
            apres: "FORMATION",
            pourquoi: "Les symboles provoquent des erreurs de parsing ou d'encodage de caractères inutiles dans la base de données recruteur."
        });
    }

    // 3. Titres de Sections (+15 pts)
    const requiredSections = ["expérience", "experience", "formation", "compétences", "competence"];
    let foundSections = 0;
    requiredSections.forEach(sec => {
        if (textLower.includes(sec)) foundSections++;
    });

    if (foundSections >= 3) {
        score += 15;
    } else {
        score += 5;
        errors.push("Titres de sections classiques (Expériences, Formations, Compétences) absents ou non reconnus.");
        revisions.push({
            section: "Titres de base",
            problem: "Manque des mots clés structurels standards.",
            avant: "Mon parcours / Ce que je sais faire",
            apres: "Expériences Professionnelles / Compétences",
            pourquoi: "Les ATS recherchent exactement ces termes pour catégoriser vos données dans leurs formulaires internes."
        });
    }

    // 4. Verbes d'Action (+20 pts)
    const actionVerbs = ["optimisé", "piloté", "analysé", "développé", "géré", "créé", "réduit", "augmenté", "implémenté", "conçu", "dirigé"];
    let foundVerbs = 0;
    actionVerbs.forEach(verb => {
        if (textLower.includes(verb)) foundVerbs++;
    });

    if (foundVerbs >= 2) {
        score += 20;
    } else {
        score += 5;
        revisions.push({
            section: "Puces d'expérience",
            problem: "Manque de verbes d'action démontrant l'impact.",
            avant: "En charge de la mise à jour du site web",
            apres: "Développé et optimisé la nouvelle architecture du site web principal",
            pourquoi: "Les recruteurs et les algorithmes filtrent selon l'impact. Les verbes d'action avec des résultats sont plus performants."
        });
    }

    // 5. Mots-Clés Sectoriels (+35 pts)
    // Mots clés tech classiques pour simuler.
    const techKeywords = ["react", "javascript", "python", "agile", "sql", "api", "node.js", "gestion de projet", "marketing", "seo", "b2b", "management"];
    let keywordsCount = 0;
    techKeywords.forEach(kw => {
        if (textLower.includes(kw)) keywordsCount++;
    });

    if (keywordsCount > 2) {
        score += 35;
    } else {
        score += 15;
        revisions.push({
            section: "Compétences clés",
            problem: "Volume de mots-clés de l'industrie très faible.",
            avant: "Bonnes capacités en informatique",
            apres: "Maîtrise de JavaScript, React, et concepts d'API REST",
            pourquoi: "C'est le filtre n°1 des ATS : un match direct entre l'offre et les compétences listées."
        });
    }

    // Génération des mots-clés manquants
    let suggestedKeywords = ["Communication", "Résolution de problèmes", "Adaptabilité"];
    if (!textLower.includes("agile")) suggestedKeywords.push("Méthodologie Agile");
    if (!textLower.includes("data")) suggestedKeywords.push("Analyse de données (Data)");
    if (!textLower.includes("kpi")) suggestedKeywords.push("Suivi des KPIs");

    let verdict = "";
    if (score >= 85) verdict = "Prêt pour l'envoi vers un ATS, excellent format !";
    else if (score >= 60) verdict = "Optimisation nécessaire avant l'envoi en masse.";
    else verdict = "À corriger d'urgence pour passer les filtres robotisés.";

    return {
        score: score,
        verdict: verdict,
        errors: errors.length > 0 ? errors : ["Aucune erreur bloquante majeure détectée."],
        revisions: revisions,
        keywordsToAdd: suggestedKeywords.slice(0, 5),
        layoutAdvice: layoutAdvice
    };
}

module.exports = { analyzeCV };
