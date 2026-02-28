"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface RemoteCursor {
  userId: string;
  x: number;
  y: number;
  userName: string;
  color: string;
}

interface MvpRealtimeCursorProps {
  channelName: string;
  currentUserId: string;
}

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
];

const MvpRealtimeCursor: React.FC<MvpRealtimeCursorProps> = ({
  channelName,
  currentUserId,
}) => {
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({});
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    const handleMouseMove = (e: MouseEvent) => {
      channel.send({
        type: "broadcast",
        event: "cursor_move",
        payload: {
          x: e.clientX,
          y: e.clientY,
        },
      });
    };

    channel
      .on("broadcast", { event: "cursor_move" }, (payload) => {
        const { presence } = payload;
        if (presence?.key !== currentUserId) {
          setCursors((prev) => ({
            ...prev,
            [presence?.key]: {
              userId: presence?.key || "",
              x: payload.payload.x,
              y: payload.payload.y,
              userName: presence?.userName || "User",
              color: colors[Math.abs((presence?.key || "").split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0)) % colors.length],
            },
          }));
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          window.addEventListener("mousemove", handleMouseMove);
        }
      });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      supabase.removeChannel(channel);
    };
  }, [channelName, currentUserId, supabase]);

  return (
    <>
      {Object.values(cursors).map((cursor) => (
        <div
          key={cursor.userId}
          style={{
            position: "fixed",
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            pointerEvents: "none",
            zIndex: 40,
          }}
        >
          <div className="relative">
            {/* Cursor Arrow */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ color: cursor.color }}
            >
              <path
                d="M0 0L0 16.9231L4.38462 13.0769L10 20L13.0769 18.1538L7.34615 11.0769L16.9231 11.0769L0 0Z"
                fill="currentColor"
              />
            </svg>
            {/* Label */}
            <div
              className="absolute top-6 left-1 bg-white rounded px-2 py-1 text-xs font-medium whitespace-nowrap shadow-lg"
              style={{ borderBottom: `2px solid ${cursor.color}` }}
            >
              {cursor.userName}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default MvpRealtimeCursor;
