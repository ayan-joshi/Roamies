import { notFound } from "next/navigation";
import { ChatRoom } from "@/components/chat/chat-room";
import { RoomView } from "@/components/views/room-view";
import { demoRoom, demoRoomMessages } from "@/lib/demo/data";
import { demoIntrosFor } from "@/lib/demo/selectors";
import { readDemoState } from "@/lib/demo/state";
import { demoSendMessage } from "../../actions";

export default async function DemoRoomPage({ params }: PageProps<"/demo/matches/[id]">) {
  const matchId = Number((await params).id);
  const { matches } = demoIntrosFor(await readDemoState());
  const room = demoRoom(matchId);
  // Only rooms for matches you actually have (e.g. after accepting Zoya) open.
  if (!room || !matches.some((m) => m.id === matchId)) notFound();

  const { messages, matchedOn } = demoRoomMessages(room);

  return (
    <RoomView
      backHref="/demo/intros"
      safetyHref={`/demo/safety/${room.otherId}?match=${matchId}`}
      otherName={room.otherName}
      verified={room.verified}
      matchedOn={matchedOn}
      context={room.context}
      banner={
        <div className="bg-lime px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-note-ink">
          DEMO · REPLIES ARE SAMPLE MESSAGES
        </div>
      }
    >
      <ChatRoom mode="demo" matchId={matchId} myId="me" otherName={room.otherName} initialMessages={messages} send={demoSendMessage} demoReplies={room.replies} />
    </RoomView>
  );
}
