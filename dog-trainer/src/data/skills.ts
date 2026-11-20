export type Category = 'Foundations' | 'Manners' | 'Recall & Leash' | 'Tricks' | 'Calm & Confidence';

export type Skill = {
  id: string;
  name: string;
  category: Category;
  level: 1 | 2 | 3;
  summary: string;
  /** What "done" looks like – used as the criteria for moving to Mastered. */
  goal: string;
  /** The dog's age in weeks when this skill is scheduled in the plan. */
  week: number;
  steps: string[];
  tips: string[];
};

export const CATEGORIES: Category[] = [
  'Foundations',
  'Manners',
  'Recall & Leash',
  'Calm & Confidence',
  'Tricks',
];

export const CATEGORY_EMOJI: Record<Category, string> = {
  Foundations: '🧱',
  Manners: '🎩',
  'Recall & Leash': '🦮',
  'Calm & Confidence': '🧘',
  Tricks: '🎪',
};

const BASE_SKILLS: Omit<Skill, 'week'>[] = [
  // ── Foundations ────────────────────────────────────────────────
  {
    id: 'charge-marker',
    name: 'Charge the marker',
    category: 'Foundations',
    level: 1,
    summary: 'Teach your dog that the click (or "Yes!") always means a treat is coming.',
    goal: 'Your dog visibly perks up and looks for a treat the instant they hear the marker.',
    steps: [
      'Sit with 15–20 tiny, soft treats in a quiet room.',
      'Click (or say "Yes!"), then hand over a treat within one second. Your dog does not need to do anything.',
      'Keep your treat hand still until after the click so the sound — not your hand — predicts food.',
      'Repeat 15–20 times, pausing a few seconds between reps.',
      'Test: click when your dog is looking away. If they snap their head toward you, the marker is charged.',
    ],
    tips: [
      'Use pea-sized treats so you can do many reps without filling them up.',
      'Never click to get attention — the click is a promise of food, not a call.',
      'If the clicker scares your dog, use the app clicker at low volume or a verbal "Yes!".',
    ],
  },
  {
    id: 'name-game',
    name: 'Name recognition',
    category: 'Foundations',
    level: 1,
    summary: 'Your dog\'s name means "look at me — good things are coming".',
    goal: 'Your dog turns to look at you 9/10 times when you say their name with mild distractions.',
    steps: [
      'In a quiet room, say your dog\'s name once in a happy tone.',
      'The moment they look at you, mark and reward.',
      'If they don\'t look, make a small kissy noise, then mark and reward the look. Fade the noise over sessions.',
      'Practice when they are mildly distracted (sniffing a toy, looking out a window).',
      'Gradually practice in new rooms, the garden, then on walks.',
    ],
    tips: [
      'Never use their name to scold — keep it 100% positive.',
      'Say the name only once. Repeating teaches them to ignore it.',
    ],
  },
  {
    id: 'sit',
    name: 'Sit',
    category: 'Foundations',
    level: 1,
    summary: 'The classic. A great default "please" behavior.',
    goal: 'Sits on a single verbal cue within 2 seconds, in 3 different locations.',
    steps: [
      'Hold a treat at your dog\'s nose and slowly lift it up and slightly back over their head.',
      'As their head goes up, their bottom goes down. Mark the instant it touches the floor, then reward.',
      'After 5–6 successful lures, do the same hand motion with no treat in that hand. Mark and reward from the other hand.',
      'Once the hand signal is reliable, say "Sit" just before the hand signal.',
      'Gradually make the hand signal smaller until the word alone works.',
    ],
    tips: [
      'Don\'t push their bottom down — let them figure it out.',
      'If they jump up, your lure is too high. Keep it just above their nose.',
      'Release with a word like "Okay!" so they learn when sit is over.',
    ],
  },
  {
    id: 'down',
    name: 'Down',
    category: 'Foundations',
    level: 1,
    summary: 'Lying down on cue — the building block for settling and stays.',
    goal: 'Lies down on a single cue within 3 seconds from a sit or stand.',
    steps: [
      'Start with your dog in a sit. Hold a treat at their nose.',
      'Slowly move the treat straight down to the floor between their front paws, then slightly away along the floor.',
      'Mark when their elbows touch the floor, then reward on the ground.',
      'If they only go part way, mark and reward small progress (head down, shoulders dipping), then raise criteria.',
      'Fade the lure into a hand signal (flat palm toward floor), then add the word "Down".',
    ],
    tips: [
      'Practicing on a soft rug or grass makes down more comfortable.',
      'Try luring under your bent leg (an "tunnel") if your dog keeps standing up.',
    ],
  },
  {
    id: 'touch',
    name: 'Hand target (Touch)',
    category: 'Foundations',
    level: 1,
    summary: 'Nose-to-palm touch. A super useful tool for moving your dog around.',
    goal: 'Moves to touch your palm on cue from up to 2 metres away.',
    steps: [
      'Present a flat palm a few centimetres from your dog\'s nose.',
      'Most dogs sniff it out of curiosity — mark the nose bump and reward from the other hand.',
      'Hide the hand behind your back between reps, then present it again.',
      'Once they touch reliably, say "Touch" as you present the hand.',
      'Gradually move your hand further away, higher, lower, and to each side.',
    ],
    tips: [
      'Rub a little treat on your palm for the first few reps if they aren\'t interested.',
      'Use Touch to call your dog off furniture or to get them past distractions.',
    ],
  },

  // ── Manners ────────────────────────────────────────────────────
  {
    id: 'leave-it',
    name: 'Leave it',
    category: 'Manners',
    level: 2,
    summary: 'Ignore food, items or things on the ground when asked.',
    goal: 'Leaves a treat on the floor for 5 seconds on cue, and turns back to you.',
    steps: [
      'Put a treat in a closed fist and hold it near your dog. Let them sniff, lick, paw.',
      'The moment they back off even slightly, mark and reward from your OTHER hand.',
      'When they back away immediately, start saying "Leave it" as you present the fist.',
      'Progress: open palm (close it if they go for it) → treat on the floor under your hand → treat uncovered on the floor.',
      'Always reward with a different (better) treat — never the one they left.',
    ],
    tips: [
      'Keep a leash on when you practice outside so they can\'t self-reward.',
      'Practice with toys, dropped tissues and other real-life items once food is easy.',
    ],
  },
  {
    id: 'wait-door',
    name: 'Wait at doors',
    category: 'Manners',
    level: 2,
    summary: 'Pause at doorways until released — no more bolting.',
    goal: 'Waits at an open door for 10 seconds until released, at home doors and the car.',
    steps: [
      'Stand at a closed door with your dog (on leash for safety).',
      'Begin to open the door. If your dog moves forward, calmly close it.',
      'When they hold position as the door opens a crack, mark, close the door and reward.',
      'Gradually open the door wider and for longer before marking.',
      'Add a release word ("Okay!") and invite them through. Practice with the car door too.',
    ],
    tips: [
      'The door itself does the teaching — no need to say "no".',
      'Sit isn\'t required; any stationary position is fine.',
    ],
  },
  {
    id: 'off-jumping',
    name: 'Four on the floor',
    category: 'Manners',
    level: 2,
    summary: 'Greet people politely instead of jumping up.',
    goal: 'Greets a visitor while keeping all four paws on the floor for 5 seconds.',
    steps: [
      'Have treats ready before a greeting. Scatter a few on the floor as the person approaches — dogs eating off the floor can\'t jump.',
      'Have the greeter only pet when all four paws are down.',
      'If your dog jumps, the greeter calmly turns away and steps back. Try again in a few seconds.',
      'Mark and reward feet-on-floor generously during greetings.',
      'Gradually phase out the floor scatter and reward intermittently.',
    ],
    tips: [
      'Practice with family first, then friends who agree to follow the rules.',
      'Consistency is everything — one person rewarding jumping undoes a lot of work.',
    ],
  },
  {
    id: 'drop-it',
    name: 'Drop it',
    category: 'Manners',
    level: 2,
    summary: 'Release what\'s in their mouth on cue — safety and fun for fetch.',
    goal: 'Drops a toy on cue within 3 seconds, without needing a treat in view.',
    steps: [
      'Play tug or offer a low-value toy.',
      'Put a high-value treat right at their nose. When they open their mouth to take it, say "Drop" and mark.',
      'Give the treat, then give the toy back — dropping doesn\'t mean losing the fun.',
      'After several reps, say "Drop" BEFORE presenting the treat.',
      'Practice with trade-ups of increasing value (toy → chew → found item).',
    ],
    tips: [
      'Never chase a dog who has something — it turns into a game of keep-away.',
      'Always trade; never just take.',
    ],
  },

  // ── Recall & Leash ─────────────────────────────────────────────
  {
    id: 'recall',
    name: 'Come (Recall)',
    category: 'Recall & Leash',
    level: 2,
    summary: 'The most important cue: come back to you, every time.',
    goal: 'Comes immediately when called from 10 metres away outdoors with mild distractions.',
    steps: [
      'Indoors, say "Come!" once in a happy voice and back away a few steps.',
      'Mark as they reach you and give a jackpot (several treats, one after the other).',
      'Play "ping-pong" recall with two people taking turns calling across a room.',
      'Move to the garden, then a quiet park on a long line (5–10 m).',
      'Only add distractions once the cue is lightning-fast in easy places.',
    ],
    tips: [
      'Never call your dog for something unpleasant (bath, nails, leaving the park).',
      'Use your best treats exclusively for recall.',
      'If they don\'t come, don\'t repeat the cue — go get them and make the next rep easier.',
    ],
  },
  {
    id: 'loose-leash',
    name: 'Loose-leash walking',
    category: 'Recall & Leash',
    level: 3,
    summary: 'Walk nicely next to you without pulling.',
    goal: 'Walks 50 metres outdoors with a loose leash (J-shape) and checks in with you.',
    steps: [
      'Indoors with no leash: reward your dog every time they are next to your leg. Walk a few steps; reward again.',
      'Put the leash on and repeat in the house, then the garden.',
      'Outside: the moment the leash goes tight, stop moving. Wait for slack (or call them back), then mark and continue.',
      'Reward frequently at your side — every 2–3 steps at first — then stretch it out.',
      'Add "Let\'s go" and change direction often to keep them engaged.',
    ],
    tips: [
      'Let them sniff as a reward: "Go sniff!" is a great release.',
      'A front-clip harness can help while you train.',
      'Short, frequent sessions beat one long frustrating walk.',
    ],
  },
  {
    id: 'check-in',
    name: 'Check-ins',
    category: 'Recall & Leash',
    level: 1,
    summary: 'Reward your dog for voluntarily looking at you on walks.',
    goal: 'Offers a check-in (looks up at you) at least once every 20 seconds on a walk.',
    steps: [
      'On a walk, quietly wait for your dog to glance at you.',
      'Mark the instant they look and reward at your leg.',
      'Count how many check-ins you get per minute and try to beat it next time.',
      'Practice in increasingly interesting places.',
    ],
    tips: ['This builds the foundation for both recall and loose-leash walking.'],
  },

  // ── Calm & Confidence ──────────────────────────────────────────
  {
    id: 'stay',
    name: 'Stay',
    category: 'Calm & Confidence',
    level: 2,
    summary: 'Hold position until released. Build the three Ds: duration, distance, distraction.',
    goal: 'Holds a stay for 30 seconds while you are 3 metres away.',
    steps: [
      'Ask for a sit or down. Say "Stay", wait 1 second, mark and reward IN position.',
      'Release with "Okay!" and encourage them to move.',
      'Build duration first: 2s, 3s, 5s, 10s… Mix easy reps between harder ones.',
      'Then build distance: one step back, return, reward. Gradually add steps.',
      'Finally add distractions (clapping, dropping a toy). Work on only one D at a time.',
    ],
    tips: [
      'Always go back to your dog to reward — don\'t call them out of a stay.',
      'If they break twice in a row, make it easier.',
    ],
  },
  {
    id: 'settle-mat',
    name: 'Settle on a mat',
    category: 'Calm & Confidence',
    level: 2,
    summary: 'Go to a bed or mat and relax there — perfect for dinner time or cafés.',
    goal: 'Goes to the mat on cue and relaxes there for 5 minutes.',
    steps: [
      'Place a mat on the floor. Mark and reward any interaction with it (sniff, step on).',
      'Raise criteria: two paws, four paws, then a down on the mat. Reward on the mat.',
      'Add the cue "Mat" or "Place" once they go there reliably.',
      'Slowly reward calm behaviour: chin down, hip roll, sighs. Slow your treat delivery right down.',
      'Practice in new locations: friend\'s house, café, vet waiting room.',
    ],
    tips: [
      'Give a long-lasting chew on the mat to help them settle.',
      'Calm, slow praise works better than excited praise here.',
    ],
  },
  {
    id: 'alone-time',
    name: 'Comfortable alone',
    category: 'Calm & Confidence',
    level: 3,
    summary: 'Gradually teach your dog that being alone is safe and boring.',
    goal: 'Stays relaxed for 30 minutes alone (check with a camera).',
    steps: [
      'Practice "pre-departure cues" (keys, shoes, coat) without leaving, until your dog stops reacting.',
      'Step out the door for 1–2 seconds and come back calmly. No big hellos.',
      'Increase time very gradually — vary it so it isn\'t always longer.',
      'Use a camera to watch body language. Stay below the point where they start to worry.',
      'Give an enrichment toy (stuffed food toy, lick mat) as you leave.',
    ],
    tips: [
      'Progress here is measured in weeks, not days. Go slowly.',
      'If your dog shows panic (destruction, howling, drooling), speak to a qualified behaviourist.',
    ],
  },

  // ── Tricks ─────────────────────────────────────────────────────
  {
    id: 'paw',
    name: 'Shake paw',
    category: 'Tricks',
    level: 1,
    summary: 'Offer a paw for a high five or handshake.',
    goal: 'Offers the correct paw on cue 9/10 times.',
    steps: [
      'Ask for a sit. Hold a treat in a closed fist low near their chest.',
      'Wait. Most dogs will paw at your hand. Mark the paw lift and open your hand.',
      'Repeat until they lift their paw quickly, then present an open palm instead of a fist.',
      'Add the cue "Paw" just before presenting your hand.',
      'For "High five", raise the palm and turn it to face them.',
    ],
    tips: ['Teach left and right as separate cues once the first one is solid.'],
  },
  {
    id: 'spin',
    name: 'Spin',
    category: 'Tricks',
    level: 1,
    summary: 'A full circle on cue. Fun warm-up and confidence builder.',
    goal: 'Spins a full circle on a small hand signal or word.',
    steps: [
      'Lure with a treat at nose height in a big circle around your dog.',
      'Mark as they complete the circle and reward.',
      'After a few reps, use the same motion with an empty hand and reward from the other.',
      'Make the hand motion smaller each session.',
      'Add the cue "Spin" before the hand signal. Teach the other direction as "Twist".',
    ],
    tips: ['Keep it slow at first — a fast lure gets you a sloppy spin.'],
  },
  {
    id: 'roll-over',
    name: 'Roll over',
    category: 'Tricks',
    level: 2,
    summary: 'Full roll from a down position.',
    goal: 'Completes a full roll on cue from a down.',
    steps: [
      'Start in a down. Lure their nose toward their shoulder so they roll onto a hip. Mark and reward.',
      'Continue the lure over their shoulder so they roll onto their side. Mark and reward.',
      'Continue so they roll fully onto their back and over. Mark and jackpot.',
      'Fade the lure into a circular hand motion and add the cue "Roll over".',
    ],
    tips: [
      'Practice on a soft surface.',
      'Some dogs find being on their back vulnerable — go slowly and stop if they seem worried.',
    ],
  },
  {
    id: 'play-dead',
    name: 'Bang! (Play dead)',
    category: 'Tricks',
    level: 3,
    summary: 'The crowd pleaser: drop and stay on their side on cue.',
    goal: 'Drops to their side on "Bang!" and holds for 3 seconds.',
    steps: [
      'Teach a solid down first, then lure onto their side (first half of roll over).',
      'Mark and reward while they are lying flat on their side.',
      'Build a little duration lying flat, like a stay.',
      'Add the cue "Bang!" with a finger-gun hand signal.',
      'Eventually ask from a stand for the full dramatic flop.',
    ],
    tips: ['Requires Down and part of Roll over — train those first.'],
  },
  // ── Puppy essentials ───────────────────────────────────────────
  {
    id: 'toilet-training',
    name: 'Toilet training',
    category: 'Foundations',
    level: 1,
    summary: 'Teach your puppy to go outside, in one spot, on a routine.',
    goal: 'A full week with no accidents indoors, and your puppy goes to the door when they need to go.',
    steps: [
      'Take your puppy out after waking, after eating, after play, and at least every 1–2 hours.',
      'Go to the same spot and stand quietly. Say a cue like "Go potty" while they sniff.',
      'The moment they finish, mark and give a treat right there, outside.',
      'Supervise indoors. If they start to sniff and circle, calmly carry them out.',
      'Gradually stretch the time between trips as they go a full day without accidents.',
    ],
    tips: [
      'Never punish accidents — it teaches them to hide when they go. Clean with an enzyme cleaner.',
      'A rough rule: puppies can hold it for about their age in months plus one, in hours.',
    ],
  },
  {
    id: 'crate',
    name: 'Crate comfort',
    category: 'Calm & Confidence',
    level: 1,
    summary: 'Make the crate a cosy den your puppy happily goes into.',
    goal: 'Goes into the crate on cue and settles quietly with the door closed for 30 minutes.',
    steps: [
      'Leave the crate open with a soft bed. Drop treats inside for your puppy to find.',
      'Feed meals in the crate with the door open.',
      'Close the door for a few seconds while they eat, then open it before they finish.',
      'Build up to a few minutes with you sitting nearby, then step out of sight briefly.',
      'Add a cue like "Bed" and give a long-lasting chew for longer stays.',
    ],
    tips: [
      'Never use the crate as punishment.',
      'Young puppies need toilet breaks — don\'t crate for longer than they can hold it.',
    ],
  },
  {
    id: 'socialisation',
    name: 'Socialisation',
    category: 'Calm & Confidence',
    level: 1,
    summary: 'Positive, calm experiences of people, places, sounds and surfaces.',
    goal: 'Your puppy has had calm, happy experiences with 100 new things (people, sounds, surfaces, places).',
    steps: [
      'Make a list: people of all ages, hats and umbrellas, traffic, bikes, vacuum, different floors, car rides.',
      'Expose your puppy to one or two new things each day, from a distance where they stay relaxed.',
      'Pair each new thing with treats: new thing appears, treats flow; it goes away, treats stop.',
      'Let your puppy choose to approach — never force an interaction.',
      'Note each experience in the session notes so you can track your 100.',
    ],
    tips: [
      'The window up to about 16 weeks matters most, so start early.',
      'Quality beats quantity. One calm experience is better than five scary ones.',
      'Ask your vet when it\'s safe to visit public places before vaccinations are complete.',
    ],
  },
  {
    id: 'handling',
    name: 'Handling & grooming',
    category: 'Foundations',
    level: 1,
    summary: 'Get your puppy happy with paws, ears, mouth and brushing touched.',
    goal: 'Lets you check ears, teeth and paws, and brush them, while staying relaxed.',
    steps: [
      'Touch a shoulder for one second, then treat. Repeat until your puppy looks happy about it.',
      'Move on to paws, ears, tail, and gently lifting the lip, one area per session.',
      'Hold each touch a little longer, and add a brush or nail clipper nearby (not used yet).',
      'Touch the clipper to a nail, treat. Then trim one nail, treat lavishly.',
      'Practice a "vet check" with a friend touching your puppy too.',
    ],
    tips: ['If your puppy pulls away, go back to a shorter, easier touch.'],
  },
  {
    id: 'gentle-mouth',
    name: 'Gentle mouth',
    category: 'Manners',
    level: 1,
    summary: 'Bite inhibition: teach your puppy that human skin is fragile.',
    goal: 'Plays with toys instead of hands, and mouths gently if at all.',
    steps: [
      'Keep a toy handy during play so your puppy has something better to bite.',
      'If teeth touch skin hard, say "Ouch" calmly, and pause play for a few seconds.',
      'Restart play with a toy. Praise gentle mouthing and toy chewing.',
      'If your puppy is overtired and bitey, it\'s nap time — pop them in the crate with a chew.',
    ],
    tips: [
      'Puppies bite most when they are tired, overexcited or teething.',
      'Frozen carrots or wet frozen washcloths help with teething.',
    ],
  },
  {
    id: 'collar-leash',
    name: 'Collar & leash comfort',
    category: 'Recall & Leash',
    level: 1,
    summary: 'Get your puppy used to wearing a collar or harness and leash.',
    goal: 'Wears a collar or harness and follows you happily on a loose leash around the house.',
    steps: [
      'Put the collar or harness on just before meals or play, then take it off after.',
      'Clip on a light leash and let it trail while you supervise.',
      'Pick up the leash and walk a few steps. Reward your puppy for following.',
      'Practice indoors, then in the garden, before your first walks.',
    ],
    tips: ['If your puppy scratches at the collar, distract them with a game or treats.'],
  },
];

/**
 * The weekly plan: the age (in weeks) at which each skill is scheduled.
 * Most puppies come home at about 8 weeks.
 */
const PLAN_WEEK: Record<string, number> = {
  'charge-marker': 8,
  'name-game': 8,
  'toilet-training': 8,
  crate: 8,
  sit: 9,
  socialisation: 9,
  touch: 10,
  handling: 10,
  down: 11,
  'gentle-mouth': 11,
  recall: 12,
  'collar-leash': 12,
  'leave-it': 13,
  'check-in': 13,
  stay: 14,
  'off-jumping': 14,
  'wait-door': 15,
  'drop-it': 15,
  'settle-mat': 16,
  paw: 16,
  'loose-leash': 17,
  spin: 18,
  'alone-time': 18,
  'roll-over': 20,
  'play-dead': 24,
};

export const PLAN_START_WEEK = 8;

/** All skills, in plan order. */
export const SKILLS: Skill[] = BASE_SKILLS.map((s) => ({ ...s, week: PLAN_WEEK[s.id] ?? 26 })).sort(
  (a, b) => a.week - b.week,
);

/** The plan weeks that have skills, in order. */
export const PLAN_WEEKS: number[] = [...new Set(SKILLS.map((s) => s.week))];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
