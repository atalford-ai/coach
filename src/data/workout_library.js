// Track & Field Workout Library
// Evidence ratings: A = RCT/Meta-analysis  B = Observational/Expert consensus  C = Coaching practice
// All exercises are science-backed at their respective levels.

export const WORKOUT_LIBRARY = [
  // ─── SPRINTING ───────────────────────────────────────────────────────────────
  {
    id: 1, name: "A-Skips", category: "Sprinting", focus: "Neuromuscular Coordination",
    default_ratio: 10, evidence: "A",
    note: "Standard ALTIS & IAAF Level 1 drill. Activates hip flexors and reinforces cyclic step timing. Improves stride frequency without overloading the system.",
    defaultWork: 15, unit: "s",
  },
  {
    id: 2, name: "B-Skips", category: "Sprinting", focus: "Hamstring Active Claw-back",
    default_ratio: 10, evidence: "A",
    note: "IAAF-prescribed drill. Teaches active dorsiflexion and hamstring pawback during swing phase — critical for ground contact efficiency.",
    defaultWork: 15, unit: "s",
  },
  {
    id: 3, name: "Sled Pushes", category: "Sprinting", focus: "Horizontal Force Production",
    default_ratio: 20, evidence: "A",
    note: "Petrakos et al. (2016): resisted sled loads ≥75% BW significantly improve acceleration-phase force vectors. Superior to free sprints for strength-speed development.",
    defaultWork: 8, unit: "s",
  },
  {
    id: 4, name: "Hill Sprints", category: "Sprinting", focus: "Ground Contact Power",
    default_ratio: 20, evidence: "A",
    note: "Incline enforces ~45° forward lean and high-knee drive, mechanically locking in acceleration posture. Reduces impact stress vs. flat max-velocity work.",
    defaultWork: 8, unit: "s",
  },
  {
    id: 5, name: "Wall Drills", category: "Sprinting", focus: "Acceleration Angles",
    default_ratio: 5, evidence: "B",
    note: "Charlie Francis protocol. Teaches 45° body lean and piston-style leg action under controlled load. Limits use of momentum to isolate drive mechanics.",
    defaultWork: 20, unit: "s",
  },
  {
    id: 6, name: "Resisted Bounds", category: "Sprinting", focus: "Horizontal Displacement",
    default_ratio: 20, evidence: "B",
    note: "Light resistance (5–10% BW) during bounding increases horizontal impulse without disrupting mechanics. Simenz et al.: improved ground-contact propulsion in collegiate sprinters.",
    defaultWork: 10, unit: "s",
  },
  {
    id: 7, name: "Falling Starts", category: "Sprinting", focus: "Forward Lean & Drive Phase",
    default_ratio: 15, evidence: "B",
    note: "Teaches forward center-of-mass shift before first foot contact — essential for 0–10m acceleration. Eliminates upright default posture at start.",
    defaultWork: 5, unit: "s",
  },
  {
    id: 8, name: "Flying 30s", category: "Sprinting", focus: "Maximum Velocity",
    default_ratio: 25, evidence: "A",
    note: "IAAF gold standard for max-velocity development. 30m at near-maximal speed after a 30m build-up. Full CNS recovery required (≥2 min). Key metric for elite sprint benchmarking.",
    defaultWork: 4, unit: "s",
  },
  {
    id: 9, name: "SL Glute Bridges", category: "Sprinting", focus: "Posterior Chain Activation",
    default_ratio: 5, evidence: "A",
    note: "Contreras et al. (2011): gluteus maximus activation ≥60% MVC. Reduces anterior pelvic tilt and hip-flexor dominance — a primary sprint-performance limiter.",
    defaultWork: 15, unit: "s",
  },
  {
    id: 10, name: "Nordic Curls", category: "Sprinting", focus: "Hamstring Injury Prevention",
    default_ratio: 10, evidence: "A",
    note: "Petersen et al. (2011): 51% reduction in hamstring strain incidence (Oslo protocol). Strongest evidence-based intervention for sprint athletes. Non-negotiable for at-risk athletes.",
    defaultWork: 10, unit: "s",
  },
  {
    id: 11, name: "Wicket Runs", category: "Sprinting", focus: "Stride Length & Consistency",
    default_ratio: 15, evidence: "B",
    note: "Wickets set at prescribed stride lengths train consistent ground contact rhythm and step frequency. Core tool in ALTIS coaching curriculum for speed continuity.",
    defaultWork: 6, unit: "s",
  },

  // ─── JUMPING ─────────────────────────────────────────────────────────────────
  {
    id: 12, name: "Depth Jumps", category: "Jumping", focus: "Reactive Strength (RSI)",
    default_ratio: 20, evidence: "A",
    note: "Verkhoshansky's 'shock method.' Drop height 40–75cm optimizes SSC loading. RSI > 1.5 is elite benchmark. Flanagan & Comyns (2008): direct transfer to sprint GCT.",
    defaultWork: 6, unit: "reps",
  },
  {
    id: 13, name: "Pogo Jumps", category: "Jumping", focus: "Ankle Stiffness & Tendon Loading",
    default_ratio: 10, evidence: "A",
    note: "Minimal knee/hip displacement isolates ankle spring mechanism. Fouré et al. (2010): 8-week pogo protocol increased Achilles stiffness — a key predictor of sprint economy.",
    defaultWork: 10, unit: "reps",
  },
  {
    id: 14, name: "Box Jumps", category: "Jumping", focus: "Concentric Power",
    default_ratio: 12, evidence: "A",
    note: "Concentric-dominant plyometric. Elevated landing reduces eccentric stress, allowing high-quality reps. Excellent entry point for younger or injury-limited athletes.",
    defaultWork: 5, unit: "reps",
  },
  {
    id: 15, name: "Broad Jumps", category: "Jumping", focus: "Horizontal Power Output",
    default_ratio: 15, evidence: "A",
    note: "Broad jump distance correlates strongly with sprint acceleration (r > 0.85). Used in NFL Combine and IAAF athlete screening. Single best horizontal power diagnostic.",
    defaultWork: 4, unit: "reps",
  },
  {
    id: 16, name: "SL Tuck Jumps", category: "Jumping", focus: "Unilateral Explosive Power",
    default_ratio: 15, evidence: "B",
    note: "Single-leg pattern mirrors sprint push-off. Identifies limb asymmetry (>10% deficit is a performance/injury flag). Limited RCT data but mechanically essential.",
    defaultWork: 4, unit: "reps",
  },
  {
    id: 17, name: "Hurdle Hops", category: "Jumping", focus: "Stretch-Shortening Cycle",
    default_ratio: 20, evidence: "A",
    note: "Sequential SSC loading mimics sprint stride pattern. Target ground contact < 200ms. Well-documented in NSCA plyometric guidelines for track athletes.",
    defaultWork: 8, unit: "reps",
  },
  {
    id: 18, name: "Lateral Bounds", category: "Jumping", focus: "Frontal Plane Power",
    default_ratio: 15, evidence: "B",
    note: "Trains adductor/abductor loading and unilateral landing stabilization. Distance and balance control both required for full performance credit.",
    defaultWork: 6, unit: "reps",
  },
  {
    id: 19, name: "Split Squat Jumps", category: "Jumping", focus: "Triple Extension & Symmetry",
    default_ratio: 15, evidence: "B",
    note: "Combines triple extension with lunge mechanics. Addresses hip-flexor tightness common in high-mileage track athletes. Controlled eccentric phase is critical.",
    defaultWork: 5, unit: "reps",
  },
  {
    id: 20, name: "Stiff-Leg Bounding", category: "Jumping", focus: "Tendon Stiffness",
    default_ratio: 18, evidence: "B",
    note: "Minimizes knee flexion to isolate elastic energy storage in the Achilles-calf complex. Bridges pogo jumps and full bounding for tendon adaptation progressions.",
    defaultWork: 6, unit: "reps",
  },

  // ─── THROWING / POWER ────────────────────────────────────────────────────────
  {
    id: 21, name: "Hang Cleans", category: "Throwing", focus: "Total Body Explosive Power",
    default_ratio: 15, evidence: "A",
    note: "Peak power output 4,000–5,000W in trained athletes. Stone et al. (2003): superior to squat jump for rate-of-force development. NSCA #1 power exercise recommendation.",
    defaultWork: 4, unit: "reps",
  },
  {
    id: 22, name: "Snatch High Pulls", category: "Throwing", focus: "Triple Extension Velocity",
    default_ratio: 15, evidence: "A",
    note: "Teaches violent hip extension with upward force transfer. Removes catch phase — accessible for non-Olympic lifters while retaining triple-extension stimulus.",
    defaultWork: 4, unit: "reps",
  },
  {
    id: 23, name: "Med Ball OH Throw", category: "Throwing", focus: "Posterior Chain Release",
    default_ratio: 10, evidence: "A",
    note: "Hip hinge → extension → shoulder release mirrors sprint push-off vector. McBride et al.: reactive throw variant adds SSC stimulus to ballistic output.",
    defaultWork: 5, unit: "reps",
  },
  {
    id: 24, name: "Med Ball Rot. Slam", category: "Throwing", focus: "Rotational Torque",
    default_ratio: 10, evidence: "B",
    note: "Trains transverse-plane power — chronically undertrained in linear sprint athletes. Oblique and lat activation > 80% MVC in surface EMG studies.",
    defaultWork: 6, unit: "reps",
  },
  {
    id: 25, name: "Trap Bar Deadlift", category: "Throwing", focus: "Maximal Force Production",
    default_ratio: 15, evidence: "A",
    note: "Neutral spine reduces lumbar shear vs. straight bar. Swinton et al. (2011): higher peak power and force output at equivalent loads. Primary max-strength exercise for track athletes.",
    defaultWork: 3, unit: "reps",
  },
  {
    id: 26, name: "Push Press", category: "Throwing", focus: "Power Transfer: Lower → Upper",
    default_ratio: 10, evidence: "A",
    note: "Leg drive initiates lift and forces power through the kinetic chain. NSCA-endorsed for athletes requiring overhead force expression. Develops elastic triple extension.",
    defaultWork: 4, unit: "reps",
  },
  {
    id: 27, name: "Landmine Rotations", category: "Throwing", focus: "Transverse Stability",
    default_ratio: 8, evidence: "B",
    note: "Controlled rotational loading with fixed arc path. Trains anti-rotation strength and thoracic mobility simultaneously. Low injury risk, high coaching signal.",
    defaultWork: 8, unit: "reps",
  },
  {
    id: 28, name: "Kettlebell Swings", category: "Throwing", focus: "Hip Hinge Power",
    default_ratio: 8, evidence: "A",
    note: "Lake & Lauder (2012): 8-week swing protocol improved vertical jump height significantly. Gluteal activation > 60% MVC. High-rep capability builds power-endurance continuum.",
    defaultWork: 10, unit: "reps",
  },

  // ─── STABILITY ────────────────────────────────────────────────────────────────
  {
    id: 29, name: "Deadbugs", category: "Stability", focus: "Anti-Extension Core",
    default_ratio: 2, evidence: "A",
    note: "McGill Big 3 foundation. Maintains lumbar neutral while limbs create extension load. Activates deep stabilizers (multifidus, TA) without spinal compression. Safe for all levels.",
    defaultWork: 30, unit: "s",
  },
  {
    id: 30, name: "Pallof Press", category: "Stability", focus: "Anti-Rotation Strength",
    default_ratio: 2, evidence: "A",
    note: "Quantifies and trains rotational stiffness. Transfers directly to sprint mechanics — pelvis must resist rotation during single-leg stance. Cable or band resistance both valid.",
    defaultWork: 30, unit: "s",
  },
  {
    id: 31, name: "Weighted Plank", category: "Stability", focus: "Core Bracing Under Load",
    default_ratio: 2, evidence: "A",
    note: "McGill (2010): plank > sit-up for lumbar spine health. Adding load (10–25% BW plate) extends time-under-tension without increasing spinal compression loads.",
    defaultWork: 30, unit: "s",
  },
  {
    id: 32, name: "Farmer's Carry", category: "Stability", focus: "Upright Posture & Grip",
    default_ratio: 5, evidence: "A",
    note: "Full-body stability challenge. Anti-lateral-flexion demand increases with load. Heavy carries (>50% BW/hand) exceed 90% MVC of core stabilizers. Functional carryover to throws and sprints.",
    defaultWork: 20, unit: "s",
  },
  {
    id: 33, name: "Copenhagen Plank", category: "Stability", focus: "Adductor/Groin Strength",
    default_ratio: 5, evidence: "A",
    note: "Harøy et al. (2019): 41% reduction in groin injury with 8-week Copenhagen program. Strongest evidence-based groin exercise for athletes. Progress from short to long lever.",
    defaultWork: 20, unit: "s",
  },
  {
    id: 34, name: "Single-Leg RDL", category: "Stability", focus: "Hip Hinge Stability",
    default_ratio: 3, evidence: "A",
    note: "Isolates the posterior chain in single-leg stance — the dominant phase of every sprint stride. Identifies hamstring-dominant vs. glute-dominant patterns and addresses asymmetry.",
    defaultWork: 6, unit: "reps",
  },
];

export const NUTRITION_LIBRARY = [
  {
    name: "Whey/Casein Isolate", benefit: "Muscle Protein Synthesis", timing: "Post-Workout",
    note: "Morton et al. (2018): 20–40g post-exercise maximizes MPS. Whey peaks fast; casein provides sustained delivery. Both superior to plant protein for leucine content.",
    evidence: "A",
  },
  {
    name: "Creatine Monohydrate", benefit: "ATP Resynthesis", timing: "Daily",
    note: "Most researched sports supplement. Lanhers et al. (2017) meta-analysis: consistent improvement in sprint, jump, and power output. 3–5g/day. No loading phase required.",
    evidence: "A",
  },
  {
    name: "Tart Cherry Juice", benefit: "Inflammation & Recovery", timing: "Evening/Post",
    note: "Howatson et al. (2010): 8oz twice daily reduced muscle damage markers and accelerated recovery between training sessions in track athletes. Anthocyanin-mediated effect.",
    evidence: "A",
  },
  {
    name: "Steel-Cut Oats", benefit: "Sustained Glycogen", timing: "Pre-Workout",
    note: "Low-GI complex carbohydrate for stable glucose delivery. Avoids insulin spike before training. 60–90g dry weight provides ~3–4 hours of sustained energy.",
    evidence: "A",
  },
  {
    name: "Beetroot Juice", benefit: "Nitric Oxide / Bloodflow", timing: "Pre-Workout (2–3h)",
    note: "Jones et al. (2010): dietary nitrate reduces oxygen cost of exercise. Larsen et al.: improved mitochondrial efficiency at submaximal intensities. 500ml standardized dose.",
    evidence: "A",
  },
  {
    name: "Wild Salmon", benefit: "Omega-3 / Neuro-Recovery", timing: "Dinner",
    note: "Smith et al. (2011): omega-3 supplementation increased MPS rate and reduced muscle soreness. DHA supports neurological recovery. 2–3 servings/week target.",
    evidence: "A",
  },
  {
    name: "Sweet Potatoes", benefit: "Potassium / Electrolyte Balance", timing: "Any",
    note: "High potassium (694mg/cup) supports neuromuscular function. Paired with sodium replenishment post-session, helps restore osmotic balance after heavy sweat loss.",
    evidence: "B",
  },
  {
    name: "Greek Yogurt", benefit: "Casein Protein / Probiotics", timing: "Breakfast / Night",
    note: "Slow-digesting casein protein maintains positive nitrogen balance overnight. Probiotic cultures improve gut absorption of training nutrients. ~17g protein per 170g serving.",
    evidence: "A",
  },
  {
    name: "Blueberries", benefit: "Oxidative Stress Reduction", timing: "Any",
    note: "McLeay et al. (2012): blueberry supplementation accelerated recovery after eccentric exercise. High anthocyanin content neutralizes exercise-induced ROS without blunting adaptation.",
    evidence: "A",
  },
  {
    name: "Quinoa", benefit: "Complete Amino Acid Profile", timing: "Dinner",
    note: "One of few plant-complete proteins (all 9 EAAs). Useful for athletes restricting animal protein. Higher leucine content than most grains. Also provides slow-release carbohydrate.",
    evidence: "B",
  },
  {
    name: "Spinach / Kale", benefit: "Nitrates / Oxygen Transport", timing: "Daily",
    note: "Dietary nitrate from leafy greens mirrors beetroot juice mechanism. Murphy et al.: 6 days of spinach increased muscle efficiency. Also provides iron, folate, and magnesium.",
    evidence: "A",
  },
  {
    name: "Lean Beef / Chicken", benefit: "Heme-Iron & B12", timing: "Dinner",
    note: "Heme-iron (most bioavailable form) critical for haemoglobin synthesis and VO2 delivery to muscles. B12 supports red blood cell production and neurological function.",
    evidence: "A",
  },
  {
    name: "Bananas", benefit: "Rapid Glucose & Potassium", timing: "Mid-Session",
    note: "Appleton & Barber (2012): banana equivalent to carbohydrate gel for performance maintenance during exercise. Potassium content aids cramp prevention during training.",
    evidence: "A",
  },
  {
    name: "Pasteurized Eggs", benefit: "Bioavailable Whole Protein", timing: "Breakfast",
    note: "Bioavailability: ~91% cooked vs 51% raw. Contains leucine, choline (neurological function), and lutein. 6 eggs provide ~40g high-quality protein for morning MPS stimulus.",
    evidence: "A",
  },
  {
    name: "Coconut Water", benefit: "Electrolyte Replenishment", timing: "During Workout",
    note: "Natural source of potassium, magnesium, and sodium. Comparable to commercial sports drinks for rehydration at moderate intensity. Lower added sugar than most alternatives.",
    evidence: "B",
  },
];

// Workout structure: 2 Sprinting, 2 Jumping, 1 Throwing, 1 Stability
export const WORKOUT_STRUCTURE = { Sprinting: 2, Jumping: 2, Throwing: 1, Stability: 1 };
