/* ================================================================
   CLIENT CONTENT — MRAKEE TECHNOLOGIES
   Source: "MRAKEE TECHNOLOGIES - Final Version.docx" (client-supplied,
   received 2026-08-22). Supersedes "Edit 1".

   Everything in this file is the client's own words. Where the document
   gave a name with no description, the name is all that appears —
   nothing here is written to fill a gap.

   THE "AV" QUESTION, twice reversed. An earlier instruction removed the
   abbreviation from every visible string on the site. Edit 4 puts it
   back, and not in passing: it says "AV" about fifteen times, in the
   opening sentence, the approach, the bullets, the FAQ and the closing
   line. That is deliberate, and it is the newer document, so the site
   says AV again.

   Four of those needed a word rather than a gap when it was removed,
   and they are back to the original phrasing now:

     Conference room systems            -> Conference room AV
     brings together technology         -> brings together AV Technology
     coordinate technology requirements -> coordinate AV requirements
     a Systems Integration business     -> an AV Systems Integration business

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

   OFFICIAL CONTACT DETAILS:
     · Phone: 9319015591, 9319119008
     · Email: Sales@mrakeetechnologies.com, Info@mrakeetechnologies.com
   STILL MISSING:
     · postal address — [Company Address]
     · social URLs for LinkedIn / Instagram / YouTube
     · a Projects section — in the footer quick links, but no project
       content was supplied
    ================================================================ */

export const HERO = {
  eyebrow: "AV Systems Integration",
  headline: "Integration made Simple",
  strap: "Engineering the way technology connects the future.",
  tagline: "Design. Integrate. Connect. Perform.",
  intro: [
    "MRakee Technologies is a technology systems integration company that creates the roadmap for delivering smart, reliable, scalable technology solutions for businesses looking to redefine their infrastructure. Our expertise spans solutions for modern workplaces, educational institutions, government facilities, hospitality venues, critical command centres, and large enterprise environments.",
    "MRakee Technologies brings together audio-visual technology, AI solutions, engineering expertise, and intentional design to create spaces that are intuitive to use, powerful in performance, and built to scale with your business.",
  ],
};

export const ABOUT = {
  question: "What is MRakee Technologies?",
  directAnswer: "MRakee Technologies is a systems integration company that designs, integrates, and deploys enterprise AI solutions, digital signage, and smart kiosks. We deliver smart, reliable, scalable technology solutions for modern corporate workplaces, educational institutions, government facilities, hospitality venues, command centres, and commercial environments.",
  title: "Displaying the way Technology connects People and endless Possibilities.",
  lede: "At MRakee Technologies, our belief is making technology seamless, secure and simple.",
  body: [
    "Our team specialises in designing and integrating systems that help businesses deliver their technology needs, ensuring solutions simplify operations and captivate users with engaging experiences.",
    "Specialising in end-to-end integration, our team manages the complete technology journey: from concept, engineering design, and installation to operator training and ongoing MRAKEE Care support. Each requirement is guided by specialists who bring technical and market expertise to ensure the success of your business goals.",
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

/* The nine solution portfolios with contextual links to dedicated service pages. */
export const SOLUTIONS = [
  {
    t: "Seamless Communication & Video Conferencing",
    quote: "Connectivity beyond a room…",
    img: "solutions/13.jpg",
    fallback: "solutions/13.jpg",
    link: "/ai-solutions/",
    linkLabel: "Explore AI & Collaboration Solutions",
    points: ["Video conferencing systems", "Conference room AV", "Wireless presentation", "Room scheduling", "Professional microphones and speakers", "Camera systems", "Collaboration platforms", "Room control and automation"],
  },
  {
    t: "Corporate Meeting & Board Rooms",
    quote: "Where minds align and creativity is born",
    img: "solutions/13.jpg",
    fallback: "solutions/13.jpg",
    link: "/ai-solutions/",
    linkLabel: "Explore Meeting Room Solutions",
    points: ["Displays and interactive screens", "Video conferencing", "Digital presentation systems", "Ceiling and table microphones", "Professional audio", "Automated room control", "Wireless collaboration", "Lighting integration"],
  },
  {
    t: "Smart Classrooms & Learning Spaces",
    quote: "Wisdom is shared",
    img: "solutions/02.jpg",
    fallback: "solutions/02.jpg",
    points: ["Interactive displays", "Projectors and projection systems", "Digital podiums", "Classroom audio", "Wireless presentation", "Lecture capture", "Video conferencing", "Content distribution", "Centralized control"],
  },
  {
    t: "Command & Control Rooms",
    quote: "Information is Key, delivering reliability during critical situations",
    img: "solutions/03.jpg",
    fallback: "solutions/03.jpg",
    link: "/ai-solutions/",
    linkLabel: "Explore Command Room Solutions",
    points: ["Video walls", "Operator workstations", "Centralized AV control", "Signal distribution", "Monitoring systems", "Large-format displays", "Collaboration systems", "Control room audio", "24/7 operational support"],
  },
  {
    t: "Experience Centres",
    quote: "Where seeing is believing",
    img: "solutions/03.jpg",
    fallback: "solutions/03.jpg",
    link: "/ai-solutions/",
    linkLabel: "Explore Experience Centre Solutions",
    points: ["Interactive displays", "Video walls", "Immersive projection", "Touch interfaces", "Digital content systems", "Professional audio", "Lighting integration", "Interactive demonstrations", "Centralized control"],
  },
  {
    t: "Digital Signage",
    quote: "Centrally Managed for Seamless Distribution through the network",
    img: "solutions/15.jpg",
    fallback: "solutions/15.jpg",
    link: "/digital-signage/",
    linkLabel: "Explore Digital Signage Solutions",
    d: "Deliver the right message to the right audience at the right time. MRakee Technologies provides digital signage solutions for corporate offices, retail environments, campuses, hospitals, hospitality spaces, transportation facilities and public areas. From display hardware to content distribution and centralized management, we create signage ecosystems that are easy to manage and built for continuous operation.",
    points: [],
  },
  {
    t: "Video Walls & Large Displays",
    quote: "Visualisation at Large",
    img: "solutions/03.jpg",
    fallback: "solutions/03.jpg",
    link: "/digital-signage/",
    linkLabel: "Explore Video Wall Solutions",
    points: ["Command centres", "Corporate lobbies", "Experience centres", "Retail environments", "Control rooms", "Auditoriums", "Large venues", "Monitoring applications"],
  },
  {
    t: "Large Venue & Auditorium",
    quote: "Showcasing the Big Message",
    img: "solutions/12.jpg",
    fallback: "solutions/12.jpg",
    points: ["Large-format projection", "LED displays", "Professional sound systems", "Stage audio", "Microphone systems", "Video processing", "Streaming and recording", "Digital control systems", "Lighting integration"],
  },
  {
    t: "Hospitality",
    quote: "Smart Hospitality..Smart Guest Experience",
    img: "solutions/09.jpg",
    fallback: "solutions/09.jpg",
    link: "/smart-kiosks/",
    linkLabel: "Explore Smart Kiosks & Concierge",
    points: ["Digital Signage", "Smart Kiosks & Self-Check In", "Large Event Spaces", "Workspace Management", "Virtual Concierge"],
  },
];

/* Nine industries. The document gives names only, so the showcase shows
   names only. Infrastructure was added in Edit 4; there is no
   photograph for it yet, so it falls back like the other eight. */
export const INDUSTRIES = [
  { t: "Corporate Solutions", short: "Corporate", img: "industries/01.jpg", fallback: "solutions/13.jpg" },
  { t: "Education", short: "Education", img: "industries/02.jpg", fallback: "solutions/02.jpg" },
  { t: "Government", short: "Government", img: "industries/03.jpg", fallback: "solutions/07.jpg" },
  { t: "Healthcare", short: "Healthcare", img: "industries/04.jpg", fallback: "solutions/08.jpg" },
  { t: "Hospitality", short: "Hospitality", img: "industries/05.jpg", fallback: "solutions/09.jpg" },
  { t: "Retail", short: "Retail", img: "industries/06.jpg", fallback: "solutions/10.jpg" },
  { t: "Banking & Financial Institutions", short: "Banking", img: "industries/07.jpg", fallback: "solutions/12.jpg" },
  { t: "Warehouse & Manufacturing", short: "Warehouse", img: "industries/08.jpg", fallback: "solutions/14.jpg" },
  { t: "Infrastructure", short: "Infrastructure", img: "industries/09.jpg", fallback: "solutions/16.jpg" },
];

export const WHY = [
  { t: "Technical Transformation", d: "Each requirement is evaluated both technically and user friendly. Creating Solutions designed for real-world use." },
  { t: "End to End Capability", d: "One Team to assist customers from Concept to Deployment." },
  { t: "Technology Agnostic", d: "Understanding requirements to successfully recommending the right solution." },
  { t: "Intentional Design", d: "Technology should feel natural where we place importance on intuitive interfaces and user experiences." },
  { t: "Scalable Solutions", d: "We are in it for the long haul, Designs which grow as the customer grows." },
  { t: "Reliable, Seamless Execution", d: "Planning successfully means Successful Project outcomes." },
];

/* The five-stage matrix. */
export const EXPERTISE = [
  { t: "Begin with Questions", d: "Where our experts evaluate your current set up, objectives, infrastructure and set goals." },
  { t: "Engineering", d: "Our Engineering experts then work the magic of bridging concept to detailed AV Designs." },
  { t: "Project Delivery", d: "Then our Project Team work with the customer to manage procurement, scheduling, installing, stakeholder management, testing and ensuring successful timely completion." },
  { t: "Training", d: "Our Training Team will share customers with user and administrator testing which will allow the customers to confidently operate the new solutions." },
  { t: "MRAKEE After Care", d: "MRAKEE After Care team will be assigned to ensure that maintenance and support are managed." },
];

export const EXPERTS = {
  title: "One Team, One Goal, One Seamless Experience.",
  body: [
    "MRakee Technologies invests in having the best minds in the business. This allows our customers to feel confident that who they interact with, have the technical, operational and market knowledge and experience to help with their requirements.",
    "Collaborative, approachable and professional are the pillars of the teams that will support your business needs.",
  ],
};

export const INSIGHTS = {
  title: "Know what is happening within the Technology.",
  lede: "Shaping modern technology today and beyond.",
  items: [
    { t: "AV Technology", d: "Understand emerging technologies and how they can improve your environment." },
    { t: "Workplace Collaboration", d: "Explore new approaches to hybrid work, meetings and communication." },
    { t: "Smart Spaces", d: "Discover how AV, automation and connected technologies are transforming physical spaces." },
    { t: "Industry Insights", d: "Practical perspectives on technology adoption across industries." },
    { t: "Project Stories", d: "Explore the challenges, solutions and outcomes behind our projects." },
  ],
};

export const FAQ = [
  {
    q: "What does MRakee Technologies do?",
    a: "MRakee Technologies is a systems integration company that designs, supplies, integrates, and supports enterprise technology solutions, including AI solutions, smart digital signage, interactive kiosks, and audio-visual systems across corporate, education, government, hospitality, and commercial sectors."
  },
  {
    q: "What technology solutions does MRakee Technologies provide?",
    a: "MRakee Technologies provides enterprise AI solutions, centrally managed digital signage networks, smart kiosks and virtual concierge systems, boardroom video conferencing, command centre displays, interactive experience centres, and custom systems integration."
  },
  {
    q: "Can MRakee Technologies upgrade an existing technology system?",
    a: "Yes. We assess existing infrastructure and recommend targeted upgrades, replacements, or improvements based on operational requirements and existing facility investments."
  },
  {
    q: "Do you provide complete turnkey integration solutions?",
    a: "Yes. Our services cover consultation, engineering design, equipment procurement, installation, system integration, programming, testing, staff training, and ongoing support."
  },
  {
    q: "Can you integrate different brands and technologies?",
    a: "Yes. We design technology environments based on functionality and compatibility, allowing multi-vendor hardware and software systems to work together as one coordinated solution."
  },
  {
    q: "Do you provide maintenance and ongoing support after installation?",
    a: "Yes. Through MRAKEE Care, we offer proactive maintenance and ongoing support services designed to keep technology environments operational and minimize downtime."
  },
  {
    q: "Can you design technology solutions for new buildings and fit-outs?",
    a: "Yes. Early involvement allows our engineering team to coordinate technology requirements with architecture, electrical systems, networking, acoustics, and other building infrastructure."
  },
];

export const FOOTER = {
  strap: "Intelligent Audio-Visual Solutions. Seamlessly Integrated.",
  disciplines: [
    { label: "AI Solutions", href: "/ai-solutions/" },
    { label: "Digital Signage", href: "/digital-signage/" },
    { label: "Smart Kiosks", href: "/smart-kiosks/" },
    { label: "Airport Digital Signage", href: "/airport-digital-signage/" },
    { label: "AI Chatbot Solutions", href: "/ai-chatbot-solutions/" },
    { label: "Audio-Visual Systems Integration" },
    { label: "Collaboration" },
    { label: "Smart Spaces" },
    { label: "Command Centres" },
    { label: "Learning Spaces" },
    { label: "Large Venues" },
  ],
  social: ["LinkedIn", "Instagram", "YouTube"],
};

export const CONTACT = {
  phones: [
    { label: "Phone", value: "9319015591", href: "tel:9319015591" },
    { label: "Phone", value: "9319119008", href: "tel:9319119008" },
  ],
  emails: [
    { label: "Email", value: "Info@mrakeetechnologies.com", href: "mailto:Info@mrakeetechnologies.com", wide: true },
    { label: "Email", value: "Sales@mrakeetechnologies.com", href: "mailto:Sales@mrakeetechnologies.com", wide: true },
  ],
};
