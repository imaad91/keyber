"use client";

import { NoOsSessionGate } from "@/components/NoOsSessionGate";

/** ERP standalone legacy retiré — ouvrir Ordinateur en session Book. */
export default function ErpPage() {
  return (
    <NoOsSessionGate
      title="ERP dans l'Ordinateur"
      blurb="L'aperçu ERP Novacier n'est plus une page produit. Lance une partie Live, ouvre l'Ordinateur, puis l'app ERP."
    />
  );
}