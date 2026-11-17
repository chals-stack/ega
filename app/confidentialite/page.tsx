import type { Metadata } from "next";
import LegalDocument from "@/components/legal-document";
import { privacy } from "@/lib/legal";
export const metadata: Metadata = { title: "Politique de confidentialité | EGA", description: "Données de cotisation, géolocalisation volontaire, stockage, destinataires et droits des membres EGA." };
export default function PrivacyPage() { return <LegalDocument title="Politique de confidentialité" intro="Comprendre quelles informations sont utilisées, où elles sont conservées et comment garder la maîtrise de vos données." sections={privacy} other="conditions" />; }
