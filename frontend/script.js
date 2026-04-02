// Remplace cette URL par celle que Render te donnera (ex: https://mon-api.onrender.com)
const API_URL = "https://cv-ats-scan.onrender.com"; 

async function sendAnalysis() {
    const text = document.getElementById('cvInput').value;
    const resultDiv = document.getElementById('result');

    if(!text) return alert("Veuillez coller votre CV");

    resultDiv.innerHTML = "Analyse en cours...";

    try {
        const response = await fetch(`${API_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cvText: text })
        });

        const data = await response.json();
        
        // Affichage des résultats (adapte selon ton HTML)
        resultDiv.innerHTML = `
            <h3>Score : ${data.score}/100</h3>
            <p><strong>Verdict :</strong> ${data.verdict}</p>
        `;
    } catch (error) {
        resultDiv.innerHTML = "Erreur de connexion au serveur.";
        console.error(error);
    }
}
