export interface WCAGCriterion {
  code: string;
  title: string;
  level: 'A' | 'AA' | 'AAA';
  description: string;
  howToTest: string;
}

export const wcagCriteria: WCAGCriterion[] = [
  // 1. Perceivable
  // 1.1 Text alternatives
  {
    code: '1.1.1',
    title: 'Non-text Content',
    level: 'A',
    description: 'Tout contenu non textuel doit avoir une alternative textuelle',
    howToTest: 'Vérifiez que toutes les images ont un attribut alt descriptif. Les images décoratives doivent avoir un alt vide (alt=""). Utilisez l\'inspecteur de votre navigateur pour vérifier chaque balise <img>.'
  },
  
  // 1.2 Time-based media
  {
    code: '1.2.1',
    title: 'Audio-only and Video-only (Prerecorded)',
    level: 'A',
    description: 'Fournir une alternative pour les médias pré-enregistrés audio ou vidéo seuls',
    howToTest: 'Pour chaque audio seul, vérifiez qu\'une transcription textuelle est disponible. Pour chaque vidéo seule (sans son), vérifiez qu\'une audio-description ou transcription est fournie.'
  },
  {
    code: '1.2.2',
    title: 'Captions (Prerecorded)',
    level: 'A',
    description: 'Fournir des sous-titres pour tout contenu audio préenregistré',
    howToTest: 'Lancez les vidéos et vérifiez que les sous-titres sont disponibles et synchronisés. Ils doivent inclure les dialogues et les sons importants (musique, effets sonores).'
  },
  {
    code: '1.2.3',
    title: 'Audio Description or Media Alternative (Prerecorded)',
    level: 'A',
    description: 'Fournir une audio-description ou une alternative textuelle pour les vidéos',
    howToTest: 'Vérifiez qu\'une piste d\'audio-description est disponible OU qu\'une transcription complète décrivant les éléments visuels importants est fournie.'
  },
  {
    code: '1.2.4',
    title: 'Captions (Live)',
    level: 'AA',
    description: 'Fournir des sous-titres pour tout contenu audio diffusé en direct',
    howToTest: 'Pour les contenus en direct (webinaires, streaming), vérifiez que des sous-titres en temps réel sont générés et affichés.'
  },
  {
    code: '1.2.5',
    title: 'Audio Description (Prerecorded)',
    level: 'AA',
    description: 'Fournir une audio-description pour tout contenu vidéo préenregistré',
    howToTest: 'Vérifiez qu\'une piste d\'audio-description est disponible et décrit les éléments visuels importants pendant les pauses du dialogue.'
  },
  {
    code: '1.2.6',
    title: 'Sign Language (Prerecorded)',
    level: 'AAA',
    description: 'Fournir une interprétation en langue des signes pour les contenus audio',
    howToTest: 'Vérifiez qu\'une vidéo avec interprétation en langue des signes est intégrée ou disponible en option pour le contenu audio.'
  },
  {
    code: '1.2.7',
    title: 'Extended Audio Description (Prerecorded)',
    level: 'AAA',
    description: 'Fournir une audio-description étendue quand les pauses sont insuffisantes',
    howToTest: 'Si l\'audio-description nécessite plus de temps que les pauses disponibles, vérifiez qu\'une version avec mise en pause automatique est disponible.'
  },
  {
    code: '1.2.8',
    title: 'Media Alternative (Prerecorded)',
    level: 'AAA',
    description: 'Fournir une alternative textuelle complète pour tous les médias préenregistrés',
    howToTest: 'Vérifiez qu\'une transcription complète incluant les dialogues, les sons et les descriptions visuelles est disponible.'
  },
  {
    code: '1.2.9',
    title: 'Audio-only (Live)',
    level: 'AAA',
    description: 'Fournir une alternative textuelle pour les contenus audio diffusés en direct',
    howToTest: 'Pour les diffusions audio en direct, vérifiez qu\'une transcription en temps réel est disponible.'
  },

  // 1.3 Adaptable
  {
    code: '1.3.1',
    title: 'Info and Relationships',
    level: 'A',
    description: 'Les informations, structures et relations doivent être restituées par programmation',
    howToTest: 'Vérifiez que les titres utilisent <h1>-<h6> dans l\'ordre, les listes utilisent <ul>/<ol>, les tableaux ont des <th> pour les en-têtes, et les formulaires ont des <label> associés.'
  },
  {
    code: '1.3.2',
    title: 'Meaningful Sequence',
    level: 'A',
    description: 'L\'ordre de lecture doit être logique et cohérent',
    howToTest: 'Désactivez les CSS et vérifiez que l\'ordre du contenu reste logique. L\'ordre dans le DOM doit suivre l\'ordre visuel de lecture.'
  },
  {
    code: '1.3.3',
    title: 'Sensory Characteristics',
    level: 'A',
    description: 'Les instructions ne doivent pas reposer uniquement sur des caractéristiques sensorielles',
    howToTest: 'Vérifiez qu\'aucune instruction ne repose uniquement sur la forme, la taille, la position ou le son (ex: évitez "cliquez sur le bouton rond à droite"). Ajoutez toujours un label textuel.'
  },
  {
    code: '1.3.4',
    title: 'Orientation',
    level: 'AA',
    description: 'Le contenu ne doit pas être limité à une seule orientation',
    howToTest: 'Testez le site en mode portrait et paysage. Le contenu doit s\'adapter aux deux orientations sauf nécessité essentielle (ex: application piano).'
  },
  {
    code: '1.3.5',
    title: 'Identify Input Purpose',
    level: 'AA',
    description: 'Le but des champs de formulaire doit être identifiable par programmation',
    howToTest: 'Vérifiez que les champs de formulaire utilisent l\'attribut autocomplete approprié (name, email, tel, etc.) pour permettre le remplissage automatique.'
  },
  {
    code: '1.3.6',
    title: 'Identify Purpose',
    level: 'AAA',
    description: 'Le but des composants UI et icônes doit être identifiable',
    howToTest: 'Vérifiez que les icônes et composants ont des attributs ARIA ou des classes sémantiques permettant d\'identifier leur fonction.'
  },

  // 1.4 Distinguishable
  {
    code: '1.4.1',
    title: 'Use of Color',
    level: 'A',
    description: 'La couleur ne doit pas être le seul moyen de transmettre une information',
    howToTest: 'Vérifiez que les liens, erreurs, et informations importantes sont identifiables sans la couleur (ajoutez soulignement, icônes, motifs).'
  },
  {
    code: '1.4.2',
    title: 'Audio Control',
    level: 'A',
    description: 'Permettre de mettre en pause ou contrôler l\'audio qui se lance automatiquement',
    howToTest: 'Si un son se lance automatiquement et dure plus de 3 secondes, vérifiez qu\'un bouton pause/stop est visible en début de page.'
  },
  {
    code: '1.4.3',
    title: 'Contrast (Minimum)',
    level: 'AA',
    description: 'Le contraste minimum entre texte et arrière-plan doit être de 4.5:1',
    howToTest: 'Utilisez WebAIM Contrast Checker ou les DevTools. Ratio minimum : 4.5:1 pour texte normal, 3:1 pour texte large (18pt+ ou gras 14pt+).'
  },
  {
    code: '1.4.4',
    title: 'Resize Text',
    level: 'AA',
    description: 'Le texte doit pouvoir être agrandi jusqu\'à 200% sans perte de contenu',
    howToTest: 'Zoomez le navigateur à 200% (Ctrl/Cmd +). Vérifiez qu\'aucun texte n\'est tronqué et que tout reste lisible et utilisable.'
  },
  {
    code: '1.4.5',
    title: 'Images of Text',
    level: 'AA',
    description: 'Privilégier le texte réel plutôt que des images de texte',
    howToTest: 'Vérifiez qu\'aucune image contenant du texte n\'est utilisée, sauf pour les logos ou quand la présentation spécifique est essentielle.'
  },
  {
    code: '1.4.6',
    title: 'Contrast (Enhanced)',
    level: 'AAA',
    description: 'Le contraste renforcé entre texte et arrière-plan doit être de 7:1',
    howToTest: 'Utilisez WebAIM Contrast Checker. Ratio minimum : 7:1 pour texte normal, 4.5:1 pour texte large (18pt+ ou gras 14pt+).'
  },
  {
    code: '1.4.7',
    title: 'Low or No Background Audio',
    level: 'AAA',
    description: 'L\'audio de fond doit être minimal ou absent',
    howToTest: 'Pour les contenus audio avec parole, vérifiez que l\'audio de fond est 20dB plus faible que la parole ou peut être désactivé.'
  },
  {
    code: '1.4.8',
    title: 'Visual Presentation',
    level: 'AAA',
    description: 'Permettre une personnalisation avancée de la présentation du texte',
    howToTest: 'Vérifiez que l\'utilisateur peut : choisir les couleurs de premier plan/arrière-plan, limiter la largeur à 80 caractères, ne pas justifier le texte, ajuster l\'interligne (1.5x) et les paragraphes (2x).'
  },
  {
    code: '1.4.9',
    title: 'Images of Text (No Exception)',
    level: 'AAA',
    description: 'Aucune image de texte ne doit être utilisée',
    howToTest: 'Vérifiez qu\'aucune image contenant du texte n\'est présente, même pour les logos (sauf exception technique absolue).'
  },
  {
    code: '1.4.10',
    title: 'Reflow',
    level: 'AA',
    description: 'Le contenu doit s\'adapter sans défilement horizontal',
    howToTest: 'À 320px de large (zoom 400% sur 1280px), vérifiez qu\'aucun scroll horizontal n\'est nécessaire pour lire le contenu, sauf pour les tableaux et images.'
  },
  {
    code: '1.4.11',
    title: 'Non-text Contrast',
    level: 'AA',
    description: 'Le contraste des éléments graphiques et composants UI doit être de 3:1',
    howToTest: 'Vérifiez que les icônes, boutons, bordures de champs et éléments graphiques informatifs ont un contraste minimum de 3:1 avec l\'arrière-plan.'
  },
  {
    code: '1.4.12',
    title: 'Text Spacing',
    level: 'AA',
    description: 'Le contenu doit rester lisible avec un espacement de texte augmenté',
    howToTest: 'Appliquez : hauteur de ligne 1.5x, espacement paragraphe 2x, espacement lettres 0.12x, espacement mots 0.16x. Vérifiez qu\'aucun contenu n\'est coupé.'
  },
  {
    code: '1.4.13',
    title: 'Content on Hover or Focus',
    level: 'AA',
    description: 'Le contenu apparaissant au survol/focus doit être contrôlable',
    howToTest: 'Pour les tooltips et infobulles, vérifiez : qu\'elles peuvent être fermées (Échap), qu\'on peut survoler leur contenu, et qu\'elles ne disparaissent pas trop rapidement.'
  },

  // 2. Operable
  // 2.1 Keyboard accessible
  {
    code: '2.1.1',
    title: 'Keyboard',
    level: 'A',
    description: 'Toutes les fonctionnalités doivent être accessibles au clavier',
    howToTest: 'Débranchez la souris. Naviguez avec Tab/Shift+Tab. Vérifiez que tous les éléments interactifs (liens, boutons, formulaires) sont accessibles et activables avec Entrée ou Espace.'
  },
  {
    code: '2.1.2',
    title: 'No Keyboard Trap',
    level: 'A',
    description: 'Le focus ne doit jamais être piégé sur un élément',
    howToTest: 'En naviguant au clavier, vérifiez que vous pouvez toujours sortir d\'un composant (modal, menu, iframe) avec Tab, Shift+Tab ou Échap.'
  },
  {
    code: '2.1.3',
    title: 'Keyboard (No Exception)',
    level: 'AAA',
    description: 'Toutes les fonctionnalités doivent être accessibles au clavier sans exception',
    howToTest: 'Même test que 2.1.1 mais sans aucune exception, même pour les fonctionnalités nécessitant un tracé libre (dessin, signature).'
  },
  {
    code: '2.1.4',
    title: 'Character Key Shortcuts',
    level: 'A',
    description: 'Les raccourcis clavier d\'un seul caractère doivent pouvoir être désactivés',
    howToTest: 'Si des raccourcis d\'un seul caractère existent (ex: "S" pour sauvegarder), vérifiez qu\'ils peuvent être désactivés, remappés ou ne sont actifs que quand le composant a le focus.'
  },

  // 2.2 Enough time
  {
    code: '2.2.1',
    title: 'Timing Adjustable',
    level: 'A',
    description: 'Permettre de désactiver, ajuster ou prolonger les limites de temps',
    howToTest: 'Si une limite de temps existe, vérifiez qu\'elle peut être désactivée, ajustée avant le début, ou prolongée (au moins 10x) via un avertissement.'
  },
  {
    code: '2.2.2',
    title: 'Pause, Stop, Hide',
    level: 'A',
    description: 'Permettre de mettre en pause les contenus en mouvement',
    howToTest: 'Pour les carrousels, animations, clignotements ou défilements automatiques durant plus de 5 secondes, vérifiez qu\'un bouton pause/stop est disponible.'
  },
  {
    code: '2.2.3',
    title: 'No Timing',
    level: 'AAA',
    description: 'Aucune limite de temps ne doit être imposée',
    howToTest: 'Vérifiez qu\'aucune limite de temps n\'existe pour compléter une action, sauf pour les événements en temps réel (enchères, jeux multijoueurs).'
  },
  {
    code: '2.2.4',
    title: 'Interruptions',
    level: 'AAA',
    description: 'Permettre de reporter ou supprimer les interruptions',
    howToTest: 'Vérifiez que les alertes et interruptions (notifications, pop-ups) peuvent être désactivées ou reportées, sauf en cas d\'urgence.'
  },
  {
    code: '2.2.5',
    title: 'Re-authenticating',
    level: 'AAA',
    description: 'Préserver les données lors d\'une nouvelle authentification',
    howToTest: 'Si la session expire, vérifiez que l\'utilisateur peut se ré-authentifier et continuer sans perte de données déjà saisies.'
  },
  {
    code: '2.2.6',
    title: 'Timeouts',
    level: 'AAA',
    description: 'Avertir l\'utilisateur de la durée d\'inactivité avant expiration',
    howToTest: 'Vérifiez qu\'un message prévient l\'utilisateur au début de la session de la durée d\'inactivité autorisée avant déconnexion.'
  },

  // 2.3 Seizures and physical reactions
  {
    code: '2.3.1',
    title: 'Three Flashes or Below Threshold',
    level: 'A',
    description: 'Éviter les contenus qui clignotent plus de 3 fois par seconde',
    howToTest: 'Vérifiez qu\'aucun contenu ne clignote plus de 3 fois par seconde, ou que les flashs respectent les seuils de luminosité/surface définis.'
  },
  {
    code: '2.3.2',
    title: 'Three Flashes',
    level: 'AAA',
    description: 'Aucun contenu ne doit clignoter plus de 3 fois par seconde',
    howToTest: 'Vérifiez qu\'aucun contenu ne clignote plus de 3 fois par seconde, sans exception.'
  },
  {
    code: '2.3.3',
    title: 'Animation from Interactions',
    level: 'AAA',
    description: 'Permettre de désactiver les animations déclenchées par l\'interaction',
    howToTest: 'Vérifiez que les animations non essentielles peuvent être désactivées via les préférences système (prefers-reduced-motion).'
  },

  // 2.4 Navigable
  {
    code: '2.4.1',
    title: 'Bypass Blocks',
    level: 'A',
    description: 'Permettre de contourner les blocs répétés',
    howToTest: 'Appuyez sur Tab dès l\'arrivée sur la page. Un lien "Aller au contenu principal" doit apparaître avant le menu pour sauter la navigation.'
  },
  {
    code: '2.4.2',
    title: 'Page Titled',
    level: 'A',
    description: 'Chaque page doit avoir un titre descriptif',
    howToTest: 'Vérifiez que l\'onglet du navigateur affiche un titre unique et descriptif pour chaque page (balise <title>).'
  },
  {
    code: '2.4.3',
    title: 'Focus Order',
    level: 'A',
    description: 'L\'ordre de navigation au clavier doit être logique',
    howToTest: 'Naviguez avec Tab. L\'ordre doit suivre la lecture naturelle (haut en bas, gauche à droite) sans sauts illogiques.'
  },
  {
    code: '2.4.4',
    title: 'Link Purpose (In Context)',
    level: 'A',
    description: 'La fonction de chaque lien doit être compréhensible dans son contexte',
    howToTest: 'Lisez chaque lien avec sa phrase environnante. La destination doit être claire. Évitez "cliquez ici" ou "en savoir plus" sans contexte.'
  },
  {
    code: '2.4.5',
    title: 'Multiple Ways',
    level: 'AA',
    description: 'Fournir plusieurs moyens d\'accéder aux pages',
    howToTest: 'Vérifiez qu\'il existe au moins 2 moyens d\'accéder aux pages : menu de navigation, plan du site, recherche, ou liste de liens connexes.'
  },
  {
    code: '2.4.6',
    title: 'Headings and Labels',
    level: 'AA',
    description: 'Les titres et labels doivent être descriptifs',
    howToTest: 'Vérifiez que tous les titres (<h1>-<h6>) et labels de formulaires décrivent clairement leur sujet ou fonction.'
  },
  {
    code: '2.4.7',
    title: 'Focus Visible',
    level: 'AA',
    description: 'Le focus clavier doit être clairement visible',
    howToTest: 'Naviguez au clavier. Chaque élément qui reçoit le focus doit avoir un contour visible (outline). Ne supprimez jamais l\'outline sans alternative visible.'
  },
  {
    code: '2.4.8',
    title: 'Location',
    level: 'AAA',
    description: 'Indiquer la position de l\'utilisateur dans le site',
    howToTest: 'Vérifiez qu\'un fil d\'Ariane (breadcrumb) ou un indicateur de navigation montre où se trouve l\'utilisateur dans l\'arborescence du site.'
  },
  {
    code: '2.4.9',
    title: 'Link Purpose (Link Only)',
    level: 'AAA',
    description: 'La fonction de chaque lien doit être compréhensible par le lien seul',
    howToTest: 'Lisez chaque lien isolément (sans son contexte). Le texte du lien seul doit suffire à comprendre sa destination.'
  },
  {
    code: '2.4.10',
    title: 'Section Headings',
    level: 'AAA',
    description: 'Utiliser des titres pour organiser le contenu',
    howToTest: 'Vérifiez que le contenu est organisé avec des titres (<h1>-<h6>) décrivant les sections, facilitant la navigation et la compréhension.'
  },
  {
    code: '2.4.11',
    title: 'Focus Not Obscured (Minimum)',
    level: 'AA',
    description: 'Le focus ne doit pas être complètement masqué',
    howToTest: 'En naviguant au clavier, vérifiez qu\'au moins une partie de l\'élément ayant le focus reste visible (non masqué par un header fixe ou modal).'
  },
  {
    code: '2.4.12',
    title: 'Focus Not Obscured (Enhanced)',
    level: 'AAA',
    description: 'Le focus ne doit pas être masqué du tout',
    howToTest: 'En naviguant au clavier, vérifiez que l\'élément ayant le focus est entièrement visible (aucune partie n\'est masquée).'
  },
  {
    code: '2.4.13',
    title: 'Focus Appearance',
    level: 'AAA',
    description: 'L\'indicateur de focus doit avoir une apparence suffisante',
    howToTest: 'Vérifiez que l\'indicateur de focus a : un ratio de contraste de 3:1, une épaisseur d\'au moins 2px, et entoure complètement l\'élément ou équivalent.'
  },

  // 2.5 Input modalities
  {
    code: '2.5.1',
    title: 'Pointer Gestures',
    level: 'A',
    description: 'Les gestes multi-points doivent avoir une alternative simple',
    howToTest: 'Si des gestes complexes existent (pincement, rotation), vérifiez qu\'une alternative à un seul doigt/clic est disponible (boutons +/-, rotation par boutons).'
  },
  {
    code: '2.5.2',
    title: 'Pointer Cancellation',
    level: 'A',
    description: 'Permettre d\'annuler une action au pointeur',
    howToTest: 'Vérifiez que les actions ne se déclenchent pas au mousedown mais au mouseup/click, permettant d\'annuler en déplaçant le pointeur hors de l\'élément.'
  },
  {
    code: '2.5.3',
    title: 'Label in Name',
    level: 'A',
    description: 'Le nom accessible doit contenir le label visible',
    howToTest: 'Pour les boutons et liens, vérifiez que le texte visible est inclus dans l\'attribut aria-label ou le texte du composant pour la reconnaissance vocale.'
  },
  {
    code: '2.5.4',
    title: 'Motion Actuation',
    level: 'A',
    description: 'Les fonctions activées par le mouvement doivent avoir une alternative',
    howToTest: 'Si une fonction utilise l\'accéléromètre (secouer pour annuler), vérifiez qu\'un bouton alternatif existe et que la fonction peut être désactivée.'
  },
  {
    code: '2.5.5',
    title: 'Target Size (Enhanced)',
    level: 'AAA',
    description: 'La zone de clic doit être d\'au moins 44x44 pixels',
    howToTest: 'Mesurez les zones cliquables (boutons, liens). Elles doivent faire au moins 44x44px, sauf exception (liens inline, contrôles natifs).'
  },
  {
    code: '2.5.6',
    title: 'Concurrent Input Mechanisms',
    level: 'AAA',
    description: 'Ne pas restreindre les modalités d\'entrée',
    howToTest: 'Vérifiez que l\'interface fonctionne avec plusieurs modes d\'entrée simultanément (clavier + souris + tactile) sans forcer un seul mode.'
  },
  {
    code: '2.5.7',
    title: 'Dragging Movements',
    level: 'AA',
    description: 'Les actions de glisser-déposer doivent avoir une alternative',
    howToTest: 'Pour chaque drag & drop, vérifiez qu\'une alternative existe (boutons, clavier) permettant la même action sans glisser.'
  },
  {
    code: '2.5.8',
    title: 'Target Size (Minimum)',
    level: 'AA',
    description: 'La zone de clic doit être d\'au moins 24x24 pixels',
    howToTest: 'Mesurez les zones cliquables. Elles doivent faire au moins 24x24px OU avoir 24px d\'espacement avec les autres cibles.'
  },

  // 3. Understandable
  // 3.1 Readable
  {
    code: '3.1.1',
    title: 'Language of Page',
    level: 'A',
    description: 'La langue principale de la page doit être définie',
    howToTest: 'Vérifiez dans le code source que la balise <html> possède un attribut lang (ex: <html lang="fr">).'
  },
  {
    code: '3.1.2',
    title: 'Language of Parts',
    level: 'AA',
    description: 'La langue de chaque passage doit être identifiable',
    howToTest: 'Si un mot ou passage est dans une autre langue, vérifiez qu\'il a un attribut lang (ex: <span lang="en">Hello</span>).'
  },
  {
    code: '3.1.3',
    title: 'Unusual Words',
    level: 'AAA',
    description: 'Fournir une définition pour les mots inhabituels',
    howToTest: 'Pour le jargon, termes techniques ou argot, vérifiez qu\'une définition est disponible (glossaire, lien, infobulle).'
  },
  {
    code: '3.1.4',
    title: 'Abbreviations',
    level: 'AAA',
    description: 'Fournir la forme développée des abréviations',
    howToTest: 'Vérifiez que les abréviations ont leur forme complète à la première occurrence ou via <abbr title="..."> ou un glossaire.'
  },
  {
    code: '3.1.5',
    title: 'Reading Level',
    level: 'AAA',
    description: 'Fournir une version simplifiée si le niveau de lecture est trop élevé',
    howToTest: 'Si le texte nécessite un niveau de lecture supérieur au collège, vérifiez qu\'une version simplifiée ou résumée est disponible.'
  },
  {
    code: '3.1.6',
    title: 'Pronunciation',
    level: 'AAA',
    description: 'Fournir la prononciation des mots ambigus',
    howToTest: 'Pour les homonymes ou mots dont la prononciation change le sens, vérifiez qu\'une aide à la prononciation est fournie (phonétique, audio).'
  },

  // 3.2 Predictable
  {
    code: '3.2.1',
    title: 'On Focus',
    level: 'A',
    description: 'Recevoir le focus ne doit pas déclencher de changement de contexte',
    howToTest: 'En naviguant au clavier, vérifiez qu\'aucun élément ne déclenche automatiquement une action (ouverture de page, soumission) juste en recevant le focus.'
  },
  {
    code: '3.2.2',
    title: 'On Input',
    level: 'A',
    description: 'Modifier un champ ne doit pas provoquer de changement inattendu',
    howToTest: 'Remplissez les formulaires. Cocher une case ou saisir ne doit pas soumettre automatiquement ou changer de page sans avertissement ou bouton explicite.'
  },
  {
    code: '3.2.3',
    title: 'Consistent Navigation',
    level: 'AA',
    description: 'La navigation doit être cohérente sur toutes les pages',
    howToTest: 'Vérifiez que les menus de navigation sont dans le même ordre et au même endroit sur toutes les pages du site.'
  },
  {
    code: '3.2.4',
    title: 'Consistent Identification',
    level: 'AA',
    description: 'Les composants ayant la même fonction doivent être identifiés de manière cohérente',
    howToTest: 'Vérifiez que les icônes, boutons et liens ayant la même fonction utilisent le même label ou texte sur toutes les pages.'
  },
  {
    code: '3.2.5',
    title: 'Change on Request',
    level: 'AAA',
    description: 'Les changements de contexte ne se produisent que sur demande',
    howToTest: 'Vérifiez qu\'aucun changement de page ou ouverture de fenêtre ne se produit sans action explicite de l\'utilisateur (clic sur bouton ou lien).'
  },
  {
    code: '3.2.6',
    title: 'Consistent Help',
    level: 'A',
    description: 'L\'aide doit être accessible de manière cohérente',
    howToTest: 'Si une aide est disponible, vérifiez qu\'elle est accessible au même endroit sur toutes les pages (même position dans la navigation).'
  },

  // 3.3 Input assistance
  {
    code: '3.3.1',
    title: 'Error Identification',
    level: 'A',
    description: 'Les erreurs de saisie doivent être identifiées et décrites',
    howToTest: 'Soumettez un formulaire avec des erreurs. Les messages d\'erreur doivent être clairs, indiquer quel champ est en erreur et décrire le problème.'
  },
  {
    code: '3.3.2',
    title: 'Labels or Instructions',
    level: 'A',
    description: 'Les champs de formulaire doivent avoir des étiquettes ou instructions',
    howToTest: 'Vérifiez que chaque champ a un <label> associé visible ou des instructions claires (placeholder ne suffit pas).'
  },
  {
    code: '3.3.3',
    title: 'Error Suggestion',
    level: 'AA',
    description: 'Fournir des suggestions pour corriger les erreurs',
    howToTest: 'Quand une erreur est détectée, vérifiez qu\'une suggestion de correction est fournie (ex: "Le format attendu est jj/mm/aaaa").'
  },
  {
    code: '3.3.4',
    title: 'Error Prevention (Legal, Financial, Data)',
    level: 'AA',
    description: 'Permettre de vérifier et corriger avant soumission pour les actions importantes',
    howToTest: 'Pour les formulaires juridiques, financiers ou de données, vérifiez qu\'une page de confirmation permet de réviser et corriger avant validation finale.'
  },
  {
    code: '3.3.5',
    title: 'Help',
    level: 'AAA',
    description: 'Fournir une aide contextuelle',
    howToTest: 'Vérifiez qu\'une aide contextuelle est disponible pour expliquer les champs complexes ou les formats attendus.'
  },
  {
    code: '3.3.6',
    title: 'Error Prevention (All)',
    level: 'AAA',
    description: 'Permettre de vérifier et corriger avant toute soumission',
    howToTest: 'Pour tous les formulaires, vérifiez qu\'une page de confirmation permet de réviser avant soumission ou qu\'un bouton annuler existe.'
  },
  {
    code: '3.3.7',
    title: 'Redundant Entry',
    level: 'A',
    description: 'Ne pas demander deux fois la même information',
    howToTest: 'Vérifiez qu\'aucune information n\'est demandée plusieurs fois dans une même session, sauf nécessité de sécurité (confirmation de mot de passe).'
  },
  {
    code: '3.3.8',
    title: 'Accessible Authentication (Minimum)',
    level: 'AA',
    description: 'Ne pas imposer de test cognitif pour l\'authentification',
    howToTest: 'Vérifiez que la connexion ne nécessite pas de se souvenir d\'informations complexes ou de résoudre des puzzles. Permettre le copier-coller et l\'auto-complétion.'
  },
  {
    code: '3.3.9',
    title: 'Accessible Authentication (Enhanced)',
    level: 'AAA',
    description: 'Ne pas imposer de test cognitif pour l\'authentification sans alternative',
    howToTest: 'Même exigence que 3.3.8, mais avec obligation de fournir une alternative (authentification biométrique, lien de connexion par email).'
  },

  // 4. Robust
  // 4.1 Compatible
  {
    code: '4.1.1',
    title: 'Parsing (obsolete)',
    level: 'A',
    description: 'Critère obsolète et supprimé dans WCAG 2.2',
    howToTest: 'Ce critère a été supprimé dans WCAG 2.2. Il concernait la validation HTML, désormais gérée par les navigateurs modernes.'
  },
  {
    code: '4.1.2',
    title: 'Name, Role, Value',
    level: 'A',
    description: 'Les composants d\'interface doivent avoir nom, rôle et valeur accessibles',
    howToTest: 'Utilisez un lecteur d\'écran (NVDA, JAWS) ou les outils de développement. Chaque bouton, lien, champ doit annoncer son rôle, son nom et son état.'
  },
  {
    code: '4.1.3',
    title: 'Status Messages',
    level: 'AA',
    description: 'Les messages de statut doivent être annoncés aux technologies d\'assistance',
    howToTest: 'Pour les messages de succès, erreur, chargement, vérifiez qu\'un role="status" ou aria-live est utilisé pour que les lecteurs d\'écran les annoncent automatiquement.'
  },
];
