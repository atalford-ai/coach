// Track Matrix Exercise Library
// 3 tabs × 5 specs × 15 exercises = 225 total

const ex = (id, name, sets, reps, unit, rest, weight, cue) => ({
  id, name, sets, reps, repsUnit: unit, rest, weight: weight || null, cue,
});

// ─── RUN ──────────────────────────────────────────────────────────────────────

const RUN_SPRINT = [
  ex('rs01', '30m Fly Sprint',         5, 1, '×30m',  120, null,    'Full relaxation through fly zone — jaw loose, hands soft'),
  ex('rs02', '60m Acceleration Run',   5, 1, '×60m',  150, null,    'Drive phase for 30m, transition, then upright at 60m'),
  ex('rs03', '100m Time Trial',        3, 1, '×100m', 300, null,    'Race simulation — full effort, track all splits'),
  ex('rs04', '150m Speed Endurance',   4, 1, '×150m', 360, null,    'Build through 100m, maintain form to finish'),
  ex('rs05', '200m Race Pace',         4, 1, '×200m', 360, null,    'Hold race pace through the curve and drive the straight'),
  ex('rs06', 'Block Start 30m',        6, 1, '×30m',   90, null,    '45° lean maintained until 20m — do not pop up early'),
  ex('rs07', 'Flying 40m',             5, 1, '×40m',  120, null,    'Rolling start, hit top speed before timing zone'),
  ex('rs08', 'Speed Endurance 300m',   3, 1, '×300m', 420, null,    'Max for 250m, maintain form through the final 50m'),
  ex('rs09', 'Hollow Sprint 80m',      4, 1, '×80m',  180, null,    'Controlled 40m then full release second 40m'),
  ex('rs10', 'Rolling 20m',            6, 1, '×20m',   90, null,    'Max effort over the short zone — ground contact quality'),
  ex('rs11', '60m Reaction Start',     5, 1, '×60m',  120, null,    'React to auditory cue — 0-10m is the drill'),
  ex('rs12', 'Progressive 100m',       5, 1, '×100m', 180, null,    '50% → 70% → 90% effort building over the rep'),
  ex('rs13', '80m Max Effort',         4, 1, '×80m',  150, null,    'No holding back — full expression from the gun'),
  ex('rs14', '120m Build Sprint',      4, 1, '×120m', 240, null,    'Gradual build — race pace from 60m to finish'),
  ex('rs15', 'In/Out 150m',            4, 1, '×150m', 300, null,    'Fast 60m, relax 40m, kick final 50m — teaches deceleration'),
];

const RUN_MID = [
  ex('rm01', '400m Repeat',        5, 1, '×400m', 180, null, 'Target 1-2s faster than race pace — compete with yourself'),
  ex('rm02', '600m Tempo',         4, 1, '×600m', 240, null, 'Controlled effort ~85% — smooth form priority'),
  ex('rm03', '800m Race Pace',     3, 1, '×800m', 300, null, 'Full simulation — run even splits, negative split goal'),
  ex('rm04', '1000m Threshold',    3, 1, '×1km',  360, null, 'Lactate threshold effort — conversational but challenging'),
  ex('rm05', '200m Speed Reps',    8, 1, '×200m', 120, null, '3-4s faster than 800m race pace — speed top-up'),
  ex('rm06', '300m Build',         5, 1, '×300m', 180, null, 'First 150m controlled, second 150m at full pace'),
  ex('rm07', '500m Threshold',     4, 1, '×500m', 240, null, 'Aerobic power zone — hold threshold pace throughout'),
  ex('rm08', '150m Speed Reps',    8, 1, '×150m', 120, null, 'Leg speed work — maintain 200m race pace mechanics'),
  ex('rm09', '3×1000m at 95%',     3, 1, '×1km',  240, null, 'Near max — race-day pressure simulation'),
  ex('rm10', 'Fartlek 6×2min',     6, 2, 'min',    90, null, 'Alternate hard/easy 2min blocks — feel based intensity'),
  ex('rm11', '600m+400m+200m',     3, 1, '×set',  180, null, 'Descending ladder — pace quickens as distance drops'),
  ex('rm12', 'Pace Run 12min',     1, 12,'min',     60, null, 'Continuous at goal 800m pace — aerobic base maintenance'),
  ex('rm13', '4×800m',             4, 1, '×800m', 240, null, 'Slightly slower than race pace — accumulate quality volume'),
  ex('rm14', '8×200m',             8, 1, '×200m', 120, null, 'Controlled speed — race pace with full mechanical focus'),
  ex('rm15', '400m + 200m Combo',  4, 1, '×set',  180, null, '400m at race pace, 60s jog, 200m at 95% — teaches surge'),
];

const RUN_HURDLES = [
  ex('rh01', '3-Step Hurdle Drill',      4,  6, 'reps',  90, null, 'Consistent 3-step rhythm — trail leg snaps through flat'),
  ex('rh02', 'Lead Leg Drill (trail)',    3, 10, 'reps',  60, null, 'Isolate lead leg punch — knee drives to chest, toe up'),
  ex('rh03', 'Trail Leg Drill',          3, 10, 'reps',  60, null, 'Hip external rotation on clearance — land under CoM'),
  ex('rh04', '5-Hurdle Sprint',          5,  1, '×5H',  120, null, 'Race intensity — attack the hurdle, do not float'),
  ex('rh05', '10-Hurdle Race Pace',      4,  1, '×10H', 240, null, 'Full simulation — count steps, consistent touchdown'),
  ex('rh06', 'Hurdle Walkover',          3,  8, 'reps',  60, null, 'Slow deliberate — ingrain correct hip path each rep'),
  ex('rh07', 'Mini Hurdle A-Skip',       4,  1, '×30m',  60, null, 'Mini hurdles spaced at A-Skip stride — active foot strike'),
  ex('rh08', '2-Leg Hurdle Hop',         4,  8, 'reps',  90, null, 'Quick ground contact — no pausing between hurdles'),
  ex('rh09', '3-Hurdle Acceleration',    5,  1, '×3H',  120, null, 'Focus on first 3 strides after start — attack H1'),
  ex('rh10', 'Alternate Leg Hop',        3, 10, 'reps',  60, null, 'Left-right alternating over single hurdle — hip flexor'),
  ex('rh11', 'Quick Sticks 20m',         4,  1, '×20m',  60, null, 'High-cadence mini sticks — foot contacts below hip'),
  ex('rh12', '110mH Time Trial',         3,  1, '×110m',300, null, 'Race-pace run — film for review, count touchdown times'),
  ex('rh13', 'Penultimate Step Drill',   4,  8, 'reps',  90, null, 'Drive the penultimate foot forward — lean into clearance'),
  ex('rh14', 'Float the Hurdle',         4,  6, 'reps',  90, null, 'Minimum clearance height — efficiency over hurdle'),
  ex('rh15', '7-Hurdle Rhythm Run',      4,  1, '×7H',  180, null, 'Consistent steps 1-7 — lock in 3-step pattern from H3'),
];

const RUN_RELAY = [
  ex('rr01', 'Baton Exchange Walk',     3, 10, 'reps',  45, null, 'Slow walkthrough — "up" command timing and hand position'),
  ex('rr02', 'Baton Exchange Jog',      4,  6, 'reps',  60, null, 'Jog pace — receiver watching mark, not the incoming runner'),
  ex('rr03', 'Speed Exchange 30m',      5,  1, '×30m', 120, null, 'Full speed — incoming runner triggers receiver at mark'),
  ex('rr04', 'Speed Exchange 60m',      4,  1, '×60m', 150, null, 'Full zone — baton must transfer before 20m mark'),
  ex('rr05', 'Zone Entry Drill',        4,  8, 'reps',  90, null, 'Receiver accelerates out of zone — no early look back'),
  ex('rr06', '4×100m Practice',         3,  1, '×full',240, null, 'Full relay order — time full exchange to exchange'),
  ex('rr07', '4×400m Practice',         2,  1, '×full',360, null, 'Outdoor exchange zones — stagger practice is essential'),
  ex('rr08', 'Acceleration Zone Drill', 5,  1, '×30m', 120, null, 'Receiver runs at 80% — practice consistent go-mark'),
  ex('rr09', 'Visual Exchange Drill',   4,  6, 'reps',  90, null, 'Receiver watches baton until received — safer exchange'),
  ex('rr10', 'Sprint Curve Baton',      4,  1, '×60m', 120, null, 'Practice on a curve — inside hand right-to-left transfer'),
  ex('rr11', 'Non-Visual Exchange',     3,  8, 'reps',  90, null, 'Eyes forward, reach back on command — blind pass only'),
  ex('rr12', 'Full Relay Simulation',   2,  1, '×full',360, null, 'Race conditions — all four legs, time everything'),
  ex('rr13', 'Fade Zone Drill',         4,  6, 'reps',  90, null, 'Outgoing runner doesn\'t fade speed — run through zone'),
  ex('rr14', 'Flying Exchange 20m',     6,  1, '×20m',  90, null, 'Short burst — precision over the critical 4m window'),
  ex('rr15', 'Team 4×200m',             2,  1, '×full',300, null, 'Speed endurance relay — each leg at 95%, no coasting'),
];

// ─── WEIGHTS ──────────────────────────────────────────────────────────────────

const WGT_OLYMPIC = [
  ex('wo01', 'Power Clean',             5, 3, 'reps', 120, '75–85% 1RM',  'Triple extension — hips, knees, ankles in sequence'),
  ex('wo02', 'Hang Clean',              4, 4, 'reps', 120, '70–80% 1RM',  'Start from hip crease — violent hip drive upward'),
  ex('wo03', 'Power Snatch',            4, 3, 'reps', 120, '70–80% 1RM',  'Wide grip — receive bar with arms fully locked'),
  ex('wo04', 'Hang Snatch',             4, 4, 'reps', 120, '65–75% 1RM',  'Pull bar close to body — elbows lead the turn'),
  ex('wo05', 'Clean Pull',              4, 4, 'reps', 120, '90–100% Clean', 'No catch — drive through the floor, shrug hard at top'),
  ex('wo06', 'Snatch Pull',             4, 3, 'reps', 120, '85–95% Snatch','Full extension — bar should float at naval level'),
  ex('wo07', 'Push Press',              4, 5, 'reps',  90, '70–80% 1RM',  'Leg drive initiates — press finishes with full lockout'),
  ex('wo08', 'Push Jerk',               4, 3, 'reps', 120, '75–85% 1RM',  'Receive with slight knee bend — lock overhead then stand'),
  ex('wo09', 'Hang Power Clean',        5, 4, 'reps', 120, '70% 1RM',     'Catch above parallel — teaches fast elbows'),
  ex('wo10', 'Clean Complex (2+2)',     3, 4, 'reps', 180, '70% 1RM',     '2 hang cleans + 2 front squats — maintain tension'),
  ex('wo11', 'High Pull',               4, 5, 'reps',  90, '65% 1RM',     'Bar to clavicle — elbows flare wide at top'),
  ex('wo12', 'Snatch Balance',          4, 3, 'reps', 120, '60–70% 1RM',  'Drop under the bar — overhead stability is the goal'),
  ex('wo13', '1-Arm DB Snatch',         3, 6, 'reps',  90, 'moderate',    'Hip hinge to explosive pull — lat stays tight throughout'),
  ex('wo14', 'Clean + Front Squat',     4, 2, 'reps', 150, '70% Clean',   'Full clean then 2 front squats — lower body strength cap'),
  ex('wo15', 'Hang Clean + Push Jerk',  4, 2, 'reps', 150, '65% 1RM',    'Power then overhead expression — full chain complex'),
];

const WGT_STRENGTH = [
  ex('ws01', 'Back Squat',              5, 5, 'reps', 180, '80–85% 1RM', 'Brace hard, break at hips and knees together'),
  ex('ws02', 'Front Squat',             4, 4, 'reps', 150, '75–80% 1RM', 'Elbows high — upper back extension is the cue'),
  ex('ws03', 'Trap Bar Deadlift',       4, 4, 'reps', 180, '80% 1RM',    'Neutral spine, push the floor away — hinge not squat'),
  ex('ws04', 'Romanian Deadlift',       4, 6, 'reps', 120, '65–75% 1RM', 'Hip hinge to below knee — feel the hamstring load'),
  ex('ws05', 'Bulgarian Split Squat',   4, 5, 'reps',  90, '60–70% 1RM', 'Rear foot elevated — front knee tracks over mid-foot'),
  ex('ws06', 'Hip Thrust',              4, 8, 'reps',  90, '70–80% 1RM', 'Drive through heels — squeeze glutes at lockout'),
  ex('ws07', 'Nordic Curl',             4, 6, 'reps',  90, 'BW + band',  'Lower slowly (3-4s) — use band assist only if needed'),
  ex('ws08', 'GHD Raise',               3, 8, 'reps',  90, 'BW',         'Hip extension only — maintain rigid torso throughout'),
  ex('ws09', 'Pause Squat (3s)',        4, 3, 'reps', 180, '70% Back Sq','Stay in hole — removes stretch reflex, pure strength'),
  ex('ws10', 'Sumo Deadlift',           4, 4, 'reps', 180, '80% 1RM',    'Wide stance, toes out — lat engagement at start'),
  ex('ws11', 'Rack Pull (below knee)',  4, 4, 'reps', 150, '85–90% 1RM', 'Lock the lats before pulling — no bar drift'),
  ex('ws12', 'Step-Up Weighted',        4, 6, 'reps',  90, 'moderate',   'Full hip extension at top — single leg drive focus'),
  ex('ws13', 'Good Mornings',           3, 8, 'reps',  90, 'light–mod',  'Soft knee bend, hinge deep — stretch then stand'),
  ex('ws14', 'Single-Leg Leg Press',    3, 8, 'reps',  90, 'moderate',   'Addresses asymmetry — identical mechanics both legs'),
  ex('ws15', 'Glute-Ham Raise',         3, 8, 'reps', 120, 'BW',         'Full range hip extension + knee flexion combo'),
];

const WGT_POWER = [
  ex('wp01', 'Jump Squat',              5, 5, 'reps', 120, '30–40% 1RM', 'Explode from bottom — land softly, reset each rep'),
  ex('wp02', 'Trap Bar Jump',           5, 4, 'reps', 120, '30–40% 1RM', 'Counter-movement — maximum vertical intent every rep'),
  ex('wp03', 'Weighted Box Jump',       4, 4, 'reps', 120, '10–20% BW',  'Step down, never jump down — eccentric protection'),
  ex('wp04', 'Speed Squat',             6, 3, 'reps',  90, '50–60% 1RM', 'Intentionally fast concentric — bar speed is the target'),
  ex('wp05', 'Trap Bar Speed Pull',     5, 3, 'reps',  90, '60% 1RM',    'Maximally accelerate the bar — intent equals output'),
  ex('wp06', 'Plyometric Push-Up',      4, 8, 'reps',  90, 'BW',         'Hands leave the floor — body rigid as a plank'),
  ex('wp07', 'KB Swing Heavy',          5, 8, 'reps',  90, 'heavy KB',   'Hip hinge drives the swing — arms are passive levers'),
  ex('wp08', 'Med Ball Chest Throw',    4, 6, 'reps',  90, '4–6kg',      'Against wall — catch and throw immediately (SSC)'),
  ex('wp09', 'Med Ball OH Slam',        4, 6, 'reps',  90, '5–8kg',      'Full stretch overhead — violent pull through to ground'),
  ex('wp10', 'Hang Clean',              5, 3, 'reps', 120, '75% 1RM',    'Intent is speed — bar velocity matters more than load'),
  ex('wp11', 'Sled Sprint',             5, 1, '×20m', 120, 'heavy sled', 'Forward lean, full drive, no upright posture'),
  ex('wp12', 'Clean Deadlift',          4, 4, 'reps', 120, '90% Clean',  'Clean grip, clean posture — max force production drill'),
  ex('wp13', 'Jump Squat Complex',      3, 5, 'reps', 150, '20% 1RM',    'Heavy squat then immediate jump — post-activation potentiation'),
  ex('wp14', 'Reverse Med Ball Throw',  4, 5, 'reps',  90, '4kg',        'Hip hinge — explosive posterior chain release overhead'),
  ex('wp15', 'Band-Resisted Broad Jump',4, 4, 'reps', 120, 'light band', 'Band increases horizontal force demand — max distance'),
];

const WGT_SPEED_STRENGTH = [
  ex('wss01', 'Complex: Squat + Broad Jump',   4, 4, 'reps', 180, '75% 1RM',   '3 heavy squats then 3 immediate broad jumps — PAP'),
  ex('wss02', 'Complex: Hang Clean + Sprint',  4, 1, '×set',  180, '75% 1RM',  '3 cleans then instant 30m sprint — full chain potentiation'),
  ex('wss03', 'Contrast: Deadlift + Hurdle',   4, 4, 'reps', 180, '80% 1RM',   '3 deadlifts then 5 hurdle hops — contrast method'),
  ex('wss04', 'Heavy Back Squat',               4, 3, 'reps', 180, '85–90% 1RM','Max strength anchor for contrast sets'),
  ex('wss05', 'Power Clean (heavy)',            5, 2, 'reps', 150, '85% 1RM',   'Two heavy singles — neural drive at near max'),
  ex('wss06', 'Drop + Squat Jump',              4, 4, 'reps', 120, 'BW',        'Drop from box, land, instantly jump — reactive strength'),
  ex('wss07', 'Sled Push Heavy 10m',            5, 1, '×10m', 120, 'heavy sled','Max acceleration intent — hip drive to lockout'),
  ex('wss08', 'Band Sprint 30m',                6, 1, '×30m',  90, 'resist band','Band provides overspeed/overload at release — powerful'),
  ex('wss09', 'Hip Thrust Iso + Jump',          4, 3, 'reps', 120, 'heavy',     '5s iso hold at top, release, vertical jump — potentiation'),
  ex('wss10', 'Nordic + Sprint',                4, 1, '×set',  120, 'BW',       '5 nordics then 20m sprint — posterior chain potentiation'),
  ex('wss11', 'Heavy Split Squat + Bound',      4, 4, 'reps', 120, 'heavy',     '4 split squats each leg then 4 lateral bounds — contrast'),
  ex('wss12', 'Drop Jump → Sprint',             5, 3, 'reps', 150, 'BW',        'Drop box, triple contact landing, then 30m sprint'),
  ex('wss13', 'Pause Clean Pull',               4, 4, 'reps', 120, '85% 1RM',  '3s pause at the knee — eliminate the bar loop'),
  ex('wss14', 'Clean + Box Jump Complex',       4, 1, '×set',  150, '70% 1RM', '2 power cleans then 3 box jumps — immediate transition'),
  ex('wss15', 'Trap Bar Jump + Sprint',         4, 1, '×set',  150, '30% 1RM', '5 trap bar jumps then 30m fly sprint — elite PAP protocol'),
];

const WGT_HYPERTROPHY = [
  ex('wh01', 'Back Squat',              4, 10, 'reps',  90, '65–70% 1RM', 'Controlled eccentric (3s) — time under tension focus'),
  ex('wh02', 'Romanian Deadlift',       4, 12, 'reps',  75, '60% 1RM',    'Feel every inch of hamstring load — slow and deliberate'),
  ex('wh03', 'Leg Press',               4, 12, 'reps',  75, 'moderate',   'Full range — no locking out at top'),
  ex('wh04', 'Leg Curl (machine)',       4, 12, 'reps',  60, 'moderate',   'Full contraction at top — squeeze the hamstring'),
  ex('wh05', 'Hip Thrust',              4, 12, 'reps',  75, '65% 1RM',    'Glute isolation — pause and squeeze for 1s at top'),
  ex('wh06', 'Walking Lunge',           4, 12, 'reps',  75, 'moderate',   'Step through heel — tall posture throughout'),
  ex('wh07', 'DB Split Squat',          4, 10, 'reps',  75, 'moderate',   'Control the descent — 2s down, explosive up'),
  ex('wh08', 'Leg Extension',           3, 15, 'reps',  60, 'moderate',   'Full ROM quad isolation — light enough for full extension'),
  ex('wh09', 'Calf Raise (weighted)',   4, 15, 'reps',  60, 'moderate',   'Full plantarflexion — pause and lower 3s'),
  ex('wh10', 'Glute Kickback Cable',    3, 15, 'reps',  60, 'light',      'Posterior pelvic tilt — isolate glute from hip flexor'),
  ex('wh11', 'KB Goblet Squat',         4, 12, 'reps',  75, 'moderate',   'Elbows inside knees — upright torso, depth priority'),
  ex('wh12', 'Nordic Curl (band)',      4,  8, 'reps',  90, 'BW + band',  'Band assist for full reps — eccentric phase is the load'),
  ex('wh13', 'GHD Sit-Up',             3, 15, 'reps',  60, 'BW',         'Full range — controlled back extension, explosive up'),
  ex('wh14', 'Copenhagen Plank',        3,  1, '×25s',  60, 'BW',         'Top foot supported — adductor side full effort'),
  ex('wh15', 'Step-Up (high box)',      4, 10, 'reps',  75, 'moderate',   'Hip extension at top is the rep — step up completely'),
];

// ─── CALISTHENICS ─────────────────────────────────────────────────────────────

const CAL_PLYO = [
  ex('cp01', 'Box Jump',               4,  6, 'reps',  90, 'BW',   'Soft landing — absorb through ankle, knee, hip'),
  ex('cp02', 'Depth Jump',             4,  5, 'reps', 120, 'BW',   'Minimal ground contact time — react off the floor'),
  ex('cp03', 'Pogo Jumps',             4, 15, 'reps',  60, 'BW',   'Ankle stiffness only — no knee bend, rapid rebound'),
  ex('cp04', 'Broad Jump',             4,  5, 'reps',  90, 'BW',   'Arm swing syncs with jump — land flat-footed, balanced'),
  ex('cp05', 'Hurdle Hops (2-leg)',    4,  8, 'reps',  90, 'BW',   'Quick toes — clear each hurdle with no pause between'),
  ex('cp06', 'Tuck Jump',              4,  6, 'reps',  90, 'BW',   'Knees to chest each rep — full hip flexion target'),
  ex('cp07', 'SL Broad Jump',          4,  4, 'reps',  90, 'BW',   'Push through the heel — land balanced on same leg'),
  ex('cp08', 'Lateral Bound',          4,  6, 'reps',  90, 'BW',   'Stick the landing 1s — single-leg absorption test'),
  ex('cp09', 'Depth Drop',             4,  5, 'reps', 120, 'BW',   'No jump — perfect landing mechanics only'),
  ex('cp10', 'Power Skip',             4,  1, '×30m',  90, 'BW',   'Drive the knee — gain maximum height each stride'),
  ex('cp11', 'Bounding',               4,  1, '×30m', 120, 'BW',   'Maximize time in air — triple extension each push'),
  ex('cp12', 'Split Jump',             4,  8, 'reps',  90, 'BW',   'Switch legs mid-air — land in opposite lunge'),
  ex('cp13', 'Stiff-Leg Bound',        4,  1, '×20m',  90, 'BW',   'No knee flexion — Achilles and calf do all the work'),
  ex('cp14', 'Reactive Step Jump',     4,  6, 'reps',  90, 'BW',   'Step off box, touch, jump — react within 150ms'),
  ex('cp15', 'Ankle Pop Jump',         4, 12, 'reps',  60, 'BW',   'Minimal knee bend — forefoot only, rapid cadence'),
];

const CAL_CORE = [
  ex('cc01', 'Deadbug',                3, 10, 'reps',  45, 'BW',   'Low back stays flat — opposite arm/leg control'),
  ex('cc02', 'Pallof Press',           3, 12, 'reps',  45, 'band', 'Resist rotation — core is the engine, arms are levers'),
  ex('cc03', 'Hollow Hold',            3,  1, '×30s',  45, 'BW',   'Lower back pressed to floor — arms and legs low'),
  ex('cc04', 'Copenhagen Plank',       3,  1, '×20s',  60, 'BW',   'Adductor strength — no hip drop through entire set'),
  ex('cc05', 'Ab Wheel Rollout',       3, 10, 'reps',  60, 'BW',   'Don\'t let the hips drop — tight glutes and abs'),
  ex('cc06', 'Dragon Flag',            3,  6, 'reps',  90, 'BW',   'Rigid body — lower as a plank, raise as a plank'),
  ex('cc07', 'Weighted Plank',         3,  1, '×45s',  60, '10kg', 'Neutral spine — don\'t let pelvis drop or pike'),
  ex('cc08', 'Hanging L-Sit',          3,  1, '×20s',  60, 'BW',   'Legs parallel to floor — compress through the hip'),
  ex('cc09', 'Side Plank + Hip Dip',   3, 10, 'reps',  45, 'BW',   'Full range dip — control every inch of motion'),
  ex('cc10', 'V-Up',                   3, 12, 'reps',  45, 'BW',   'Simultaneous arms and legs — meet at the top'),
  ex('cc11', 'Single-Leg RDL',         3,  8, 'reps',  60, 'BW',   'Hinge to parallel — standing leg stays soft'),
  ex('cc12', 'Lateral Band Walk',      3, 15, 'reps',  30, 'band', 'Keep tension in the band — don\'t let knees cave'),
  ex('cc13', 'Farmer\'s Carry',        3,  1, '×30m',  60, 'mod',  'Tall posture, slow controlled steps, grip hard'),
  ex('cc14', 'Arch Hold',              3,  1, '×30s',  45, 'BW',   'Face down — lift arms, chest, legs simultaneously'),
  ex('cc15', 'Hip 90/90 External Rot', 3, 10, 'reps',  30, 'BW',   'Seated — rotate front shin parallel to the wall'),
];

const CAL_SPRINT_DRILLS = [
  ex('cd01', 'A-Skip',                 4,  1, '×20m',  60, 'BW',   'Dorsiflexed foot — pawback contact below hip'),
  ex('cd02', 'B-Skip',                 4,  1, '×20m',  60, 'BW',   'Full extension before pawback — hamstring loads'),
  ex('cd03', 'Wall Drill 2-Count',     4, 15, 'reps',  45, 'BW',   '45° lean — high knee held for 2 counts'),
  ex('cd04', 'Wall Drill 4-Count',     4, 10, 'reps',  45, 'BW',   'Alternate legs with hold — postural awareness'),
  ex('cd05', 'Ankling Drill',          4,  1, '×20m',  60, 'BW',   'Tiny ground contact — ankle cycles under the hip'),
  ex('cd06', 'High Knees',             4,  1, '×20m',  45, 'BW',   'Hip height — maintain tall spine, not a forward lean'),
  ex('cd07', 'Butt Kicks',             4,  1, '×20m',  45, 'BW',   'Hamstring curl action — not kicking back with the foot'),
  ex('cd08', 'Wicket Runs',            4,  1, '×30m',  90, 'BW',   'Wickets set for your stride — consistent contact pattern'),
  ex('cd09', 'Falling Start',          5,  1, '×20m',  90, 'BW',   'Lean to 45° before first foot strike — commit to the fall'),
  ex('cd10', 'Resisted A-Skip',        4,  1, '×20m',  60, 'band', 'Band adds horizontal load — same mechanics as unresisted'),
  ex('cd11', 'Straight-Leg Bound',     4,  1, '×20m',  90, 'BW',   'Stiff legs — Achilles spring with each ground contact'),
  ex('cd12', 'Pawback Drill',          4, 10, 'reps',  45, 'BW',   'Stand still — simulate the claw-back under your hip'),
  ex('cd13', 'Running A',              4,  1, '×30m',  90, 'BW',   'A-Skip at running speed — full commitment per step'),
  ex('cd14', '3-Point Start',          5,  1, '×30m',  90, 'BW',   'Head down through 15m — drive position, not race'),
  ex('cd15', 'Fly-In Sprint Drill',    4,  1, '×20m',  90, 'BW',   'Build 20m, sprint the target zone — max velocity feel'),
];

const CAL_CONDITIONING = [
  ex('con01', 'Burpee',                4, 10, 'reps',  60, 'BW',   'Chest to floor — explosive jump at the top'),
  ex('con02', 'Jump Rope Speed',       5,  1, '×30s',  45, 'BW',   'Forefoot only — wrist rotation, not arm circles'),
  ex('con03', 'Bear Crawl',            4,  1, '×20m',  45, 'BW',   'Hips level — slow and deliberate, no side to side'),
  ex('con04', 'Squat Jump',            5, 10, 'reps',  60, 'BW',   'Squat deep, explode — land softly and reload'),
  ex('con05', 'Mountain Climbers',     4,  1, '×30s',  45, 'BW',   'Hips stay level — drive the knee to chest alternating'),
  ex('con06', 'Push-Up to Row',        3, 10, 'reps',  45, 'band', 'Stable hips — row elbow tight to body after push'),
  ex('con07', 'Box Step-Up',           4, 10, 'reps',  45, 'BW',   'Full hip extension at top — step down controlled'),
  ex('con08', 'Plank Shoulder Tap',    4, 16, 'reps',  45, 'BW',   'No rotation — tap opposite shoulder, hips still'),
  ex('con09', 'Shuttle Run 2×10m',     5,  1, '×set',  90, 'BW',   'Touch the line, don\'t round — deceleration counts'),
  ex('con10', 'Cone Shuffle',          5, 10, 'reps',  60, 'BW',   'Low center — fast feet lateral between cones'),
  ex('con11', 'Med Ball Chest Pass',   4,  8, 'reps',  60, '4–6kg','Against wall — catch and throw immediately (SSC)'),
  ex('con12', 'Sandbag Over Shoulder', 4,  6, 'reps',  90, 'mod',  'Hip hinge to shoulder — rotate and drop, full speed'),
  ex('con13', 'Sled Drag Backward',    4,  1, '×20m',  90, 'mod',  'Step through heel — quad and glute dominant pull'),
  ex('con14', 'Battle Rope Slams',     4,  1, '×20s',  60, 'BW',   'Full overhead to floor — max amplitude each slam'),
  ex('con15', 'Sprint-Burpee Combo',   4,  6, 'reps', 120, 'BW',   'Burpee then instant 20m sprint — simulate game intensity'),
];

const CAL_MOBILITY = [
  ex('mob01', 'Hip 90/90 Flow',        3, 10, 'reps',  30, 'BW',   'Rotate front shin to back shin — controlled transition'),
  ex('mob02', 'World\'s Greatest',     3,  8, 'reps',  30, 'BW',   'Lunge, rotate, reach — 3 planes in one movement'),
  ex('mob03', 'Pigeon Pose Hold',      3,  1, '×45s',  30, 'BW',   'External rotation of hip — relax into the stretch'),
  ex('mob04', 'Ankle Circles (loaded)',3, 15, 'reps',  20, 'BW',   'Full range of motion — slow, deliberate circles'),
  ex('mob05', 'Deep Squat Hold',       3,  1, '×45s',  30, 'BW',   'Heels on floor, spine tall — use doorframe if needed'),
  ex('mob06', 'Leg Swing (frontal)',   3, 12, 'reps',  20, 'BW',   'Stand tall — controlled pendulum, no momentum'),
  ex('mob07', 'Leg Swing (sagittal)',  3, 12, 'reps',  20, 'BW',   'Forward/back — increase range gradually each swing'),
  ex('mob08', 'Couch Stretch',         3,  1, '×40s',  30, 'BW',   'Hip flexor lengthened — posterior pelvic tilt cue'),
  ex('mob09', 'Standing Hamstring',    3,  1, '×40s',  30, 'BW',   'Hinge at hip — don\'t round the spine to reach'),
  ex('mob10', 'Band Hip Distraction',  3,  1, '×40s',  30, 'band', 'Joint distraction — creates space in hip capsule'),
  ex('mob11', 'Thoracic Rotation',     3, 10, 'reps',  20, 'BW',   'Hands behind head — rotate from the upper back'),
  ex('mob12', 'Adductor Rock',         3, 12, 'reps',  20, 'BW',   'Side lunge base — rock side to side slowly'),
  ex('mob13', 'Kneeling Hip Flexor',   3,  1, '×45s',  30, 'BW',   'Back knee down, squeeze glute, posterior tilt'),
  ex('mob14', 'Neck & Shoulder Flow',  3,  8, 'reps',  20, 'BW',   'Slow controlled circles — no end-range force'),
  ex('mob15', 'Foam Roll Quads',       3,  1, '×40s',  20, 'BW',   'Pause on tender spots — 5 deep breaths to release'),
];

// ─── Exports ──────────────────────────────────────────────────────────────────

export const MATRIX_DATA = {
  run: {
    label: 'Run',
    color: '#3b82f6',
    specs: {
      sprint:       { label: 'Sprint',       exercises: RUN_SPRINT  },
      'mid-dist':   { label: 'Mid-Distance', exercises: RUN_MID     },
      hurdles:      { label: 'Hurdles',      exercises: RUN_HURDLES },
      relay:        { label: 'Relay',        exercises: RUN_RELAY   },
    },
  },
  weights: {
    label: 'Weights',
    color: '#f59e0b',
    specs: {
      olympic:       { label: 'Olympic Lifts',  exercises: WGT_OLYMPIC       },
      strength:      { label: 'Strength',       exercises: WGT_STRENGTH      },
      power:         { label: 'Power',          exercises: WGT_POWER         },
      'speed-str':   { label: 'Speed-Strength', exercises: WGT_SPEED_STRENGTH},
      hypertrophy:   { label: 'Hypertrophy',    exercises: WGT_HYPERTROPHY   },
    },
  },
  calisthenics: {
    label: 'Calisthenics',
    color: '#10b981',
    specs: {
      plyometrics:    { label: 'Plyometrics',    exercises: CAL_PLYO          },
      core:           { label: 'Core & Stability',exercises: CAL_CORE         },
      'sprint-drills':{ label: 'Sprint Drills',  exercises: CAL_SPRINT_DRILLS },
      conditioning:   { label: 'Conditioning',   exercises: CAL_CONDITIONING  },
      mobility:       { label: 'Mobility',       exercises: CAL_MOBILITY      },
    },
  },
};
