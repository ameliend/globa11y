export interface WCAGCriterion {
  code: string;
  title: string;
  level: 'A' | 'AA' | 'AAA';
  description: string;
  howToTest: string;
}

export const wcagCriteria: WCAGCriterion[] = [
  {
    code: '1.1.1',
    title: 'Contenu non textuel',
    level: 'A',
    description: 'Tout contenu non textuel doit avoir une alternative textuelle',
    howToTest: 'Vérifiez que toutes les images ont un attribut alt descriptif. Les images décoratives doivent avoir un alt vide (alt=""). Utilisez l\'inspecteur de votre navigateur pour vérifier.'
  },
  {
    code: '1.3.1',
    title: 'Information et relations',
    level: 'A',
    description: 'Les informations, structures et relations doivent être restituées par la programmation',
    howToTest: 'Vérifiez que les titres utilisent les balises h1-h6 dans l\'ordre. Les listes utilisent ul/ol. Les tableaux de données ont des th pour les en-têtes.'
  },
  {
    code: '1.4.3',
    title: 'Contraste (minimum)',
    level: 'AA',
    description: 'Le contraste entre le texte et l\'arrière-plan doit être d\'au moins 4.5:1',
    howToTest: 'Utilisez un outil comme WebAIM Contrast Checker. Le ratio doit être 4.5:1 pour le texte normal et 3:1 pour le texte large (18pt+ ou gras 14pt+).'
  },
  {
    code: '2.1.1',
    title: 'Clavier',
    level: 'A',
    description: 'Toutes les fonctionnalités doivent être accessibles au clavier',
    howToTest: 'Débranchez votre souris et naviguez avec la touche Tab. Vous devez pouvoir accéder à tous les éléments interactifs et les activer avec Entrée ou Espace.'
  },
  {
    code: '2.1.2',
    title: 'Pas de piège au clavier',
    level: 'A',
    description: 'Le focus ne doit jamais être bloqué sur un élément',
    howToTest: 'En naviguant au clavier, vérifiez que vous pouvez toujours sortir d\'un composant (modal, menu...) avec Tab, Échap ou les flèches.'
  },
  {
    code: '2.4.1',
    title: 'Contourner des blocs',
    level: 'A',
    description: 'Un mécanisme permet d\'éviter les blocs répétés (menu, header...)',
    howToTest: 'En appuyant sur Tab dès l\'arrivée sur la page, un lien "Aller au contenu principal" doit apparaître avant le menu de navigation.'
  },
  {
    code: '2.4.2',
    title: 'Titre de page',
    level: 'A',
    description: 'Chaque page web doit avoir un titre descriptif',
    howToTest: 'Vérifiez que l\'onglet du navigateur affiche un titre unique et descriptif pour chaque page. Il doit décrire le contenu ou la fonction de la page.'
  },
  {
    code: '2.4.3',
    title: 'Parcours du focus',
    level: 'A',
    description: 'L\'ordre de navigation au clavier doit être logique',
    howToTest: 'Naviguez avec Tab dans la page. L\'ordre doit suivre la lecture naturelle (haut en bas, gauche à droite) sans sauts illogiques.'
  },
  {
    code: '2.4.4',
    title: 'Fonction du lien (selon le contexte)',
    level: 'A',
    description: 'La fonction de chaque lien doit être compréhensible',
    howToTest: 'Lisez le texte de chaque lien. Il doit être explicite. Évitez "cliquez ici" ou "en savoir plus" seuls. Le contexte (phrase environnante) peut aider.'
  },
  {
    code: '2.4.7',
    title: 'Focus visible',
    level: 'AA',
    description: 'Le focus clavier doit être clairement visible',
    howToTest: 'Naviguez au clavier. Chaque élément qui reçoit le focus doit avoir un contour visible (outline). Ne pas supprimer l\'outline sans alternative.'
  },
  {
    code: '3.1.1',
    title: 'Langue de la page',
    level: 'A',
    description: 'La langue principale de la page doit être définie',
    howToTest: 'Vérifiez dans le code source que la balise <html> possède un attribut lang (ex: <html lang="fr">).'
  },
  {
    code: '3.2.1',
    title: 'Au focus',
    level: 'A',
    description: 'Recevoir le focus ne doit pas déclencher de changement de contexte',
    howToTest: 'En naviguant au clavier, vérifiez qu\'aucun élément ne déclenche automatiquement une action (ouverture de page, soumission de formulaire) juste en recevant le focus.'
  },
  {
    code: '3.2.2',
    title: 'À la saisie',
    level: 'A',
    description: 'Modifier un champ ne doit pas provoquer de changement inattendu',
    howToTest: 'Remplissez les formulaires. Cocher une case ou saisir un texte ne doit pas soumettre automatiquement le formulaire ou changer de page sans avertissement.'
  },
  {
    code: '3.3.1',
    title: 'Identification des erreurs',
    level: 'A',
    description: 'Les erreurs de saisie doivent être identifiées et décrites',
    howToTest: 'Soumettez un formulaire avec des erreurs. Les messages d\'erreur doivent être clairs, indiquer quel champ est en erreur et comment le corriger.'
  },
  {
    code: '3.3.2',
    title: 'Étiquettes ou instructions',
    level: 'A',
    description: 'Les champs de formulaire doivent avoir des étiquettes ou instructions',
    howToTest: 'Vérifiez que chaque champ a un <label> associé ou des instructions claires. Le label doit être visible et proche du champ.'
  },
  {
    code: '4.1.1',
    title: 'Analyse syntaxique',
    level: 'A',
    description: 'Le code HTML doit être valide et sans erreur majeure',
    howToTest: 'Utilisez le validateur W3C (validator.w3.org). Vérifiez qu\'il n\'y a pas d\'erreurs critiques (balises mal fermées, IDs dupliqués).'
  },
  {
    code: '4.1.2',
    title: 'Nom, rôle, valeur',
    level: 'A',
    description: 'Les composants d\'interface doivent avoir nom, rôle et valeur accessibles',
    howToTest: 'Utilisez un lecteur d\'écran (NVDA, JAWS) ou les outils de développement. Chaque bouton, lien, champ doit annoncer son rôle et son état.'
  },
];
