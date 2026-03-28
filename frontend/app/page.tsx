"use client";

import Link from "next/link";
import styles from "./hub.module.css";

const WORKFLOWS = [
  {
    id: "translate",
    title: "Traduction de texte",
    description: "Traduisez du texte dans plusieurs langues en utilisant l'IA",
    icon: "🌐",
    href: "/translate"
  }
  // Ajoutez ici d'autres workflows plus tard
];

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Poly CloudOps Hub</h1>
          <p className={styles.subtitle}>
            Plateforme d'automatisation cloud avec workflows n8n
          </p>
        </header>

        <main className={styles.main}>
          <h2 className={styles.sectionTitle}>Workflows disponibles</h2>

          <div className={styles.workflowsGrid}>
            {WORKFLOWS.map((workflow) => (
              <div key={workflow.id} className={styles.workflowCard}>
                <div className={styles.workflowIcon}>
                  {workflow.icon}
                </div>
                <h3 className={styles.workflowTitle}>
                  {workflow.title}
                </h3>
                <p className={styles.workflowDescription}>
                  {workflow.description}
                </p>
                <div className={styles.buttonContainer}>
                  <Link
                    href={workflow.href}
                    className={styles.workflowButton}
                  >
                    Accéder au workflow →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {WORKFLOWS.length === 0 && (
            <div className={styles.emptyState}>
              <p>Aucun workflow disponible pour le moment.</p>
            </div>
          )}
        </main>

        <footer className={styles.footer}>
          <p>Polytech Angers - 2026</p>
        </footer>
      </div>
    </div>
  );
}
