<p align="center">
  <img src="public/images/ega-logo.jpg" width="150" alt="Logo EGA" />
</p>

<h1 align="center">EGA — Ensemble, on va plus loin</h1>

<p align="center">La tontine digitale transparente pensée pour les collectifs du Togo.</p>

<p align="center">
  <a href="https://egawo.vercel.app"><img alt="Application en ligne" src="https://img.shields.io/badge/application-egawo.vercel.app-F5C400?style=for-the-badge&logo=vercel&logoColor=000000"></a>
  <img alt="Next.js 15" src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
</p>

Application Next.js, React et TypeScript de suivi de tontine au Togo. Design jaune solaire, crème et noir, icônes Phosphor, billetage correspondant au principal validé. Montants entiers en XOF, affichés en FCFA.

## Aperçu

| Produit | Informations |
| --- | --- |
| Site public | [egawo.vercel.app](https://egawo.vercel.app) |
| Marché | Togo, zone BCEAO |
| Devise | Franc CFA BCEAO (XOF) |
| Fuseau métier | Africa/Lome, UTC+0 |
| Éditeur | Ega group |
| Contact | nazacharbel@gmail.com |

## Fonctionnalités principales

- Cagnotte visuelle avec billets BCEAO, liasses et total strictement réconcilié.
- Registre des cotisations, validation par le trésorier et historique auditable.
- Cycle du 30 au 7, arriérés et pénalité forfaitaire de 1 500 FCFA sans capitalisation.
- Paiements déclaratifs Mixx by Yas et Moov Money Flooz.
- Calendrier journalier, hebdomadaire et mensuel avec billetage cumulé.
- Tracker cartographique activable par l’administrateur avec consentement de géolocalisation.
- Interface responsive, documents juridiques, partage social et export CSV.

> Cette version est un MVP de démonstration. Elle n’encaisse pas réellement d’argent et son registre est stocké dans le navigateur.

## Lancer

Node 22 ou supérieur. Depuis ce dossier :

```sh
npm install
npm run dev
```

Ouvrir http://localhost:3001. `npm run build` crée la version de production ; `npm start` la sert. `npm test` vérifie les règles métier avec Node 24.

## Démonstration

La date de démonstration est le 5 décembre 2026, pendant la collecte de novembre. Dans le menu du profil, choisir Ama (membre), Koffi (trésorier), Afi (administratrice) ou Yao (cas avec arriéré et pénalité).

1. Ama déclare 10 000 FCFA et une référence Mixx by Yas. La caisse reste à 175 000 FCFA ; l’attente augmente.
2. Koffi ouvre les cotisations et valide Ama : le total confirmé passe à 185 000 FCFA, soit 74 %.
3. Koffi valide Dédé : 210 000 FCFA, soit 84 %.
4. Le registre et l’historique se mettent à jour. Le rechargement conserve les déclarations. Les onglets du même navigateur se synchronisent via l’événement storage.
5. Les paramètres regroupent les règles, les rappels locaux, l’aide et les documents. La clôture est couverte par les tests du moteur ; sa commande de simulation n’est plus exposée.

## Suivi, interface mobile et documents

Le bouton jaune ouvre le calendrier mensuel, hebdomadaire (lundi au dimanche) ou journalier. Les cotisations validées figurent à leur date de validation ; la collecte de novembre peut donc être visible en décembre. Le billetage reconstitue le principal cumulé à la fin de la période sélectionnée. Arriérés et majorations restent séparés. L’export CSV suit la sélection et son filtre de statut.

`app/responsive.css` définit une marge de sécurité de 12 à 14 px sur petits écrans, une typographie noire et bold, des titres black, une navigation défilable et des fiches mobiles à la place du tableau. La vérification visuelle reste à effectuer : le service de contrôle navigateur était indisponible pendant cette mise à jour.

`/conditions` et `/confidentialite` contiennent respectivement 19 et 16 articles, avec sommaires et sources officielles. Éditeur déclaré : Ega group, contact : nazacharbel@gmail.com. Adresse professionnelle à compléter. Les textes décrivent les limites réelles du stockage local et des paiements déclaratifs.

## Règles

Ouverture le 30 à 00 h ; en février le dernier jour du mois. Clôture le 7 suivant à 23 h 59, fuseau Africa/Lome. Une déclaration déposée à temps couvrant le principal suspend la décision de retard pendant sa vérification. Une pénalité forfaitaire de 1 500 FCFA à la cotisation suivante par période en défaut, sans capitalisation. L’arriéré reste distinct. Le badge de retard est visible dans le groupe tant que le principal en arriéré reste dû.

## Périmètre réel

Cette V1 utilise un registre local `localStorage` avec profils de démonstration, pas une authentification serveur. Les paiements, invitations et versements ne déclenchent aucun mouvement financier ou message externe. Le nom de la preuve est conservé ; le fichier lui-même n’est pas téléversé. Les rôles sont vérifiés par le moteur pour les transitions mais une mise en production nécessite une authentification et des autorisations serveur. Le temps réel entre appareils nécessite un backend partagé. Ne pas saisir de données réelles dans cette démo.

## Vercel

Importer ce dossier comme projet Next.js, ou lancer `vercel --prod` depuis ce dossier. Aucune variable d’environnement n’est nécessaire pour la démo. Ne pas sélectionner le dossier parent qui contient d’autres projets.

La typographie utilise Inter via Next Font, avec repli Arial/sans-serif.
