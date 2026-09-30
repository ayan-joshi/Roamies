import "server-only";
import { formatRange } from "@/lib/format";
import type { ChatMessage, FeedItem, IncomingIntro, Place, Prompt, PromptAnswer, RoomContext, Trip } from "@/lib/types";

// Sample data for /demo. Dates are relative to today so the demo never goes stale.
function inDays(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const DEMO_PLACES: Place[] = [
  { id: 1, name: "Manali", circuit: "Himachal" },
  { id: 2, name: "Kasol", circuit: "Himachal" },
  { id: 3, name: "Tosh", circuit: "Himachal" },
  { id: 4, name: "Bir", circuit: "Himachal" },
  { id: 5, name: "Jibhi", circuit: "Himachal" },
  { id: 9, name: "Rishikesh", circuit: "Uttarakhand" },
  { id: 12, name: "Nainital", circuit: "Uttarakhand" },
  { id: 19, name: "Anjuna", circuit: "Goa", kind: "beach" },
  { id: 22, name: "Arambol", circuit: "Goa" },
  { id: 201, name: "Varanasi", circuit: "Uttar Pradesh" },
  { id: 202, name: "Jaipur", circuit: "Rajasthan" },
  { id: 203, name: "Udaipur", circuit: "Rajasthan" },
  { id: 204, name: "Leh", circuit: "Ladakh" },
  { id: 210, name: "Triund", circuit: "Himachal", kind: "trek" },
  { id: 211, name: "Kedarkantha", circuit: "Uttarakhand", kind: "trek" },
  { id: 212, name: "Hampta Pass", circuit: "Himachal", kind: "trek" },
  { id: 213, name: "Tsomgo Lake", circuit: "Sikkim", kind: "spot" },
  { id: 205, name: "Hampi", circuit: "Karnataka" },
  { id: 206, name: "Gokarna", circuit: "Karnataka", kind: "beach" },
  { id: 207, name: "Varkala", circuit: "Kerala", kind: "beach" },
  { id: 208, name: "Darjeeling", circuit: "West Bengal" },
  { id: 209, name: "Shillong", circuit: "Meghalaya" },
];

export const DEMO_PROMPTS: Prompt[] = [
  { id: 1, text: "My ideal stay in the hills looks like...", placeholder: "A tiny homestay, chai at 6am, no wifi", category: "travel-style" },
  { id: 2, text: "The trek I keep telling people about...", placeholder: "Kheerganga in the rain, zero regrets", category: "travel-style" },
  { id: 4, text: "My non-negotiable on a trip...", placeholder: "At least one sunrise", category: "travel-style" },
  { id: 5, text: "I am looking for a buddy who...", placeholder: "Is fine with 4am starts and slow cafe afternoons", category: "about-me" },
  { id: 8, text: "My split-the-bill philosophy...", placeholder: "Split everything, settle on Splitwise same day", category: "logistics" },
  { id: 10, text: "Work-from-mountains setup...", placeholder: "Laptop, power bank, a cafe with a backup inverter", category: "logistics" },
];

// "You" are going to Manali in 10 days.
export function demoBaseTrips(): Trip[] {
  return [
    {
      id: 900,
      start_date: inDays(10),
      end_date: inDays(16),
      budget_bracket: "Hostel/Budget",
      vibe_tag: "Trekking/Adventure",
      note: "first time in parvati valley, want a trek buddy",
      place: { name: "Manali", circuit: "Himachal" },
    },
  ];
}

type Traveller = Omit<FeedItem, "my_place_name" | "circuit" | "start_date" | "end_date"> & {
  startIn: number;
  endIn: number;
  circuit: string;
  answers: [string, string, string, string];
};

const TRAVELLERS: Traveller[] = [
  {
    itinerary_id: 101, user_id: "demo-ananya", display_name: "Ananya", age: 24, gender: "Female", home_city: "Pune",
    avatar_url: null, is_verified: true, place_name: "Kasol", circuit: "Himachal", startIn: 12, endIn: 18,
    budget_bracket: "Hostel/Budget", vibe_tag: "Trekking/Adventure", note: "doing kheerganga + tosh. slow mornings, fast chai.",
    distance_km: 28.5, overlap_days: 5,
    answers: ["My ideal stay in the hills looks like...", "a dorm with a wood stove, one guy with a guitar who knows 2 songs, maggi at 2am",
      "The trek I keep telling people about...", "hampta pass, 2024. cried at the top. blamed the wind."],
  },
  {
    itinerary_id: 102, user_id: "demo-meher", display_name: "Meher", age: 26, gender: "Non-Binary", home_city: "Delhi",
    avatar_url: null, is_verified: true, place_name: "Manali", circuit: "Himachal", startIn: 9, endIn: 13,
    budget_bracket: "Mid-range", vibe_tag: "Cafe Hopping/Chill", note: "old manali cafes, one day in solang, zero agenda",
    distance_km: 0, overlap_days: 4,
    answers: ["Work-from-mountains setup...", "laptop, power bank, a cafe with a backup inverter and good momos",
      "My split-the-bill philosophy...", "splitwise same night or i lose sleep"],
  },
  {
    itinerary_id: 103, user_id: "demo-kabir", display_name: "Kabir", age: 27, gender: "Male", home_city: null,
    avatar_url: null, is_verified: false, place_name: "Tosh", circuit: "Himachal", startIn: 15, endIn: 20,
    budget_bracket: "Hostel/Budget", vibe_tag: "Partying", note: null,
    distance_km: 35.2, overlap_days: 2,
    answers: ["I am looking for a buddy who...", "is fine with 4am starts and very slow cafe afternoons",
      "My non-negotiable on a trip...", "one sunrise, one bonfire, one bad decision"],
  },
  {
    itinerary_id: 104, user_id: "demo-riya", display_name: "Riya", age: 23, gender: "Female", home_city: "Bengaluru",
    avatar_url: null, is_verified: true, place_name: "Bir", circuit: "Himachal", startIn: 11, endIn: 15,
    budget_bracket: "Hostel/Budget", vibe_tag: "Trekking/Adventure", note: "paragliding if the weather behaves, rajgundha if it doesn't",
    distance_km: 49.1, overlap_days: 5,
    answers: ["My ideal stay in the hills looks like...", "a hostel with a terrace, a dog that adopts me, and chai on tap",
      "The trek I keep telling people about...", "triund at night. did not plan for the cold. learned."],
  },
  {
    itinerary_id: 105, user_id: "demo-tenzin", display_name: "Tenzin", age: 29, gender: "Male", home_city: "Dharamshala",
    avatar_url: null, is_verified: true, place_name: "Jibhi", circuit: "Himachal", startIn: 14, endIn: 21,
    budget_bracket: "Mid-range", vibe_tag: "Spiritual", note: "slow week, waterfall, jalori pass, maybe serolsar lake",
    distance_km: 74.8, overlap_days: 3,
    answers: ["My non-negotiable on a trip...", "a quiet morning before anyone else wakes up",
      "I am looking for a buddy who...", "walks slow, talks less, and carries snacks"],
  },
];

export function demoFeed(): { items: FeedItem[]; answersByUser: Record<string, PromptAnswer[]> } {
  const items: FeedItem[] = [];
  const answersByUser: Record<string, PromptAnswer[]> = {};
  for (const t of TRAVELLERS) {
    const { startIn, endIn, answers, ...rest } = t;
    items.push({ ...rest, start_date: inDays(startIn), end_date: inDays(endIn), my_place_name: "Manali" });
    answersByUser[t.user_id] = [
      { id: t.itinerary_id * 10 + 1, user_id: t.user_id, prompt: { text: answers[0] }, answer: answers[1] },
      { id: t.itinerary_id * 10 + 2, user_id: t.user_id, prompt: { text: answers[2] }, answer: answers[3] },
    ];
  }
  return { items, answersByUser };
}

export function demoIncoming(): IncomingIntro[] {
  const [trip] = demoBaseTrips();
  return [
    {
      id: 201,
      intro_message: "also doing a slow manali week. hampta pass on the 13th? i have a spare trekking pole and zero sense of direction",
      created_at: new Date().toISOString(),
      target_type: "itinerary",
      sender: { id: "demo-zoya", display_name: "Zoya", verification_status: "verified" },
      itinerary: { start_date: trip.start_date, end_date: trip.end_date, place: { name: "Manali" } },
      user_prompt: null,
    },
    {
      id: 202,
      intro_message: "a hostel dog adopting you is the only valid way to choose a hostel. i know one in old manali with 3 dogs",
      created_at: new Date().toISOString(),
      target_type: "prompt",
      sender: { id: "demo-arjun", display_name: "Arjun", verification_status: "unverified" },
      itinerary: null,
      user_prompt: { answer: "a hostel with a terrace, a dog that adopts me, chai on tap", prompt: { text: "My ideal stay in the hills looks like..." } },
    },
  ];
}

export const DEMO_EXISTING_MATCHES = [{ id: 301, name: "Ishaan" }];

type DemoRoom = {
  otherId: string;
  otherName: string;
  verified: boolean;
  context: RoomContext;
  opener: { fromMe: boolean; body: string };
  history: { fromMe: boolean; body: string; minutesAgo: number }[];
  replies: string[];
};

export function demoRoom(matchId: number): DemoRoom | null {
  const [trip] = demoBaseTrips();
  const manali = { label: "TRIP", body: `Manali · ${formatRange(trip.start_date, trip.end_date)}`, handwritten: false };
  const rooms: Record<number, DemoRoom> = {
    301: {
      otherId: "demo-ishaan",
      otherName: "Ishaan",
      verified: true,
      context: { label: "THE TREK I KEEP TELLING PEOPLE ABOUT...", body: "beas kund in the rain. zero visibility, full vibes", handwritten: true },
      opener: { fromMe: true, body: "beas kund in the rain is either the best or worst idea. which one was it?" },
      history: [
        { fromMe: false, body: "both. i'd do it again tomorrow", minutesAgo: 95 },
        { fromMe: true, body: "ok so i'm in manali on the 10th. solang one day, beas kund if weather holds?", minutesAgo: 90 },
        { fromMe: false, body: "deal. i'll check the forecast on the 9th. hostel near the mall road bus stand?", minutesAgo: 60 },
      ],
      replies: ["haha fair. splitting a cab from the bus stand then", "i'll book the dorm tonight. two beds, one near the heater", "chai at 6 before we leave. non negotiable"],
    },
    201: {
      otherId: "demo-zoya",
      otherName: "Zoya",
      verified: true,
      context: manali,
      opener: { fromMe: false, body: "also doing a slow manali week. hampta pass on the 13th? i have a spare trekking pole and zero sense of direction" },
      history: [],
      replies: ["amazing. i'll look up the jobra trailhead timings", "budget wise i'm thinking dorms + shared cab. works?", "sending you the trek group link once we lock dates"],
    },
    202: {
      otherId: "demo-arjun",
      otherName: "Arjun",
      verified: false,
      context: { label: "MY IDEAL STAY IN THE HILLS LOOKS LIKE...", body: "a hostel with a terrace, a dog that adopts me, chai on tap", handwritten: true },
      opener: { fromMe: false, body: "a hostel dog adopting you is the only valid way to choose a hostel. i know one in old manali with 3 dogs" },
      history: [],
      replies: ["the dogs are called momo, maggi and sir. sir is the boss", "it's 600 a night with breakfast. want the link?", "i'm there 11th to 15th if you want to split a room"],
    },
  };
  return rooms[matchId] ?? null;
}

/** Opening intro + history as chat messages, timestamped relative to now. */
export function demoRoomMessages(room: DemoRoom): { messages: ChatMessage[]; matchedOn: string } {
  const now = Date.now();
  const at = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
  return {
    matchedOn: at(110),
    messages: [
      { id: "intro", sender_id: room.opener.fromMe ? "me" : "other", body: room.opener.body, created_at: at(120) },
      ...room.history.map((h, i) => ({ id: `h${i}`, sender_id: h.fromMe ? "me" : "other", body: h.body, created_at: at(h.minutesAgo) })),
    ],
  };
}

const DEMO_NAMES: Record<string, string> = {
  "demo-ananya": "Ananya",
  "demo-meher": "Meher",
  "demo-kabir": "Kabir",
  "demo-riya": "Riya",
  "demo-tenzin": "Tenzin",
  "demo-zoya": "Zoya",
  "demo-arjun": "Arjun",
  "demo-ishaan": "Ishaan",
};

export function demoPersonName(userId: string) {
  return DEMO_NAMES[userId] ?? "this person";
}
