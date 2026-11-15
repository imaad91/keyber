"use client";

import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";

export default function Page() {
  return <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES["moteur-evenements"]} />;
}
