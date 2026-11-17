import type { Metadata } from "next";
import LegalDocument from "@/components/legal-document";
import { terms } from "@/lib/legal";
export const metadata: Metadata = { title: "Conditions générales d’utilisation | EGA", description: "Fonctionnement, règles de cotisation, responsabilités et recours du collectif EGA au Togo." };
export default function TermsPage() { return <LegalDocument title="Conditions générales d’utilisation" intro="Un cadre clair pour cotiser ensemble : le fonctionnement du service, les règles du groupe et les responsabilités de chacun." sections={terms} other="confidentialite" />; }
