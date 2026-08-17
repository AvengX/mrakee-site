/* ================================================================
   CLIENT CONTENT — MRAKEE TECHNOLOGIES
   Source: "MRAKEE TECHNOLOGIES - Edit 1.docx" (client-supplied).

   Everything in this file is the client's own words. Where the document
   gave a name with no description, the name is all that appears —
   nothing here is written to fill a gap.

   Note on what this replaced: the site previously carried the product
   range, industries, head-office details and headline statistics of an
   acquired APAC digital-signage business. None of that is in the
   client's document, and the statistics in particular belonged to
   another company, so they are gone rather than re-homed.

   STILL MISSING, flagged rather than invented:
     · phone, email and postal address — the document has
       "+91 XXXXX XXXXX", "info@yourMRAKEE Technologies.com" and
       "[Company Address]", all placeholders
     · social URLs for LinkedIn / Instagram / YouTube
     · a Projects section — listed in the footer's quick links but no
       project content was supplied
   ================================================================ */

export const HERO = {
  eyebrow: "AV Systems Integration",
  tagline: "Design. Integrate. Connect. Perform.",
  strap: "Re-engineering the way technology connects the future.",
  intro:
    "An AV Systems Integration business creating the road map for smart, reliable, scalable technology solutions — for modern workplaces, educational institutions, secure government facilities, hospitality, critical command centres and large enterprise environments.",
};

export const ABOUT = {
  title: "Re-imagining the way that Technology connects People and endless Possibilities.",
  lede: "At MRAKEE TECHNOLOGIES, our belief is making technology seamless, secure and simple.",
  body: [
    "Our team specialises in designing and integrating AV Systems that help businesses deliver their technology needs. Ensuring that the solutions simplify and captivate users with engaging experiences.",
    "Specialising in a wide range of solutions, our team will manage the complete AV journey. From Concept, Design, Installation, After Care, Training and On-going support. Each requirement is managed by experts who bring technical and market knowledge to ensure the success of your business goals.",
    "Bridging the gap of reliable performance today with proactive planning for tomorrow.",
  ],
};

export const APPROACH = [
  { t: "Listen", d: "We begin by listening and understanding your vision, objectives, users and operational requirements." },
  { t: "Create", d: "Our engineers develop solutions that balance performance, usability, aesthetics and budget." },
  { t: "Integrate", d: "We bring multiple technologies together into one coordinated and intuitive environment." },
  { t: "Deploy", d: "Our project teams manage installation, configuration, testing and commissioning with attention to detail." },
  { t: "MRAKEE Care", d: "Where we continue to be your technology partner, to provide proactive support and maintenance." },
];

/* The nine solution portfolios. `img` is the closest existing photograph
   on the site; most were shot for digital signage and do not show a
   boardroom, a classroom or a control room. See
   film-src/AV_SOLUTION_PROMPTS.md — six of the nine need new images. */
export const SOLUTIONS = [
  {
    t: "Seamless Communication & Video Conferencing",
    quote: "Meetings made easy.",
    img: "solutions/13.jpg",
    fallback: "solutions/13.jpg",
    points: ["Video conferencing systems", "Conference room AV", "Wireless presentation", "Room scheduling", "Professional microphones and speakers", "Camera systems", "Collaboration platforms", "Room control and automation", "Connectivity beyond a room"],
  },
  {
    t: "Corporate Meeting & Board Rooms",
    quote: "Where minds align and creativity is born.",
    img: "solutions/13.jpg",
    fallback: "solutions/13.jpg",
    points: ["Displays and interactive screens", "Video conferencing", "Digital presentation systems", "Ceiling and table microphones", "Professional audio", "Automated room control", "Wireless collaboration", "Lighting integration"],
  },
  {
    t: "Smart Classrooms & Learning Spaces",
    quote: "Where Knowledge is given wings.",
    img: "solutions/02.jpg",
    fallback: "solutions/02.jpg",
    points: ["Interactive displays", "Projectors and projection systems", "Digital podiums", "Classroom audio", "Wireless presentation", "Lecture capture", "Video conferencing", "Content distribution", "Centralized control"],
  },
  {
    t: "Command & Control Rooms",
    quote: "Information is Key, delivering reliability during critical situations.",
    img: "solutions/03.jpg",
    fallback: "solutions/03.jpg",
    points: ["Video walls", "Operator workstations", "Centralized AV control", "Signal distribution", "Monitoring systems", "Large-format displays", "Collaboration systems", "Control room audio", "24/7 operational support"],
  },
  {
    t: "Experience Centres",
    quote: "Stepping into the realm of Possibilities.",
    img: "solutions/03.jpg",
    fallback: "solutions/03.jpg",
    points: ["Interactive displays", "Video walls", "Immersive projection", "Touch interfaces", "Digital content systems", "Professional audio", "Lighting integration", "Interactive demonstrations", "Centralized control"],
  },
  {
    t: "Digital Signage",
    quote: "Capturing Media Magic.",
    img: "solutions/15.jpg",
    fallback: "solutions/15.jpg",
    d: "Deliver the right message to the right audience at the right time. Digital signage for corporate offices, retail environments, campuses, hospitals, hospitality spaces, transportation facilities and public areas — from display hardware to content distribution and centralized management, built for continuous operation.",
    points: [],
  },
  {
    t: "Video Walls & Large Displays",
    quote: "Make information impossible to miss.",
    img: "solutions/03.jpg",
    fallback: "solutions/03.jpg",
    d: "We design and deploy high-performance display environments, helping select the right display technology, configuration and processing architecture for each application.",
    points: ["Command centres", "Corporate lobbies", "Experience centres", "Retail environments", "Control rooms", "Auditoriums", "Large venues", "Monitoring applications"],
  },
  {
    t: "Large Venue & Auditorium AV",
    quote: "Deliver exceptional experiences to large audiences.",
    img: "solutions/12.jpg",
    fallback: "solutions/12.jpg",
    d: "Integrated AV for auditoriums, conference halls, training centres, event spaces and multipurpose venues.",
    points: ["Large-format projection", "LED displays", "Professional sound systems", "Stage audio", "Microphone systems", "Video processing", "Streaming and recording", "Digital control systems", "Lighting integration"],
  },
  {
    t: "Hospitality AV",
    quote: "Technology that complements the guest experience.",
    img: "solutions/09.jpg",
    fallback: "solutions/09.jpg",
    d: "AV environments for hotels, restaurants, conference facilities, lounges, banquet halls and other hospitality spaces — combining performance, aesthetics and ease of operation.",
    points: [],
  },
];

/* Eight industries. The document gives names only, so the showcase
   shows names only. */
export const INDUSTRIES = [
  { t: "Corporate Solutions", short: "Corporate", img: "industries/01.jpg", fallback: "solutions/13.jpg" },
  { t: "Education", short: "Education", img: "industries/02.jpg", fallback: "solutions/02.jpg" },
  { t: "Government", short: "Government", img: "industries/03.jpg", fallback: "solutions/07.jpg" },
  { t: "Healthcare", short: "Healthcare", img: "industries/04.jpg", fallback: "solutions/08.jpg" },
  { t: "Hospitality", short: "Hospitality", img: "industries/05.jpg", fallback: "solutions/09.jpg" },
  { t: "Retail", short: "Retail", img: "industries/06.jpg", fallback: "solutions/10.jpg" },
  { t: "Banking & Financial Institutions", short: "Banking", img: "industries/07.jpg", fallback: "solutions/12.jpg" },
  { t: "Warehouse & Manufacturing", short: "Warehouse", img: "industries/08.jpg", fallback: "solutions/14.jpg" },
];

export const WHY = [
  { t: "Technical Transformation", d: "Each requirement is evaluated both technically and user friendly. Creating solutions designed for real-world use." },
  { t: "End to End Capability", d: "One team to assist customers from concept to deployment." },
  { t: "Technology Agnostic", d: "Understanding requirements to successfully recommending the right solution." },
  { t: "Intentional Design", d: "Technology should feel natural — we place importance on intuitive interfaces and user experiences." },
  { t: "Scalable Solutions", d: "We are in it for the long haul. Designs which grow as the customer grows." },
  { t: "Reliable, Seamless Execution", d: "Planning successfully means successful project outcomes." },
];

/* The five-stage matrix. Note this covers much the same ground as
   APPROACH above — both are in the client's document, described twice. */
export const EXPERTISE = [
  { t: "Begin with Questions", d: "Our experts evaluate your current set up, objectives, infrastructure and set goals." },
  { t: "Engineering", d: "Our engineering experts then work the magic of bridging concept to detailed AV designs." },
  { t: "Project Delivery", d: "Our project team work with the customer to manage procurement, scheduling, installing, stakeholder management, testing and ensuring successful timely completion." },
  { t: "Training", d: "Our training team will share user and administrator testing which will allow customers to confidently operate the new solutions." },
  { t: "MRAKEE After Care", d: "An after care team is assigned to ensure that maintenance and support are managed." },
];

export const EXPERTS = {
  title: "One Team, One Goal, One Seamless AV experience.",
  body: [
    "MRAKEE TECHNOLOGIES invests in having the best minds in the business. This allows our customers to feel confident that who they interact with have the technical, operational and market knowledge and experience to help with their requirements.",
    "Collaborative, approachable and professional are the pillars of the teams that will support your business needs.",
  ],
};

/* Flagged by the client's reviewer: "Blog Categories - Unsure what this
   is for but I didnt make any changes." Carried through as written. */
export const INSIGHTS = {
  title: "Know what's happening within the Technology.",
  lede: "Shaping modern technology today and beyond.",
  items: [
    { t: "AV Technology", d: "Understand emerging technologies and how they can improve your environment." },
    { t: "Workplace Collaboration", d: "Explore new approaches to hybrid work, meetings and communication." },
    { t: "Smart Spaces", d: "Discover how AV, automation and connected technologies are transforming physical spaces." },
    { t: "Industry Insights", d: "Practical perspectives on technology adoption across industries." },
    { t: "Project Stories", d: "Explore the challenges, solutions and outcomes behind our projects." },
  ],
};

/* Also flagged by the reviewer: "Again FAQ - unsure who designed these,
   but I have not made any changes." */
export const FAQ = [
  { q: "What does MRAKEE TECHNOLOGIES do?", a: "MRAKEE TECHNOLOGIES designs, supplies, integrates and supports professional audio-visual technology for organizations across corporate, education, government, hospitality and other sectors." },
  { q: "Can MRAKEE TECHNOLOGIES upgrade an existing AV system?", a: "Yes. We can assess existing infrastructure and recommend upgrades, replacements or improvements based on your requirements and available infrastructure." },
  { q: "Do you provide complete turnkey AV solutions?", a: "Yes. Our services can cover consultation, design, equipment supply, installation, integration, programming, commissioning, training and ongoing support." },
  { q: "Can you integrate different brands and technologies?", a: "Yes. We design technology environments based on functionality and compatibility, allowing different systems to work together as one solution." },
  { q: "Do you provide maintenance after installation?", a: "Yes. We offer support and maintenance services designed to keep AV environments operational and minimize downtime." },
  { q: "Can you design AV solutions for new buildings?", a: "Yes. Early involvement allows our team to coordinate AV requirements with architecture, electrical systems, networking, acoustics and other building infrastructure." },
];

export const FOOTER = {
  strap: "Intelligent Audio-Visual Solutions. Seamlessly Integrated.",
  disciplines: [
    "Audio-Visual Systems Integration", "Collaboration", "Digital Signage",
    "Smart Spaces", "Command Centers", "Learning Spaces", "Large Venues",
  ],
  // LinkedIn / Instagram / YouTube are named in the document but no URLs
  // were supplied, so they are not rendered as links here.
  social: ["LinkedIn", "Instagram", "YouTube"],
};
