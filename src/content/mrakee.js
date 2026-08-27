/* ================================================================
   CLIENT CONTENT — MRAKEE TECHNOLOGIES
   Source: "MRAKEE TECHNOLOGIES - Final Version.docx" (client-supplied,
   received 2026-08-22). Supersedes "Edit 1".

   Everything in this file is the client's own words. Where the document
   gave a name with no description, the name is all that appears —
   nothing here is written to fill a gap.

   ONE EXCEPTION, on the client's later instruction: the abbreviation
   "AV" has been removed from every visible string on the site. Mostly
   that is a deletion ("AV Systems Integration" -> "Systems
   Integration"), but four places needed a word rather than a gap, since
   removing the noun left the phrase pointing at nothing:

     Conference room AV          -> Conference room systems
     brings together AV Technology -> brings together technology
     coordinate AV requirements  -> coordinate technology requirements
     an AV Systems Integration business -> a Systems Integration business

   The last of those changes the article as well; "an" before "AV" is
   pronounced, not spelled.

   The two quotations of the source document below still say AV, and
   should: they record what the client's Final Version actually
   contained, and editing a record of what a document said would make it
   a false one.

   WHAT CHANGED FROM EDIT 1, so it can be checked against the document:
     · a new hero headline, "AV Integration made Simple", and a second
       intro paragraph
     · seven of the nine solution portfolios have a new line in quotes
     · "Connectivity beyond a room" was a bullet under Seamless
       Communication and is now that portfolio's quoted line, so it is
       no longer also in its list
     · Video Walls and Large Venue lost their descriptions; Hospitality
       AV lost its description and gained five bullets
     · the Our Expertise matrix is reworded
     · two of the six Why reasons are reworded

   ONE LINE DELIBERATELY NOT CARRIED: under Digital Signage the document
   has "Digital Signage solutions for your space.. centrally managed for
   seamless distribution..", which restates the quoted line directly
   above it. Set back-to-back on a card the two read as a stutter. Say
   the word and it goes back in.

   STILL MISSING, flagged rather than invented:
     · phone, email and postal address — the final document still has
       "+91 XXXXX XXXXX", "info@yourMRAKEE Technologies.com" and
       "[Company Address]", all placeholders
     · social URLs for LinkedIn / Instagram / YouTube
     · a Projects section — in the footer quick links, but no project
       content was supplied
   ================================================================ */

export const HERO = {
  eyebrow: "Systems Integration",
  headline: "Integration made Simple",
  strap: "Re-engineering the way technology connects the future.",
  tagline: "Design. Integrate. Connect. Perform.",
  intro: [
    "MRAKEE TECHNOLOGIES is a Systems Integration business that creates the road map for delivering smart, reliable, scalable technology solutions for business that are looking to redefine their technology. Expertise that range for solutions to support modern workplaces, educational institutions, secure government facilities, hospitality, critical command centres and large enterprise environments.",
    "MRAKEE Technologies brings together technology, leading engineering expertise, revolutionary and intentional design to create spaces that are intuitive to use. Powerful in performance and built to scale with your business. Where growth is built together.",
  ],
};

export const ABOUT = {
  title: "Re-imagining the way that Technology connects People and endless Possibilities.",
  lede: "At MRAKEE TECHNOLOGIES, our belief is making technology seamless, secure and simple.",
  body: [
    "Our team specialises in designing and integrating systems that help businesses deliver their technology needs. Ensuring that the solutions simplify and captivate users with engaging experiences.",
    "Specialising in a wide range of solutions, our team will manage the complete journey. From Concept, Design, Installation, After Care, Training and On-going support. Each requirement is managed by experts who bring technical and market knowledge to ensure the success of your business goals.",
    "Bridging the gap of reliable performance today with proactive planning for tomorrow.",
  ],
};

/* Each stage carries the image the About panel shows for it. Only three
   photographs were commissioned for this (the service images), so
   Integrate borrows a solutions frame and Care shares the technician
   with Deploy — both flagged in film-src/AV_SOLUTION_PROMPTS.md as
   worth shooting properly.

   The final document writes the last stage "Mrakee Care"; kept as
   "MRAKEE Care", which is how that same document sets the name
   everywhere else, including "MRAKEE After Care" further down. */
export const APPROACH = [
  { t: "Listen", short: "Listen", img: "services/01.jpg",
    d: "We begin by listening and understanding your vision, objectives, users and operational requirements." },
  { t: "Create", short: "Create", img: "services/02.jpg",
    d: "Our engineers develop solutions that balance performance, usability, aesthetics and budget." },
  { t: "Integrate", short: "Integrate", img: "solutions/13.jpg",
    d: "We bring multiple technologies together into one coordinated and intuitive environment." },
  { t: "Deploy", short: "Deploy", img: "services/03.jpg",
    d: "Our project teams manage installation, configuration, testing and commissioning with attention to detail." },
  { t: "MRAKEE Care", short: "Care", img: "services/03.jpg",
    d: "Where we continue to be your technology partner, to provide proactive support and maintenance." },
];

/* The nine solution portfolios. Each `img` is the closest existing
   photograph on the site; most were shot for digital signage and do not
   show a boardroom, a classroom or a control room. See
   film-src/AV_SOLUTION_PROMPTS.md — six of the nine need new images. */
export const SOLUTIONS = [
  {
    t: "Seamless Communication & Video Conferencing",
    quote: "Connectivity beyond a room…",
    img: "solutions/13.jpg",
    fallback: "solutions/13.jpg",
    points: ["Video conferencing systems", "Conference room systems", "Wireless presentation", "Room scheduling", "Professional microphones and speakers", "Camera systems", "Collaboration platforms", "Room control and automation"],
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
    quote: "Wisdom is shared.",
    img: "solutions/02.jpg",
    fallback: "solutions/02.jpg",
    points: ["Interactive displays", "Projectors and projection systems", "Digital podiums", "Classroom audio", "Wireless presentation", "Lecture capture", "Video conferencing", "Content distribution", "Centralized control"],
  },
  {
    t: "Command & Control Rooms",
    quote: "Information is Key, delivering reliability during critical situations.",
    img: "solutions/03.jpg",
    fallback: "solutions/03.jpg",
    points: ["Video walls", "Operator workstations", "Centralized control", "Signal distribution", "Monitoring systems", "Large-format displays", "Collaboration systems", "Control room audio", "24/7 operational support"],
  },
  {
    t: "Experience Centres",
    quote: "Where seeing is believing.",
    img: "solutions/03.jpg",
    fallback: "solutions/03.jpg",
    points: ["Interactive displays", "Video walls", "Immersive projection", "Touch interfaces", "Digital content systems", "Professional audio", "Lighting integration", "Interactive demonstrations", "Centralized control"],
  },
  {
    t: "Digital Signage",
    quote: "Centrally Managed for Seamless Distribution through the network.",
    img: "solutions/15.jpg",
    fallback: "solutions/15.jpg",
    d: "Deliver the right message to the right audience at the right time. MRAKEE TECHNOLOGIES provides digital signage solutions for corporate offices, retail environments, campuses, hospitals, hospitality spaces, transportation facilities and public areas. From display hardware to content distribution and centralized management, we create signage ecosystems that are easy to manage and built for continuous operation.",
    points: [],
  },
  {
    t: "Video Walls & Large Displays",
    quote: "Visualisation at Large.",
    img: "solutions/03.jpg",
    fallback: "solutions/03.jpg",
    points: ["Command centres", "Corporate lobbies", "Experience centres", "Retail environments", "Control rooms", "Auditoriums", "Large venues", "Monitoring applications"],
  },
  {
    t: "Large Venue & Auditorium",
    quote: "Showcasing the Big Message.",
    img: "solutions/12.jpg",
    fallback: "solutions/12.jpg",
    points: ["Large-format projection", "LED displays", "Professional sound systems", "Stage audio", "Microphone systems", "Video processing", "Streaming and recording", "Digital control systems", "Lighting integration"],
  },
  {
    t: "Hospitality",
    quote: "Smart Hospitality… Smart Guest Experience.",
    img: "solutions/09.jpg",
    fallback: "solutions/09.jpg",
    points: ["Digital Signage", "Large Event Spaces", "Workspace Management", "Virtual Concierge", "Self-Check In"],
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
  { t: "Technical Transformation", d: "Each requirement is evaluated both technically and user friendly. Creating Solutions designed for real-world use." },
  { t: "End to End Capability", d: "One Team to assist customers from Concept to Deployment." },
  { t: "Technology Agnostic", d: "Understanding requirements to successfully recommending the right solution." },
  { t: "Intentional Design", d: "Technology should feel natural where we place importance on intuitive interfaces and user experiences." },
  { t: "Scalable Solutions", d: "We are in it for the long haul, Designs which grow as the customer grows." },
  { t: "Reliable, Seamless Execution", d: "Planning successfully means Successful Project outcomes." },
];

/* The five-stage matrix. The final document runs stages two to five as
   sentences with no heading of their own; the headings below are the
   ones the client gave these same five stages in Edit 1, and each names
   the team its sentence goes on to describe. */
export const EXPERTISE = [
  { t: "Begin with Questions", d: "Where our experts evaluate your current set up, objectives, infrastructure and set goals." },
  { t: "Engineering", d: "Our Engineering experts then work the magic of bridging concept to detailed designs." },
  { t: "Project Delivery", d: "Then our Project Team work with the customer to manage procurement, scheduling, installing, stakeholder management, testing and ensuring successful timely completion." },
  { t: "Training", d: "Our Training Team will share customers with user and administrator testing which will allow the customers to confidently operate the new solutions." },
  { t: "MRAKEE After Care", d: "MRAKEE After Care team will be assigned to ensure that maintenance and support are managed." },
];

export const EXPERTS = {
  title: "One Team, One Goal, One Seamless experience.",
  body: [
    "MRAKEE TECHNOLOGIES invests in having the best minds in the business. This allows our customers to feel confident that who they interact with, have the technical, operational and market knowledge and experience to help with their requirements.",
    "Collaborative, approachable and professional are the pillars of the teams that will support your business needs.",
  ],
};

/* Flagged again by the client reviewer on the final version: "Blog
   Categories - Unsure what this is for but I didnt make any changes."
   Carried through as written. */
export const INSIGHTS = {
  title: "Know what is happening within the Technology.",
  lede: "Shaping modern technology today and beyond.",
  items: [
    { t: "Technology", d: "Understand emerging technologies and how they can improve your environment." },
    { t: "Workplace Collaboration", d: "Explore new approaches to hybrid work, meetings and communication." },
    { t: "Smart Spaces", d: "Discover how automation and connected technologies are transforming physical spaces." },
    { t: "Industry Insights", d: "Practical perspectives on technology adoption across industries." },
    { t: "Project Stories", d: "Explore the challenges, solutions and outcomes behind our projects." },
  ],
};

/* Also flagged again: "Again FAQ - unsure who designed these, but I
   have not made any changes." */
export const FAQ = [
  { q: "What does MRAKEE TECHNOLOGIES do?", a: "MRAKEE TECHNOLOGIES designs, supplies, integrates and supports professional audio-visual technology for organizations across corporate, education, government, hospitality and other sectors." },
  { q: "Can MRAKEE TECHNOLOGIES upgrade an existing system?", a: "Yes. We can assess existing infrastructure and recommend upgrades, replacements or improvements based on your requirements and available infrastructure." },
  { q: "Do you provide complete turnkey solutions?", a: "Yes. Our services can cover consultation, design, equipment supply, installation, integration, programming, commissioning, training and ongoing support." },
  { q: "Can you integrate different brands and technologies?", a: "Yes. We design technology environments based on functionality and compatibility, allowing different systems to work together as one solution." },
  { q: "Do you provide maintenance after installation?", a: "Yes. We offer support and maintenance services designed to keep environments operational and minimize downtime." },
  { q: "Can you design solutions for new buildings?", a: "Yes. Early involvement allows our team to coordinate technology requirements with architecture, electrical systems, networking, acoustics and other building infrastructure." },
];

export const FOOTER = {
  strap: "Intelligent Audio-Visual Solutions. Seamlessly Integrated.",
  disciplines: [
    "Audio-Visual Systems Integration", "Collaboration", "Digital Signage",
    "Smart Spaces", "Command Centres", "Learning Spaces", "Large Venues",
  ],
  // LinkedIn / Instagram / YouTube are named in the document but no URLs
  // were supplied, so they are not rendered as links here.
  social: ["LinkedIn", "Instagram", "YouTube"],
};
