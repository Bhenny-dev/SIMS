import React, { useState, useEffect, createContext, useContext, useRef } from 'react';

// Mock data and types
enum UserRole {
  USER = 'user',
  OFFICER = 'officer',
  ADMIN = 'admin',
}

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

const mockUsers: { [key in UserRole]: User } = {
  [UserRole.USER]: { id: 1, name: 'Alex Johnson', email: 'alex.j@sims.demo', role: UserRole.USER, avatar: 'https://i.pravatar.cc/150?u=user1' },
  [UserRole.OFFICER]: { id: 2, name: 'Brenda Smith', email: 'brenda.s@sims.demo', role: UserRole.OFFICER, avatar: 'https://i.pravatar.cc/150?u=user2' },
  [UserRole.ADMIN]: { id: 3, name: 'Chris Lee', email: 'chris.l@sims.demo', role: UserRole.ADMIN, avatar: 'https://i.pravatar.cc/150?u=user3' },
};

// --- DATA STRUCTURES FOR EVENT-DRIVEN CONTENT ---
interface Team {
    rank: number;
    name: string;
    score: number;
    previousScores: number[];
    wins: number;
    losses: number;
    players: number;
    live: boolean;
    details: {
      merits: { category: string; points: number; description: string; updatedBy: string }[];
      demerits: { reason: string; points: number; person: string; updatedBy: string }[];
      eventScores: { eventName: string; placement: number; basePoints: number; competitionPoints: number; scorecard: { judge: string, scores: { criteria: string; score: number; }[] }[] }[];
    }
}

// Updated Event Data Structures
interface Criteria {
    name: string;
    description: string;
    points: number | string;
}
interface EventGuidelineSection {
    title: string;
    description?: string;
    guidelines?: string[];
    criteria?: Criteria[];
    competitionPoints?: number | string;
    table?: { headers: string[]; rows: (string | number)[][] };
}
interface EventData {
    id: number;
    category: string;
    name: string;
    officer: string;
    participants: string;
    description?: string;
    details?: EventGuidelineSection[];
    judges?: string[];
}


interface StatCard {
    team: string;
    points: string;
    games: number;
    change: number;
    color: string;
}

// Data for Rules Page
const rulesData: { [key: string]: any } = {
    'i3 Day | Clash of Cards': {
        title: "i3 Day | Clash of Cards",
        subtitle: "CIT Tech and Sports Fest 2025",
        sdgs: ["#SDG9", "#SDG13", "#SDG17"],
        objectives: [
            "To showcase the diverse talents and skills of information technology students and faculty, fostering a sense of community and camaraderie.",
            "To promote sportsmanship, healthy competition, and community spirit among students, faculty, and the wider IT community, encourage teamwork, and foster a supportive atmosphere that promotes growth and learning."
        ],
        houseRules: [
            { title: "Attendance and Participation", rules: ["All students are required to participate in the events assigned to their units. Attendance is mandatory and will be strictly monitored.", "This activity is part of the college calendar and is considered a regular class schedule. Therefore, students are expected to attend and actively participate in their assigned units.", "While the event includes competitions, its primary goal is to promote unity and cooperation among all students, not just to compete for victory.", "Double entries in solo events are not allowed, except in team events, or there’s such cases where the players are limited and needed to play to represent the team."] },
            { title: "Responsibilities of Unit Advisers and Leaders", rules: ["Unit advisers and leaders must ensure that all members are actively involved in the events. They are also responsible for implementing a buddy system to help manage their unit members.", "Students are expected to maintain discipline throughout the event."] },
            { title: "Demerit System", rules: ["A demerit system will be implemented for any rule violations. Deductions will be made from the unit’s overall score.", "The current point standings will be displayed publicly to promote accountability and awareness."] },
            { title: "Complaint and Grievance Procedure", rules: ["All complaints must be submitted to the Grievance Committee at least 3 hours before the event.", "The Committee’s decision is final.", "Misconduct, cheating, or disrespect toward officials will result in disqualification.", "Complaints or protests must be filed through the Secretariat for proper handling.", "Appeals will be considered if filed no less than 3 hours before or at least one day before the event for review and approval by the Steering Committee."] },
            { title: "Forfeits and Unsportsmanlike Behavior", rules: ["A unit that refuses to play or walks out automatically forfeits the event.", "Any unsportsmanlike behavior will result in the disqualification of the player.", "A second violation will cause the player to be barred from future events."] }
        ],
        demeritDeductions: [
            { offense: "Abrupt back-out, refusal to play, or walkout", deduction: "0 points per event" },
            { offense: "Unsportsmanlike behavior", deduction: "–25 points per incident" },
            { offense: "Spying on another team (intentional)", deduction: "–500 points" },
            { offense: "Spying on another team (unintentional/warning)", deduction: "–100 points" },
        ],
        scoring: {
            basePoints: [
                { type: "Solo Events", points: "1,000" },
                { type: "Duo–4 Member Events", points: "1,200" },
                { type: "5-Member or Team Events", points: "1,500" },
            ],
            placement: [
                { place: "1st Place", points: "100% (Full points)" },
                { place: "2nd Place", points: "80% of 1st Place" },
                { place: "3rd Place", points: "80% of 2nd Place" },
                { place: "4th Place", points: "80% of 3rd Place" },
            ],
            meritPoints: [
                { category: "Attendance (1st/2nd/3rd/4th)", points: "500/400/300/200 pts" },
                { category: "Outstanding Sportsmanship", points: "50 pts" },
                { category: "Discipline and Cooperation", points: "50 pts" },
                { category: "Highest Participating Members (1st/2nd/3rd/4th)", points: "1,000/900/800/700 pts" },
            ]
        },
        teamFormation: {
            leaders: [
                { position: "Unit Leader", count: 1, description: "Leads and manages the entire unit. Oversees all activities, makes decisions, assigns tasks, and reports directly to the S-ALT Officers. Ensures coordination and teamwork among members." },
                { position: "Unit Secretary", count: 1, description: "Acts as the right hand of the leader. Records meeting notes, tracks attendance, manages documents, and keeps members informed." },
                { position: "Unit Treasurer", count: 1, description: "Handles all financial matters of the unit. Collects and records contributions, manages the budget, and reports expenses to the leader." },
                { position: "Operational Errands", count: 4, description: "Provides manpower and logistical support. Buys needed materials, assists in errands, gathers information, and helps the leader, secretary, and treasurer with tasks." },
            ],
            advisers: "The teams will vote for their own advisers from the faculty. The chosen adviser will be the one they will interact with and share their experiences with throughout the games. Teams may treat their adviser as a coach, mentor, motivator, or guide during the event.",
            naming: {
                description: "The teams will be assigned a team color and will decide what name they will create to complete their signature team name.",
                teams: [
                    { name: "Spades", color: "Black" },
                    { name: "Clubs", color: "Green" },
                    { name: "Hearts", color: "Red" },
                    { name: "Diamonds", color: "Blue" },
                ],
                format: "Team Color + Team name. E.g., AMARANTH JOKER"
            }
        }
    }
};

interface AppData {
    [eventName: string]: {
        statCards: StatCard[];
        leaderboard: Team[];
        events: EventData[];
        topPlayers: User[];
        rules: any;
    }
}

const initialAppData: AppData = {
    'i3 Day | Clash of Cards': {
        statCards: [
            { team: 'Midnight Spades', points: '2850', games: 14, change: 43.5, color: 'bg-blue-500' },
            { team: 'Scarlet Hearts', points: '2400', games: 14, change: 22.1, color: 'bg-red-500' },
            { team: 'Emerald Clover', points: '1980', games: 14, change: -5.8, color: 'bg-green-500' },
            { team: 'Glacier Diamonds', points: '1850', games: 14, change: 10.3, color: 'bg-sky-500' }
        ],
        leaderboard: [
            { rank: 1, name: 'Midnight Spades', score: 2850, previousScores: [2800, 2750], wins: 12, losses: 2, players: 15, live: true, details: {
                merits: [{category: "Attendance", points: 500, description: "Highest attendance", updatedBy: "Brenda Smith"}, {category: "Sportsmanship", points: 50, description: "Fair play in Basketball", updatedBy: "Brenda Smith"}],
                demerits: [{reason: "Late for event", points: 20, person: "John Doe", updatedBy: "Chris Lee"}],
                eventScores: [
                    {eventName: "Basketball", placement: 1, basePoints: 1500, competitionPoints: 1500, scorecard: [{judge: "Mr. Davison", scores: [{criteria: "Offense", score: 90}, {criteria: "Defense", score: 85}]}]},
                    {eventName: "Chess", placement: 2, basePoints: 1000, competitionPoints: 800, scorecard: [{judge: "Ms. Carol", scores: [{criteria: "Strategy", score: 92}, {criteria: "Speed", score: 78}]}]},
                ]
            }},
            { rank: 2, name: 'Scarlet Hearts', score: 2400, previousScores: [2420, 2350], wins: 10, losses: 4, players: 14, live: false, details: {
                merits: [{category: "Discipline", points: 50, description: "Excellent cooperation", updatedBy: "Brenda Smith"}],
                demerits: [],
                eventScores: [{eventName: "Volleyball", placement: 1, basePoints: 1500, competitionPoints: 1500, scorecard: []}, {eventName: "Debate", placement: 3, basePoints: 1200, competitionPoints: 768, scorecard: []}]
            }},
            { rank: 3, name: 'Emerald Clover', score: 1980, previousScores: [1950, 2000], wins: 9, losses: 5, players: 15, live: false, details: { merits: [], demerits: [], eventScores: []} },
            { rank: 4, name: 'Glacier Diamonds', score: 1850, previousScores: [1800, 1820], wins: 8, losses: 6, players: 13, live: false, details: { merits: [], demerits: [], eventScores: []} },
        ],
        events: [
            { 
                id: 1, category: "Joker Flag", name: "Joker Flag (Chant, Silent Drill, Yell)", officer: "Bhenny & Foncee", participants: "ALL", judges: ["Judge A", "Judge B"],
                description: "The Joker Flag serves as the ultimate symbol of team spirit, unity, and dominance throughout the competition. When the Joker Flag is marched into the game area, the supporting audience members of that team must perform their routines according to the designated wave. Each team will showcase its pride and creativity through three waves of performance: Chant, Silent Drill, and Yell. Each wave must last for a minimum of 1 minute and will be judged based on the given criteria.",
                details: [
                    {
                        title: "WAVE 1 – CHANT",
                        description: "A rhythmic and melodic team chant that promotes the team’s identity and energy. The chant may be accompanied by coordinated movements, claps, or beats, but should primarily highlight vocal unity and synchronization.",
                        guidelines: ["Duration: Minimum of 1 minute", "Focus on rhythm, clarity, and team synergy", "Lyrics must reflect the team’s values, name, or spirit", "Must be appropriate and respectful in content"],
                        criteria: [
                            { name: "Creativity & Originality", description: "Uniqueness and innovative approach in chant composition and presentation", points: 30 },
                            { name: "Synchronization & Coordination", description: "Timing, teamwork, and alignment of movement and rhythm", points: 30 },
                            { name: "Energy & Delivery", description: "Enthusiasm, projection, and liveliness of performance", points: 20 },
                            { name: "Clarity & Team Identity", description: "Clear diction, message, and reflection of the team’s character", points: 20 },
                        ],
                        competitionPoints: 1000
                    },
                    {
                        title: "WAVE 2 – SILENT DRILL",
                        description: "A performance showcasing precision, discipline, and creativity using body percussion, movement, and improvised rhythms. Limited vocal use is allowed, but emphasis should be on non-verbal synchronization and impact.",
                        guidelines: ["Duration: Minimum of 1 minute", "Must use body, claps, stomps, or objects (no musical instruments)", "Vocal sounds allowed but minimal", "Emphasis on timing, formation, and group coordination"],
                        criteria: [
                            { name: "Precision & Timing", description: "Accuracy and uniformity in movements and beats", points: 30 },
                            { name: "Creativity & Use of Body Percussion", description: "Innovation in creating sound and rhythm using the body or improvised means", points: 30 },
                            { name: "Synchronization & Formation", description: "Cohesiveness of the group and formation transitions", points: 20 },
                            { name: "Overall Impact & Discipline", description: "General impression, composure, and performance quality", points: 20 },
                        ],
                        competitionPoints: 1000
                    },
                    {
                        title: "WAVE 3 – YELL",
                        description: "An intense and powerful vocal performance designed to intimidate rival teams and boost team morale. This wave highlights strength, confidence, and the team’s competitive spirit through commanding chants and unified expressions.",
                        guidelines: ["Duration: Minimum of 1 minute", "Focus on volume, projection, and intensity", "Must remain respectful (no offensive language or gestures)", "May include brief team slogans or cheers"],
                        criteria: [
                            { name: "Intensity & Energy", description: "Strength and enthusiasm in vocal performance", points: 30 },
                            { name: "Unity & Vocal Power", description: "Harmony, coordination, and equal participation", points: 30 },
                            { name: "Message & Delivery", description: "Clarity and effectiveness of the yell’s message", points: 20 },
                            { name: "Stage Presence & Confidence", description: "Body language, expression, and command of space", points: 20 },
                        ],
                        competitionPoints: 1000
                    }
                ]
            },
            {
                id: 4, category: "CIT Quest", name: "Cheer Dance", officer: "Yesha", participants: "10-15", judges: [],
                description: "A dynamic performance blending dance and cheerleading elements.",
                details: [{
                    title: "Mechanics",
                    guidelines: [
                        "Each unit shall have one (1) entry with 10-15 performers (mixed gender).",
                        "The routine must incorporate essential cheerleading elements: dance techniques, formations, and group stunts/pyramids (basket tosses and other high-risk aerial stunts are prohibited for safety).",
                        "The team can make use of their own song choice as music.",
                        "The performance must not exceed 5 minutes, including entrance and exit.",
                        "The use of props (e.g., pompoms, flags, banners) is allowed as long as you take extra precautions and ensure safety."
                    ],
                    criteria: [
                        { name: "Choreography (Creativity & Artistry)", description: "Originality, creativity, complexity, transitions, and overall composition.", points: 50 },
                        { name: "Execution & Energy", description: "Precision, synchronization, consistency, enthusiasm, and stage presence.", points: 30 },
                        { name: "Costume & Visuals", description: "Appropriateness, design, and appeal of costumes and props.", points: 10 },
                        { name: "Overall Impact", description: "Crowd appeal, confidence, and how well all elements come together.", points: 10 },
                    ],
                    competitionPoints: 1500
                }]
            },
            { id: 5, category: "CIT Quest", name: "Banner Competition", officer: "Yesha", participants: "1", judges: [], details: [/* Add details from prompt */] },
            { id: 6, category: "CIT Quest", name: "Cosplay", officer: "Yesha", participants: "1", judges: [], details: [/* Add details from prompt */] },
            { id: 7, category: "CIT Quest", name: "Amazing Race", officer: "Yesha", participants: "ALL", judges: [], details: [/* Add details from prompt */] },
            { id: 8, category: "CIT Quest", name: "Larong Lahi", officer: "Yesha", participants: "Varies", judges: [], details: [/* Add details from prompt */] },
            { id: 11, category: "CIT Quest", name: "General Quiz", officer: "Yesha", participants: "All", judges: [], details: [/* Add details from prompt */] },
            { id: 31, category: "Pixel Play", name: "Solo and Duet Singing", officer: "Sean", participants: "1-2", judges: [], details: [/* Add details from prompt */] },
            { id: 12, category: "Mindscape", name: "Essay Writing (Filipino)", officer: "Lryn", participants: "1", judges: [] },
            { id: 13, category: "Mindscape", name: "Essay Writing (English)", officer: "Lryn", participants: "1", judges: [] },
            { id: 14, category: "Mindscape", name: "Debate", officer: "Lryn", participants: "3", judges: [] },
            { id: 19, category: "Hoop & Spike", name: "Basketball", officer: "Joshua & Jericho", participants: "12 Men | 5 Women", judges: [] },
            { id: 23, category: "Cipher Matrix", name: "Programming", officer: "Lorenz", participants: "4 (1st-4th year)", judges: [] },
            { id: 37, category: "Table Masters", name: "Chess", officer: "Jeverlyn", participants: "1 male | 1 female", judges: [] },
        ],
        topPlayers: Object.values(mockUsers),
        rules: rulesData['i3 Day | Clash of Cards'],
    },
    'Campus Clash': {
        statCards: [],
        leaderboard: [],
        events: [],
        topPlayers: [],
        rules: null,
    },
    'Intramurals': {
        statCards: [],
        leaderboard: [],
        events: [],
        topPlayers: [],
        rules: null,
    }
};


// --- CONTEXTS ---
interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  switchRole: (role: UserRole) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEvent: string;
  setSelectedEvent: React.Dispatch<React.SetStateAction<string>>;
  appData: AppData;
  updateEventData: (updatedEvent: EventData) => void;
  addEventData: (newEvent: Omit<EventData, 'id'>) => void;
  deleteEventData: (eventId: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  const [user, setUser] = useState<User | null>(mockUsers.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('i3 Day | Clash of Cards');
  const [appData, setAppData] = useState(initialAppData);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const switchRole = (role: UserRole) => setUser(mockUsers[role]);
  
  const updateEventData = (updatedEvent: EventData) => {
    setAppData(prevData => {
        const currentEvents = prevData[selectedEvent]?.events || [];
        const newEventList = currentEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e);
        return {
            ...prevData,
            [selectedEvent]: {
                ...prevData[selectedEvent],
                events: newEventList,
            }
        };
    });
  };

  const addEventData = (newEvent: Omit<EventData, 'id'>) => {
    setAppData(prevData => {
        const currentEvents = prevData[selectedEvent]?.events || [];
        const newEventWithId = { ...newEvent, id: Date.now() };
        return {
            ...prevData,
            [selectedEvent]: {
                ...prevData[selectedEvent],
                events: [...currentEvents, newEventWithId],
            }
        };
    });
  };

  const deleteEventData = (eventId: number) => {
    setAppData(prevData => {
        const currentEvents = prevData[selectedEvent]?.events || [];
        const newEventList = currentEvents.filter(e => e.id !== eventId);
        return {
            ...prevData,
            [selectedEvent]: {
                ...prevData[selectedEvent],
                events: newEventList,
            }
        };
    });
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, user, setUser, switchRole, isSidebarOpen, setIsSidebarOpen, selectedEvent, setSelectedEvent, appData, updateEventData, addEventData, deleteEventData }}>
      {children}
    </AppContext.Provider>
  );
};

// --- HOOKS ---
const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

// --- SVG ICONS ---
const Icons = {
    Dashboard: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    Leaderboard: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd" /></svg>,
    Events: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
    Profile: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
    Admin: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" /></svg>,
    Rules: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h6v1H5V6zm0 2h6v1H5V8zm0 2h6v1H5v-1z" clipRule="evenodd" /></svg>,
    Menu: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    Close: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Bell: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>,
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
};


// --- LAYOUT COMPONENTS ---

const AnimatedBackground: React.FC = () => (
    <div className="fixed inset-0 -z-10 h-full w-full bg-gray-50 dark:bg-gray-900">
      <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary-400 opacity-20 blur-[100px] dark:bg-primary-700"></div>
    </div>
);

const RoleSwitcher: React.FC = () => {
    const { user, switchRole } = useAppContext();
    return (
      <div className="fixed bottom-4 right-4 z-50 rounded-2xl bg-white/50 p-2 shadow-lg backdrop-blur-sm dark:bg-gray-800/50">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Role:</span>
          <select value={user?.role} onChange={(e) => switchRole(e.target.value as UserRole)} className="rounded-lg border-gray-300 bg-white p-1 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value={UserRole.USER}>User</option>
            <option value={UserRole.OFFICER}>Officer</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </select>
        </div>
      </div>
    );
};
  
const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useAppContext();
    return (
      <button onClick={toggleTheme} className="rounded-full p-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
        {theme === 'light' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
      </button>
    );
};

const Sidebar: React.FC<{ currentPage: string, setCurrentPage: (page: string) => void }> = ({ currentPage, setCurrentPage }) => {
    const { user, isSidebarOpen, setIsSidebarOpen } = useAppContext();

    const navLinks = [
      { name: 'Dashboard', page: 'dashboard', icon: <Icons.Dashboard />, roles: [UserRole.USER, UserRole.OFFICER, UserRole.ADMIN] },
      { name: 'Leaderboard', page: 'leaderboard', icon: <Icons.Leaderboard />, roles: [UserRole.USER, UserRole.OFFICER, UserRole.ADMIN] },
      { name: 'Events', page: 'events', icon: <Icons.Events />, roles: [UserRole.USER, UserRole.OFFICER, UserRole.ADMIN] },
      { name: 'Rules & Guidelines', page: 'rules', icon: <Icons.Rules />, roles: [UserRole.USER, UserRole.OFFICER, UserRole.ADMIN] },
      { name: 'Profile', page: `profile/${user?.id}`, icon: <Icons.Profile />, roles: [UserRole.USER, UserRole.OFFICER, UserRole.ADMIN] },
      { name: 'Admin Panel', page: 'admin', icon: <Icons.Admin />, roles: [UserRole.ADMIN] },
    ].filter(link => link.roles.includes(user?.role || UserRole.USER));

    return (
        <aside className={`absolute inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-8">
                    <div className="bg-primary-600 text-white text-xl font-bold rounded-lg w-10 h-10 flex items-center justify-center">S</div>
                    <div>
                        <div className="font-bold text-lg text-gray-800 dark:text-white">SIMS</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Management System</div>
                    </div>
                </div>
                <nav className="flex-grow">
                    <ul className="space-y-2">
                        {navLinks.map(link => (
                            <li key={link.name}>
                                <a onClick={() => { setCurrentPage(link.page); setIsSidebarOpen(false); }}
                                   className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${currentPage.startsWith(link.page.split('/')[0]) ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
                                    {link.icon}
                                    <span>{link.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mt-auto">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <div className="font-semibold text-sm text-gray-800 dark:text-white">{user?.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const Header: React.FC = () => {
    const { user, setIsSidebarOpen, selectedEvent, setSelectedEvent, appData } = useAppContext();
    return (
        <header className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-600 dark:text-gray-300"><Icons.Menu/></button>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Let's see what's happening today.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <label htmlFor="event-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">Event:</label>
                        <select id="event-select" onChange={e => setSelectedEvent(e.target.value)} value={selectedEvent} className="rounded-lg border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm">
                            {Object.keys(appData).map(event => <option key={event} value={event}>{event}</option>)}
                        </select>
                    </div>
                    <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"><Icons.Bell/></button>
                    <ThemeToggle/>
                </div>
            </div>
        </header>
    );
}

// --- PAGE COMPONENTS ---

const Dashboard: React.FC = () => {
  const { selectedEvent, appData } = useAppContext();
  const eventData = appData[selectedEvent];
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useAppContext();

  useEffect(() => {
    if (!barChartRef.current || !eventData || eventData.leaderboard.length === 0) return;
    
    const teamColorMap: { [key: string]: string } = {
        'Midnight Spades': '#3b82f6',
        'Scarlet Hearts': '#ef4444',
        'Emerald Clover': '#22c55e',
        'Glacier Diamonds': '#0ea5e9'
    };

    const maxScore = Math.max(...eventData.leaderboard.map(t => t.score));
    const yAxisMax = Math.ceil(maxScore / 1000) * 1000;

    const chartData = {
        labels: eventData.leaderboard.map(t => t.name),
        datasets: [
            {
                label: 'Previous Score',
                data: eventData.leaderboard.map(t => t.previousScores[0] || 0),
                backgroundColor: theme === 'dark' ? 'rgba(203, 213, 225, 0.4)' : 'rgba(203, 213, 225, 0.7)',
                borderColor: 'transparent',
                borderWidth: 1,
                borderRadius: 8,
            },
            {
                label: 'Current Score',
                data: eventData.leaderboard.map(t => t.score),
                backgroundColor: eventData.leaderboard.map(t => teamColorMap[t.name] || '#9ca3af'),
                borderColor: 'transparent',
                borderWidth: 1,
                borderRadius: 8,
            },
            {
                label: 'Historic Score',
                data: eventData.leaderboard.map(t => t.previousScores[1] || 0),
                backgroundColor: theme === 'dark' ? 'rgba(226, 232, 240, 0.3)' : 'rgba(226, 232, 240, 0.6)',
                borderColor: 'transparent',
                borderWidth: 1,
                borderRadius: 8,
            }
        ]
    };
    
    const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';

    const chart = new (window as any).Chart(barChartRef.current, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'top',
                    labels: { color: textColor }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: yAxisMax,
                    grid: {
                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: { color: textColor }
                },
                x: {
                     grid: {
                        display: false,
                    },
                    ticks: { color: textColor }
                }
            }
        }
    });
    return () => chart.destroy();
  }, [eventData, theme]);

  if (!eventData || eventData.statCards.length === 0) {
      return <div className="animate-fade-in text-center p-10 rounded-2xl bg-white/50 dark:bg-gray-800/50">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">No Data Available</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">There is no information to display for the "{selectedEvent}" event yet.</p>
      </div>
  }

  const statCards = eventData.statCards;
  const topPlayers = eventData.topPlayers;

  return (
      <div className="animate-fade-in space-y-6">
          <h1 id="selectedEvent" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{selectedEvent}</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map(card => (
                  <div key={card.team} className="transform-gpu rounded-2xl bg-white/50 p-5 shadow-lg backdrop-blur-lg transition-all hover:-translate-y-1 hover:shadow-2xl dark:bg-gray-800/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-10 rounded-full ${card.color}`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.team}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.points} <span className="text-base font-medium">Points</span></p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-baseline">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${card.change > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                            {card.change > 0 ? '▲' : '▼'} {Math.abs(card.change)}%
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{card.games} games played</span>
                      </div>
                  </div>
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 rounded-2xl bg-white/50 p-6 shadow-lg backdrop-blur-lg dark:bg-gray-800/50">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Leaderboard Ranking</h3>
                  <div className="relative h-80">
                    <canvas ref={barChartRef}></canvas>
                  </div>
              </div>
              <div className="lg:col-span-2 rounded-2xl bg-white/50 p-6 shadow-lg backdrop-blur-lg dark:bg-gray-800/50">
                 <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Players</h3>
                 <ul className="space-y-3">
                    {topPlayers.map((u, i) => (
                        <li key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-400">#{i+1}</span>
                                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{u.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                                </div>
                            </div>
                            <div className="w-1/3">
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Score</span>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{1800 - i*250}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                    <div className="bg-primary-500 h-1.5 rounded-full" style={{width: `${90-i*12}%`}}></div>
                                </div>
                            </div>
                        </li>
                    ))}
                 </ul>
              </div>
          </div>
      </div>
  );
};

// --- LEADERBOARD MODAL ---
const TeamDetailModal: React.FC<{ team: Team | null, onClose: () => void }> = ({ team, onClose }) => {
    const { user } = useAppContext();
    const canViewSensitive = user?.role === UserRole.ADMIN || user?.role === UserRole.OFFICER;

    if (!team) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-50 p-6 shadow-2xl dark:bg-gray-900 text-gray-800 dark:text-gray-200 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <h2 className="text-2xl font-bold">{team.name} - Details</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Icons.Close /></button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 text-green-600 dark:text-green-400">Merits</h3>
                        <div className="space-y-2 text-sm">
                            {team.details.merits.length > 0 ? team.details.merits.map((merit, i) => (
                                <div key={i} className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                    <div className="flex justify-between">
                                        <span>{merit.category}: {merit.description}</span>
                                        <span className="font-bold text-green-500">+{merit.points}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Updated by: {merit.updatedBy}</div>
                                </div>
                            )) : <p className="text-gray-500 dark:text-gray-400 text-sm">No merits recorded.</p>}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2 text-red-600 dark:text-red-400">Demerits</h3>
                        <div className="space-y-2 text-sm">
                             {team.details.demerits.length > 0 ? team.details.demerits.map((demerit, i) => (
                                <div key={i} className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                    <div className="flex justify-between">
                                        <span>{demerit.reason}</span>
                                        <span className="font-bold text-red-500">-{demerit.points}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {canViewSensitive ? `Contributor: ${demerit.person}` : `Contributor: [Hidden]`} | Updated by: {demerit.updatedBy}
                                    </div>
                                </div>
                            )) : <p className="text-gray-500 dark:text-gray-400 text-sm">No demerits recorded.</p>}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2 text-primary-600 dark:text-primary-400">Event Scores & Competition Points</h3>
                        <div className="space-y-3">
                            {team.details.eventScores.length > 0 ? team.details.eventScores.map((event, i) => (
                                <div key={i} className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                    <p className="font-bold">{event.eventName} - {event.placement}st Place</p>
                                    <p className="text-sm">Competition Points: <span className="font-semibold text-primary-500">{event.competitionPoints}</span> (from {event.basePoints} base points)</p>
                                    {event.scorecard.map((card, j) => (
                                      <div key={j} className="mt-2 text-xs border-t border-gray-200 dark:border-gray-700 pt-2">
                                        <p className="font-semibold">Judge: {card.judge}</p>
                                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                                            {card.scores.map((s, k) => <li key={k}>{s.criteria}: {s.score}</li>)}
                                        </ul>
                                      </div>
                                    ))}
                                </div>
                            )) : <p className="text-gray-500 dark:text-gray-400 text-sm">No event scores recorded yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Leaderboard: React.FC = () => {
    const { selectedEvent, appData } = useAppContext();
    const [teams, setTeams] = useState<Team[]>(appData[selectedEvent]?.leaderboard || []);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    useEffect(() => {
        setTeams(appData[selectedEvent]?.leaderboard || []);
    }, [selectedEvent, appData]);

    useEffect(() => {
        if (!appData[selectedEvent]?.leaderboard || appData[selectedEvent].leaderboard.length === 0) {
            return;
        }

        const interval = setInterval(() => {
            setTeams(prevTeams => {
                if (prevTeams.length === 0) return [];
                const newTeams = JSON.parse(JSON.stringify(prevTeams));
                const randomIndex = Math.floor(Math.random() * newTeams.length);
                newTeams.forEach((t: Team) => t.live = false);
                newTeams[randomIndex].score += Math.floor(Math.random() * 20);
                newTeams[randomIndex].live = true;
                return newTeams.sort((a:Team,b:Team) => b.score - a.score).map((t: Team, i: number) => ({...t, rank: i+1}));
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedEvent, appData]);

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Leaderboard</h1>
            <div className="overflow-hidden rounded-2xl bg-white/50 shadow-lg backdrop-blur-lg dark:bg-gray-800/50">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Rank</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Team</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Score</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 hidden sm:table-cell">W/L</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 hidden sm:table-cell">Players</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {teams.length > 0 ? teams.map(team => (
                            <tr key={team.name} onClick={() => setSelectedTeam(team)} className={`cursor-pointer transition-all duration-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 ${team.live ? 'bg-primary-100/50 dark:bg-primary-900/30' : ''}`}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{team.rank}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-100">{team.name} {team.live && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500 animate-ping"></span>}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300 font-bold">{team.score}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">{team.wins}/{team.losses}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">{team.players}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    No leaderboard data available for "{selectedEvent}".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <TeamDetailModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
        </div>
    );
};

// --- EVENTS MODALS ---

const EventDetailModal: React.FC<{ event: EventData | null, onClose: () => void }> = ({ event, onClose }) => {
    if (!event) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-50 p-6 shadow-2xl dark:bg-gray-900 text-gray-800 dark:text-gray-200 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">{event.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{event.category} | OIC: {event.officer}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Icons.Close /></button>
                </div>
                <div className="space-y-6">
                    {event.description && <p className="text-gray-700 dark:text-gray-300">{event.description}</p>}
                    {event.details?.map((section, idx) => (
                        <div key={idx}>
                            <h3 className="font-bold text-lg text-primary-700 dark:text-primary-300 mb-2">{section.title}</h3>
                            {section.description && <p className="mb-3 text-sm">{section.description}</p>}
                            {section.guidelines && (
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {section.guidelines.map((g, i) => <li key={i}>{g}</li>)}
                                </ul>
                            )}
                            {section.criteria && (
                                <>
                                <h4 className="font-semibold mb-2">Criteria</h4>
                                <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-100 dark:bg-gray-800/50">
                                            <tr>
                                                <th className="p-3 text-left font-semibold">Criteria</th>
                                                <th className="p-3 text-left font-semibold">Description</th>
                                                <th className="p-3 text-right font-semibold">Points</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {section.criteria.map((c, i) => (
                                                <tr key={i}>
                                                    <td className="p-3 font-medium">{c.name}</td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">{c.description}</td>
                                                    <td className="p-3 text-right font-bold">{c.points}</td>
                                                </tr>
                                            ))}
                                            <tr className="font-bold bg-gray-100 dark:bg-gray-800/50">
                                                <td className="p-3" colSpan={2}>Total</td>
                                                <td className="p-3 text-right">{section.criteria.reduce((sum, c) => sum + (typeof c.points === 'number' ? c.points : 0), 0)} pts</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                </>
                            )}
                            {section.competitionPoints && <p className="text-right font-bold mt-2">Competition Points: <span className="text-primary-500">{section.competitionPoints}</span></p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AddEventModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (event: Omit<EventData, 'id'>) => void }> = ({ isOpen, onClose, onSave }) => {
    const { appData, selectedEvent } = useAppContext();
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [participants, setParticipants] = useState('');
    const [officer, setOfficer] = useState('');
    const [judges, setJudges] = useState<string[]>(['']);
    const [description, setDescription] = useState('');
    const [mechanics, setMechanics] = useState('');
    const [criteria, setCriteria] = useState<Criteria[]>([{ name: '', description: '', points: 0 }]);
    const [competitionPoints, setCompetitionPoints] = useState<number | string>('');

    const eventCategories = [...new Set(appData[selectedEvent]?.events.map(e => e.category) || [])];
    
    if (!isOpen) return null;
    
    const resetForm = () => {
        setName(''); setCategory(''); setParticipants(''); setOfficer(''); setJudges(['']);
        setDescription(''); setMechanics(''); setCriteria([{ name: '', description: '', points: 0 }]); setCompetitionPoints('');
    };

    const handleSave = () => {
        if (!name || !category || !participants || !officer) {
            alert("Please fill all required fields."); // Simple validation
            return;
        }

        const newEventDetails: EventGuidelineSection[] = [{
            title: "Mechanics & Criteria",
            description: mechanics,
            criteria: criteria.filter(c => c.name),
            competitionPoints: competitionPoints
        }];

        onSave({ 
            name, 
            category, 
            participants, 
            officer, 
            judges: judges.filter(j => j), 
            description,
            details: newEventDetails 
        });
        onClose();
        resetForm();
    };
    
    // --- Dynamic field handlers ---
    const handleJudgeChange = (index: number, value: string) => setJudges(judges.map((j, i) => i === index ? value : j));
    const addJudgeField = () => setJudges([...judges, '']);
    const removeJudgeField = (index: number) => setJudges(judges.filter((_, i) => i !== index));

    const handleCriteriaChange = (index: number, field: keyof Criteria, value: string) => {
        setCriteria(criteria.map((c, i) => i === index ? { ...c, [field]: value } : c));
    };
    const addCriteriaField = () => setCriteria([...criteria, { name: '', description: '', points: 0 }]);
    const removeCriteriaField = (index: number) => setCriteria(criteria.filter((_, i) => i !== index));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-50 p-6 shadow-2xl dark:bg-gray-900 text-gray-800 dark:text-gray-200 animate-slide-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">Add New Event</h2>
                <div className="space-y-4 text-sm">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" placeholder="Event Name" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600" />
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600">
                            <option value="">Select Category</option>
                            {eventCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            <option value="New Category">-- Add New Category --</option>
                        </select>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" placeholder="No. of Participants" value={participants} onChange={e => setParticipants(e.target.value)} className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600" />
                        <input type="text" placeholder="Officer/s in Charge" value={officer} onChange={e => setOfficer(e.target.value)} className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600" />
                     </div>
                     {/* Description & Mechanics */}
                     <textarea placeholder="General Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600" rows={3}></textarea>
                     <textarea placeholder="Mechanics / Guidelines" value={mechanics} onChange={e => setMechanics(e.target.value)} className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600" rows={4}></textarea>
                    
                    {/* Judges */}
                    <div>
                        <label className="font-medium">Judges</label>
                        {judges.map((judge, index) => (
                            <div key={index} className="flex items-center gap-2 mt-1">
                                <input type="text" value={judge} onChange={e => handleJudgeChange(index, e.target.value)} className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600" placeholder={`Judge ${index + 1}`} />
                                <button onClick={() => removeJudgeField(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Icons.Trash /></button>
                            </div>
                        ))}
                        <button onClick={addJudgeField} className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1"><Icons.Plus/> Add Judge</button>
                    </div>
                     {/* Criteria */}
                     <div>
                        <label className="font-medium">Criteria</label>
                        {criteria.map((c, index) => (
                             <div key={index} className="flex items-center gap-2 mt-1 p-2 rounded-lg bg-white dark:bg-gray-800/50">
                                <input type="text" value={c.name} onChange={e => handleCriteriaChange(index, 'name', e.target.value)} placeholder="Criteria Name" className="w-1/3 rounded-md border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600" />
                                <input type="text" value={c.description} onChange={e => handleCriteriaChange(index, 'description', e.target.value)} placeholder="Description" className="w-2/3 rounded-md border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600" />
                                <input type="number" value={c.points} onChange={e => handleCriteriaChange(index, 'points', e.target.value)} placeholder="Pts" className="w-20 rounded-md border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600" />
                                <button onClick={() => removeCriteriaField(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Icons.Trash /></button>
                             </div>
                        ))}
                        <button onClick={addCriteriaField} className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1"><Icons.Plus/> Add Criterion</button>
                    </div>
                    {/* Competition Points */}
                    <input type="number" placeholder="Competition Points" value={competitionPoints} onChange={e => setCompetitionPoints(parseInt(e.target.value) || '')} className="w-full sm:w-1/2 rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600" />
                </div>
                 <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded-2xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSave} className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-700">Add Event</button>
                </div>
            </div>
        </div>
    );
};

const EventEditModal: React.FC<{ event: EventData | null, onClose: () => void, onSave: (event: EventData) => void }> = ({ event, onClose, onSave }) => {
    const [formData, setFormData] = useState<EventData | null>(null);

    useEffect(() => {
        setFormData(event ? JSON.parse(JSON.stringify(event)) : null);
    }, [event]);
    
    if (!formData) return null;

    const handleSave = () => {
        onSave(formData);
        onClose();
    };
    
    // --- Criteria handlers ---
    const handleCriteriaChange = (sectionIndex: number, criteriaIndex: number, field: keyof Criteria, value: string | number) => {
        const newDetails = [...(formData.details || [])];
        const newCriteria = [...(newDetails[sectionIndex].criteria || [])];
        newCriteria[criteriaIndex] = { ...newCriteria[criteriaIndex], [field]: value };
        newDetails[sectionIndex] = { ...newDetails[sectionIndex], criteria: newCriteria };
        setFormData({ ...formData, details: newDetails });
    };
    const addCriteriaField = (sectionIndex: number) => {
        const newDetails = [...(formData.details || [])];
        const newCriteria = [...(newDetails[sectionIndex].criteria || []), {name: '', description: '', points: 0}];
        newDetails[sectionIndex] = {...newDetails[sectionIndex], criteria: newCriteria};
        setFormData({...formData, details: newDetails});
    };
    const removeCriteriaField = (sectionIndex: number, criteriaIndex: number) => {
        const newDetails = [...(formData.details || [])];
        const newCriteria = (newDetails[sectionIndex].criteria || []).filter((_, i) => i !== criteriaIndex);
        newDetails[sectionIndex] = {...newDetails[sectionIndex], criteria: newCriteria};
        setFormData({...formData, details: newDetails});
    };

    // --- Judge handlers ---
    const handleJudgeChange = (index: number, value: string) => {
        const newJudges = [...(formData.judges || [])];
        newJudges[index] = value;
        setFormData({ ...formData, judges: newJudges });
    };
    const addJudgeField = () => setFormData({ ...formData, judges: [...(formData.judges || []), ''] });
    const removeJudgeField = (index: number) => setFormData({ ...formData, judges: (formData.judges || []).filter((_, i) => i !== index) });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-50 p-6 shadow-2xl dark:bg-gray-900 text-gray-800 dark:text-gray-200 animate-slide-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Edit Event: {event?.name}</h2>
                <div className="space-y-4 text-sm">
                    <div>
                        <h3 className="font-semibold text-lg my-2">Judging</h3>
                        <div>
                            <label className="font-medium">Judges</label>
                            {(formData.judges || []).map((judge, index) => (
                                <div key={index} className="flex items-center gap-2 mt-1">
                                    <input type="text" value={judge} onChange={e => handleJudgeChange(index, e.target.value)} className="w-full rounded-lg border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600" />
                                    <button onClick={() => removeJudgeField(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Icons.Trash /></button>
                                </div>
                            ))}
                            <button onClick={addJudgeField} className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1"><Icons.Plus/> Add Judge</button>
                        </div>
                        <div className="mt-4">
                            <label className="font-medium">Criteria</label>
                            {(formData.details || []).map((section, sIdx) => (
                                <div key={sIdx} className="mt-2 p-3 border dark:border-gray-700 rounded-lg">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300">{section.title}</h4>
                                {section.criteria?.map((c, cIdx) => (
                                    <div key={cIdx} className="grid grid-cols-1 md:grid-cols-[1fr,2fr,auto,auto] gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg mt-1 items-center">
                                        <input type="text" value={c.name} onChange={e => handleCriteriaChange(sIdx, cIdx, 'name', e.target.value)} placeholder="Criteria Name" className="rounded-md border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600" />
                                        <input type="text" value={c.description} onChange={e => handleCriteriaChange(sIdx, cIdx, 'description', e.target.value)} placeholder="Description" className="rounded-md border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600" />
                                        <input type="number" value={c.points} onChange={e => handleCriteriaChange(sIdx, cIdx, 'points', parseInt(e.target.value) || 0)} placeholder="Pts" className="w-20 rounded-md border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600" />
                                        <button onClick={() => removeCriteriaField(sIdx, cIdx)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Icons.Trash /></button>
                                    </div>
                                ))}
                                <button onClick={() => addCriteriaField(sIdx)} className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1"><Icons.Plus/> Add Criterion</button>
                                <p className="text-right font-bold mt-2">Total: {section.criteria?.reduce((sum, c) => sum + (typeof c.points === 'number' ? c.points : 0), 0)} points</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded-2xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSave} className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-700">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const Events: React.FC = () => {
    const { user, selectedEvent, appData, updateEventData, addEventData, deleteEventData } = useAppContext();
    const isAdminOrOfficer = user?.role === UserRole.ADMIN || user?.role === UserRole.OFFICER;
    
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
    const [viewingEvent, setViewingEvent] = useState<EventData | null>(null);

    const events = appData[selectedEvent]?.events || [];
    
    const handleDelete = (eventId: number) => {
        if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            deleteEventData(eventId);
        }
    };

    const groupedEvents = events.reduce((acc, event) => {
        const category = event.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(event);
        return acc;
    }, {} as Record<string, EventData[]>);

    if (events.length === 0 && !isAdminOrOfficer) {
        return (
            <div className="animate-fade-in">
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Events</h1>
                 <div className="text-center p-10 rounded-2xl bg-white/50 dark:bg-gray-800/50">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">No Events Scheduled</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">There are no events scheduled for "{selectedEvent}" yet.</p>
                </div>
            </div>
        );
    }

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Events</h1>
            {isAdminOrOfficer && <button onClick={() => setIsAddingEvent(true)} className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center gap-2"><Icons.Plus /> Add Event</button>}
        </div>
      
        <div className="space-y-10">
            {Object.keys(groupedEvents).length > 0 ? Object.entries(groupedEvents).map(([category, categoryEvents]) => (
                <div key={category} className="animate-slide-up" style={{ animationDelay: `${Object.keys(groupedEvents).indexOf(category) * 100}ms` }}>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b-2 border-primary-500/30">{category}</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {categoryEvents.map(event => (
                            <div key={event.id} className="rounded-2xl bg-white/50 p-6 shadow-lg backdrop-blur-lg dark:bg-gray-800/50 flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl">
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{event.name}</h3>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Participants: <span className="font-medium">{event.participants}</span></p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">OIC: <span className="font-medium">{event.officer}</span></p>
                                </div>
                                <div className="mt-6 flex justify-end gap-2">
                                    <button onClick={() => setViewingEvent(event)} className="rounded-xl bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Details</button>
                                    {isAdminOrOfficer && (
                                        <>
                                            <button onClick={() => setEditingEvent(event)} className="rounded-xl bg-gray-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500">Edit</button>
                                            <button onClick={() => handleDelete(event.id)} className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500">Delete</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )) : (
                <div className="text-center p-10 rounded-2xl bg-white/50 dark:bg-gray-800/50">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">No Events Scheduled</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Click "Add Event" to get started.</p>
                </div>
            )}
        </div>

        <AddEventModal isOpen={isAddingEvent} onClose={() => setIsAddingEvent(false)} onSave={addEventData} />
        <EventDetailModal event={viewingEvent} onClose={() => setViewingEvent(null)} />
        <EventEditModal event={editingEvent} onClose={() => setEditingEvent(null)} onSave={updateEventData} />
    </div>
  );
};

const AccordionItem: React.FC<{ title: string; children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between py-4 text-left font-semibold text-lg text-gray-800 dark:text-gray-100">
                <span>{title}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><Icons.ChevronDown /></span>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[5000px]' : 'max-h-0'}`}>
                <div className="pb-4 text-gray-600 dark:text-gray-300">
                    {children}
                </div>
            </div>
        </div>
    );
};

const RulesPage: React.FC = () => {
    const { selectedEvent, appData } = useAppContext();
    const rules = appData[selectedEvent]?.rules;

    if (!rules) {
        return (
            <div className="animate-fade-in">
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Rules & Guidelines</h1>
                 <div className="text-center p-10 rounded-2xl bg-white/50 dark:bg-gray-800/50">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">No Rules Available</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">There are no rules or guidelines available for "{selectedEvent}" yet.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{rules.title}</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{rules.subtitle}</p>
                <div className="mt-4 flex justify-center gap-2">
                    {rules.sdgs.map((sdg: string) => (
                        <span key={sdg} className="inline-flex items-center rounded-full bg-primary-100 px-3 py-0.5 text-sm font-medium text-primary-800 dark:bg-primary-900/50 dark:text-primary-300">{sdg}</span>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl bg-white/50 p-6 shadow-lg backdrop-blur-lg dark:bg-gray-800/50 space-y-4">
                 <AccordionItem title="Objectives" defaultOpen>
                    <ul className="list-disc space-y-2 pl-5">
                        {rules.objectives.map((obj: string, i: number) => <li key={i}>{obj}</li>)}
                    </ul>
                 </AccordionItem>
                 <AccordionItem title="House Rules">
                    <div className="space-y-4">
                        {rules.houseRules.map((section: { title: string, rules: string[] }, i: number) => (
                            <div key={i}>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{section.title}</h4>
                                <ul className="list-disc space-y-2 pl-5">
                                    {section.rules.map((rule: string, j: number) => <li key={j}>{rule}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                 </AccordionItem>
                  <AccordionItem title="Scoring System">
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Base Points per Event Type</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700/50"><tr><th className="p-2 text-left">Event Type</th><th className="p-2 text-left">Base Points</th></tr></thead>
                                    <tbody>{rules.scoring.basePoints.map((item: any, i:number) => <tr key={i} className="border-b border-gray-200 dark:border-gray-700"><td className="p-2">{item.type}</td><td className="p-2">{item.points} points</td></tr>)}</tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Placement Scoring</h4>
                             <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700/50"><tr><th className="p-2 text-left">Placement</th><th className="p-2 text-left">Points Awarded</th></tr></thead>
                                    <tbody>{rules.scoring.placement.map((item: any, i:number) => <tr key={i} className="border-b border-gray-200 dark:border-gray-700"><td className="p-2">{item.place}</td><td className="p-2">{item.points}</td></tr>)}</tbody>
                                </table>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Merit Points</h4>
                             <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700/50"><tr><th className="p-2 text-left">Category</th><th className="p-2 text-left">Points</th></tr></thead>
                                    <tbody>{rules.scoring.meritPoints.map((item: any, i:number) => <tr key={i} className="border-b border-gray-200 dark:border-gray-700"><td className="p-2">{item.category}</td><td className="p-2">{item.points}</td></tr>)}</tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Demerit Deductions</h4>
                             <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700/50"><tr><th className="p-2 text-left">Offense</th><th className="p-2 text-left">Deduction</th></tr></thead>
                                    <tbody>{rules.demeritDeductions.map((item: any, i:number) => <tr key={i} className="border-b border-gray-200 dark:border-gray-700"><td className="p-2">{item.offense}</td><td className="p-2 text-red-500 font-semibold">{item.deduction}</td></tr>)}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </AccordionItem>
                <AccordionItem title="Team Formation & Roles">
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Unit Leaders</h4>
                            {rules.teamFormation.leaders.map((leader: any, i: number) => (
                                <div key={i} className="mb-2">
                                    <p><strong>{leader.position} ({leader.count} only):</strong> {leader.description}</p>
                                </div>
                            ))}
                        </div>
                        <div>
                             <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Advisers</h4>
                             <p>{rules.teamFormation.advisers}</p>
                        </div>
                         <div>
                             <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Unit Naming Convention</h4>
                             <p>{rules.teamFormation.naming.description}</p>
                             <ul className="list-disc pl-5 mt-2">
                                {rules.teamFormation.naming.teams.map((team:any, i:number) => <li key={i}>{team.name}: {team.color}</li>)}
                             </ul>
                             <p className="mt-2"><strong>Format:</strong> {rules.teamFormation.naming.format}</p>
                        </div>
                    </div>
                </AccordionItem>
            </div>
        </div>
    );
};

const Profile: React.FC = () => {
    const { user } = useAppContext();
    if (!user) return null;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white/50 p-8 shadow-lg backdrop-blur-lg dark:bg-gray-800/50">
                <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-8">
                    <img src={user.avatar} alt={user.name} className="h-32 w-32 rounded-full shadow-md"/>
                    <div className="mt-6 text-center md:mt-0 md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                        <p className="mt-1 text-primary-600 dark:text-primary-400 font-medium capitalize">{user.role}</p>
                        <p className="mt-4 max-w-xl text-gray-600 dark:text-gray-300">A passionate player with 5 years of experience in competitive gaming. Specializes in strategy and team coordination.</p>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Details</h2>
                    <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</dd>
                        </div>
                         <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Student ID</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">SIMS-00{user.id}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
};

const Admin: React.FC = () => {
    const { user } = useAppContext();
    if (user?.role !== UserRole.ADMIN) {
        return <div className="text-center text-red-500">Access Denied. Admins only.</div>
    }

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Admin Panel</h1>
            <div className="overflow-hidden rounded-2xl bg-white/50 shadow-lg backdrop-blur-lg dark:bg-gray-800/50">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.values(mockUsers).map(u => (
                            <tr key={u.id}>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full" src={u.avatar} alt={u.name} />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {u.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">{u.role}</span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    <a href="#" className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200">Edit</a>
                                    <a href="#" className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Delete</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    const pageName = currentPage.split('/')[0];
    switch (pageName) {
      case 'dashboard': return <Dashboard />;
      case 'leaderboard': return <Leaderboard />;
      case 'events': return <Events />;
      case 'rules': return <RulesPage />;
      case 'profile': return <Profile />;
      case 'admin': return <Admin />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppProvider>
        <div className="h-screen font-sans text-gray-800 dark:text-gray-200 flex overflow-hidden">
            <AnimatedBackground />
            <RoleSwitcher />
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    </AppProvider>
  );
}
