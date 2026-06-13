/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CryLabel, CryTypeDetails } from '../types';

export const emoji_map: Record<CryLabel, string> = {
  [CryLabel.BELLY_PAIN]: 'Belly Pain / Gas',
  [CryLabel.BURPING]: 'Burp Required',
  [CryLabel.COLD_HOT]: 'Thermal Shift',
  [CryLabel.DISCOMFORT]: 'Discomfort',
  [CryLabel.HUNGRY]: 'Hunger cues',
  [CryLabel.LAUGH]: 'Laughing & Cooing',
  [CryLabel.LONELY]: 'Lonely / Cuddle Seek',
  [CryLabel.NOISE]: 'Overstimulated',
  [CryLabel.SCARED]: 'Scared / Startled',
  [CryLabel.SILENCE]: 'Calm & Resting',
  [CryLabel.TIRED]: 'Tired & Sleepy'
};

export const advice_map: Record<CryLabel, string> = {
  [CryLabel.BELLY_PAIN]: "Try gently massaging baby's tummy in circular motions, or bicycle their legs gently to relieve trapped gas.",
  [CryLabel.BURPING]: "Hold baby upright against your shoulder or sitting on your lap, and gently pat or rub their back.",
  [CryLabel.COLD_HOT]: "Check baby's clothing and room temperature. Feel the back of their neck to ensure they are comfortable.",
  [CryLabel.DISCOMFORT]: "Check diaper status immediately, inspect clothing tags, or look for hair tourniquets on toes/fingers.",
  [CryLabel.HUNGRY]: "Time to feed! Baby is showing hunger cues. Offer breastmilk, formula, or pacifier if they just ate.",
  [CryLabel.LAUGH]: "Baby is happy and playful! Enjoy the moment! Talk, sing, or interact with soft toys.",
  [CryLabel.LONELY]: "Baby needs cuddles! Pick them up, make direct eye contact, speak in warm tones, and offer skins-to-skin touch.",
  [CryLabel.NOISE]: "Background noise detected — move to a quieter environment or decrease speaker volume to avoid overstimulation.",
  [CryLabel.SCARED]: "Baby is startled or frightened. Hold them close in a tight cuddle, speak softly, and eliminate sudden light or sound.",
  [CryLabel.SILENCE]: "Baby is calm and quiet. All good! Sleeping, observing or resting peacefully.",
  [CryLabel.TIRED]: "Baby needs sleep. Try rocking, swaddling, dimming the lights, or playing a soft natural white noise loop."
};

// Richly descriptive catalog of cry attributes for a gorgeous informational dashboard
export const cryTypeDetails: CryTypeDetails[] = [
  {
    label: CryLabel.HUNGRY,
    name: 'Hungry',
    emoji: '🍼',
    description: 'The most frequent infant vocalization. It is driven by the sucking reflex, causing a rhythmic pattern and soft sucking noises.',
    symptoms: [
      'Repetitive, steady crying that gets louder',
      '"Neh" or "N" sounding consonants from pressing tongue to the roof',
      'Smacking lips or sucking on hands/fingers',
      'Rooting (turning head looking for a feeding source)'
    ],
    soothingTechniques: [
      'Provide immediate latching or formula feed',
      'Ensure milk flow is warm and consistent',
      'Keep feeding pauses minimal to prevent extra air induction'
    ]
  },
  {
    label: CryLabel.BELLY_PAIN,
    name: 'Belly Pain / Gas',
    emoji: '🤢',
    description: 'Often caused by swallowed air, initial colic development, or digestion adaptation. Distinctly sharp, sudden, and muscular.',
    symptoms: [
      'Shrill, high-pitched crying or sudden screaming',
      'Arched back and legs drawn tightly up to the abdomen',
      'Firm or bloated tummy feel',
      'Squeezing fists or grunting noises'
    ],
    soothingTechniques: [
      'Perform "belly massage" in soft, clockwise circular motions',
      'Lay the baby on their back and gently "bicycle" their legs toward the chest',
      'Try the "colic hold" (holding the baby tummy-down along your forearm)'
    ]
  },
  {
    label: CryLabel.BURPING,
    name: 'Burp Required',
    emoji: '💨',
    description: 'Trapped pocket of air in the upper esophagus. The baby exhibits a raspy, grunting vocal sequence trying to release the bubble.',
    symptoms: [
      '"Eh" or "Eh-Ah" rasping sounds',
      'Squirming quickly immediately after or during a feeding',
      'Annoyance when laid flat on their back',
      'Sudden interruption of peaceful feeding'
    ],
    soothingTechniques: [
      'Hold upright resting on your shoulder with firm bottom support',
      'Seat baby on your lap, supporting their chin securely, and pat their upper back',
      'Gently rub upwards from the lower spine toward the shoulder blades'
    ]
  },
  {
    label: CryLabel.TIRED,
    name: 'Tired / Sleepy',
    emoji: '😴',
    description: 'Overstimulation combined with fatigue creates a whiny, yawny wailing. The baby is fighting sleep pressure.',
    symptoms: [
      'Nasal, whiny cry that starts and stops, yawning sounds',
      'Rubbing eyes, ears, or pulling at hair',
      'Averted gaze (actively looking away from faces and toys)',
      'Heavy fluttering eyelids'
    ],
    soothingTechniques: [
      'Move to a dark, quiet, cozy nursery as soon as possible',
      'Swaddle securely to calm spontaneous startle reflexes (Moro reflex)',
      'Rock rhythmically or sing a soft, low-frequency whisper'
    ]
  },
  {
    label: CryLabel.DISCOMFORT,
    name: 'General Discomfort',
    emoji: '😣',
    description: 'Triggered by wetness, scratchy textiles, thermal shifts, or tight wraps. Usually whiny and continuous but less frantic than pain.',
    symptoms: [
      'Continuous, flat whiny complaint',
      'Wriggling and trying to pull away from immediate surfaces',
      'Fretful restless movements without clear colic arches'
    ],
    soothingTechniques: [
      'Perform a rapid diaper diaper check',
      'Inspect inside layers for tight elastic or scratchy labels',
      'Gently wipe sensitive creases with a warm, damp cloth'
    ]
  },
  {
    label: CryLabel.COLD_HOT,
    name: 'Thermal Shift (Cold/Hot)',
    emoji: '🌡️',
    description: 'Infants cannot thermal-regulate efficiently. Being cold generates high-vibration crying, while being hot creates lethargic complaining.',
    symptoms: [
      'Cold: Quick shivering cry waves, cool hands or feet',
      'Hot: Heavy warm skin, flushed red cheeks, sweaty chest',
      'Slightly damp hair or damp clothing'
    ],
    soothingTechniques: [
      'Verify status: touch the back of the neck or chest (never trust hand temperature alone)',
      'Cold: Add an organic cotton sleep sack or swaddle layer',
      'Hot: Remove a layer; optimize room air circulation (maintain ~68-72°F / 20-22°C)'
    ]
  },
  {
    label: CryLabel.LONELY,
    name: 'Lonely / Bored',
    emoji: '🥺',
    description: 'Requires primary caregiver presence, reassurance, and tactile contact. Lowers when picked up.',
    symptoms: [
      'Calling whimper that repeats at regular intervals',
      'Quiets down instantly as soon as someone enters the room or approaches',
      'Searching look with wide eyes'
    ],
    soothingTechniques: [
      'Pick up immediately for cuddle or skin-to-skin contact',
      'Utilize a baby carrier to keep them close while moving around',
      'Sing, talk softly, or establish gentle direct eye contact'
    ]
  },
  {
    label: CryLabel.SCARED,
    name: 'Scared / Startled',
    emoji: '😨',
    description: 'A sharp reaction to sudden disruptions like sirens, door bangs, or bright flashes.',
    symptoms: [
      'Sudden, explosive high cry with wide-eyed shock',
      'Moro reflex (arms spreading out wide then drawing in)',
      'Rapid, racing heartbeat and heavy chest breathing'
    ],
    soothingTechniques: [
      'Hold the baby tightly against your chest to suppress the Moro reflex',
      'Shush calmly near their ear in rhythmic waves ("shh... shh...")',
      'Provide a pacifier or clean finger to suck on for soothing'
    ]
  },
  {
    label: CryLabel.NOISE,
    name: 'Overstimulated (Noise)',
    emoji: '🔊',
    description: 'The surrounding auditory ecosystem is too noisy for the baby’s sensory threshhold.',
    symptoms: [
      'Irritable crying while turning head away from sound sources',
      'Covers ears or squints eyes against ambient sound',
      'Clenched jaw and tense facial muscles'
    ],
    soothingTechniques: [
      'Immediately transition to a quiet, closed-door room',
      'Turn off active screens, loud speakers, or noisy appliances',
      'Activate a steady, gentle white noise machine to mask unpredictable sounds'
    ]
  },
  {
    label: CryLabel.SILENCE,
    name: 'Silence & Calm',
    emoji: '🤫',
    description: 'No crying. The ideal state of restorative quietude. The baby’s primary biological needs are balanced.',
    symptoms: [
      'Steady, rhythmic breathing',
      'Open, relaxed hands (unclenched)',
      'Bright, attentive watching or deep, therapeutic sleep'
    ],
    soothingTechniques: [
      'Maintain the current surrounding environment',
      'Allow them to play or look at non-noisy items naturally',
      'Let them transition into sleep without extra stimulus intervention'
    ]
  },
  {
    label: CryLabel.LAUGH,
    name: 'Laughing & Cooing',
    emoji: '😄',
    description: 'Happy acoustic expressions denoting amusement, satisfactory digestion, and physical comfort.',
    symptoms: [
      'Soft giggles, high squealing joy notes, or cheerful cooing',
      'Relaxed, smiling lip structure, kicking legs in excitement'
    ],
    soothingTechniques: [
      'Praise and giggle back, encouraging social bond milestones',
      'Mirror their playful sounds and make soft funny faces',
      'Gently tickle toes or play a soft peek-a-boo sequence'
    ]
  }
];
