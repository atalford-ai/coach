// ── Football Plays Database ────────────────────────────────────
// Organized by side of the ball, with position-specific assignments and related drills

export const PLAY_CATEGORIES = [
  { id: 'run',     label: 'Run Game',     side: 'offense' },
  { id: 'pass',    label: 'Pass Game',    side: 'offense' },
  { id: 'rpo',     label: 'RPO / Option', side: 'offense' },
  { id: 'screen',  label: 'Screens',      side: 'offense' },
  { id: 'coverage',label: 'Coverages',    side: 'defense' },
  { id: 'blitz',   label: 'Blitz',        side: 'defense' },
  { id: 'front',   label: 'Fronts',       side: 'defense' },
  { id: 'st',      label: 'Special Teams',side: 'special' },
];

let _id = 0;
const play = (name, category, formation, desc, assignments, drills, level) => ({
  id: `play${++_id}`, name, category, formation, desc, assignments, drills, level,
});

export const FOOTBALL_PLAYS = [

  // ══════════════════════════════════════════════════════════════
  // RUN GAME
  // ══════════════════════════════════════════════════════════════

  play('Inside Zone', 'run', 'Shotgun / Singleback',
    'The bread-and-butter run play at every level. OL zone-blocks playside, RB reads the first down lineman and cuts backside if the frontside is walled off.',
    {
      QB:  'Open to playside, hand off or keep on zone read. Eyes on the read key (backside DE).',
      RB:  'Aiming point: playside A-gap. Press the line, read the first covered OL, one cut and go. No dancing.',
      WR:  'Stalk block your DB. Lock on and sustain — your block springs a 10-yard gain into a 40-yard TD.',
      OL:  'Zone step playside. Covered? Block him. Uncovered? Combo to the next level. Stay hip-to-hip on doubles.',
      TE:  'Seal the playside DE or climb to the Will linebacker. Your block sets the edge.',
    },
    ['Zone Read Footwork', 'Double Team Block', 'Reach Block', 'Ball Security Drill'],
    ['HS','COL','PRO']),

  play('Outside Zone (Stretch)', 'run', 'Shotgun / Pistol',
    'Stretch the defense horizontally. OL reaches playside, RB aims for the edge but reads cutback lanes.',
    {
      QB:  'Open playside, extend the ball to the RB. On zone-read variant, read the backside end.',
      RB:  'Aim for the outside hip of the playside tackle. If the edge is sealed, bang it. If overrun, cut back.',
      WR:  'Crack block on the safety or stalk the corner. Crack blocks spring huge runs.',
      OL:  'Aggressive reach steps. Win the playside shoulder. If you can\'t reach, push the defender past the play.',
      TE:  'Reach the DE or arc release to the secondary. You\'re the edge setter.',
    },
    ['Reach Block', 'Zone Read Footwork', 'Juke / Cut Drill', 'Stiff Arm / Broken Tackle'],
    ['HS','COL','PRO']),

  play('Power', 'run', 'I-Form / Singleback',
    'Gap scheme — the pulling guard leads through the hole. Downhill, physical football.',
    {
      QB:  'Reverse pivot, hand off to the RB. Carry out the boot fake away from the play.',
      RB:  'Patience. Let the guard pull and lead. Follow his block through the B-gap. Run behind your pads.',
      WR:  'Block downfield. Stalk the corner or crack the safety. Effort blocks make TDs.',
      OL:  'Playside down blocks. Backside guard pulls and kicks out the end man on the line. Center-backside guard combo.',
      TE:  'Down block on the DE. Seal him inside — the guard is pulling around you.',
    },
    ['Pull and Trap', 'Double Team Block', 'Goal Line / Short Yardage', 'Sled Work'],
    ['HS','COL','PRO']),

  play('Counter', 'run', 'Shotgun / I-Form',
    'Misdirection run — fake one way, pull two blockers the other. The guard and tackle (or H-back) lead the way.',
    {
      QB:  'Open away from the play, fake the handoff or zone read look, then hand off to the RB cutting back.',
      RB:  'Take one step playside to sell the fake, then cut back hard behind the pulling linemen. Trust the blocks.',
      WR:  'Block your man. If the fake works, the safety bites and your job gets easy.',
      OL:  'Backside guard and tackle pull. Guard kicks out the DE, tackle wraps to the LB. Frontside blocks down.',
      TE:  'Down block. Seal everything inside. The pulling guard is coming around you.',
    },
    ['Pull and Trap', 'Ball Security Drill', 'Vision Drill', 'DL Get-Off Drill'],
    ['HS','COL','PRO']),

  play('Sweep / Jet Sweep', 'run', 'Shotgun Spread',
    'Get the ball to the edge fast. Jet motion WR takes the handoff at full speed and attacks outside.',
    {
      QB:  'Time the snap with the jet motion. Hand off at the mesh point — smooth exchange.',
      RB:  'Lead block through the hole or fake the inside run to freeze the LBs.',
      WR:  'Jet motion: full speed across the formation. Take the handoff in stride, get upfield. Outside WRs: stalk block.',
      OL:  'Reach block playside. Get movement to the edge. Backside: cut off pursuit.',
      TE:  'Seal the edge or arc release to the corner. Speed to the edge.',
    },
    ['Reach Block', 'RAC Drill (Run After Catch)', 'Juke / Cut Drill', 'Ball Handling / Fakes'],
    ['HS','COL','PRO']),

  play('Trap', 'run', 'Under Center / I-Form',
    'Let the DT penetrate, then trap-block him with the pulling guard. Classic misdirection up front.',
    {
      QB:  'Quick handoff to the RB. Sell the fake to the other side after the handoff.',
      RB:  'Downhill. Read the trap block — the DT will be kicked out. Hit the hole hard.',
      WR:  'Stalk block. Hold your man for 3 seconds and the play is over.',
      OL:  'Center and playside guard let the DT go (bait him). Backside guard pulls and traps. Tackles block down.',
      TE:  'Base block the DE or release to the linebacker.',
    },
    ['Pull and Trap', 'DL Get-Off Drill', 'Sled Work', 'Goal Line / Short Yardage'],
    ['HS','COL']),

  play('Quarterback Draw', 'run', 'Shotgun',
    'QB fakes pass, then runs into the void left by pass-rushing defenders. Exploits aggressive rushers.',
    {
      QB:  'Fake the pass — set up like you\'re throwing. When the DL rushes upfield, tuck and run through the A-gap.',
      RB:  'Pass protect initially, then lead block through the hole. Sell the pass protection.',
      WR:  'Run routes like it\'s a pass play. Clear out defenders and block downfield once the QB crosses the LOS.',
      OL:  'Pass set initially, then drive block once the QB starts running. Let the DL rush past you, then wall them off.',
      TE:  'Pass set, then seal. Create a running lane as the DL vacates.',
    },
    ['Scramble Drill', 'Pass Set / Kick Step', 'Ball Security Drill', 'Vision Drill'],
    ['HS','COL','PRO']),

  play('Toss / Pitch Sweep', 'run', 'I-Form / Shotgun',
    'Pitch the ball to the RB wide and let him attack the edge with blockers leading the way.',
    {
      QB:  'Toss the ball to the RB leading him to the sideline. Soft pitch, let him catch it in stride.',
      RB:  'Catch the pitch, get to the edge FAST. Read the blocks — can you turn the corner or cut upfield?',
      WR:  'Stalk block or crack the safety. Your block makes or breaks this play.',
      OL:  'Playside: reach and seal. Backside guard pulls and leads to the edge. Tackle walls off pursuit.',
      TE:  'Arc release and block the force defender (OLB or safety coming downhill).',
    },
    ['Reach Block', 'Juke / Cut Drill', 'Pull and Trap', 'Stiff Arm / Broken Tackle'],
    ['HS','COL']),

  // ══════════════════════════════════════════════════════════════
  // PASS GAME
  // ══════════════════════════════════════════════════════════════

  play('Slant / Quick Slant', 'pass', 'Shotgun Spread',
    'Quick-game staple. WR takes 3 steps and breaks inside at 45 degrees. Beats press and off coverage.',
    {
      QB:  '3-step drop. Throw it before the WR makes his break — anticipation throw. Lead him inside.',
      RB:  'Check-release. Blitz pickup first, then leak to the flat as a checkdown.',
      WR:  '3 steps vertical, sharp 45-degree break inside. Catch and get vertical immediately. Head on a swivel.',
      OL:  'Quick set. Aggressive hands — this is a fast throw, just hold for 1.5 seconds.',
      TE:  'Run a flat or drag route to clear space for the slant. Or chip and release.',
    },
    ['Route Tree Fundamentals', 'Release Drills', 'RAC Drill (Run After Catch)', '3-Step Drop'],
    ['HS','COL','PRO']),

  play('Curl / Hitch', 'pass', 'Shotgun / Pro Set',
    'WR runs 5-8 yards, stops, and turns back to the QB. A timing route that beats zone coverage.',
    {
      QB:  '3-step drop. Throw as the WR is turning. Put it on his front shoulder away from the defender.',
      RB:  'Pass protect or check-release to the flat.',
      WR:  'Sprint 5-8 yards, chop your feet, turn back to the QB. Sit in the soft spot of zone. Adjust to coverage.',
      OL:  'Quick pass set. This is a rhythm throw — hold your blocks.',
      TE:  'Flat route or seam to stretch the defense vertically and clear space underneath.',
    },
    ['Route Tree Fundamentals', 'Comeback Route', '3-Step Drop', 'Release Drills'],
    ['HS','COL','PRO']),

  play('Four Verticals', 'pass', 'Shotgun Spread',
    'Send 4 receivers deep. Stress the safeties — someone will be open. High school to the NFL, this works.',
    {
      QB:  '5-step drop. Read the safeties. 1 high safety? Throw the seam away from him. 2 high? Hit the post.',
      RB:  'Check-release. You\'re the hot route if they bring a 5th rusher.',
      WR:  'Outside WRs: go route, stack on top of the CB. Slot WRs: seam route, split the safeties.',
      OL:  'Big boy protection. This is a deep throw — hold for 3+ seconds. Half-slide to the pressure side.',
      TE:  'Seam route. Split the safeties. If the safety commits to the WR, you\'re the answer.',
    },
    ['Release Drills', 'Contested Catch', '5-Step Drop', 'Pass Set / Kick Step'],
    ['COL','PRO']),

  play('Mesh Concept', 'pass', 'Shotgun / Trips',
    'Two receivers cross underneath at 5-6 yards, creating natural picks in man coverage. Zone beater too.',
    {
      QB:  '3- or 5-step drop. Read the mesh — if man, the crossers will be open off the rub. If zone, find the window.',
      RB:  'Checkdown. Sit in the flat or run a swing. You\'re the safety valve.',
      WR:  'Two inside WRs run crossing routes at 5-6 yards, nearly touching as they cross. Outside WRs: clear out deep.',
      OL:  'Half-slide protection. Quick throw — hold your man.',
      TE:  'Sit route at 10-12 yards behind the mesh. If both crossers are covered, the TE is the answer.',
    },
    ['Route Tree Fundamentals', 'RAC Drill (Run After Catch)', '3-Step Drop', 'Option Route / Sit Route'],
    ['COL','PRO']),

  play('Post Route', 'pass', 'Shotgun / Pro Set',
    'Deep route breaking to the middle of the field. The big-play call against Cover 2 and Cover 3.',
    {
      QB:  '5- or 7-step drop. Let the WR clear the underneath coverage. Throw with arc over the LB, in front of the safety.',
      RB:  'Max protect or checkdown to the flat.',
      WR:  'Vertical stem for 12-15 yards, then break inside at 45 degrees toward the far goalpost. Win on the break.',
      OL:  'Full slide protection. This is a long-developing play — protection is everything.',
      TE:  'Drag or flat route to pull the LB away from the post window.',
    },
    ['Route Tree Fundamentals', 'Contested Catch', '7-Step Drop', 'Pass Set / Kick Step'],
    ['HS','COL','PRO']),

  play('Corner Route', 'pass', 'Trips / Shotgun',
    'Deep out-breaking route to the corner of the end zone or sideline. Beats Cover 3 and man coverage.',
    {
      QB:  '5-step drop. Throw the WR open to the sideline. Back shoulder if the CB is on top. Lead him to the pylon.',
      RB:  'Blitz pickup or swing to the flat.',
      WR:  'Stem vertical to 12-15 yards, break hard to the corner at 45 degrees. Sell the post before breaking.',
      OL:  'Solid pass set. This throw takes time — keep the pocket clean.',
      TE:  'Flat or seam to clear underneath coverage away from the corner route.',
    },
    ['Route Tree Fundamentals', 'Red Zone Fade', '5-Step Drop', 'Contested Catch'],
    ['COL','PRO']),

  play('PA Boot', 'pass', 'Under Center / Pistol',
    'Play-action bootleg — fake the run, roll out, and throw to receivers flooding one side of the field.',
    {
      QB:  'Sell the run fake. Boot away from the run action. Read high-to-low: deep crosser, TE in the flat, scramble.',
      RB:  'Sell the run fake — take the handoff fake and hit the line. Block if someone leaks through.',
      WR:  'Backside WR: deep crosser behind the LBs. Playside WR: clear out deep. This creates a void for the TE.',
      OL:  'Run block playside to sell the fake. Backside tackle must wall off — don\'t let the DE chase the QB.',
      TE:  'Fake the block, release to the flat. You\'re the primary read on the boot if the defense bites on the run.',
    },
    ['Ball Handling / Fakes', 'Rollout Throws', 'Pull and Trap', 'TE Blocking / Release Combo'],
    ['HS','COL','PRO']),

  play('Smash Concept', 'pass', 'Shotgun / Pro Set',
    'High-low read: outside WR runs a hitch at 5, inside WR runs a corner at 12-15. Beats Cover 2 and Cover 4.',
    {
      QB:  '3-step drop, hitch up. Read the corner/flat defender. If he drops, throw the hitch. If he sits, throw the corner.',
      RB:  'Pass protect. Checkdown to the flat opposite the smash side.',
      WR:  'Outside WR: hitch at 5 yards, turn and face the QB. Inside WR: corner route at 12-15 yards behind the dropping corner.',
      OL:  'Pass set. Quick read — hold for 2-3 seconds.',
      TE:  'Opposite side: run a drag or flat to pull coverage away from the smash concept.',
    },
    ['Route Tree Fundamentals', 'Comeback Route', '3-Step Drop', 'Pre-Snap Read Drill'],
    ['COL','PRO']),

  play('Slant-Flat Combo', 'pass', 'Shotgun Spread',
    'Quick-game combination — WR runs a slant, RB or slot runs to the flat. High-low on the flat defender.',
    {
      QB:  '3-step drop. Read the flat defender. If he drops with the flat, throw the slant. If he jumps the slant, hit the flat.',
      RB:  'Release to the flat immediately. Get width and depth — be a target, not a blocker.',
      WR:  'Inside WR: slant at 5 yards. Outside WR: block or run a clear-out go route.',
      OL:  'Quick set. Fast throw — just hold your man for a beat.',
      TE:  'Check-release to the flat on the opposite side or run a seam to occupy the safety.',
    },
    ['Route Tree Fundamentals', 'Release Drills', '3-Step Drop', 'Receiving Out of Backfield'],
    ['HS','COL','PRO']),

  play('Dagger Concept', 'pass', 'Trips / Shotgun',
    'Seam route combined with a deep dig (in) route. Attacks the void behind the LBs in Cover 3.',
    {
      QB:  '5-step drop. Read the middle safety. If he goes with the seam, throw the dig. If he sits, throw the seam.',
      RB:  'Pass protect. Checkdown if both reads are covered.',
      WR:  'Slot: seam route, get vertical and hold the safety. #2 WR: dig route at 15-18 yards behind the LBs.',
      OL:  'Full protection. This is a deeper throw — need 3+ seconds.',
      TE:  'Drag underneath as a safety valve or chip the DE and release.',
    },
    ['Route Tree Fundamentals', '5-Step Drop', 'Pass Set / Kick Step', 'Contested Catch'],
    ['COL','PRO']),

  // ══════════════════════════════════════════════════════════════
  // RPO / OPTION
  // ══════════════════════════════════════════════════════════════

  play('Zone Read', 'rpo', 'Shotgun',
    'The QB reads the backside DE. If the DE crashes on the RB, the QB keeps it. If the DE stays, hand it off.',
    {
      QB:  'Mesh with the RB, eyes on the read key (backside DE). DE crashes = keep. DE stays = give. Make the right read.',
      RB:  'Run inside zone. Press the ball into the mesh point and let the QB decide. Trust the read.',
      WR:  'Block like it\'s a run. Stalk the corner — you don\'t know who has the ball yet.',
      OL:  'Block inside zone. Leave the backside DE unblocked — he\'s the read key. Do NOT block him.',
      TE:  'Seal the playside or climb to LB. Zone blocking rules apply.',
    },
    ['Zone Read Footwork', 'Ball Handling / Fakes', 'Scramble Drill', 'Read and React (Run Fits)'],
    ['HS','COL','PRO']),

  play('RPO Bubble', 'rpo', 'Shotgun Spread',
    'Run-pass option: the OL blocks inside zone, but the QB can pull it and throw a bubble screen if the defense loads the box.',
    {
      QB:  'Pre-snap: count the box. Post-snap: if the LB steps up toward the run, pull and throw the bubble. If he drops, hand off.',
      RB:  'Run inside zone regardless. You don\'t know if the QB is handing off or pulling.',
      WR:  'Slot: bubble screen — catch and get upfield. Outside WR: block the corner for the bubble. This happens fast.',
      OL:  'Block the run. You CANNOT go downfield if the QB throws. Stay behind the line on pass.',
      TE:  'Run block. Seal the DE or climb. Same as inside zone.',
    },
    ['Zone Read Footwork', 'RAC Drill (Run After Catch)', 'Pre-Snap Read Drill', 'Reach Block'],
    ['HS','COL','PRO']),

  play('Speed Option', 'rpo', 'Shotgun / Pistol',
    'QB attacks the edge and pitches to the RB based on the pitch key defender. Old-school option football.',
    {
      QB:  'Attack the outside shoulder of the pitch key. If he commits to you, pitch. If he widens, cut upfield and keep.',
      RB:  'Maintain pitch relationship — 4x4 (4 yards deep, 4 yards outside). Catch the pitch and turn upfield.',
      WR:  'Stalk block. Your defender is the force player if the pitch is made.',
      OL:  'Veer blocking. Leave the pitch key unblocked. Reach and seal everything inside.',
      TE:  'Arc release to the outside and block the first threat. You\'re the lead blocker on the pitch.',
    },
    ['Ball Handling / Fakes', 'Scramble Drill', 'Juke / Cut Drill', 'Reach Block'],
    ['HS','COL']),

  play('RPO Slant', 'rpo', 'Shotgun Trips',
    'Inside zone paired with a slant read. QB reads the flat defender — if he fills the run, throw the slant.',
    {
      QB:  'Mesh point with the RB. Eyes on the playside LB or flat defender. He steps up? Throw the slant. He drops? Give the ball.',
      RB:  'Run inside zone. Same rules — press the hole, one cut, go.',
      WR:  'Run the slant at full speed. Be ready for a quick throw — it\'s coming hot.',
      OL:  'Block inside zone. Stay behind the LOS — if the QB throws, linemen past the LOS is a penalty.',
      TE:  'Block the DE or climb. Same as any zone run.',
    },
    ['Route Tree Fundamentals', 'Zone Read Footwork', '3-Step Drop', 'Pre-Snap Read Drill'],
    ['HS','COL','PRO']),

  // ══════════════════════════════════════════════════════════════
  // SCREENS
  // ══════════════════════════════════════════════════════════════

  play('RB Screen', 'screen', 'Shotgun',
    'Let the defense rush, then dump the ball to the RB behind a wall of blockers. The counter to heavy pressure.',
    {
      QB:  'Fake the deep drop. Let the DL rush past. Soft, catchable pass to the RB behind the line.',
      RB:  'Pass block for 1 count, then release behind the OL. Set up behind the wall and catch the ball in stride.',
      WR:  'Run go routes to clear out the secondary. Take the DBs with you.',
      OL:  'Let the DL rush past — initial pass set, then release downfield. Set up a wall for the RB. Guard-tackle-center wall.',
      TE:  'Chip the DE, then get downfield and find someone to block. Be a lead blocker.',
    },
    ['Screen Pass Drill', 'Receiving Out of Backfield', 'Pass Set / Kick Step', 'RAC Drill (Run After Catch)'],
    ['HS','COL','PRO']),

  play('Bubble Screen', 'screen', 'Shotgun Spread',
    'Quick throw to the slot receiver behind blockers. An extension of the run game in the spread offense.',
    {
      QB:  'Catch, turn, throw — one motion. Get it out fast. Aim for the receiver\'s chest at 3 yards depth.',
      RB:  'Fake a run inside to hold the LBs. Then block if the play comes your way.',
      WR:  'Slot: bubble catch — catch and get upfield behind blocks. Outside WR: block the corner. Crack the safety if he triggers.',
      OL:  'Block the DL. This is a quick throw — just hold your man.',
      TE:  'Block or release. Depends on alignment.',
    },
    ['RAC Drill (Run After Catch)', 'Juke / Cut Drill', 'Release Drills', 'Screen Pass Drill'],
    ['HS','COL','PRO']),

  play('WR Tunnel Screen', 'screen', 'Trips / Shotgun',
    'Interior WR screen with blockers out in front. Hit the slot in the middle of the field with traffic cleared.',
    {
      QB:  'Quick throw to the slot receiver. Fast release — don\'t hold it. Timing is everything.',
      RB:  'Block the most dangerous rusher or release as a decoy.',
      WR:  'Slot catches in the middle, outside WRs block inside for the tunnel. Set up the wall and let the slot run through it.',
      OL:  'Standard pass set. Quick throw — hold for 1.5 seconds.',
      TE:  'Release upfield and find a linebacker to block. Get in the way.',
    },
    ['RAC Drill (Run After Catch)', 'Screen Pass Drill', 'Gauntlet Drill', 'Release Drills'],
    ['COL','PRO']),

  // ══════════════════════════════════════════════════════════════
  // DEFENSIVE COVERAGES
  // ══════════════════════════════════════════════════════════════

  play('Cover 1 (Man Free)', 'coverage', 'Base / Nickel',
    'Man-to-man coverage with a single high safety. Aggressive coverage that allows you to blitz.',
    {
      DB:  'Man-to-man on your assigned receiver. Inside leverage, don\'t get beat deep. The safety is behind you but he can\'t cover everything.',
      LB:  'Man on the RB or TE. Stay in phase. If they release, match them. If they block, look for work.',
      DL:  'You get a free rusher advantage with man behind you. Get to the QB — the DBs can\'t cover forever.',
      Safety: 'Center field. Read the QB\'s eyes. Break on the throw. You\'re the last line of defense. Help over the top.',
    },
    ['Man-to-Man / Trail Technique', 'Press Coverage', 'Break on the Ball', 'Backpedal Technique'],
    ['HS','COL','PRO']),

  play('Cover 2', 'coverage', 'Base / Nickel',
    'Two deep safeties split the field. Corners play the flats. Protects against the deep ball but vulnerable in the middle.',
    {
      DB:  'Corners: funnel the WR inside, jam at the LOS, then squat on the flat. Don\'t let anyone behind you in the flat.',
      LB:  'Drop to your zone hook/curl. Read the QB\'s eyes and break on the throw. Wall off crossing routes.',
      DL:  '4-man rush. Get pressure with 4. If you can\'t get home, this coverage gets picked apart underneath.',
      Safety: 'Split the field. Each safety takes one deep half. Drive on any throw in your half. Don\'t get beat over the top.',
    },
    ['Cover 2 Flat / Half', 'Break on the Ball', 'Zone Drop / Hook-Curl', 'Backpedal Technique'],
    ['HS','COL','PRO']),

  play('Cover 3', 'coverage', 'Base / 4-3 / 3-4',
    'Three deep defenders (2 corners + free safety). Four underneath zones. The most common coverage in football.',
    {
      DB:  'Corners: bail to your deep third at the snap. Don\'t let anyone get behind you. Read #2 to the QB.',
      LB:  'Drop to your underneath zone (curl/flat, hook). Read through the QB to the receivers. Break on throws.',
      DL:  '4-man rush. Same as Cover 2 — win your 1-on-1 to make this coverage work.',
      Safety: 'Free safety: center field, deep middle third. Strong safety: drop to flat/curl or play robber underneath.',
    },
    ['Cover 3 / Deep Third', 'Zone Drop / Hook-Curl', 'Break on the Ball', 'Pursuit Angles'],
    ['HS','COL','PRO']),

  play('Cover 4 (Quarters)', 'coverage', 'Nickel / Dime',
    'Four deep defenders each take a quarter of the field. Great against 4 verticals and the deep passing game.',
    {
      DB:  'Each corner and safety takes one deep quarter. Read #2 — if he goes vertical, carry him. If he goes short, rob underneath.',
      LB:  'Underneath zones. Read through #3 (TE or RB) to the QB. Wall off crossers.',
      DL:  '4-man rush. You MUST get pressure — Quarters coverage gives up the underneath game.',
      Safety: 'Deep quarter. Read your key (#2 receiver). If he goes vertical, you\'re on him man-to-man. If he doesn\'t, help over the top.',
    },
    ['Backpedal Technique', 'Break on the Ball', 'Man-to-Man / Trail Technique', 'Ball Drills (Tip / INT)'],
    ['COL','PRO']),

  play('Cover 0 (No Safety)', 'coverage', 'Goal Line / Blitz',
    'Pure man coverage, no deep safety. All-out aggression. High risk, high reward — usually paired with a blitz.',
    {
      DB:  'Man-to-man, no help. You CANNOT get beat. Press coverage, don\'t let them release clean. Physical at the line.',
      LB:  'Man on your assignment. If you\'re blitzing, get home. If you\'re covering, you\'re on an island.',
      DL:  'Pin your ears back and get to the QB. There\'s no help in the secondary — the faster you get there, the better.',
      Safety: 'You\'re in man coverage on a TE or RB, or you\'re blitzing. No one is free. Everyone has a job.',
    },
    ['Press Coverage', 'Blitz Timing', 'Man-to-Man / Trail Technique', 'Tackle Circuit'],
    ['COL','PRO']),

  play('Cover 6 (Quarter-Quarter-Half)', 'coverage', 'Nickel',
    'Hybrid coverage — Cover 4 to the field, Cover 2 to the boundary. Adjusts strength to the wide side.',
    {
      DB:  'Field corner: quarter technique, read #2. Boundary corner: flat/squat technique like Cover 2.',
      LB:  'Drop to your zone. Read through the QB. React to routes in your area.',
      DL:  '4-man rush. Balanced front, win your matchup.',
      Safety: 'Field safety: deep quarter. Boundary safety: deep half. Read your keys and communicate with corners.',
    },
    ['Cover 2 Flat / Half', 'Backpedal Technique', 'Break on the Ball', 'Film Study Session'],
    ['COL','PRO']),

  play('Tampa 2', 'coverage', 'Nickel / 4-3',
    'Cover 2 variation where the Mike LB drops to the deep middle, turning it into a 3-deep look. Invented by Tony Dungy\'s Bucs.',
    {
      DB:  'Corners jam and squat on the flat, same as Cover 2. Funnel receivers inside.',
      LB:  'Mike LB: sprint to the deep middle hole between the safeties. You\'re the 3rd deep defender. Will/Sam: hook-curl zones.',
      DL:  '4-man rush with contain. The front four MUST get pressure — Tampa 2 relies on it.',
      Safety: 'Deep halves, same as Cover 2. Trust that the Mike has the middle seam covered. Drive on throws to your half.',
    },
    ['Zone Drop / Hook-Curl', 'Backpedal Technique', 'Break on the Ball', 'Pursuit Angles'],
    ['COL','PRO']),

  play('Cover 2 Man Under', 'coverage', 'Nickel',
    'Two deep safeties with man coverage underneath. Combines the deep protection of Cover 2 with man-to-man on routes.',
    {
      DB:  'Man-to-man on your WR, but you have safety help over the top. Play aggressive underneath — deny the short stuff.',
      LB:  'Man on TE or RB. Match routes. You have deep help, so play the underneath aggressively.',
      DL:  '4-man rush. Get pressure — man coverage underneath can\'t hold forever.',
      Safety: 'Split the deep halves. Help over the top on any vertical threats. Let the corners play man below you.',
    },
    ['Man-to-Man / Trail Technique', 'Press Coverage', 'Cover 2 Flat / Half', 'Break on the Ball'],
    ['COL','PRO']),

  play('Cover 3 Buzz', 'coverage', 'Base / Nickel',
    'Cover 3 variation where the strong safety buzzes down to the flat instead of playing deep, creating a robber look.',
    {
      DB:  'Corners: deep third technique. Read #2 to the QB.',
      LB:  'Hook-curl-flat zones. If the SS is in the flat, you can stay tighter to the hook area.',
      DL:  '4-man rush. Win your 1-on-1 — this is a zone look behind you.',
      Safety: 'SS: buzz to the flat immediately — rob any quick throws. FS: center field, deep middle third. Cover more ground.',
    },
    ['Cover 3 / Deep Third', 'Robber / Rat Coverage', 'Break on the Ball', 'Zone Drop / Hook-Curl'],
    ['HS','COL','PRO']),

  play('Quarters Match (Pattern Read)', 'coverage', 'Nickel / Dime',
    'Pattern-matching quarters — starts as zone, converts to man based on route distribution. The modern NFL coverage.',
    {
      DB:  'Read #2. If #2 goes vertical, carry #1 man-to-man. If #2 goes short/inside, look to rob #1\'s route underneath.',
      LB:  'Read #3 (TE/RB). Match any vertical by #3. If #3 blocks or goes flat, look for crossers to wall off.',
      DL:  '4-man rush. Keep the QB in the pocket — pattern match takes a beat to sort out assignments.',
      Safety: 'Read #2. If #2 goes vertical, match him man-to-man. If #2 goes under, help over the top on #1.',
    },
    ['Backpedal Technique', 'Man-to-Man / Trail Technique', 'Film Study Session', 'Break on the Ball'],
    ['PRO']),

  play('Bracket Coverage (Cloud/Clamp)', 'coverage', 'Nickel / Dime',
    'Double-team the opponent\'s best receiver — one defender underneath, one over the top. Takes away the #1 option.',
    {
      DB:  'Corner on the bracketed WR plays underneath. Deny the short/intermediate. The safety has your back deep.',
      LB:  'Cover your man normally. The bracket frees you up — one less elite receiver to worry about.',
      DL:  'Rush the passer. The QB\'s first read is taken away — force him to his 2nd or 3rd option. You have time.',
      Safety: 'Safety over the top of the bracketed WR. Take away the deep ball. Let the corner handle everything underneath.',
    },
    ['Man-to-Man / Trail Technique', 'Press Coverage', 'Film Study Session', 'Backpedal Technique'],
    ['COL','PRO']),

  play('Prevent / Quarters Prevent', 'coverage', 'Dime / Quarter',
    'End-of-half or end-of-game defense. Drop everyone deep, give up the short stuff, protect the deep ball and sidelines.',
    {
      DB:  'Deep zones. Do NOT get beat deep. Give up 5-10 yard completions — just don\'t give up the big play or the sideline.',
      LB:  'Drop deep — 15-18 yards. Cover any crossers or intermediate routes. You\'re a safety net, not a run stopper right now.',
      DL:  '3-man rush. Contain the QB. Don\'t let him scramble for a first down. Just keep him in the pocket.',
      Safety: 'Ultra-deep. 25+ yards off the ball. Nothing gets behind you. Break on everything thrown in your half.',
    },
    ['Backpedal Technique', 'Break on the Ball', 'Cover 3 / Deep Third', 'Tackling in Space'],
    ['HS','COL','PRO']),

  play('Red Zone Defense (Tight)', 'coverage', 'Goal Line / Nickel',
    'Inside the 20 — the field shrinks. Tighten coverage, take away the end zone, force field goals.',
    {
      DB:  'Press coverage. No cushion — the end zone is right there. Don\'t let the WR get a free release into the end zone.',
      LB:  'Squeeze the formation. Take away crossing routes and TE seams. Be physical.',
      DL:  'Collapse the pocket. The QB has nowhere to step up. Drive him into the back of the end zone.',
      Safety: 'Play the goal posts as your deep help. Take away the fade and the post. Watch for back-shoulder throws.',
    },
    ['Press Coverage', 'Tackle Circuit', 'Break on the Ball', 'Man-to-Man / Trail Technique'],
    ['HS','COL','PRO']),

  // ══════════════════════════════════════════════════════════════
  // BLITZ PACKAGES
  // ══════════════════════════════════════════════════════════════

  play('A-Gap Blitz', 'blitz', 'Nickel / Dime',
    'Send a LB through the A-gap. Direct pressure up the middle — collapses the pocket fast.',
    {
      DB:  'Man coverage behind the blitz. Everyone has a man. No help.',
      LB:  'Blitzer: time the snap, shoot the A-gap. Get skinny, get through. Non-blitzers: cover your man.',
      DL:  'Occupy blockers. The OL has to account for you — if they slide to the blitz, you\'re 1-on-1. Win.',
      Safety: 'Single high or man assignment. If the blitz gets home, great. If not, you\'re the last line.',
    },
    ['Blitz Timing', 'Read and React (Run Fits)', 'Press Coverage', 'Tackle Circuit'],
    ['COL','PRO']),

  play('Edge Blitz (Corner / Safety)', 'blitz', 'Nickel',
    'Bring a DB off the edge. The offense doesn\'t expect a corner or safety rushing — creates a free runner.',
    {
      DB:  'Blitzing DB: disguise until the snap, then attack the edge. Contain rush — don\'t get too far upfield. Other DBs: cover.',
      LB:  'Drop into the vacated zone or pick up the DB\'s man assignment. Communication is critical.',
      DL:  'Crash inside to create the edge for the blitzing DB. Occupy interior blockers.',
      Safety: 'If you\'re blitzing: attack the edge or B-gap. If not: rotate to cover the blitzer\'s zone.',
    },
    ['Blitz Timing', 'Edge Rush / Bend', 'Backpedal-to-Sprint Transition', 'Tackle Circuit'],
    ['COL','PRO']),

  play('Zone Blitz', 'blitz', '3-4 / Nickel',
    'Blitz from an unexpected spot, but drop a DL into coverage to replace the blitzer. Disguise and deception.',
    {
      DB:  'Play your zone. The coverage behind the blitz is zone — read the QB and break on throws.',
      LB:  'Blitzer: fire through your gap. Dropper: fall back into the zone vacated by the blitzer. Sell the fake.',
      DL:  'One DL drops into a short zone (usually the DE into the flat). Unusual look — confuses the QB.',
      Safety: 'Deep zone responsibility. Your help underneath comes from the dropping DL.',
    },
    ['Zone Drop / Hook-Curl', 'Blitz Timing', 'Read and React (Run Fits)', 'Shed Block Drill'],
    ['HS','COL','PRO']),

  play('Overload Blitz', 'blitz', 'Base / Nickel',
    'Send more rushers to one side than the OL can block. Creates an unblocked rusher by scheme.',
    {
      DB:  'Man or zone on the backside. The overload side is the pressure side — be ready for a quick throw your way.',
      LB:  'Stack the blitz side. Time it together — both LBs through adjacent gaps at once.',
      DL:  'DL on the blitz side: attack your gap. DL on the back side: contain. Don\'t let the QB escape.',
      Safety: 'Rotate to the weakened coverage side. The overload leaves one side short — you fill.',
    },
    ['Blitz Timing', 'Pursuit Angles', 'Tackle Circuit', 'Read and React (Run Fits)'],
    ['COL','PRO']),

  play('Double A-Gap Mug', 'blitz', 'Nickel / Dime',
    'Both inside LBs walk up to the A-gaps pre-snap. They might both blitz, one might drop — the offense has to guess.',
    {
      DB:  'Man or zone behind. The OL is locked on the A-gap threats — your pass rush help is the confusion.',
      LB:  'Both LBs align in the A-gaps. On the snap: both fire, or one drops into coverage. The call dictates who goes.',
      DL:  'Slant away from the mugging LBs. If they blitz, you occupy blockers. If one drops, you rush harder.',
      Safety: 'If both LBs blitz, you may need to replace one in coverage. Read the call and rotate.',
    },
    ['Blitz Timing', 'Read and React (Run Fits)', 'Zone Drop / Hook-Curl', 'Shed Block Drill'],
    ['COL','PRO']),

  play('Fire Zone (3-Rush, Zone Blitz)', 'blitz', '3-4 / Nickel',
    'Rush 5, drop 6 into zone coverage. Three down linemen rush while two LBs/DBs add pressure. Zone coverage hides the blitz.',
    {
      DB:  'Play your zone. You\'re not blitzing — read the QB and break on the throw. Cover the vacated area.',
      LB:  'Blitzers: time the snap and attack your gap. Droppers: get to your zone landmark immediately — you\'re replacing someone.',
      DL:  '3-man rush. One DE drops into the flat. The other two DL must win — with only 3 rushing, every rep counts.',
      Safety: 'Deep coverage. The zone behind the blitz depends on you being in position. Communicate with the corners.',
    },
    ['Zone Drop / Hook-Curl', 'Blitz Timing', 'Edge Rush / Bend', 'Read and React (Run Fits)'],
    ['COL','PRO']),

  play('Mike Blitz (Inside LB)', 'blitz', 'Base / Nickel',
    'Send the Mike linebacker through the A or B gap. Simple, effective interior pressure.',
    {
      DB:  'Man behind the blitz. Everyone locks on. No free players in coverage.',
      LB:  'Mike: time the snap, shoot your gap. Will: fill the Mike\'s vacated area. Don\'t leave the middle empty.',
      DL:  'Occupy blockers so the Mike comes free. If the center slides to the Mike, the DT opposite has a 1-on-1.',
      Safety: 'Replace the Mike in the underneath zone if it\'s zone behind. If man, cover your assignment.',
    },
    ['Blitz Timing', 'Tackle Circuit', 'Read and React (Run Fits)', 'Shed Block Drill'],
    ['HS','COL','PRO']),

  play('Nickel Blitz Package', 'blitz', 'Nickel',
    'The nickel DB blitzes off the slot while the safety rotates down to cover the slot receiver.',
    {
      DB:  'Nickel: attack the B-gap or edge at the snap. Corner: take the slot receiver — the nickel is rushing. Safety rotates to help.',
      LB:  'Drop or cover your man. The pressure is coming from the secondary — stay disciplined.',
      DL:  '4-man rush plus the nickel makes 5. One rusher should be free. Occupy your man and let the nickel get home.',
      Safety: 'Rotate to the slot area pre-snap to disguise. Post-snap: cover the slot receiver the nickel left behind.',
    },
    ['Blitz Timing', 'Edge Rush / Bend', 'Press Coverage', 'Backpedal-to-Sprint Transition'],
    ['COL','PRO']),

  play('Simulated Pressure (Sim Blitz)', 'blitz', 'Nickel / Dime',
    'Show blitz with 6-7 defenders at the line, but only rush 4. The rest drop into coverage. Confuses the QB\'s pre-snap read.',
    {
      DB:  'Walk up like you\'re blitzing, then bail into coverage at the snap. Disguise is everything.',
      LB:  'Align like a blitz. At the snap: designated rushers go, everyone else drops. The offense thinks pressure is coming from everywhere.',
      DL:  '4-man rush. The walked-up defenders are dropping — you still need to win your matchup.',
      Safety: 'Can walk up to sell the blitz, then rotate deep. Make the QB think he\'s getting hit.',
    },
    ['Zone Drop / Hook-Curl', 'Blitz Timing', 'Film Study Session', 'Backpedal-to-Sprint Transition'],
    ['COL','PRO']),

  play('Delayed Blitz', 'blitz', 'Nickel',
    'LB waits 1-2 seconds after the snap, then rushes. The OL has already committed to their pass sets — the LB finds the gap.',
    {
      DB:  'Man or zone behind. Hold your coverage a beat longer — the delayed rush takes time.',
      LB:  'Read the play for one count like you\'re dropping. Then attack the gap that opens when the OL commits to the DL.',
      DL:  'Rush hard initially to occupy blockers. The LB is coming late — create the gap for him.',
      Safety: 'Stay disciplined. The delayed blitz takes longer to get home, so coverage needs to hold.',
    },
    ['Blitz Timing', 'Read and React (Run Fits)', 'Zone Drop / Hook-Curl', 'Shed Block Drill'],
    ['COL','PRO']),

  // ══════════════════════════════════════════════════════════════
  // DEFENSIVE FRONTS
  // ══════════════════════════════════════════════════════════════

  play('4-3 Over', 'front', 'Base Defense',
    'Standard 4-down front shifted to the strong side. The foundation of most defenses from HS to NFL.',
    {
      DB:  'Play your coverage. The front doesn\'t change your job — just know where the extra help is.',
      LB:  'Will (weak-side): responsible for the B-gap backside. Mike (middle): A-gap, run downhill. Sam (strong): set the edge.',
      DL:  'Shifted to strength. 3-tech (DT) to the strong side in the B-gap. 1-tech or shade to the weak side. DEs: contain.',
      Safety: 'Read the formation strength. Strong safety closer to the LOS in run support.',
    },
    ['Read and React (Run Fits)', 'DL Get-Off Drill', 'Shed Block Drill', 'Pursuit Angles'],
    ['HS','COL','PRO']),

  play('3-4 Base', 'front', 'Base Defense',
    'Three down linemen, four linebackers. Versatile — can rush 4 from any angle or drop 8 into coverage.',
    {
      DB:  'Coverage stays the same. The extra LB gives you flexibility underneath.',
      LB:  'Inside LBs: A/B gap responsibilities. Read your keys. OLBs: set the edge in run, rush the passer on passing downs.',
      DL:  'Nose tackle: 2-gap the center — control both A-gaps. DEs: set the edge, occupy blockers, keep LBs free.',
      Safety: 'Free safety: center field. Strong safety: come down in run support or play coverage based on the call.',
    },
    ['Read and React (Run Fits)', 'Bull Rush', 'Shed Block Drill', 'DL Get-Off Drill'],
    ['HS','COL','PRO']),

  play('Nickel (5 DBs)', 'front', 'Sub Package',
    'Replace a LB with a 5th DB. The standard passing-down defense in modern football.',
    {
      DB:  'Nickel DB: cover the slot. You\'re the 5th DB — good in space, can tackle. Play your technique.',
      LB:  '2 LBs only. Must be versatile — cover and hit. Every play matters when you\'re out there.',
      DL:  '4-man front. Win your 1-on-1 — this is a passing-down call. Get pressure.',
      Safety: 'Same as base. Adjust to the extra DB in the formation. More coverage flexibility.',
    },
    ['Tackling in Space', 'Press Coverage', 'Break on the Ball', 'Pass Set / Kick Step'],
    ['HS','COL','PRO']),

  play('46 Defense', 'front', 'Base / Goal Line',
    'Buddy Ryan\'s famous front — 6 defenders on the line, 1 safety deep. Extreme aggression, stops the run, creates chaos.',
    {
      DB:  'Man coverage with limited safety help. Play physical — the front is bringing heat.',
      LB:  'Walk up to the line. You\'re a de facto DL. Fire gaps, attack the LOS, read and react on the move.',
      DL:  '4 down linemen with 2 LBs walked up = 6 on the line. Slant, stunt, and attack. Overwhelm the OL.',
      Safety: 'SS is walked up near the LOS as a run defender. FS is single-high — you\'re the only deep help. Don\'t get beat.',
    },
    ['Blitz Timing', 'Bull Rush', 'DL Get-Off Drill', 'Tackle Circuit'],
    ['COL','PRO']),

  play('Bear Front', 'front', 'Base / Short Yardage',
    'Nose tackle heads up on the center, two DTs in the B-gaps. Clogs every interior gap — designed to stop the run.',
    {
      DB:  'Play your coverage. The front is handling the run — don\'t get caught peeking in the backfield.',
      LB:  'Free to flow. The DL is eating up blocks — read your keys and fill the gaps they can\'t reach.',
      DL:  'Nose: lock up the center, control both A-gaps. DTs: attack the B-gaps, don\'t get reached. DEs: set the edge.',
      Safety: 'SS in run support. FS deep. If it\'s a run, trigger downhill. If it\'s pass, bail to your zone.',
    },
    ['DL Get-Off Drill', 'Bull Rush', 'Shed Block Drill', 'Read and React (Run Fits)'],
    ['HS','COL','PRO']),

  play('4-3 Under', 'front', 'Base Defense',
    'Opposite of 4-3 Over — shifted to the weak side. The 3-tech is to the weak side, creating a different gap-pressure look.',
    {
      DB:  'Coverage stays the same. Adjust to the front shift.',
      LB:  'Sam (strong-side): walked up as a de facto DE on the strong side. Will: free to flow weak. Mike: A-gap.',
      DL:  '3-tech weak side. The strong DE is head up on the tackle. Creates weak-side pressure.',
      Safety: 'Strong safety may need to help set the edge to the strong side since the Sam is walked up.',
    },
    ['Read and React (Run Fits)', 'DL Get-Off Drill', 'Shed Block Drill', 'Edge Rush / Bend'],
    ['COL','PRO']),

  play('Dime (6 DBs)', 'front', 'Sub Package',
    'Replace 2 LBs with 6 DBs. Extreme passing-down defense — used in obvious pass situations and 2-minute drill.',
    {
      DB:  '6 DBs on the field. Dime back covers the 3rd WR or RB in space. Must be able to tackle in the open field.',
      LB:  '1 LB only (Mike). You\'re the only LB — everything funnels through you. Run game and underneath coverage.',
      DL:  '4-man rush, possibly 3. Must generate pressure with fewer rushers. Win your 1-on-1.',
      Safety: 'Two deep or man responsibilities. Extra DBs give you coverage flexibility — disguise pre-snap.',
    },
    ['Tackling in Space', 'Press Coverage', 'Man-to-Man / Trail Technique', 'Break on the Ball'],
    ['COL','PRO']),

  play('Odd Stack (3-3-5)', 'front', 'Base / Spread Offense Counter',
    'Three down linemen, three LBs stacked behind them, five DBs. Built to defend the spread — speed over size.',
    {
      DB:  '5 DBs cover 4 WRs and the RB. Play your technique. The extra speed on the field lets you match up in space.',
      LB:  '3 LBs stacked directly behind the 3 DL. Read through the OL to the RB. Scrape to the ball.',
      DL:  'Nose plus 2 DEs. Control your gaps. The LBs are right behind you — keep them clean.',
      Safety: 'Can play deep or walk up as a hybrid LB/S. Versatility is the strength of this defense.',
    },
    ['Read and React (Run Fits)', 'Tackling in Space', 'Backpedal-to-Sprint Transition', 'Zone Drop / Hook-Curl'],
    ['HS','COL']),

  play('DL Stunt / Twist', 'front', 'Any Front',
    'Interior DL stunts — one crashes inside while the other loops around behind. Confuses blocking assignments.',
    {
      DB:  'Coverage holds. Stunts create quick pressure — be ready for a faster throw than usual.',
      LB:  'Read through the stunt. The OL may get displaced — fill the gaps that open.',
      DL:  'Penetrator: crash hard into your gap, draw the blocker. Looper: wrap behind the penetrator into the vacated gap. Timing is critical.',
      Safety: 'If the stunt gets home fast, the ball comes out fast. Stay in position.',
    },
    ['DL Get-Off Drill', 'Swim Move', 'Spin Move', 'Bull Rush'],
    ['HS','COL','PRO']),

  play('Goal Line Defense (6-2 / 5-3)', 'front', 'Goal Line',
    'Heavy front inside the 5-yard line. Stack the box, take away the run, and make them throw into tight coverage.',
    {
      DB:  'Press man coverage. The field is compressed — they have no room to run routes. Be physical.',
      LB:  'Fill every gap. Fit your run keys. If they try to jump it over the top, the QB has no time.',
      DL:  '5-6 down linemen. Win the line of scrimmage. Get penetration into the backfield. Low pad level wins.',
      Safety: 'In the box or man on the TE. Everyone is in the fight on the goal line.',
    },
    ['Tackle Circuit', 'Bull Rush', 'DL Get-Off Drill', 'Press Coverage'],
    ['HS','COL','PRO']),

  // ══════════════════════════════════════════════════════════════
  // SPECIAL TEAMS
  // ══════════════════════════════════════════════════════════════

  play('Kickoff Return Middle', 'st', 'Kickoff Return',
    'Set up a wedge/wall in the middle of the field. Return man hits the seam between the double-team blocks.',
    {
      'Return Man': 'Catch the ball in stride. Find the wall. Hit the first seam you see — one cut and go north.',
      'Front Line':  'Block your man, drive him to the sideline. Create a lane in the middle.',
      'Wedge/Wall':  'Set up the wall at the 30-35 yard line. Double-team the most dangerous cover guys. Create one clean lane.',
      'Safety':      'Get to your spot. Pick up the kicker or the first free man. Don\'t let anyone through.',
    },
    ['Kick Return Fundamentals', 'Kickoff Coverage', 'Pursuit Angles', 'Ball Security Drill'],
    ['HS','COL','PRO']),

  play('Punt Block', 'st', 'Punt Rush',
    'All-out rush on the punter. Overload one side to get a hand on the punt.',
    {
      'Edge Rusher': 'Sprint to the block point — 7 yards behind the LOS, 1 yard outside the center. Get your hands up.',
      'Interior':    'Collapse the pocket. Bull rush the personal protector. Create traffic.',
      'Contain':     'Don\'t let the punter escape. If the punt gets off, you\'re in coverage. Stay disciplined.',
      'Return Man':  'Be ready to field a blocked punt. Stay alert — it can bounce anywhere.',
    },
    ['Field Goal Block Technique', 'DL Get-Off Drill', 'Bull Rush', 'Pursuit Angles'],
    ['COL','PRO']),

  play('Fake Punt', 'st', 'Punt Formation',
    'The punter or upback keeps it and runs or throws. A game-changing call when the defense is relaxed.',
    {
      'Punter/Upback': 'Read the defense. If they\'re selling out on the return, keep it. Run or throw based on the look.',
      'Gunners':       'Run a go route if it\'s a pass. Block if it\'s a run. Sell the punt first.',
      'Interior':      'Block like normal, then release. The defense won\'t expect you to block for a run.',
      'Coverage':      'Be ready to switch from coverage to blocking. If the play works, spring it.',
    },
    ['Ball Handling / Fakes', 'Scramble Drill', 'Ball Security Drill', 'Punt Coverage'],
    ['HS','COL','PRO']),
];
