'use strict';

// ============================================================
// WPI COURSE DATA — 2026-2027 Academic Year
// Data sourced from courselistings.wpi.edu prod-data.json
// A/B: Fall 2026  |  C/D: Spring 2027
// Day codes: M=Mon T=Tue W=Wed R=Thu F=Fri
// "M-R" = Mon+Thu, "T-F" = Tue+Fri, "M-T-R-F" = Mon+Tue+Thu+Fri
// ============================================================

const TERM_INFO = {
  A: { id:'A', name:'A Term', fullName:'A Term — Fall 2026',   season:'Fall 2026',   start:'Aug 20, 2026', end:'Oct 9, 2026',   color:'#C0392B', light:'#fdecea' },
  B: { id:'B', name:'B Term', fullName:'B Term — Fall 2026',   season:'Fall 2026',   start:'Oct 19, 2026', end:'Dec 11, 2026',  color:'#D35400', light:'#fdf0e9' },
  C: { id:'C', name:'C Term', fullName:'C Term — Spring 2027', season:'Spring 2027', start:'Jan 13, 2027', end:'Mar 5, 2027',   color:'#1E8449', light:'#eafaf1' },
  D: { id:'D', name:'D Term', fullName:'D Term — Spring 2027', season:'Spring 2027', start:'Mar 15, 2027', end:'May 5, 2027',   color:'#1A5276', light:'#eaf2fb' },
};

const TYPE_META = {
  CS:   { label:'Computer Science',       color:'#2980B9', text:'#fff' },
  DS:   { label:'Data Science',           color:'#27AE60', text:'#fff' },
  INTL: { label:'International Studies',  color:'#8E44AD', text:'#fff' },
  HU:   { label:'Humanities',             color:'#CA6F1E', text:'#fff' },
  EN:   { label:'English',               color:'#D4AC0D', text:'#fff' },
  WPE:  { label:'Physical Education',     color:'#17A589', text:'#fff' },
  IQP:  { label:'IQP',                    color:'#B7950B', text:'#fff' },
  MQP:  { label:'MQP',                    color:'#922B21', text:'#fff' },
};

// ============================================================
// COURSES
// sections[TERM] = array of section objects:
//   { section, professor, days:[], start:'HH:MM', end:'HH:MM',
//     location, enrolled, waitlist,
//     lab: { section, days, start, end, location } }  // CS 3733 only
// IQP/MQP have no fixed meeting time.
// ============================================================
const COURSES = {

  // ── COMPUTER SCIENCE ──────────────────────────────────────
  CS3043: {
    id:'CS3043', code:'CS 3043', type:'CS', credits:1,
    name:'Social Implications of Information Processing',
    description:'Cat. I. Makes students aware of the social, moral, ethical, and philosophical impact of computers on society. Topics include major computer-based applications, human-machine relationships, and the major problems of controlling the use of computers. Students contribute to classroom discussions and complete significant writing assignments. Recommended for juniors and seniors. The Social Science Requirement cannot be satisfied by this course.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A01', professor:'Keith Pray',        days:['T','F'], start:'16:00', end:'17:50', location:'Innovation Studio 203', enrolled:'0/30',  waitlist:'0/15' },
        { section:'A02', professor:'TBD',               days:['T','F'], start:'16:00', end:'17:50', location:'Unity Hall 500',        enrolled:'0/60',  waitlist:'0/10' },
      ],
      B:[
        { section:'B01', professor:'Michelle Rosenberg',days:['T','F'], start:'14:00', end:'15:50', location:'Higgins Labs 114',      enrolled:'0/35',  waitlist:'0/10' },
        { section:'B02', professor:'Robert Krueger',    days:['M','R'], start:'14:00', end:'15:50', location:'Fuller Labs 320',       enrolled:'0/60',  waitlist:'0/10' },
      ],
      C:[
        { section:'C01', professor:'Crystal Brown',     days:['M','R'], start:'16:00', end:'17:50', location:'Innovation Studio 203', enrolled:'0/30',  waitlist:'0/10' },
        { section:'C02', professor:'Michelle Borowski', days:['M','R'], start:'12:00', end:'13:50', location:'Salisbury Labs 411',    enrolled:'0/30',  waitlist:'0/10' },
        { section:'C03', professor:'TBD',               days:['T','F'], start:'14:00', end:'15:50', location:'Olin Hall 109',         enrolled:'0/30',  waitlist:'0/10' },
      ],
      D:[
        { section:'D01', professor:'Keith Pray',        days:['T','F'], start:'16:00', end:'17:50', location:'Salisbury Labs 402',   enrolled:'0/30',  waitlist:'0/10' },
        { section:'D02', professor:'Michelle Borowski', days:['T','F'], start:'14:00', end:'15:50', location:'Unity Hall 405',        enrolled:'0/30',  waitlist:'0/10' },
        { section:'D03', professor:'TBD',               days:['T','F'], start:'12:00', end:'13:50', location:'Innovation Studio 203', enrolled:'0/30',  waitlist:'0/10' },
        { section:'D04', professor:'TBD',               days:['M','R'], start:'10:00', end:'11:50', location:'Fuller Labs 311',       enrolled:'0/30',  waitlist:'0/10' },
      ],
    },
  },

  CS3733: {
    id:'CS3733', code:'CS 3733', type:'CS', credits:1,
    name:'Software Engineering',
    description:'Cat. I. Introduces the fundamental principles of software engineering. Topics include requirements analysis and specification, analysis and design, architecture, implementation, testing and quality, configuration management, and project management. Students complete a project employing studied techniques. This course should be taken before any course requiring a large programming project. Recommended background: CS 2102, CS 2103, or CS 2119.\n\nNote: Each section includes a required weekly Wednesday lab (1–2 hrs). Both the lecture and lab are shown on your calendar.',
    prerequisites:[],
    sections:{
      B:[
        { section:'BL01', professor:'George Heineman', days:['M','T','R','F'], start:'13:00', end:'13:50', location:'Unity Hall 500',
          enrolled:'0/100', waitlist:'0/0',
          lab:{ section:'BX01', days:['W'], start:'13:00', end:'13:50', location:'Unity Hall 500' } },
      ],
      C:[
        { section:'CL01', professor:'Sakire Arslan Ay', days:['M','T','R','F'], start:'14:00', end:'14:50', location:'Unity Hall 400',
          enrolled:'0/80', waitlist:'0/0',
          lab:{ section:'CX01', days:['W'], start:'14:00', end:'15:50', location:'Fuller Labs PHL Perreault Hall' } },
        { section:'CL02', professor:'Sakire Arslan Ay', days:['M','T','R','F'], start:'09:00', end:'09:50', location:'Unity Hall 520',
          enrolled:'0/80', waitlist:'0/20',
          lab:{ section:'CX02', days:['W'], start:'09:00', end:'10:50', location:'Fuller Labs PHL Perreault Hall' } },
      ],
      D:[
        { section:'DL01', professor:'Wilson Wong', days:['M','T','R','F'], start:'11:00', end:'11:50', location:'Unity Hall 400',
          enrolled:'0/75', waitlist:'0/20',
          lab:{ section:'DX01', days:['W'], start:'11:00', end:'12:50', location:'Unity Hall 400' } },
        { section:'DL02', professor:'Wilson Wong', days:['M','T','R','F'], start:'15:00', end:'15:50', location:'Fuller Labs PHL Perreault Hall',
          enrolled:'0/75', waitlist:'0/20',
          lab:{ section:'DX02', days:['W'], start:'15:00', end:'16:50', location:'Fuller Labs PHL Perreault Hall' } },
      ],
    },
  },

  CS4341: {
    id:'CS4341', code:'CS 4341', type:'CS', credits:1,
    name:'Introduction to Artificial Intelligence',
    description:'Cat. I. Studies the problem of making computers act in intelligent ways. Topics include major theories, tools, and applications of AI; knowledge representation; searching and planning; and natural language understanding. Students complete projects requiring search in state spaces and proposing appropriate problem-solving methods. Recommended background: CS 2102 or CS 2103; CS 2223; and CS 3133.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A01', professor:'Ethan Prihar',  days:['M','R'], start:'08:00', end:'09:50', location:'Unity Hall 520',             enrolled:'0/70',  waitlist:'0/20' },
      ],
      B:[
        { section:'B01', professor:'Ethan Prihar',  days:['T','F'], start:'10:00', end:'11:50', location:'Salisbury Labs 305',          enrolled:'0/60',  waitlist:'0/20' },
      ],
      C:[
        { section:'C01', professor:'Dachun Sun',    days:['T','F'], start:'09:00', end:'10:50', location:'Fuller Labs PHL Perreault Hall', enrolled:'0/70', waitlist:'0/10' },
      ],
      D:[
        { section:'D01', professor:'Dachun Sun',    days:['T','F'], start:'12:00', end:'13:50', location:'Goddard Hall 227',            enrolled:'0/64',  waitlist:'0/10' },
      ],
    },
  },

  CS4342: {
    id:'CS4342', code:'CS 4342', type:'CS', credits:1,
    name:'Machine Learning',
    description:'Cat. I. Explores theoretical and practical aspects of machine learning, including algorithms for regression, classification, dimensionality reduction, clustering, and density estimation. Topics include neural networks and deep learning, Bayesian networks, PCA, k-means, decision trees, random forests, SVMs, and kernel methods. Recommended background: Multivariate Calculus, Linear Algebra, Probability (MA 2621 or MA 2631), and Algorithms (CS 2223). Prerequisite: CS 3733 (user constraint).',
    prerequisites:['CS3733'],
    sections:{
      A:[
        { section:'A01', professor:'Kyumin Lee',      days:['M','R'], start:'12:00', end:'13:50', location:'Fuller Labs PHL Perreault Hall', enrolled:'0/70', waitlist:'0/10' },
      ],
      B:[
        { section:'B01', professor:'Jacob Whitehill', days:['T','F'], start:'14:00', end:'15:50', location:'Unity Hall 420',             enrolled:'0/70',  waitlist:'0/10' },
      ],
      C:[
        { section:'C01', professor:'Walter Gerych',   days:['T','F'], start:'14:00', end:'15:50', location:'Washburn 229',               enrolled:'0/70',  waitlist:'0/10' },
      ],
      D:[
        { section:'D01', professor:'Raha Moraffah',   days:['M','T','R','F'], start:'10:00', end:'10:50', location:'Fuller Labs 320',    enrolled:'0/60',  waitlist:'0/5'  },
      ],
    },
  },

  CS4343: {
    id:'CS4343', code:'CS 4343', type:'CS', credits:1,
    name:'Deep Learning',
    description:'Advanced machine learning focusing on deep neural networks. Topics include convolutional neural networks (CNNs), recurrent neural networks (RNNs), LSTMs, transformers, attention mechanisms, generative models (GANs, VAEs, diffusion), transfer learning, and applications in computer vision and NLP. Heavy Python/PyTorch implementation.',
    prerequisites:['CS4341'],
    sections:{
      A:[
        { section:'A01', professor:'Raha Moraffah', days:['T','F'], start:'10:00', end:'11:50', location:'Salisbury Labs 402', enrolled:'0/40', waitlist:'0/10' },
      ],
      B:[
        { section:'B01', professor:'Dachun Sun',    days:['M','R'], start:'14:00', end:'15:50', location:'Salisbury Labs 411', enrolled:'0/50', waitlist:'0/15' },
      ],
    },
  },

  CS4344: {
    id:'CS4344', code:'CS 4344', type:'CS', credits:1,
    name:'Natural Language Processing: From Foundations to Large Language Models',
    description:'Introduces core principles, models, and real-world applications of NLP and Large Language Models (LLMs). Students explore NLP tasks, build deep learning models for language understanding and generation, and apply LLMs to information extraction, conversational AI, summarization, and data querying. Includes a focus on LLM trust, safety, and ethical deployment. Recommended background: programming skills (CS 1004/1101/1102) and (CS 2102/2103/2119); machine learning equivalent to DS 3010, CS 4445, or CS 4342. Units: 1/3 Category: II.',
    prerequisites:[],
    prereqNote:'Recommended: DS 3010, CS 4445, or CS 4342 completed first',
    sections:{
      B:[
        { section:'B01', professor:'Xiaozhong Liu', days:['M','R'], start:'14:00', end:'15:50', location:'Unity Hall 420', enrolled:'0/50', waitlist:'0/15' },
      ],
    },
  },

  CS4345: {
    id:'CS4345', code:'CS 4345', type:'CS', credits:1,
    name:'Multi-Agent Systems',
    description:'Study of systems with multiple interacting autonomous agents. Topics include agent architectures, game theory, mechanism design, auctions, voting systems, coalition formation, negotiation, and multi-agent reinforcement learning. Applications to robotics, economics, and AI safety. Only offered D term.',
    prerequisites:['CS4341'],
    sections:{
      D:[
        { section:'D01', professor:'Qi Zhang', days:['T','F'], start:'10:00', end:'11:50', location:'Unity Hall 520', enrolled:'0/60', waitlist:'0/15' },
      ],
    },
  },

  CS4432: {
    id:'CS4432', code:'CS 4432', type:'CS', credits:1,
    name:'Database Systems II',
    description:'Cat. II. Concentrates on the internals of database management systems. Topics include physical storage management, advanced query languages, query processing and optimization, index structures for relational databases, transaction processing, concurrency control, distributed databases, and database recovery and security. Students design and implement software components of modern database systems. Recommended background: CS 3431 and CS 3733.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A01', professor:'Rodica Neamtu', days:['M','R'], start:'08:00', end:'09:50', location:'Salisbury Labs 411',  enrolled:'0/60', waitlist:'0/15' },
      ],
      B:[
        { section:'B01', professor:'Fabricio Murai', days:['M','R'], start:'12:00', end:'13:50', location:'Unity Hall 520',    enrolled:'0/60', waitlist:'0/15' },
      ],
      D:[
        { section:'D01', professor:'Roee Shraga',    days:['M','R'], start:'14:00', end:'15:50', location:'Atwater Kent 233',  enrolled:'0/60', waitlist:'0/20' },
      ],
    },
  },

  CS4433: {
    id:'CS4433', code:'CS 4433', type:'CS', credits:1,
    name:'Big Data Management and Analytics',
    description:'Introduces emerging techniques and infrastructures for big data management and analytics including parallel and distributed database systems, map-reduce, Spark, and NO-SQL infrastructures, data stream processing systems, scalable analytics and mining, and cloud-based computing. Query processing and optimization, access methods, and storage layouts on these infrastructures are covered. Students engage in hands-on projects. Recommended background: CS 4432.',
    prerequisites:['CS4432'],
    sections:{
      C:[
        { section:'C01', professor:'Rodica Neamtu', days:['M','R'], start:'12:00', end:'13:50', location:'Salisbury Labs 402', enrolled:'0/60', waitlist:'0/15' },
      ],
    },
  },

  CS4445: {
    id:'CS4445', code:'CS 4445', type:'CS', credits:1,
    name:'Data Mining and Knowledge Discovery in Databases',
    description:'Cat. II. Introduction to Knowledge Discovery in Databases (KDD) and Data Mining. Covers data integration techniques, discovery and visualization of patterns in large collections of data. Topics include data warehousing and mediation, data mining methods (rule-based learning, decision trees, association rules, sequence mining), and data visualization. Recommended background: MA 2611, CS 2223, and CS 3431 or CS 3733.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A01', professor:'Carolina Ruiz',  days:['M','R'], start:'12:00', end:'13:50', location:'Unity Hall 520',    enrolled:'0/60', waitlist:'0/15' },
      ],
      D:[
        { section:'D01', professor:'Xiangnan Kong',  days:['T','F'], start:'12:00', end:'13:50', location:'Salisbury Labs 402', enrolled:'0/50', waitlist:'0/5'  },
      ],
    },
  },

  CS4804: {
    id:'CS4804', code:'CS 4804', type:'CS', credits:1,
    name:'Data Visualization',
    description:'Cat. II. Trains students in data visualization — the graphical communication of data for presentation, confirmation, and exploration. Students learn the visualization pipeline: data characterization, mapping attributes to graphical attributes, user task abstraction, visual display techniques, tools, paradigms, and perceptual issues. Students evaluate visualization effectiveness and implement algorithms using commercial and public-domain tools. Recommended background: CS 2102 or CS 2103, and CS 2223.',
    prerequisites:[],
    sections:{
      B:[
        { section:'B01', professor:'Maxim Lisnic', days:['T','F'], start:'14:00', end:'15:50', location:'Salisbury Labs 411', enrolled:'0/50', waitlist:'0/5' },
      ],
    },
  },

  // ── DATA SCIENCE ──────────────────────────────────────────
  DS1010: {
    id:'DS1010', code:'DS 1010', type:'DS', credits:1,
    name:'Data Science I: Introduction to Data Science',
    description:'Cat. I, Units 1/3. Introduction to data science methods and applications. Covers data collection, cleaning, and visualization; exploratory data analysis; and introductory statistical modeling and machine learning. Students work with real datasets and develop computational skills for data-driven problem solving. Recommended background: MA 1021 or equivalent.',
    prerequisites:[],
    sections:{
      A:[ { section:'A01', professor:'Daniel Treku',    days:['M','R'], start:'14:00', end:'15:50', location:'Salisbury Labs 402',       enrolled:'0/30', waitlist:'0/0' } ],
      B:[ { section:'B01', professor:'Xiangnan Kong',   days:['M','R'], start:'12:00', end:'13:50', location:'Salisbury Labs 402',       enrolled:'0/30', waitlist:'0/0' } ],
      C:[ { section:'C01', professor:'Torumoy Ghoshal', days:['M','R'], start:'14:00', end:'15:50', location:'Salisbury Labs 402',       enrolled:'0/30', waitlist:'0/0' } ],
      D:[ { section:'D01', professor:'Torumoy Ghoshal', days:['M','R'], start:'14:00', end:'15:50', location:'Innovation Studio 205',   enrolled:'0/30', waitlist:'0/0' } ],
    },
  },

  DS2010: {
    id:'DS2010', code:'DS 2010', type:'DS', credits:1,
    name:'Data Science II: Statistical Modeling and Analysis',
    description:'Cat. I, Units 1/3. Focuses on model- and data-driven approaches in Data Science. Covers applied statistics, optimization, and machine learning methods including linear and nonlinear regression, classification, decision trees, and dimension reduction techniques. Also covers data exploration, cleaning, feature engineering, and the bias-variance tradeoff. Recommended background: DS 1010, MA 2611 and MA 2612, and CS programming course.',
    prerequisites:[],
    sections:{
      B:[
        { section:'B01', professor:'Fatemeh Emdad',  days:['M','R'], start:'12:00', end:'13:50', location:'Washburn 229',     enrolled:'0/50', waitlist:'0/15' },
      ],
      C:[
        { section:'C01', professor:'Bahman Moraffah', days:['M','R'], start:'12:00', end:'13:50', location:'Unity Hall 420',  enrolled:'0/60', waitlist:'0/15' },
      ],
      D:[
        { section:'D01', professor:'Bahman Moraffah', days:['M','R'], start:'12:00', end:'13:50', location:'Fuller Labs 320', enrolled:'0/60', waitlist:'0/15' },
      ],
    },
  },

  DS3010: {
    id:'DS3010', code:'DS 3010', type:'DS', credits:1,
    name:'Data Science III: Computational Methods',
    description:'Units 1/3. Covers a broad range of computational methods for informed decisions on large and/or high-dimensional data sets following the data science pipeline. Core topics include collecting data via APIs, processing and managing large-scale data, cloud computing, and applying machine learning and deep learning toolkits to extract insights. Recommended background: DS 1010, DS 2010, MA 2611 and MA 2612, CS programming, and databases (CS 3431 or MIS 3720).',
    prerequisites:['DS2010'],
    sections:{
      B:[
        { section:'B01', professor:'Torumoy Ghoshal', days:['T','F'], start:'12:00', end:'13:50', location:'Unity Hall 520',         enrolled:'0/50', waitlist:'0/10' },
      ],
      C:[
        { section:'C01', professor:'Randy Paffenroth', days:['T','F'], start:'10:00', end:'11:50', location:'Unity Hall 405',        enrolled:'0/48', waitlist:'0/10' },
      ],
      D:[
        { section:'D01', professor:'Fabricio Murai',   days:['M','R'], start:'12:00', end:'13:50', location:'Goddard Hall 227',      enrolled:'0/60', waitlist:'0/15' },
      ],
    },
  },

  DS4635: {
    id:'DS4635', code:'DS 4635', type:'DS', credits:1,
    name:'Data Analytics and Statistical Learning',
    description:'Covers modern statistical learning methods for data analytics. Topics include supervised and unsupervised learning, regression, classification, model selection, regularization, and high-dimensional data analysis. Emphasis on both theoretical foundations and practical applications using real datasets.',
    prerequisites:[],
    sections:{
      D:[
        { section:'D01', professor:'Oren Mangoubi', days:['T','F'], start:'12:00', end:'13:50', location:'Higgins Labs 202', enrolled:'0/30', waitlist:'0/0' },
      ],
    },
  },

  // ── INTERNATIONAL STUDIES ─────────────────────────────────
  INTL1100: {
    id:'INTL1100', code:'INTL 1100', type:'INTL', credits:1,
    name:'Introduction to International and Global Studies',
    description:'Cat. I. An introduction to the main concepts, tools, fields of study, global problems, and cross-cultural perspectives that comprise international and global studies. No prior background required. Especially appropriate for students interested in any of WPI\'s global Project Centers.',
    prerequisites:[],
    sections:{
      C:[
        { section:'C01', professor:'John Galante', days:['M','T','R','F'], start:'11:00', end:'11:50', location:'Salisbury Labs 402', enrolled:'0/35', waitlist:'0/10' },
      ],
    },
  },

  INTL2110: {
    id:'INTL2110', code:'INTL 2110', type:'INTL', credits:1,
    name:'Global Justice',
    description:'Cat. II. What is justice during an era of globalization? What are the rights and responsibilities of individuals, groups, nations, or supranational organizations in a world of profound inequalities? This course takes an interdisciplinary approach to historical, literary, religious, and ethical debates about global justice, including globalization and distributive justice, climate justice, migration, citizenship, human rights, and global democracy. No prior background required.',
    prerequisites:[],
    sections:{
      D:[
        { section:'D01', professor:'Geoffrey Pfeifer', days:['T','F'], start:'12:00', end:'13:50', location:'Higgins Labs 114', enrolled:'0/35', waitlist:'0/10' },
      ],
    },
  },

  INTL2210: {
    id:'INTL2210', code:'INTL 2210', type:'INTL', credits:1,
    name:'Popular Culture and Social Change in Asia',
    description:'Cat. II. Godzilla, kung-fu, anime, sushi, Hello Kitty, yin and yang, Pokémon, manga — where did they come from and what meaning do they hold as cultural phenomena? Explores topics in the popular cultures of East Asia to understand influences that shaped the region\'s contemporary societies. Focus country will be either Japan or China, depending on term offered. Examines various media: films, songs, advertisements, video games, manga, anime. Students may not receive credit for both HU 2340 and INTL 2210.',
    prerequisites:[],
    sections:{
      B:[
        { section:'B01', professor:'Jennifer Rudolph', days:['M','R'], start:'12:00', end:'13:50', location:'Atwater Kent 232', enrolled:'0/25', waitlist:'0/10' },
      ],
    },
  },

  INTL2310: {
    id:'INTL2310', code:'INTL 2310', type:'INTL', credits:1,
    name:'Modern Latin America',
    description:'Cat. II. Uses interdisciplinary, thematic, and case study approaches to examine modern Latin America. Explores topics from past and present critical for understanding the region and its residents. May include cultural production, nationalism, urban and rural development, migration, social and racial inequality, democracy, and social justice. Examples from the 19th, 20th, and 21st centuries drawn from WPI Global Project Center locations. Students may not receive credit for both INTL 221X and INTL 2310.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A01', professor:'John Galante', days:['T','F'], start:'14:00', end:'15:50', location:'Stratton Hall 301', enrolled:'0/25', waitlist:'0/10' },
      ],
    },
  },

  INTL2320: {
    id:'INTL2320', code:'INTL 2320', type:'INTL', credits:1,
    name:'Environmental Justice in the Global Caribbean and Latin America',
    description:'Cat. II. Latin America and the Caribbean are center stage in discussions about global ecological inequalities and injustices. This course examines historical and contemporary processes producing and contesting environmental injustices in Latin America and the Caribbean Basin, and analyzes the role of this region in global environmental inequality. Especially appropriate for students interested in environment/sustainability issues, and those expecting to complete IQP/MQP at WPI Project centers in Latin America or the Caribbean.',
    prerequisites:[],
    sections:{
      B:[
        { section:'B01', professor:'William San Martín', days:['T','F'], start:'10:00', end:'11:50', location:'Stratton Hall 313', enrolled:'0/25', waitlist:'0/10' },
      ],
    },
  },

  INTL2410: {
    id:'INTL2410', code:'INTL 2410', type:'INTL', credits:1,
    name:'Modern Africa',
    description:'Examines modern African history, politics, and society. Explores the diversity of African regions and peoples through case studies of political transformation, economic development, colonial legacies, and contemporary challenges. Topics vary by term but may include post-colonial state-building, conflict and peace, health and development, and African contributions to global culture.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A01', professor:'Mohammed El Hamzaoui', days:['M','R'], start:'12:00', end:'13:50', location:'Stratton Hall 311', enrolled:'0/25', waitlist:'0/10' },
      ],
    },
  },

  INTL2510: {
    id:'INTL2510', code:'INTL 2510', type:'INTL', credits:1,
    name:'Contemporary Europe: Union and Disunion',
    description:'Cat. II. A thematic approach to contemporary Europe, especially since the establishment of the European Union\'s single market and common currency. Topics may include expansion of the EU and Euro, free movement of goods and people, migration and refugees, populist and nationalist movements, uneven regional development, postcolonial relations, and debates over national heritage and cultural change. Case studies from WPI European Project Center locations. No prior background required.',
    prerequisites:[],
    sections:{
      C:[
        { section:'C01', professor:'Peter Hansen', days:['T','F'], start:'10:00', end:'11:50', location:'Salisbury Labs 406', enrolled:'0/25', waitlist:'0/10' },
      ],
    },
  },

  INTL2100: {
    id:'INTL2100', code:'INTL 2100', type:'INTL', credits:1,
    name:'Approaches to Global Studies',
    description:'Cat. I. Introduces students to the interdisciplinary methods and frameworks used in international and global studies. Examines how scholars analyze global phenomena including migration, development, environment, culture, and governance. Appropriate for students planning to complete IQP at an international project center.',
    prerequisites:[],
    sections:{
      B:[ { section:'B01', professor:'Alexander Herbert',  days:['M','R'], start:'08:00', end:'09:50', location:'Salisbury Labs 406', enrolled:'0/25', waitlist:'0/0' } ],
      D:[ { section:'D01', professor:'John Galante',       days:['T','F'], start:'14:00', end:'15:50', location:'Salisbury Labs 407', enrolled:'0/25', waitlist:'0/0' } ],
    },
  },

  INTL2420: {
    id:'INTL2420', code:'INTL 2420', type:'INTL', credits:1,
    name:'Middle East, North Africa and Mediterranean',
    description:'Cat. II. Examines the history, politics, societies, and cultures of the Middle East, North Africa, and Mediterranean region. Explores themes including colonial legacies, nationalism, religion and state, gender and society, economic development, and contemporary conflicts. Case studies draw on countries relevant to WPI project center locations.',
    prerequisites:[],
    sections:{
      D:[ { section:'D01', professor:'Mohammed El Hamzaoui', days:['M','R'], start:'12:00', end:'13:50', location:'Stratton Hall 301', enrolled:'0/25', waitlist:'0/0' } ],
    },
  },

  INTL2910: {
    id:'INTL2910', code:'INTL 2910', type:'INTL', credits:1,
    name:'Topics in Global Studies',
    description:'Cat. II. Special topics in international and global studies. Content varies by term and section. Each section addresses a distinct theme or region. Check the specific section for the topic offered.',
    prerequisites:[],
    sections:{
      A:[ { section:'A01', sectionName:'Topics in Global Studies: Promises & Politics of Global Health',
             professor:'Shana Lessing',  days:['T','F'], start:'14:00', end:'15:50', location:'Kaven Hall 115',      enrolled:'0/25', waitlist:'0/0' } ],
      B:[ { section:'B01', sectionName:'Topics in Global Studies: Religion in Modern Japan',
             professor:'Adrien Stoloff', days:['T','F'], start:'12:00', end:'13:50', location:'Salisbury Labs 011',  enrolled:'0/25', waitlist:'0/0' } ],
      C:[
        { section:'C01', sectionName:'Topics in Global Studies',
          professor:'Peter Hansen',   days:['M','R'], start:'14:00', end:'15:50', location:'Washburn 323',           enrolled:'0/25', waitlist:'0/0' },
        { section:'C02', sectionName:'Topics in Global Studies: East Asian Traditions and Modernity',
          professor:'Adrien Stoloff', days:['T','F'], start:'10:00', end:'11:50', location:'Salisbury Labs 305',     enrolled:'0/25', waitlist:'0/0' },
      ],
    },
  },

  // ── ENGLISH ───────────────────────────────────────────────
  EN1219: {
    id:'EN1219', code:'EN 1219', type:'EN', credits:1,
    name:'Introduction to Creative Writing',
    description:'Cat. I. An introduction to the practice of creative writing across forms. Students read widely and write original work in poetry, fiction, and creative nonfiction. Emphasis on developing craft, voice, and revision skills through workshop-style critique and discussion.',
    prerequisites:[],
    sections:{
      A:[ { section:'A01', professor:'Kate McIntyre',   days:['M','T','R','F'], start:'13:00', end:'13:50', location:'Fuller Labs 320',     enrolled:'0/20', waitlist:'0/0' } ],
      C:[ { section:'C01', professor:'Joseph Aguilar',  days:['M','T','R','F'], start:'12:00', end:'12:50', location:'Higgins Labs 202',    enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  EN1251: {
    id:'EN1251', code:'EN 1251', type:'EN', credits:1,
    name:'Introduction to Literature',
    description:'Cat. I. An introduction to the close reading and analysis of literary texts, including fiction, poetry, and drama. Students develop skills in textual interpretation, argumentation, and academic writing through engagement with a diverse range of literary works.',
    prerequisites:[],
    sections:{
      A:[ { section:'A01', professor:'Kristin Boudreau', days:['M','T','R','F'], start:'12:00', end:'12:50', location:'Stratton Hall 207',   enrolled:'0/20', waitlist:'0/0' } ],
      B:[ { section:'B01', professor:'TBD',              days:['M','T','R','F'], start:'11:00', end:'11:50', location:'Fuller Labs 311',      enrolled:'0/20', waitlist:'0/0' } ],
      D:[ { section:'D01', professor:'TBD',              days:['M','T','R','F'], start:'13:00', end:'13:50', location:'Salisbury Labs 407',   enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  EN1259: {
    id:'EN1259', code:'EN 1259', type:'EN', credits:1,
    name:'Introduction to Contemporary Chicana/o Literature',
    description:'Cat. I. Introduces students to the rich and diverse tradition of contemporary Chicana/o literature, including fiction, poetry, drama, and autobiography. Examines themes of identity, immigration, cultural memory, social justice, and the borderlands through texts by major Chicana/o writers.',
    prerequisites:[],
    sections:{
      C:[ { section:'C01', professor:'Joseph Aguilar', days:['M','T','R','F'], start:'13:00', end:'13:50', location:'Salisbury Labs 407', enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  EN1439: {
    id:'EN1439', code:'EN 1439', type:'EN', credits:1,
    name:'Introduction to Poetry',
    description:'Cat. I. A close reading of poems representing a wide variety of periods, traditions, and forms. Students learn to analyze the elements of poetry including voice, meter, rhyme, imagery, and tone. Weekly writing exercises and discussions develop skills of close reading and literary interpretation.',
    prerequisites:[],
    sections:{
      B:[ { section:'B01', professor:'Jim Cocola', days:['M','T','R','F'], start:'11:00', end:'11:50', location:'Stratton Hall 301', enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  EN2219: {
    id:'EN2219', code:'EN 2219', type:'EN', credits:1,
    name:'Creative Writing Workshop',
    description:'Cat. II. An intermediate creative writing workshop. Students produce and workshop original creative writing. The specific form — poetry, fiction, or creative nonfiction — varies by section. Check the section listing for this term\'s focus.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A01', sectionName:'Creative Writing: Poetry',
          professor:'Joseph Aguilar', days:['M','R'], start:'10:00', end:'11:50', location:'Kaven Hall 204',      enrolled:'0/15', waitlist:'0/0' },
        { section:'A02', sectionName:'Creative Writing: Creative Nonfiction',
          professor:'Kate McIntyre',  days:['M','R'], start:'14:00', end:'15:50', location:'Salisbury Labs 406', enrolled:'0/15', waitlist:'0/0' },
      ],
      B:[ { section:'B01', sectionName:'Creative Writing: Fiction',
            professor:'Joseph Aguilar', days:['M','R'], start:'12:00', end:'13:50', location:'Stratton Hall 311', enrolled:'0/15', waitlist:'0/0' } ],
      C:[ { section:'C01', sectionName:'Creative Writing: Fiction',
            professor:'Kate McIntyre',  days:['M','R'], start:'14:00', end:'15:50', location:'Higgins Labs 202',  enrolled:'0/15', waitlist:'0/0' } ],
      D:[ { section:'D01', sectionName:'Creative Writing: Poetry',
            professor:'Jim Cocola',     days:['M','R'], start:'12:00', end:'13:50', location:'Higgins Labs 114',  enrolled:'0/15', waitlist:'0/0' } ],
    },
  },

  EN2225: {
    id:'EN2225', code:'EN 2225', type:'EN', credits:1,
    name:'The Literature of Sin',
    description:'Cat. II. Explores literary representations of sin, transgression, and moral failure across literary traditions. Examines how writers depict the allure and consequences of sinful behavior. Texts may include fiction, drama, and poetry from various periods and cultures.',
    prerequisites:[],
    sections:{
      B:[ { section:'B01', professor:'Michelle Ephraim', days:['T','F'], start:'12:00', end:'13:50', location:'Stratton Hall 313', enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  EN2251: {
    id:'EN2251', code:'EN 2251', type:'EN', credits:1,
    name:'Moral Issues in the Modern Novel',
    description:'Cat. II. Examines the moral dimensions of modern novels. How do novelists engage with ethical questions of justice, responsibility, guilt, and compassion? Students read and discuss novels that put moral issues at the center of storytelling and analyze how literary form shapes moral reflection.',
    prerequisites:[],
    sections:{
      B:[ { section:'B01', professor:'Svetlana Nikitina', days:['M','R'], start:'10:00', end:'11:50', location:'Unity Hall 520', enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  EN2271: {
    id:'EN2271', code:'EN 2271', type:'EN', credits:1,
    name:'American Literary Histories: The Harlem Renaissance',
    description:'Cat. II. A study of the Harlem Renaissance, the flourishing of Black intellectual and artistic life in 1920s New York. Examines poetry, fiction, essays, and visual arts of the period, exploring themes of racial identity, migration, modernity, and cultural pride. Authors may include Langston Hughes, Zora Neale Hurston, Claude McKay, and Nella Larsen.',
    prerequisites:[],
    sections:{
      C:[ { section:'C01', professor:'Kristin Boudreau', days:['M','R'], start:'12:00', end:'13:50', location:'Kaven Hall 115', enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  EN2281: {
    id:'EN2281', code:'EN 2281', type:'EN', credits:1,
    name:'World Literatures: African Fictions',
    description:'Cat. II. Introduces students to major traditions of African fiction. Examines how African writers negotiate questions of colonialism, independence, identity, and modernity. Authors may include Chinua Achebe, Chimamanda Ngozi Adichie, Ngugi wa Thiong\'o, Buchi Emecheta, and others.',
    prerequisites:[],
    sections:{
      B:[ { section:'B01', professor:'Kristin Boudreau', days:['M','R'], start:'10:00', end:'11:50', location:'Salisbury Labs 411', enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  EN2410: {
    id:'EN2410', code:'EN 2410', type:'EN', credits:1,
    name:'Screenwriting',
    description:'Cat. II. An introduction to the craft of writing for film and television. Students develop original screenplays and teleplays, learning the conventions of dramatic structure, scene construction, dialogue, and visual storytelling. Work is workshopped in a collaborative environment with feedback from peers and the instructor.',
    prerequisites:[],
    sections:{
      D:[ { section:'D01', professor:'Kevin Lewis', days:['T','F'], start:'10:00', end:'11:50', location:'Higgins Labs 202', enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  EN3219: {
    id:'EN3219', code:'EN 3219', type:'EN', credits:1,
    name:'Advanced Creative Writing: Fiction',
    description:'Cat. III. An advanced workshop in fiction writing. Students produce substantial original fiction and engage deeply with workshop critique. Emphasis on structure, characterization, voice, and revision. Students are expected to have completed at least one prior creative writing course.',
    prerequisites:[],
    sections:{
      C:[ { section:'C01', professor:'Kate McIntyre',   days:['M','R'], start:'12:00', end:'13:50', location:'Stratton Hall 313', enrolled:'0/15', waitlist:'0/0' } ],
      D:[ { section:'D01', professor:'Joseph Aguilar',  days:['T','F'], start:'10:00', end:'11:50', location:'Stratton Hall 311', enrolled:'0/15', waitlist:'0/0' } ],
    },
  },

  EN3226: {
    id:'EN3226', code:'EN 3226', type:'EN', credits:1,
    name:'Strange and Strangers',
    description:'Cat. III. Examines literary and cultural representations of strangeness and the figure of the stranger. Topics may include the uncanny, the alien, the monstrous, and the outsider across genres and periods. Texts may include fiction, poetry, film, and theory.',
    prerequisites:[],
    sections:{
      C:[ { section:'C01', professor:'Michelle Ephraim', days:['M','R'], start:'10:00', end:'11:50', location:'Fuller Labs 311', enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  EN3231: {
    id:'EN3231', code:'EN 3231', type:'EN', credits:1,
    name:'Supernatural Literatures',
    description:'Cat. III. Explores literary representations of the supernatural, from gothic horror to magical realism to contemporary speculative fiction. Examines how writers deploy supernatural elements to address questions of fear, desire, power, and the unknown. May include texts by Poe, Shelley, Lovecraft, Morrison, García Márquez, and others.',
    prerequisites:[],
    sections:{
      A:[ { section:'A01', professor:'Joseph Aguilar', days:['M','R'], start:'08:00', end:'09:50', location:'Kaven Hall 204', enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  EN3271: {
    id:'EN3271', code:'EN 3271', type:'EN', credits:1,
    name:'American Literary Topics: Toni Morrison',
    description:'Cat. III. A focused study of the work of Toni Morrison, Nobel Prize-winning American novelist. Examines Morrison\'s major novels including Beloved, Song of Solomon, and The Bluest Eye, analyzing her themes of race, memory, community, and the African-American experience. Attention to Morrison\'s literary craft, her relationship to African-American literary tradition, and her cultural impact.',
    prerequisites:[],
    sections:{
      D:[ { section:'D01', professor:'Kristin Boudreau', days:['M','R'], start:'12:00', end:'13:50', location:'Innovation Studio 203', enrolled:'0/20', waitlist:'0/0' } ],
    },
  },

  // ── HUMANITIES ────────────────────────────────────────────
  HU3900: {
    id:'HU3900', code:'HU 3900', type:'HU', credits:1,
    name:'Topics in Humanities (HU 39XX)',
    description:'Upper-level humanities course satisfying the HUA requirement. Must be taken AFTER completing 2 INTL courses. Specific HU 3900/39XX sections for Spring 2027 have not yet been posted — check courselistings.wpi.edu. Plan to place this in either C or D term once sections are announced. A slot is reserved in your schedule below.',
    prerequisites:[],
    hu3900placeholder: true,
    sections:{
      C:[{ section:'TBD', professor:'TBD — Not yet posted', days:[], start:null, end:null, location:'TBD', enrolled:'—', waitlist:'—' }],
      D:[{ section:'TBD', professor:'TBD — Not yet posted', days:[], start:null, end:null, location:'TBD', enrolled:'—', waitlist:'—' }],
    },
  },

  // ── PHYSICAL EDUCATION ────────────────────────────────────
  WPE1003: {
    id:'WPE1003', code:'WPE 1003', type:'WPE', credits:0.25,
    name:'Intro to Badminton',
    description:'Cat. I (1/12 unit). Introduction to the sport through skill development and play.',
    prerequisites:[],
    sections:{
      C:[
        { section:'C01', professor:'Matthew Kelly', days:['M','R'], start:'10:00', end:'10:50', location:'Recreation Center All Courts 1-2', enrolled:'0/20', waitlist:'0/10' },
      ],
    },
  },

  WPE1009: {
    id:'WPE1009', code:'WPE 1009', type:'WPE', credits:0.25,
    name:'Walking for Fitness',
    description:'Cat. I. Teaches basic walking techniques and principles with the goal for students to develop and implement an individualized conditioning program for themselves.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A01', professor:'Brenden Casey',    days:['T','R'], start:'11:00', end:'11:50', location:'Recreation Center Track', enrolled:'0/35', waitlist:'0/10' },
      ],
      B:[
        { section:'B01', professor:'Heather Ross',     days:['M','R'], start:'10:00', end:'10:50', location:'Recreation Center Track', enrolled:'0/35', waitlist:'0/10' },
        { section:'B02', professor:'Brenden Casey',    days:['T','R'], start:'13:00', end:'13:50', location:'Recreation Center Track', enrolled:'0/35', waitlist:'0/10' },
        { section:'B03', professor:'Madeleine Katz',   days:['T','R'], start:'14:00', end:'14:50', location:'Recreation Center Track', enrolled:'0/35', waitlist:'0/10' },
      ],
      C:[
        { section:'C01', professor:'Heather Ross',     days:['T','R'], start:'13:00', end:'13:50', location:'Recreation Center Track', enrolled:'0/35', waitlist:'0/15' },
        { section:'C02', professor:'Brenden Casey',    days:['M','R'], start:'14:00', end:'14:50', location:'Recreation Center Track', enrolled:'0/35', waitlist:'0/15' },
        { section:'C03', professor:'Matt Oney',        days:['T','R'], start:'11:00', end:'11:50', location:'Recreation Center Track', enrolled:'0/30', waitlist:'0/0'  },
      ],
      D:[
        { section:'D01', professor:'Brenden Casey',    days:['M','R'], start:'10:00', end:'10:50', location:'Recreation Center Track', enrolled:'0/33', waitlist:'0/15' },
        { section:'D02', professor:'Heather Ross',     days:['T','R'], start:'11:00', end:'11:50', location:'Recreation Center Track', enrolled:'0/33', waitlist:'0/15' },
        { section:'D03', professor:'Danielle Rainey',  days:['T','R'], start:'13:00', end:'13:50', location:'Recreation Center Track', enrolled:'0/33', waitlist:'0/15' },
      ],
    },
  },

  WPE1011: {
    id:'WPE1011', code:'WPE 1011', type:'WPE', credits:0.25,
    name:'Touch Football',
    description:'Cat. I (1/12 unit). Introduction to basic rules and individual/team skill development with practical application through game competition.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A02', professor:'Matthew Kelly',         days:['T','R'], start:'10:00', end:'10:50', location:'Athletic Field Football', enrolled:'0/30', waitlist:'0/10' },
      ],
      D:[
        { section:'D01', professor:'Matthew Kelly',         days:['T','R'], start:'14:00', end:'14:50', location:'Athletic Field',         enrolled:'0/30', waitlist:'0/15' },
        { section:'D02', professor:'Christopher Robertson', days:['M','F'], start:'11:00', end:'11:50', location:'Athletic Field',         enrolled:'0/30', waitlist:'0/15' },
      ],
    },
  },

  WPE1012: {
    id:'WPE1012', code:'WPE 1012', type:'WPE', credits:0.25,
    name:'Basketball',
    description:'Cat. I (1/12 unit). Introduction to basic rules and individual/team skill development with practical application through game competition.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A01', professor:'Armando Dunn',       days:['M','R'], start:'14:00', end:'14:50', location:'Recreation Center All Courts 1-2', enrolled:'0/30', waitlist:'0/10' },
      ],
      B:[
        { section:'B01', professor:'Christopher Bartley',days:['M','F'], start:'10:00', end:'10:50', location:'Recreation Center All Courts 1-2', enrolled:'0/30', waitlist:'0/10' },
        { section:'B02', professor:'Riley Naclerio',     days:['M','R'], start:'13:00', end:'13:50', location:'Recreation Center All Courts 1-2', enrolled:'0/30', waitlist:'0/10' },
      ],
      C:[
        { section:'C01', professor:'Armando Dunn',       days:['T','R'], start:'14:00', end:'14:50', location:'Recreation Center All Courts 1-2', enrolled:'0/30', waitlist:'0/15' },
        { section:'C02', professor:'Riley Naclerio',     days:['M','F'], start:'13:00', end:'13:50', location:'Recreation Center All Courts 1-2', enrolled:'0/30', waitlist:'0/15' },
        { section:'C03', professor:'Christopher Bartley',days:['T','R'], start:'09:00', end:'09:50', location:'Recreation Center All Courts 1-2', enrolled:'0/30', waitlist:'0/15' },
      ],
      D:[
        { section:'D01', professor:'Riley Naclerio',     days:['M','R'], start:'14:00', end:'14:50', location:'Recreation Center All Courts 1-2', enrolled:'0/30', waitlist:'0/15' },
        { section:'D02', professor:'Christopher Bartley',days:['M','R'], start:'10:00', end:'10:50', location:'Recreation Center All Courts 1-2', enrolled:'0/30', waitlist:'0/15' },
      ],
    },
  },

  WPE1018: {
    id:'WPE1018', code:'WPE 1018', type:'WPE', credits:0.25,
    name:'Volleyball',
    description:'Cat. I (1/12 unit). Introduction to basic rules and individual/team skill development with practical application through game competition.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A01', professor:'Cherise Galasso', days:['T','R'], start:'13:00', end:'13:50', location:'Recreation Center All Courts 1-2', enrolled:'0/28', waitlist:'0/10' },
        { section:'A02', professor:'TBD',             days:['M','F'], start:'13:00', end:'13:50', location:'Recreation Center All Courts 1-2', enrolled:'0/25', waitlist:'0/10' },
      ],
      B:[
        { section:'B01', professor:'Mickey Cahoon',   days:['T','F'], start:'13:00', end:'13:50', location:'Recreation Center All Courts 1-2', enrolled:'0/28', waitlist:'0/10' },
      ],
      C:[
        { section:'C01', professor:'Mickey Cahoon',   days:['T','R'], start:'11:00', end:'11:50', location:'Recreation Center All Courts 1-2', enrolled:'0/28', waitlist:'0/10' },
        { section:'C02', professor:'Cherise Galasso', days:['T','R'], start:'13:00', end:'13:50', location:'Recreation Center All Courts 1-2', enrolled:'0/28', waitlist:'0/10' },
      ],
      D:[
        { section:'D01', professor:'Cherise Galasso', days:['T','R'], start:'13:00', end:'13:50', location:'Recreation Center All Courts 1-2', enrolled:'0/30', waitlist:'0/15' },
        { section:'D02', professor:'Mickey Cahoon',   days:['T','R'], start:'11:00', end:'11:50', location:'Recreation Center All Courts 1-2', enrolled:'0/30', waitlist:'0/15' },
      ],
    },
  },

  WPE1019: {
    id:'WPE1019', code:'WPE 1019', type:'WPE', credits:0.25,
    name:'Soccer',
    description:'Cat. I. Introduction to basic rules and individual/team skill development with practical application through game competition.',
    prerequisites:[],
    sections:{
      A:[
        { section:'A01', professor:'Brian Kelley', days:['T','R'], start:'13:00', end:'13:50', location:'Athletic Field Football',          enrolled:'0/30', waitlist:'0/10' },
      ],
      B:[
        { section:'B02', professor:'Brian Kelley', days:['T','R'], start:'11:00', end:'11:50', location:'Recreation Center All Courts 1-2', enrolled:'0/30', waitlist:'0/10' },
      ],
      C:[
        { section:'C01', professor:'Brian Kelley', days:['M','R'], start:'14:00', end:'14:50', location:'Recreation Center All Courts 3-4',  enrolled:'0/30', waitlist:'0/15' },
      ],
      D:[
        { section:'D01', professor:'Brian Kelley', days:['T','R'], start:'13:00', end:'13:50', location:'Athletic Field',                    enrolled:'0/30', waitlist:'0/15' },
      ],
    },
  },

  // ── IQP & MQP ─────────────────────────────────────────────
  IQP: {
    id:'IQP', code:'IQP', type:'IQP', credits:1,
    name:'Interactive Qualifying Project',
    description:'Signature WPI project at the intersection of science/technology and society. Teams work with faculty advisors on real-world problems. Projects done at WPI or at one of 50+ global project centers. Total = 3 credit units distributed across terms (patterns: 1+1+1, 2+1, 1+2, or all 3 in one term — no gaps allowed). Cannot be taken in the same year as MQP.',
    prerequisites:[], isProject:true, isIQP:true,
    sections:{
      A:[{ section:'—', professor:'Various Advisors', days:[], start:null, end:null, location:'Various', enrolled:'—', waitlist:'—' }],
      B:[{ section:'—', professor:'Various Advisors', days:[], start:null, end:null, location:'Various', enrolled:'—', waitlist:'—' }],
      C:[{ section:'—', professor:'Various Advisors', days:[], start:null, end:null, location:'Various', enrolled:'—', waitlist:'—' }],
      D:[{ section:'—', professor:'Various Advisors', days:[], start:null, end:null, location:'Various', enrolled:'—', waitlist:'—' }],
    },
  },

  MQP: {
    id:'MQP', code:'MQP', type:'MQP', credits:1,
    name:'Major Qualifying Project',
    description:'CS/DS capstone research project demonstrating professional-level competency. Students solve a real engineering or science problem, often with industry partners, government agencies, or research labs. Total = 3 credit units distributed across terms (patterns: 1+1+1, 2+1, 1+2, or all 3 in one term — no gaps allowed). Cannot be taken in the same year as IQP.',
    prerequisites:[], isProject:true, isMQP:true,
    sections:{
      A:[{ section:'—', professor:'Various Advisors', days:[], start:null, end:null, location:'Various', enrolled:'—', waitlist:'—' }],
      B:[{ section:'—', professor:'Various Advisors', days:[], start:null, end:null, location:'Various', enrolled:'—', waitlist:'—' }],
      C:[{ section:'—', professor:'Various Advisors', days:[], start:null, end:null, location:'Various', enrolled:'—', waitlist:'—' }],
      D:[{ section:'—', professor:'Various Advisors', days:[], start:null, end:null, location:'Various', enrolled:'—', waitlist:'—' }],
    },
  },
};

// ── TERM AVAILABILITY ─────────────────────────────────────────
// Based on PDF "class list 26-27" — authoritative course list per term
const TERM_AVAIL = {
  A:['INTL2310','INTL2410','INTL2910',
     'EN1219','EN1251','EN2219','EN3231',
     'DS1010',
     'WPE1009','WPE1011','WPE1012','WPE1018','WPE1019',
     'CS3043','CS4341','CS4342','CS4343','CS4432','CS4445',
     'IQP','MQP'],
  B:['INTL2100','INTL2210','INTL2320','INTL2910',
     'EN1251','EN1439','EN2219','EN2225','EN2251','EN2281',
     'DS1010','DS2010','DS3010',
     'WPE1009','WPE1012','WPE1018','WPE1019',
     'CS3043','CS3733','CS4341','CS4342','CS4343','CS4344','CS4432','CS4804',
     'IQP','MQP'],
  C:['INTL1100','INTL2510','INTL2910','HU3900',
     'EN1219','EN1259','EN2219','EN2271','EN3219','EN3226',
     'DS1010','DS2010','DS3010',
     'WPE1003','WPE1009','WPE1012','WPE1018','WPE1019',
     'CS3043','CS3733','CS4341','CS4342','CS4433',
     'IQP','MQP'],
  D:['INTL2100','INTL2110','INTL2420','HU3900',
     'EN1251','EN2219','EN2410','EN3219','EN3271',
     'DS1010','DS2010','DS3010','DS4635',
     'WPE1009','WPE1011','WPE1012','WPE1018','WPE1019',
     'CS3043','CS3733','CS4341','CS4342','CS4345','CS4432','CS4445',
     'IQP','MQP'],
};

// ── HELPER FUNCTIONS ──────────────────────────────────────────
function getCourse(id) { return COURSES[id] || null; }

function getTermCourses(term, includeWPE=true, includeProject=true) {
  return TERM_AVAIL[term]
    .map(id => COURSES[id])
    .filter(c => c &&
      (includeWPE    || c.type !== 'WPE') &&
      (includeProject || !c.isProject)
    );
}

function timeToMins(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Get all time-blocks for a section (lecture + optional lab)
function getSectionBlocks(sec) {
  if (!sec || !sec.start) return [];
  const blocks = [{ days: sec.days, start: sec.start, end: sec.end }];
  if (sec.lab && sec.lab.start) {
    blocks.push({ days: sec.lab.days, start: sec.lab.start, end: sec.lab.end });
  }
  return blocks;
}

function doCourseTimesConflict(a, b, term) {
  const sa = a.sections[term]?.[0];
  const sb = b.sections[term]?.[0];
  if (!sa || !sb) return false;
  const blocksA = getSectionBlocks(sa);
  const blocksB = getSectionBlocks(sb);
  for (const ba of blocksA) {
    if (!ba.start) continue;
    for (const bb of blocksB) {
      if (!bb.start) continue;
      const sharedDays = ba.days.filter(d => bb.days.includes(d));
      if (!sharedDays.length) continue;
      const aS = timeToMins(ba.start), aE = timeToMins(ba.end);
      const bS = timeToMins(bb.start), bE = timeToMins(bb.end);
      if (aS < bE && aE > bS) return true;
    }
  }
  return false;
}
