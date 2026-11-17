# Architecture

EGA est une application Next.js 15 avec App Router, React 19 et TypeScript.

## Couches

- `app/` : routes, métadonnées, pages juridiques et styles responsives.
- `components/` : tableau de bord, calendrier, carte, billetage et miniatures.
- `lib/engine.ts` : transitions métier, validations, pénalités et historique.
- `lib/collection.ts` : agrégations temporelles et réconciliation de la cagnotte.
- `public/` : logo, aperçu social, billets et portraits de démonstration.

## Données

La V1 conserve un état versionné dans `localStorage`. Les opérations sont synchronisées entre onglets du même navigateur. Aucun backend partagé n’est inclus.

## Invariants métier

- Le principal validé est le seul montant qui augmente la cagnotte.
- Les pénalités et arriérés sont suivis séparément.
- Une déclaration ne peut être validée ou rejetée qu’une fois.
- Une pénalité de retard est fixe, unique par période et ne produit pas d’autre pénalité.
