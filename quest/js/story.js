/* Chapter 1: Kharagpur, 2019 to 2024.
   Facts on signs come from iitkgp.ac.in, Wikipedia and the student wiki metakgp.org. */

(function () {
  'use strict';

  var G = window.GAME;
  var L = function (k) { return G.landmark(k); };

  /* ---------- Campus signs ---------- */

  var SIGNS = {
    puri_gate: ['Puri Gate', [
      'Puri Gate, the main way into campus.',
      'Just outside is Chhedi’s, the dhaba alumni swear has closed only once in its history, in 1983. Order the Tinku: an egg-poach burger.'
    ]],
    main_building: ['Main Building', [
      'The Main Building. Everyone calls it Insti.',
      'Designed by the Swiss architect Werner M. Moser. Nehru laid the foundation stone in March 1952.',
      'The sign out front reads: Dedicated to the service of the nation. The roundabout outside is GolC.'
    ]],
    netaji: ['Netaji Auditorium', [
      'Netaji Auditorium, part of the Main Building.',
      'The Technology Film Society turns it into the cheapest cinema in West Bengal every week.'
    ]],
    central_library: ['Central Library', [
      'The library started in 1951 in a single room of the old Hijli building and moved here in 1956.',
      'Open 8 am to midnight, and round the clock in exam season. The air-conditioned basement fills up fast in summer.'
    ]],
    nehru_museum: ['Hijli Shaheed Bhavan', [
      'Nehru Museum of Science and Technology, in the old Hijli Detention Camp. A fighter plane and a steam engine are parked outside.'
    ]],
    kalidas: ['Kalidas Auditorium', [
      'Kalidas Auditorium, inside the Vikramshila complex. 850 seats.',
      'The dance and dramatics societies rehearse in Vikramshila. During Kshitij this stretch becomes Robotix Avenue.'
    ]],
    nalanda: ['Nalanda Complex', [
      'Nalanda Classroom Complex, opened 2012. Seven blocks, five floors, four classrooms per block per floor.',
      'NC 341? Block NC4, third floor. Good luck finding it in your first week.'
    ]],
    takshashila: ['Takshashila', ['Takshashila, opened in 2002. Vikramshila followed in 2003 and Nalanda in 2012.']],
    gymkhana: ['Technology Students’ Gymkhana', [
      'TSG, founded 1952: sports, culture and student government all run from here.',
      'The motto is Yogah Karmasu Kaushalam: yoga is skill in action.'
    ]],
    jnan_ghosh: ['Jnan Ghosh Stadium', [
      'Named after Sir Jnan Chandra Ghosh, the first Director. 400 metre track.',
      'Spring Fest’s Star Nites fill this place every January.'
    ]],
    open_air_theatre: ['Tagore Open Air Theatre', ['TOAT. Concerts, plays, and Spring Fest nights under the sky.']],
    tech_market: ['Tech Market', [
      'Groceries, Bimola Sweets, tailors and a lot of xerox shops.',
      'At the start of term cycle stalls go up here: ₹3,500 to ₹6,000. The price drops once the parents leave.'
    ]],
    clock_tower: ['The 2.2', [
      'You’re on the 2.2: the 2.2 km loop through the heart of campus, made of Scholars’ Avenue, Nalini Ranjan Sarkar Avenue and part of IIT Main Road.',
      'Late-night laps are a KGP tradition. Put a KGPian on a treadmill anywhere and they’ll set it to 2.2.'
    ]],
    tikka: ['Tikka', ['Tikka. Open seating, always crowded, and an adrak chai alumni still miss.']],
    patel_hall: ['Patel Hall', [
      'Patel Hall, the oldest hall of residence. Motto: Lux et Veritas Vincant.',
      'With Azad and Nehru it gives the PAN Loop its name. Nehru is the traditional rival.'
    ]],
    nehru_hall: ['Nehru Hall', ['Nehru Hall, named after Motilal Nehru. In 2006–07 it took gold in all three General Championships.']],
    azad_hall: ['Azad Hall', ['Azad Hall, founded 1954. Azad started Illumination in 1981, and it’s the only hall with its own anthem.']],
    rp_hall: ['Rajendra Prasad Hall', [
      'RP Hall, the closest hall to Puri Gate. Its 2010–11 rangoli made it into Ripley’s Believe It or Not.',
      'Night canteen: Carlos. Closed on Wednesdays, open till 2 am the rest of the week.'
    ]],
    rk_hall: ['Radhakrishnan Hall', ['RK Hall, founded 1957. Motto: A great place to learn and... live. Nine playgrounds.']],
    lbs_hall: ['Lal Bahadur Shastri Hall', ['LBS, opened 2011 and the biggest hall on campus, with more than 2,000 residents. Motto: Learn Believe Succeed.']],
    ms_hall: ['Meghnad Saha Hall', ['MS Hall, founded 2001. Ubi Concordia, Ibi Victoria: where there is unity, there is victory.']],
    llr_hall: ['Lala Lajpat Rai Hall', ['LLR Hall of Residence.']],
    mmm_hall: ['Madan Mohan Malaviya Hall', ['MMM Hall of Residence.']],
    hjb_hall: ['Homi Jehangir Bhabha Hall', ['HJB Hall of Residence. Hall Days start here in March.']],
    mt_hall: ['Mother Teresa Hall', ['Mother Teresa Hall of Residence, right next to Tikka.']],
    ig_hall: ['Indira Gandhi Hall', ['IG Hall. For Illumination, the prize was once a matka of sweets.']],
    vgsom: ['Vinod Gupta School of Management', ['VGSOM, IIT Kharagpur’s business school.']],
    mining: ['Department of Mining Engineering', ['Department of Mining Engineering. Where you learn to read the ground before you dig it.']],
    post_office: ['Post Office', ['Kharagpur Technology post office. Every letter for every hall passes through here.']],
    cse: ['Computer Science and Engineering', ['Department of Computer Science and Engineering.']],
    tsg_lake: ['TSG Lake', ['A quiet pond by the Gymkhana. Good spot to think about life and CG.']],
    swimming_pool: ['Gymkhana Pool', ['The Gymkhana swimming pool.']],
    bc_roy_hospital: ['B. C. Roy Technology Hospital', ['The campus hospital.']],
    billoos: ['Billoo’s', ['Billoo’s, opposite RK Hall. Punjabi food.']],
    heritage: ['Heritage', ['Heritage, on Scholars’ Avenue next to CCD. Air conditioning, which in a Kharagpur summer is the whole menu.']],
    sahara: ['Sahara', ['Sahara, near the Prem Bazar gate.']],
    vs_canteen: ['VS Canteen', ['VS Canteen.']],
    kalidas_canteen: ['Kalida’s Canteen', ['Kalida’s Canteen, by the Hijli building.']],
    jubilee_park: ['Jubilee Park', ['Jubilee Park.']],
    biodiversity_park: ['Plant Biodiversity Park', ['Plant Biodiversity Park.']],
    railway_counter: ['Railway Reservation Counter', [
      'Book your train home here.',
      'Kharagpur Junction’s platform, 1,072 metres, was the longest in the world until Gorakhpur’s opened in 2013. Get the Aloo Khasa.'
    ]],
    sbi: ['State Bank of India', ['The campus branch of State Bank of India.']]
  };

  /* ---------- People of KGP ---------- */

  var CHATTER = [
    'Peace maar yaar, why so much load?',
    'KGP ka tempo high hai!',
    'Did a lap of the 2.2 at midnight. Best way to clear your head.',
    'My room-baap left me a broken table lamp and three years of notes.',
    'Midsems next week. Total load. Library basement it is.',
    'Have you had the adrak chai at Tikka yet? Go.',
    'Bhaat later, I’m late for a lab in Nalanda.',
    'That guy is a gawd. Nehli CG and still runs a Spring Fest event.',
    'Faccha? Get a cycle first. The campus is 2,100 acres.',
    'Came back from class and my room had been C.G.’d. Everything is in the corridor.',
    'Spring Fest is in January. Star Nite at Jnan Ghosh is something else.',
    'Kshitij started as Ideon, back in 2004.',
    'Illu night: every light goes off and twenty thousand diyas come on.',
    'Dual degree? Then you’re a Dude. That’s what we call you lot.',
    'Insti means the Main Building. Nobody says Main Building.',
    '11. Sorry, that means I’m laughing. Blame Age of Empires.',
    'Weather’s fine now. Give it an hour. KGP weather does what it wants.',
    'Machaya! Aced the quiz. Well, did not makha it at least.',
    'Arbit question: anyone know when Tech Market is open? Not Mondays, apparently.',
    'Room 341? Nalanda, block NC4, third floor. You’ll get used to it.',
    'Taapna is a strong word. I was just referring to his assignment.',
    'Hall Day is in March. Even the mess food tastes better that week.'
  ];
  var NIGHT_CHATTER = [
    'Night canteen run? Carlos in RP, unless it’s a Wednesday.',
    'Cathleen’s in Nehru stays open till 5 am. Don’t ask how I know.',
    'Can’t sleep. Doing a 2.2.'
  ];
  var RAIN_CHATTER = ['Raining cats and dogs. Should have carried an umbrella.', 'This is the monsoon. The roads become rivers by evening.'];

  function chatter(n) {
    var pool = CHATTER;
    if (G.world.rain > 0.5) pool = RAIN_CHATTER.concat(CHATTER.slice(0, 4));
    else if (G.world.darkness > 0.6) pool = NIGHT_CHATTER.concat(CHATTER);
    var line = pool[(n.seed + Math.floor(G.world.t / 30)) % pool.length];
    return G.say(n.name, [line]);
  }

  var NAMES = ['Arjun', 'Priya', 'Sayan', 'Ritika', 'Aniket', 'Debjani', 'Kunal', 'Sneha', 'Rahul', 'Ananya', 'Soham', 'Ishita', 'Vikram', 'Tanvi', 'Arnab', 'Meera', 'Rohan', 'Pooja', 'Abhishek', 'Shreya', 'Siddharth', 'Nandini', 'Aditya', 'Riya', 'Subhro', 'Kavya', 'Nikhil', 'Aparna'];

  /* ---------- Quests ---------- */

  var QUESTS = [
    { id: 'day1', title: 'Report at Insti', target: 'main_building', date: 'Jul 2019' },
    { id: 'cycle', title: 'Buy a cycle at Tech Market', target: 'tech_market', date: 'Jul 2019' },
    { id: 'rocks', title: 'Meet the Mining professor', target: 'mining', date: 'Aug 2019' },
    { id: 'hijli', title: 'Visit Hijli Shaheed Bhavan', target: 'nehru_museum', date: 'Sep 2021' },
    { id: 'crawler', title: 'Collect Supreme Court judgements for IIM Bangalore', target: 'central_library', date: 'Feb 2022' },
    { id: 'dc', title: 'Valuation drill at VGSOM', target: 'vgsom', date: 'Apr 2023' },
    { id: 'cfa', title: 'Present at the CFA Research Challenge', target: 'kalidas', date: 'Jan 2024' },
    { id: 'convo', title: 'Convocation day at Insti', target: 'main_building', date: 'May 2024' },
    { id: 'free', title: 'Explore KGP: read every campus sign', target: null, date: '2024' }
  ];
  var byId = {};
  QUESTS.forEach(function (q) { byId[q.id] = q; });

  var st = G.state;
  function current() { return byId[st.quest] || null; }

  function startQuest(id, quiet) {
    st.quest = id;
    var q = byId[id];
    G.setDate(q.date);
    var target = q.target ? spotFor(q.target) : null;
    G.setObjective(q.title, target);
    refreshMarks();
    if (!quiet) { G.sfx('open'); G.toast('New quest: ' + q.title, 'quest'); }
    G.save();
  }
  function finishQuest(id, next) {
    if (st.done.indexOf(id) < 0) st.done.push(id);
    G.questDone(byId[id].title);
    if (next) startQuest(next, true);
  }

  // Where someone stands for a landmark: in front of the door.
  function spotFor(key) {
    var l = L(key);
    return l ? { x: l.x, y: l.y } : null;
  }

  /* ---------- Story people ---------- */

  var people = {};

  function storyNPC(id, key, name, look, onTalk, offset) {
    var at = spotFor(key);
    if (!at) return null;
    if (offset) at = G.walkableNear({ x: at.x + offset[0], y: at.y + offset[1] });
    var n = G.addNPC({ id: id, at: at, name: name, look: look, dir: 'down', onTalk: onTalk });
    people[id] = n;
    return n;
  }

  function refreshMarks() {
    var q = st.quest;
    var who = { day1: 'registrar', cycle: 'cyclewala', rocks: 'prof', crawler: 'postman', dc: 'banker', cfa: 'judge', convo: 'director' }[q];
    Object.keys(people).forEach(function (k) { people[k].mark = null; });
    if (who && people[who]) people[who].mark = '!';
    if (q === 'crawler' && st.flags.letterIIMB && people.postman) people.postman.mark = null;
    if (q === 'dc' && !st.flags.letterDC && people.postman) { people.postman.mark = '!'; if (people.banker) people.banker.mark = null; }
    if (q === 'crawler' && !st.flags.letterIIMB) G.setObjective('Collect a letter at the post office', spotFor('post_office'));
    if (q === 'dc' && !st.flags.letterDC) G.setObjective('A letter is waiting at the post office', spotFor('post_office'));
  }

  async function quiz(name, qs) {
    var score = 0;
    for (var i = 0; i < qs.length; i++) {
      var q = qs[i];
      var pick = await G.choose(name, q.q, q.options);
      if (pick === q.a) { score++; G.sfx('item'); await G.say(name, [q.right]); }
      else { G.sfx('wrong'); await G.say(name, [q.wrong]); }
    }
    return score;
  }

  var ROCKS = [
    { q: 'On a geological section, which rock is drawn with a brick pattern?', options: ['Sandstone', 'Limestone', 'Granite'], a: 1,
      right: 'Limestone. Blocks, like the beds it forms in.', wrong: 'Limestone gets the bricks. Think of the blocky beds.' },
    { q: 'Dots, like grains, scattered across a layer?', options: ['Shale', 'Sandstone', 'Coal'], a: 1,
      right: 'Sandstone. Every dot is a grain of sand.', wrong: 'Sandstone. The dots are grains of sand.' },
    { q: 'Short dashes in neat rows?', options: ['Shale', 'Granite', 'Limestone'], a: 0,
      right: 'Shale. It splits into thin sheets, so we draw thin lines.', wrong: 'That’s shale: thin dashes for thin, fissile layers.' },
    { q: 'Little crosses, plus signs and x’s?', options: ['Granite', 'Sandstone', 'Shale'], a: 0,
      right: 'Granite. Igneous rock, and the bedrock under most of this.', wrong: 'Crosses mean granite, an igneous rock.' }
  ];

  var VALUATION = [
    { q: 'Enterprise value is equity value plus...?', options: ['Net debt', 'Revenue', 'Dividends'], a: 0,
      right: 'Net debt. EV is what you pay for the whole business: the equity, plus the debt you take on, less the cash you get.', wrong: 'Net debt. EV covers the whole business, debt included, less cash.' },
    { q: 'EBITDA is ₹100 crore and comparable companies trade at 8x EV/EBITDA. Implied enterprise value?', options: ['₹12.5 crore', '₹800 crore', '₹108 crore'], a: 1,
      right: '₹800 crore. 100 times 8.', wrong: 'Multiply: ₹100 crore times 8 is ₹800 crore.' },
    { q: 'Net debt is ₹300 crore. What is the equity worth?', options: ['₹500 crore', '₹1,100 crore', '₹800 crore'], a: 0,
      right: '₹500 crore. Take the debt off the ₹800 crore. You’ll do fine in Mumbai.', wrong: 'Equity is EV less net debt: ₹800 crore minus ₹300 crore is ₹500 crore.' }
  ];

  function setupPeople() {
    var formal = { skin: '#b9845a', hair: '#2a2a2a', shirt: '#dfe6ee', pants: '#2b2f3a', tie: '#7a2a2a' };

    storyNPC('registrar', 'main_building', 'Registrar’s office', { skin: '#c08a60', hair: '#5a5a5a', shirt: '#f0ead8', pants: '#3b3b46' }, async function () {
      if (st.quest !== 'day1') return G.say('Registrar’s office', ['Next in line, please. And welcome to Insti.']);
      await G.say('Registrar’s office', [
        'Name? Ranabir Basu. Dual degree, Mining Engineering. Welcome to IIT Kharagpur.',
        'You’re standing in the first IIT. It opened in 1951 in the old Hijli Detention Camp, just east of here.',
        'Here is your institute ID. Don’t lose it; the library won’t let you in without it.'
      ]);
      G.give('id', 'Institute ID card', 'Roll number, photo, and a stamp that says you belong here.');
      if (people.ma) { G.remove('ma'); G.remove('baba'); }
      finishQuest('day1');
      await G.say('', ['Your parents have started back home. You’re on your own now.', 'Everyone says the same thing: before anything else, get a cycle.']);
      startQuest('cycle');
    });

    storyNPC('cyclewala', 'tech_market', 'Cycle stall', { skin: '#9c6b45', hair: '#1b1512', shirt: '#6b8f5a', pants: '#4a4a4a' }, async function () {
      if (st.flags.hasBike) return G.say('Cycle stall', ['Chain giving trouble? Bring it back any time, dada.']);
      if (st.quest !== 'cycle') return G.say('Cycle stall', ['Cycles, locks, baskets. Freshers get a good price. Mostly.']);
      var pick = await G.choose('Cycle stall', 'New faccha? This one is perfect. Six thousand, final price.', ['Pay ₹6,000', 'Your parents have left. Haggle.']);
      if (pick === 0) await G.say('Cycle stall', ['Done! You won’t regret it. Probably.']);
      else await G.say('Cycle stall', ['Ah, parents gone, now you bargain? Fine. Three thousand eight hundred, for you only.', 'No gears. You don’t need gears in Kharagpur. It’s flat as a chapati.']);
      st.flags.hasBike = true;
      G.give('cycle', pick === 0 ? 'A ₹6,000 cycle' : 'A ₹3,800 cycle', 'Your way around 2,100 acres. Press B to get on or off.');
      G.setBike(true);
      finishQuest('cycle');
      await G.say('', ['Press B (or the bike button) to ride. Much faster.', 'Next: your department wants to see you.']);
      startQuest('rocks');
    }, [2, 0]);

    storyNPC('prof', 'mining', 'Professor, Mining', { skin: '#c49067', hair: '#d8d8d8', shirt: '#c9b48a', pants: '#4a3f35' }, async function () {
      if (st.done.indexOf('rocks') >= 0) return G.say('Professor, Mining', ['Every layer is a chapter. Remember that when you’re reading balance sheets one day.']);
      if (st.quest !== 'rocks') return G.say('Professor, Mining', ['Come back when you’ve registered, young man.']);
      await G.say('Professor, Mining', [
        'Ah, the dual degree student. Mining, and then Financial Engineering, I hear. Interesting combination.',
        'Mining starts with reading the ground before you dig. Geologists draw each rock with its own symbol. Let’s see if you can read them.'
      ]);
      var score = await quiz('Professor, Mining', ROCKS);
      if (score < 3) { await G.say('Professor, Mining', [score + ' out of 4. Read up and come back. The rocks aren’t going anywhere.']); return; }
      await G.say('Professor, Mining', [score + ' out of 4. You’ll do. Keep this, every mining engineer should own one.']);
      G.give('hammer', 'Geologist’s hammer', 'For reading the ground. Later, for reading companies.');
      finishQuest('rocks');
      await lockdown();
    });

    storyNPC('postman', 'post_office', 'Postman', { skin: '#a87048', hair: '#2e2219', shirt: '#b5873a', pants: '#5b4a3a', cap: '#8a6a2a' }, async function () {
      if (st.quest === 'crawler' && !st.flags.letterIIMB) {
        st.flags.letterIIMB = true;
        await G.say('Postman', ['Letter for you. From IIM Bangalore.']);
        await G.say('Letter', [
          'Research internship, Feb to Apr 2022, with Prof. Manaswini Bhalla.',
          'The question: do Supreme Court judgements depend on the caste of the petitioners, respondents and judges?',
          'First you need data. Build a crawler and collect the judgements.'
        ]);
        spawnJudgements();
        refreshMarks();
        G.setObjective('Collect judgements around the library (0/6)', spotFor('central_library'));
        return;
      }
      if (st.quest === 'dc' && !st.flags.letterDC) {
        st.flags.letterDC = true;
        await G.say('Postman', ['Another one for you. Fancy envelope. Mumbai.']);
        await G.say('Letter', [
          'DC Advisory: investment banking internship, May to July 2023.',
          'Before you join, a senior at VGSOM has offered to run a valuation drill with you.'
        ]);
        G.setObjective(byId.dc.title, spotFor('vgsom'));
        refreshMarks();
        return;
      }
      return G.say('Postman', ['Nothing for you today. Check again after your next semester.']);
    }, [1, 0]);

    storyNPC('banker', 'vgsom', 'Senior, VGSOM', formal, async function () {
      if (st.quest !== 'dc' || !st.flags.letterDC) return G.say('Senior, VGSOM', ['Placements are a marathon, not a sprint. Says the guy who sprinted.']);
      await G.say('Senior, VGSOM', ['DC Advisory, nice. They’ll throw a model at you on day one. Three questions, quick.']);
      var score = await quiz('Senior, VGSOM', VALUATION);
      if (score < 2) { await G.say('Senior, VGSOM', ['Hmm. Revise and come back, there’s time before May.']); return; }
      await G.say('Senior, VGSOM', ['You’re ready. Take this. Mumbai offices like a tie.']);
      G.give('tie', 'A brown tie', 'Your first formal wear. Worn to every important room since.');
      G.setPlayerLook({ tie: '#5a3424' });
      await G.say('', ['Summer 2023. Mumbai. Financial evaluations, market analysis, deal sourcing.', 'On the last day, DC Advisory makes you an offer.']);
      var pick = await G.choose('DC Advisory', 'We’d like you back full time. Will you accept our pre-placement offer?', ['Accept the offer', 'Turn it down and do an MBA']);
      if (pick === 0) await G.say('', ['A reasonable choice. In real life, Ranabir turned it down and went to IIM Calcutta for an MBA.', 'It worked out: that MBA led to private credit at Ascertis.']);
      else await G.say('', ['That’s what Ranabir really did. Turning down a sure thing to go after the one he wanted.']);
      finishQuest('dc', 'cfa');
      G.toast('New quest: ' + byId.cfa.title, 'quest');
    }, [1, 0]);

    storyNPC('judge', 'kalidas', 'Judge, CFA Research Challenge', { skin: '#d9a274', hair: '#3b2a1e', shirt: '#2f3b52', pants: '#22283a', hairLong: true }, async function () {
      if (st.done.indexOf('cfa') >= 0) return G.say('Judge', ['Good luck at the Asia Pacific round. You earned it.']);
      if (st.quest !== 'cfa') return G.say('Judge', ['The Research Challenge finals are later in the year.']);
      await G.say('Judge, CFA Research Challenge', [
        'Final team. You have twenty minutes to present your equity research report, then Q&A.',
        '...',
        'Clear thesis, honest risks, a valuation that holds up. The panel has decided.',
        'National champions. You’ll represent India at the Asia Pacific round.'
      ]);
      G.give('trophy', 'CFA Research Challenge trophy', 'National champions. Represented India at Asia Pacific.');
      finishQuest('cfa', 'convo');
      G.toast('New quest: ' + byId.convo.title, 'quest');
    }, [0, 1]);

    storyNPC('director', 'main_building', 'Convocation', { skin: '#c49067', hair: '#cfcfcf', shirt: '#6b2a3a', pants: '#2a2a2a' }, async function () {
      if (st.quest !== 'convo') return G.say('Convocation', ['The convocation hall is being set up.']);
      await G.say('Convocation', [
        'Ranabir Basu. Dual degree: B.Tech in Mining Engineering, M.Tech in Financial Engineering. CGPA 8.4.',
        'Five years, one pandemic, four internships and a trophy later: you’re a KGPian for life.'
      ]);
      G.give('degree', 'Dual degree certificate', 'IIT Kharagpur, 2019 to 2024.');
      finishQuest('convo');
      G.banner('Chapter 1 complete', 'Kharagpur, 2019 to 2024');
      await G.say('', [
        'Next stop: Joka. IIM Calcutta, then private credit in Mumbai. Those chapters are still being built.',
        'Until then, KGP is yours. Ride the 2.2, find every campus sign, and see the campus at night.'
      ]);
      startQuest('free');
    }, [3, 0]);
  }

  async function lockdown() {
    G.banner('March 2020', 'Lockdown. The campus empties.');
    await G.say('', [
      'March 2020. The world shuts down. Classes move to laptops in bedrooms across the country.',
      'Eighteen months later, you’re finally back on campus.'
    ]);
    G.banner('Back on campus', 'September 2021');
    await G.say('', ['You’ve walked past Hijli a hundred times without stopping. Time to see what it was.']);
    startQuest('hijli');
  }

  function setupHijli() {
    var at = spotFor('nehru_museum');
    if (!at) return;
    G.addZone({ id: 'z-hijli', at: at, r: 2, onEnter: async function () {
      if (st.quest !== 'hijli') return;
      await G.say('Hijli Shaheed Bhavan', [
        'Before it was a museum, this was the Hijli Detention Camp, set up by the British in 1930 to hold freedom fighters without trial.',
        'On 16 September 1931 the police opened fire on unarmed detainees. Santosh Kumar Mitra and Tarakeswar Sengupta were killed. Subhas Chandra Bose came to Hijli to collect their bodies.',
        'The camp closed for good in 1942. In August 1951 India’s first IIT began its first session in these same rooms: 224 students and 42 teachers.',
        'At the first convocation in 1956, Nehru said: “Here in the place of that Hijli Detention Camp stands the fine monument of India, representing India’s urges, India’s future in the making.”'
      ]);
      G.give('hijli', 'The Hijli story', 'A prison that became India’s first IIT.');
      finishQuest('hijli');
      await G.say('', ['Spring 2022. Internship season. Check the post office.']);
      startQuest('crawler');
    } });
  }

  function spawnJudgements() {
    var c = spotFor('central_library') || spotFor('main_building');
    var placed = 0, tries = 0;
    while (placed < 6 && tries < 400) {
      tries++;
      var a = (tries * 2.39996) % (Math.PI * 2), r = 4 + (tries % 7) * 1.7;
      var p = { x: Math.round(c.x + Math.cos(a) * r), y: Math.round(c.y + Math.sin(a) * r) };
      var t = G.tileAt(p.x, p.y);
      if (G.solidAt(p.x, p.y) || (t !== G.T.ROAD && t !== G.T.PATH && t !== G.T.GRASS && t !== G.T.PARK)) continue;
      var id = 'judgement-' + placed;
      if (st.flags[id]) { placed++; continue; }
      (function (id) {
        G.addItem({ id: id, at: p, onPickup: function () { st.flags[id] = true; collected(); } });
      })(id);
      placed++;
    }
  }

  async function collected() {
    var n = 0;
    for (var i = 0; i < 6; i++) if (st.flags['judgement-' + i]) n++;
    if (n < 6) { G.toast('Judgement collected (' + n + '/6)'); G.setObjective('Collect judgements around the library (' + n + '/6)', spotFor('central_library')); return; }
    await G.say('', [
      'Six judgements in. The crawler works.',
      'Next, a sentiment analysis pipeline to read the text of each judgement, then the regressions.'
    ]);
    G.give('crawler', 'Web crawler', 'Built for IIM Bangalore: crawls court judgements and scores their sentiment.');
    finishQuest('crawler');
    await G.say('', ['Summer 2022: Snapdeal, product and user growth. Winter 2022: Venwiz, strategy.', 'And then, in spring 2023, a letter from Mumbai.']);
    startQuest('dc');
  }

  /* ---------- Setup and start ---------- */

  var setupDone = false;
  function setup() {
    if (setupDone) return;
    setupDone = true;

    // Landmarks that are red brick in real life.
    ['main_building', 'nehru_museum'].forEach(function (k) { var l = L(k); if (l && l.bid) G.setLook(l.bid, 'brick'); });

    // Signs stand beside the door, not in it.
    Object.keys(SIGNS).forEach(function (k) {
      var l = L(k);
      if (!l) return;
      var at = G.walkableNear({ x: l.x - 1, y: l.y });
      if (at.x === l.x && at.y === l.y) at = G.walkableNear({ x: l.x + 1, y: l.y });
      G.addSign({ id: k, at: at, title: SIGNS[k][0], pages: SIGNS[k][1] });
    });

    // Students and cyclists going about their day.
    G.roadTiles(70, 3).forEach(function (p, i) {
      var bike = i % 4 === 0;
      var n = G.addNPC({ id: 'student-' + i, at: p, name: NAMES[i % NAMES.length], wander: true, bike: bike, look: G.randomLook(i * 13 + 5), onTalk: function (self) { return chatter(self); } });
      n.seed = i;
    });

    setupPeople();
    setupHijli();
  }

  function start(fromSave) {
    setup();
    if (fromSave && st.quest) {
      if (st.flags.hasBike === undefined) st.flags.hasBike = false;
      if (st.quest === 'crawler' && st.flags.letterIIMB) spawnJudgements();
      startQuest(st.quest, true);
      if (st.quest === 'crawler' && st.flags.letterIIMB) collectedCount();
      return;
    }
    // New game: arrive at Puri Gate with your parents.
    var gate = spotFor('puri_gate');
    G.teleport(gate);
    G.setTime(9 * 60);
    G.player.dir = 'down';
    var ma = G.walkableNear({ x: gate.x - 1, y: gate.y + 1 }), baba = G.walkableNear({ x: gate.x + 1, y: gate.y + 1 });
    people.ma = G.addNPC({ id: 'ma', at: ma, name: 'Ma', dir: 'up', look: { skin: '#c68a5a', hair: '#1b1512', shirt: '#c0392b', pants: '#c0392b', hairLong: true }, onTalk: function () { return G.say('Ma', ['Eat properly. Call every Sunday. And don’t cycle in the rain without a raincoat.']); } });
    people.baba = G.addNPC({ id: 'baba', at: baba, name: 'Baba', dir: 'up', look: { skin: '#b07a4f', hair: '#4a4a4a', shirt: '#e8e0c8', pants: '#5b4a3a' }, onTalk: function () { return G.say('Baba', ['First IIT in the country. Make it count, shona.']); } });
    st.quest = null;
    G.banner('Chapter 1', 'Kharagpur, July 2019');
    G.setDate('Jul 2019');
    setTimeout(async function () {
      await G.say('', [
        'July 2019. After a night on the train, you’re standing at Puri Gate, IIT Kharagpur.',
        window.matchMedia('(pointer: coarse)').matches
          ? 'Drag anywhere on the left to walk. Tap A to talk and read signs, B to ride once you have a cycle. Map and Journal are up top.'
          : 'Arrow keys or WASD to move. Space or Enter to talk and read signs. M for the map, J for your journal.'
      ]);
      startQuest('day1');
    }, 1400);
  }

  function collectedCount() {
    var n = 0;
    for (var i = 0; i < 6; i++) if (st.flags['judgement-' + i]) n++;
    G.setObjective('Collect judgements around the library (' + n + '/6)', spotFor('central_library'));
  }

  G.story = { setup: setup, start: start };
  G.journal = function (s) {
    return {
      quests: QUESTS.filter(function (q) { return s.done.indexOf(q.id) >= 0 || s.quest === q.id; })
        .map(function (q) { return { title: q.title, done: s.done.indexOf(q.id) >= 0 }; }),
      items: s.items
    };
  };
})();
