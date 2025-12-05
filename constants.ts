import { CostumeStyle } from './types';

// Import all SVG icons as URLs for instant loading (bundled by Vite)
import VampireIcon from './Public/Icons/ORIGINAL NIGHTMARES/The Eternal (Vampire).svg';
import ZombieIcon from './Public/Icons/ORIGINAL NIGHTMARES/The Rotted (Zombie).svg';
import WitchIcon from './Public/Icons/ORIGINAL NIGHTMARES/Coven Leader (Witch).svg';
import SkeletonIcon from './Public/Icons/ORIGINAL NIGHTMARES/Grim Reaper (Skeleton).svg';
import PumpkinIcon from './Public/Icons/ORIGINAL NIGHTMARES/Harvest Curse (Pumpkin).svg';
import DemonIcon from './Public/Icons/ORIGINAL NIGHTMARES/Possessed (Demon).svg';
import WerewolfIcon from './Public/Icons/ORIGINAL NIGHTMARES/The Mooncursed (Werewolf).svg';
import GhostIcon from './Public/Icons/ORIGINAL NIGHTMARES/The Apparition (Ghost).svg';
import ClownIcon from './Public/Icons/ORIGINAL NIGHTMARES/The Jester (Clown).svg';
import DollIcon from './Public/Icons/ORIGINAL NIGHTMARES/The Marionette (Doll).svg';
import AlienIcon from './Public/Icons/ORIGINAL NIGHTMARES/The Visitor (Alien).svg';
import CyborgIcon from './Public/Icons/ORIGINAL NIGHTMARES/The Construct (Cyborg).svg';
import MummyIcon from './Public/Icons/ORIGINAL NIGHTMARES/The Preserved (Mummy).svg';
import ScarecrowIcon from './Public/Icons/ORIGINAL NIGHTMARES/The Strawman (Scarecrow).svg';
import DeanIcon from './Public/Icons/SUPERNATURAL/Dean Winchester (The Righteous Man).svg';
import SamIcon from './Public/Icons/SUPERNATURAL/Sam Winchester (The Boy King).svg';
import CastielIcon from './Public/Icons/SUPERNATURAL/Castiel (The Fallen Angel).svg';
import CrowleyIcon from './Public/Icons/SUPERNATURAL/Crowley (King of the Crossroads).svg';
import DrDoomIcon from './Public/Icons/VIDEO GAME LEGENDS/Dr. Doom (The Monarch).svg';
import KratosIcon from './Public/Icons/VIDEO GAME LEGENDS/Kratos (Ghost of Sparta).svg';
import MasterChiefIcon from './Public/Icons/VIDEO GAME LEGENDS/Master Chief (The Spartan).svg';
import LaraCroftIcon from './Public/Icons/VIDEO GAME LEGENDS/Lara Croft (The Survivor).svg';
import LichKingIcon from './Public/Icons/VIDEO GAME LEGENDS/Lich King (Lord of the Scourge).svg';
import GeraltIcon from './Public/Icons/VIDEO GAME LEGENDS/Geralt (The White Wolf).svg';
import DarthVaderIcon from './Public/Icons/MOVIE MANIACS/Darth Vader (The Dark Lord).svg';
import TerminatorIcon from './Public/Icons/MOVIE MANIACS/Terminator (The Cyborg Assassin).svg';
import JohnWickIcon from './Public/Icons/MOVIE MANIACS/John Wick (The Boogeyman).svg';
import JokerIcon from './Public/Icons/MOVIE MANIACS/Joker (Agent of Chaos).svg';
import PredatorIcon from './Public/Icons/MOVIE MANIACS/Predator (The Hunter).svg';
import MadMaxIcon from './Public/Icons/MOVIE MANIACS/Mad Max (The Road Warrior).svg';
import CustomIcon from './Public/Icons/custom.svg';
import MentorIcon from './Public/Icons/The Mentor .svg';

// Category card images
import NightmaresCardIcon from './Public/Icons/Category Card Image/l Nightmares (Category I).svg';
import SupernaturalCardIcon from './Public/Icons/Category Card Image/Supernatural (Category II).svg';
import GameLegendsCardIcon from './Public/Icons/Category Card Image/Video Game Legends (Category III).svg';
import MovieManiacsCardIcon from './Public/Icons/Category Card Image/Movie Maniacs (Category IV).svg';

export const MENTOR_ICON = MentorIcon;

export const CATEGORY_ICONS = {
  nightmares: NightmaresCardIcon,
  supernatural: SupernaturalCardIcon,
  game: GameLegendsCardIcon,
  movie: MovieManiacsCardIcon,
};

export const COSTUME_STYLES: CostumeStyle[] = [
  {
    id: 'vampire',
    name: 'The Eternal',
    description: 'An ancient thirst that has survived centuries in the dark.',
    promptModifier: 'Dress the person as a Vampire Lord. Apply pale makeup, red contact lenses, and fangs. Victorian velvet clothing. Dark, misty cemetery background.',
    icon: VampireIcon,
    hexColor: '#8a0303',
    accentColorClass: 'text-blood',
    gender: 'male',
    category: 'original'
  },
  {
    id: 'zombie',
    name: 'The Rotted',
    description: 'Flesh falling from bone, the grave could not hold them.',
    promptModifier: 'Zombie costume and makeup. Green-grey skin tone, dark circles under eyes, torn clothing. Atmosphere of decay and grime.',
    icon: ZombieIcon,
    hexColor: '#4a5e2a',
    accentColorClass: 'text-lime-900',
    gender: 'unisex',
    category: 'original'
  },
  {
    id: 'witch',
    name: 'Coven Leader',
    description: 'Dark rituals whispered in the deep woods.',
    promptModifier: 'Dark Witch costume. Hooded cloak, glowing runic makeup on face, white contact lenses. Dark smoke and floating embers background.',
    icon: WitchIcon,
    hexColor: '#5c0099',
    accentColorClass: 'text-purple-900',
    gender: 'female',
    category: 'original'
  },
  {
    id: 'skeleton',
    name: 'Grim Reaper',
    description: 'Death waits for no one. The final visage.',
    promptModifier: 'Grim Reaper costume. Black hooded robe. Realistic skull face paint (makeup). Holding a scythe. Mist swirling around.',
    icon: SkeletonIcon,
    hexColor: '#a3a3a3',
    accentColorClass: 'text-gray-400',
    gender: 'unisex',
    category: 'original'
  },
  {
    id: 'pumpkin',
    name: 'Harvest Curse',
    description: 'The fields are alive, and they are hungry.',
    promptModifier: 'Horror Pumpkin creature costume. Orange and black face paint, vine textures on neck. Dark cornfield background at night.',
    icon: PumpkinIcon,
    hexColor: '#cf5700',
    accentColorClass: 'text-orange-800',
    gender: 'unisex',
    category: 'original'
  },
  {
    id: 'demon',
    name: 'Possessed',
    description: 'A vessel for something... else.',
    promptModifier: 'Possessed Demon costume and makeup. Pitch black contact lenses, cracked skin texture makeup with magma glow effects, dark robes. Hellish red lighting.',
    icon: DemonIcon,
    hexColor: '#3d0000',
    accentColorClass: 'text-red-900',
    gender: 'unisex',
    category: 'original'
  },
  {
    id: 'werewolf',
    name: 'The Mooncursed',
    description: 'A primal rage unleashed under the full moon.',
    promptModifier: 'Werewolf costume. Applied fur textures to face edges, glowing yellow contact lenses, sharp teeth. Tattered clothing. Dark forest background.',
    icon: WerewolfIcon,
    hexColor: '#5e4b35',
    accentColorClass: 'text-amber-900',
    gender: 'unisex',
    category: 'original'
  },
  {
    id: 'ghost',
    name: 'The Apparition',
    description: 'Trapped between worlds, a fading echo of life.',
    promptModifier: 'Ghost costume. Pale blue skin makeup, white contact lenses. Wearing tattered spectral robes. Ethereal mist and fog background.',
    icon: GhostIcon,
    hexColor: '#a5f2f3',
    accentColorClass: 'text-cyan-200',
    gender: 'unisex',
    category: 'original'
  },
  {
    id: 'clown',
    name: 'The Jester',
    description: 'Laughter that turns into a scream.',
    promptModifier: 'Killer Clown costume. White face paint with cracked texture, smeared red smile makeup, dark makeup around eyes, colorful but dirty ruffled collar.',
    icon: ClownIcon,
    hexColor: '#ff0055',
    accentColorClass: 'text-pink-600',
    gender: 'unisex',
    category: 'original'
  },
  {
    id: 'doll',
    name: 'The Marionette',
    description: 'Porcelain skin that hides a dark soul.',
    promptModifier: 'Creepy Porcelain Doll costume and makeup. Porcelain skin texture effect, doll-like eye makeup. Vintage lace clothing. Dark attic background.',
    icon: DollIcon,
    hexColor: '#fcede6',
    accentColorClass: 'text-rose-200',
    gender: 'female',
    category: 'original'
  },
  {
    id: 'alien',
    name: 'The Visitor',
    description: 'They came from the stars, but not in peace.',
    promptModifier: 'Alien-hybrid costume. Grey skin makeup with shimmer, large black contact lenses. Sci-fi horror lighting.',
    icon: AlienIcon,
    hexColor: '#39ff14',
    accentColorClass: 'text-green-500',
    gender: 'unisex',
    category: 'original'
  },
  {
    id: 'cyborg',
    name: 'The Construct',
    description: 'Flesh fused with metal in a twisted experiment.',
    promptModifier: 'Cyborg costume. Metallic makeup and prosthetics on face, glowing red LED eye effect. Grimy industrial background.',
    icon: CyborgIcon,
    hexColor: '#00e1ff',
    accentColorClass: 'text-cyan-500',
    gender: 'unisex',
    category: 'original'
  },
  {
    id: 'mummy',
    name: 'The Preserved',
    description: 'Bound in linens, cursed for eternity.',
    promptModifier: 'Mummy costume. Wrapped in ancient linen bandages leaving face visible with decayed skin makeup. Ancient tomb background.',
    icon: MummyIcon,
    hexColor: '#e3cfa0',
    accentColorClass: 'text-yellow-200',
    gender: 'unisex',
    category: 'original'
  },
  {
    id: 'scarecrow',
    name: 'The Strawman',
    description: 'Silent watcher of the rotting fields.',
    promptModifier: 'Scarecrow costume. Burlap texture makeup effects on face, stitched mouth makeup. Worn, dirty clothes with straw. Dark stormy cornfield background.',
    icon: ScarecrowIcon,
    hexColor: '#d6ae5c',
    accentColorClass: 'text-amber-500',
    gender: 'unisex',
    category: 'original'
  },
  {
    id: 'dean_winchester',
    name: 'The Righteous Man',
    description: 'Saving people, hunting things. The family business.',
    promptModifier: 'Transform the person into Dean Winchester from Supernatural. A green jacket over a plaid flannel shirt, worn-in jeans. A rugged, determined look.',
    icon: DeanIcon,
    hexColor: '#4a5d23',
    accentColorClass: 'text-green-700',
    gender: 'male',
    category: 'supernatural'
  },
  {
    id: 'sam_winchester',
    name: 'The Boy King',
    description: 'The brains of the operation, with a dark destiny.',
    promptModifier: 'Transform the person into Sam Winchester from Supernatural. A plaid button-up shirt, maybe a hoodie. A thoughtful, slightly haunted expression and slightly longer hair.',
    icon: SamIcon,
    hexColor: '#3b3f4f',
    accentColorClass: 'text-slate-500',
    gender: 'male',
    category: 'supernatural'
  },
  {
    id: 'castiel',
    name: 'The Fallen Angel',
    description: 'An angel of the Lord who gripped you tight and raised you from perdition.',
    promptModifier: 'Transform the person into the angel Castiel from Supernatural. A tan trench coat over a suit and a loosened tie. An intense, otherworldly stare.',
    icon: CastielIcon,
    hexColor: '#c2b280',
    accentColorClass: 'text-yellow-300',
    gender: 'unisex',
    category: 'supernatural'
  },
  {
    id: 'crowley',
    name: 'King of the Crossroads',
    description: 'Hello, boys. The King of Hell, at your service.',
    promptModifier: 'Transform the person into the demon Crowley from Supernatural. A sharp, tailored black suit. A smug, charismatic expression and a faint red glow in their eyes.',
    icon: CrowleyIcon,
    hexColor: '#8b0000',
    accentColorClass: 'text-red-700',
    gender: 'unisex',
    category: 'supernatural'
  },
  {
    id: 'dr_doom',
    name: 'The Monarch',
    description: 'Ruler of Latveria, master of science and sorcery.',
    promptModifier: 'Transform the person into Dr. Doom. A green hooded cloak over metallic armor, an imposing metal mask covering the entire face.',
    icon: DrDoomIcon,
    hexColor: '#3d553d',
    accentColorClass: 'text-green-800',
    gender: 'male',
    category: 'game'
  },
  {
    id: 'kratos',
    name: 'Ghost of Sparta',
    description: 'The God of War, fueled by rage and vengeance.',
    promptModifier: 'Transform the person into Kratos from God of War. Pale, ash-white skin with a red tattoo over the face and body. A scarred, bald appearance with a full beard.',
    icon: KratosIcon,
    hexColor: '#b5a6a0',
    accentColorClass: 'text-gray-300',
    gender: 'male',
    category: 'game'
  },
  {
    id: 'master_chief',
    name: 'The Spartan',
    description: 'Humanity\'s last hope, a super-soldier of legend.',
    promptModifier: 'Transform the person into Master Chief from Halo. Encased in green Mjolnir powered assault armor, with a gold-visored helmet completely obscuring the face.',
    icon: MasterChiefIcon,
    hexColor: '#2e4530',
    accentColorClass: 'text-green-600',
    gender: 'unisex',
    category: 'game'
  },
  {
    id: 'lara_croft',
    name: 'The Survivor',
    description: 'A legendary adventurer, archeologist, and tomb raider.',
    promptModifier: 'Transform the person into Lara Croft. A practical tank top and cargo pants, with gear like a climbing axe or bow. An athletic, determined look with a braid.',
    icon: LaraCroftIcon,
    hexColor: '#8b7355',
    accentColorClass: 'text-amber-700',
    gender: 'female',
    category: 'game'
  },
  {
    id: 'lich_king',
    name: 'The Lich King',
    description: 'Lord of the Scourge, master of the damned.',
    promptModifier: 'Transform the person into the Lich King from World of Warcraft. Encased in dark, ornate, spiky plate armor with skull motifs. A menacing horned helmet with glowing blue eyes.',
    icon: LichKingIcon,
    hexColor: '#36454f',
    accentColorClass: 'text-slate-600',
    gender: 'unisex',
    category: 'game'
  },
  {
    id: 'geralt',
    name: 'The White Wolf',
    description: 'A Witcher, a professional monster slayer for hire.',
    promptModifier: 'Transform the person into Geralt of Rivia from The Witcher. White, long hair, yellow cat-like eyes, and a scarred face. Wearing leather armor.',
    icon: GeraltIcon,
    hexColor: '#c0c0c0',
    accentColorClass: 'text-gray-400',
    gender: 'male',
    category: 'game'
  },
  {
    id: 'darth_vader',
    name: 'The Dark Lord',
    description: 'The iron fist of the Empire, a master of the dark side.',
    promptModifier: 'Transform the person into Darth Vader. A full black suit of armor, a flowing cape, and the iconic menacing helmet. A red glowing lightsaber.',
    icon: DarthVaderIcon,
    hexColor: '#ff0000',
    accentColorClass: 'text-red-600',
    gender: 'unisex',
    category: 'movie'
  },
  {
    id: 'terminator',
    name: 'The Cyborg Assassin',
    description: 'An unstoppable machine from the future, sent back in time.',
    promptModifier: 'Transform the person into the Terminator. A black leather jacket, dark sunglasses, and exposed cybernetic parts on one side of the face with a glowing red eye.',
    icon: TerminatorIcon,
    hexColor: '#808080',
    accentColorClass: 'text-gray-500',
    gender: 'unisex',
    category: 'movie'
  },
  {
    id: 'john_wick',
    name: 'The Boogeyman',
    description: 'He is the one you send to kill the Boogeyman.',
    promptModifier: 'Transform the person into John Wick. A sharp, tailored black suit, slightly disheveled hair, and an intense, focused expression. Battle-worn with a few scrapes.',
    icon: JohnWickIcon,
    hexColor: '#2b2b2b',
    accentColorClass: 'text-gray-800',
    gender: 'male',
    category: 'movie'
  },
  {
    id: 'joker_chaos',
    name: 'Agent of Chaos',
    description: 'Some men just want to watch the world burn.',
    promptModifier: 'Transform the person into Heath Ledger\'s Joker. Messy green hair, chaotic smeared clown makeup with a Glasgow smile, and a purple suit.',
    icon: JokerIcon,
    hexColor: '#5a00b3',
    accentColorClass: 'text-purple-600',
    gender: 'unisex',
    category: 'movie'
  },
  {
    id: 'predator',
    name: 'The Hunter',
    description: 'An extraterrestrial warrior that hunts for sport.',
    promptModifier: 'Transform the person into the Predator. An intricate biomask with a triangular laser sight, dreadlock-like appendages, and advanced alien armor.',
    icon: PredatorIcon,
    hexColor: '#a9a9a9',
    accentColorClass: 'text-gray-400',
    gender: 'unisex',
    category: 'movie'
  },
  {
    id: 'mad_max',
    name: 'The Road Warrior',
    description: 'In the wasteland, he is the one who survives.',
    promptModifier: 'Transform the person into Mad Max. Worn and dusty leather gear, a sawn-off shotgun, and a rugged, weathered look. Post-apocalyptic.',
    icon: MadMaxIcon,
    hexColor: '#964b00',
    accentColorClass: 'text-amber-800',
    gender: 'unisex',
    category: 'movie'
  },
  {
    id: 'custom',
    name: 'The Unbound',
    description: 'Defy the presets. Forge your own nightmare.',
    promptModifier: '', // Populated by user input
    icon: CustomIcon,
    hexColor: '#ffffff',
    accentColorClass: 'text-white',
    gender: 'unisex',
    category: 'custom'
  }
];
