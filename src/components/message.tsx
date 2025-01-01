import dynamic from "next/dynamic";
const Renderer = dynamic(
  () => import("./renderer"),
  { ssr: false }
);

import {
  Doc,
  Id,
} from "../../convex/_generated/dataModel";
import {
  format,
  isToday,
  isYesterday,
} from "date-fns";
import { Hint } from "./ui/hint";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "./ui/avatar";
import { Thumbnail } from "./thumbnail";

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages">) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
}

const formatFulltTime = (date: Date) => {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d")} at ${format(date, "hh:mm:s a")}`;
};

export const Message = ({
  id,
  isAuthor,
  memberId,
  authorImage,
  authorName = "Member",
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  isCompact,
  setEditingId,
  hideThreadButton,
  threadCount,
  threadImage,
  threadTimestamp,
}: MessageProps) => {
  if (isCompact) {
    return (
      <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative">
        <div className="flex items-start gap-2">
          <Hint
            label={formatFulltTime(
              new Date(createdAt)
            )}
          >
            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline mr-0.5">
              {format(
                new Date(createdAt),
                "hh:mm"
              )}
            </button>
          </Hint>
          <div className="flex flex-col w-full">
            <Renderer value={body} />
            <Thumbnail url={image} />

            {updatedAt ? (
              <span className="text-xs text-muted-foreground">
                (edited)
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const avatarFallback = authorName
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative">
      <div className="flex items-start gap-2">
        <button>
          <Avatar>
            <AvatarImage
              className="rouned=md"
              src={authorImage}
            />
            <AvatarFallback>
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="flex flex-col w-full overflow-hidden">
          <div className="text-sm">
            <button
              onClick={() => {}}
              className="font-bold text-primary hover:underline"
            >
              {authorName}
            </button>
            <span>&nbsp;&nbsp;</span>
            <Hint
              label={formatFulltTime(
                new Date(createdAt)
              )}
            >
              <button className="text-xs text-muted-foreground hover:underline">
                {format(
                  new Date(createdAt),
                  "h:mm a"
                )}
              </button>
            </Hint>
          </div>

          <Renderer value={body} />

          <Thumbnail url={image} />

          {updatedAt ? (
            <span className="text-xs text-muted-foreground">
              (edited)
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
