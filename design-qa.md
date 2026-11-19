# EGA - design QA

final result: blocked

## Mise à jour du 19 novembre 2026 — suivi visuel par billets

- Source : `C:/Users/Samuel/AppData/Local/Temp/codex-clipboard-9bb7bff3-c535-4a02-bad7-1032b9eee14b.png`.
- Nouvelle rubrique « Suivi visuel » inspirée du mouvement vertical du croquis, sans tracer de courbe classique.
- Trois graphes fonctionnels : cagnotte cumulée, entrées quotidiennes et progression individuelle.
- Chaque point utilise des billets BCEAO miniatures en orientation verticale, un compteur exact par coupure, un montant FCFA et une position proportionnelle à la valeur.
- Les données proviennent uniquement du principal validé ; pénalités, arriérés et déclarations en attente restent séparés.
- Filtres fonctionnels : cycle actuel et sept derniers jours.
- Responsive prévu avec défilement horizontal interne sur petits écrans, sans débordement global.
- Vérification technique : 15 tests métier réussis et build Next.js terminé avec succès. Avertissements environnementaux uniquement sur ESLint absent et les liens symboliques du dossier standalone Windows.
- Vérification visuelle bloquée : le service du navigateur contrôlable a expiré deux fois avant l’ouverture de l’application. Aucune capture d’implémentation ni comparaison au même viewport n’a pu être produite.
- Résultat visuel : bloqué.

## Mise à jour — billetage d'accueil et pénalité fixe

- Source : `C:/Users/Samuel/AppData/Local/Temp/codex-clipboard-1b3a8b7d-3a6f-49a1-9423-4deecba84daa.png`.
- Le billetage principal de l'accueil est explicitement en format horizontal. Les miniatures présentes dans les autres vues conservent leur format vertical.
- La pénalité de retard est désormais forfaitaire à 1 500 FCFA. Sa miniature se décompose visuellement en un billet de 1 000 FCFA et un billet de 500 FCFA.
- Les données locales enregistrées avec l'ancienne pénalité de 1 250 FCFA sont migrées automatiquement, sans mutation de la donnée source.
- Vérification métier : 15 tests sur 15 réussis.
- Vérification visuelle réelle toujours bloquée : aucun navigateur contrôlable n'est disponible dans cette session. Le résultat visuel ne peut donc pas être certifié par capture.

## Miniatures de billets verticaux

Source : `C:/Users/Samuel/AppData/Local/Temp/codex-clipboard-dec7013f-c9e4-444d-82cc-8f53ae8441ad.png` et demande de billets verticaux, compteur en haut à gauche.

Composant commun `components/money-miniature.tsx` utilisant la photo BCEAO existante. Chaque coupure a son compteur exact ; le reliquat inférieur à 500 FCFA est explicitement distingué. Montants validés, échéances, paiements, cartes récapitulatives, calendrier, formulaire et règles bénéficient du composant. Le billetage principal est également orienté en portrait. Zéro produit « Aucun billet ».

Vérification visuelle non effectuée : le service navigateur retourne toujours une expiration sur `service_info`. Pas de capture ni de certification de la mise en page mobile. Les miniatures ont des largeurs fixes de 48/56 px avec retour à la ligne, et des styles limités au composant.

## Mise à jour du 16 novembre 2026

- Sources : les quatre captures de la demande mobile du 16 novembre, situées dans `C:/Users/Samuel/AppData/Local/Temp/`.
- Responsive prévu aux seuils 280, 320, 360, 620, 900 et 1250 px ; marge mobile de 12 à 14 px.
- Corps bold noir, titres et montants black, tailles lisibles, tableau des membres converti en fiches mobiles.
- Footer et mentions de démonstration visibles supprimés ; cartes de statut sans point vert ; paramètres avant engagement ; aide et documents dans les paramètres.
- Calendrier mensuel, hebdomadaire et journalier ajouté avec dates de validation, export filtré et billetage cumulé.
- 14 tests métier réussis ; TypeScript sans erreur ; les trois routes locales répondent HTTP 200.
- Documents : 19 articles de CGU et 16 articles de confidentialité. Éditeur Ega group, contact nazacharbel@gmail.com ; adresse professionnelle à compléter.
- Capture, viewport réel, comparaison visuelle, interactions et console non certifiés : le service de contrôle navigateur a échoué sur `service_info`, même après disponibilité HTTP du serveur local. Aucune capture d’implémentation disponible.
- Résultat visuel : bloqué. Le build et les tests ne remplacent pas cette vérification.

## Historique antérieur

## Source visuelle

- `C:/Users/Samuel/AppData/Local/Temp/codex-clipboard-67508293-0d37-4cfb-89c4-f150eb12b2fc.png`
- `C:/Users/Samuel/AppData/Local/Temp/codex-clipboard-dcb54abb-9f5e-4b8a-b590-8053a779292c.png`

## Implémentation

- URL publique : https://egawo.vercel.app
- État contrôlé : liasse complète de 10 billets.
- Tests métier : 10/10.
- TypeScript : sans erreur.

## Correction appliquée

- Le ruban indique désormais le nombre de billets : `10 BILLETS`, jamais la somme de la liasse.
- Le cartouche est blanc opaque avec texte noir `#050505`, graisse 900 et bordure visible pour respecter le contraste demandé.
- La même règle est appliquée aux deux variantes de liasses, y compris l’affichage à partir de 200 000 FCFA.

## Comparaison et blocage visuel

- Dimensions des sources : non normalisées dans cette session.
- Viewport d’implémentation : non capturé.
- Capture navigateur de l’implémentation : indisponible.
- Comparaison plein écran et région ciblée : bloquées, car aucun navigateur contrôlable n’est disponible pour produire une capture au même viewport.
- Interactions et erreurs console : non certifiées.

La logique, le contenu, les couleurs CSS et le build sont vérifiés, mais la comparaison visuelle côte à côte exigée par la QA ne peut pas être certifiée sans capture navigateur.
