"use client";

import { useState } from "react";
import styles from "./ui/home.module.css";

const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "FR", label: "Français" },
  { code: "ES", label: "Español" },
  { code: "DE", label: "Deutsch" },
  { code: "IT", label: "Italiano" },
  { code: "PT", label: "Português" },
  { code: "NL", label: "Nederlands" },
  { code: "RU", label: "Русский" },
  { code: "JA", label: "日本語" },
  { code: "ZH", label: "中文" },
];

export default function TranslationPage() {
  const [sourceLang, setSourceLang] = useState("FR");
  const [targetLang, setTargetLang] = useState("EN");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTranslate() { //fonction permettant au boutton d'envoyer la requête à l'api
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, source: sourceLang, target: targetLang }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTranslatedText(data.translatedText ?? "");
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSwap() { //fonction permettant d'interchanger les langues et les textes, pas encore très fonctionnel pour la langue source car deepl choisit automatiquement la langue source dans le workflow en fonction de ce qu'il détecte.
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Page de Traduction</h1>

      <div className={styles.controlsRow}>
        <div className={styles.field}>
          <label className={styles.label}>Langue source</label>
          <select className={styles.select} value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Langue cible</label>
          <select className={styles.select} value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.actions}>
          <button className={styles.button} onClick={handleSwap} type="button">
            Interchanger
          </button>
          <button className={styles.buttonPrimary} onClick={handleTranslate} disabled={loading || !sourceText}>
            {loading ? "Traduction…" : "Traduire"}
          </button>
        </div>
      </div>

      <div className={styles.textareas}>
        <textarea
          aria-label="Texte source"
          className={styles.textarea}
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Entrez le texte à traduire"
        />

        <textarea
          aria-label="Texte traduit"
          className={styles.textareaTranslated}
          value={translatedText}
          readOnly
          placeholder="Traduction"
        />
      </div>

      {error && (
        <div className={styles.error}>
          Erreur: {error}
        </div>
      )}
    </div>
  );
}
