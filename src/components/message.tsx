import dynamic from "next/dynamic";
const Renderer = dynamic(
  () => import("@/components/renderer"),
  { ssr: false }
);

const Editor = dynamic(
  () => import("@/components/editor"),
  {
    ssr: false,
  }
);

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UseUpdateMessage } from "@/features/messages/api/use-update-message";
import { UseRemoveMessage } from "@/features/messages/api/use-remove-message";
import { UseToogleReaction } from "@/features/reactions/api/use-toogle-reaction";
import { useConfirm } from "@/hooks/use-confirm";
import { usePanel } from "@/hooks/use-panel";
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
import { Toolbar } from "./toolbar";
import { v } from "convex/values";
import { Reactions } from "./reactions";
import { ThreadBar } from "./thread-bar";

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
  setEditingId: (
    id: Id<"messages"> | null
  ) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
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
  threadName,
  threadTimestamp,
}: MessageProps) => {
  const {
    parentMessageId,
    onOpenMessage,
    onOpenProfile,
    onClose,
  } = usePanel();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete message",
    "Are you sure you want to delete this message?"
  );

  const {
    mutate: updateMessage,
    isPending: isUpdatingMessage,
  } = UseUpdateMessage();

  const {
    mutate: removeMessage,
    isPending: isRemovingMessage,
  } = UseRemoveMessage();

  const {
    mutate: toogleReaction,
    isPending: isTooglingReaction,
  } = UseToogleReaction();

  const isPending =
    isUpdatingMessage ||
    isRemovingMessage ||
    isTooglingReaction;

  const handleReaction = (value: string) => {
    toogleReaction(
      { messageId: id, value },
      {
        onError: () => {
          toast.error("Failed to add reaction");
        },
      }
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;

    removeMessage(
      { id },
      {
        onSuccess: () => {
          toast.success("Message deleted");

          if (parentMessageId === id) {
            onClose();
          }
        },
        onError: () => {
          toast.error("Failed to delete message");
        },
      }
    );
  };

  const handleUpdate = ({
    body,
  }: {
    body: string;
  }) => {
    updateMessage(
      { id, body },
      {
        onSuccess: () => {
          toast.success("Message updated");
          setEditingId(null);
        },
        onError: () => {
          toast.error("Failed to update message");
        },
      }
    );
  };
  if (isCompact) {
    return (
      <>
        <ConfirmDialog />
        <div
          className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
            isEditing &&
              "bg-[#f2c74433] hover:bg-[#f2c74433]",
            isRemovingMessage &&
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
          )}
        >
          <div className="flex items-start gap-2">
            <Hint
              label={formatFulltTime(
                new Date(createdAt)
              )}
            >
              <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-10 leading-[22px] text-center hover:underline shrink-0">
                {format(
                  new Date(createdAt),
                  "hh:mm"
                )}
              </button>
            </Hint>
            {isEditing ? (
              <div className="w-full h-full">
                <Editor
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValue={JSON.parse(body)}
                  onCancel={() =>
                    setEditingId(null)
                  }
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <Renderer value={body} />
                <Thumbnail url={image} />

                {updatedAt ? (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                ) : null}

                <Reactions
                  data={reactions}
                  onChange={handleReaction}
                />
                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  name={threadName}
                  timestamp={threadTimestamp}
                  onClick={() =>
                    onOpenMessage(id)
                  }
                />
              </div>
            )}
          </div>
          {!isEditing && (
            <Toolbar
              isAuthor={isAuthor}
              isPending={isPending}
              handleEdit={() => {
                setEditingId(id);
              }}
              handleThread={() =>
                onOpenMessage(id)
              }
              handleDelete={handleDelete}
              handleReaction={handleReaction}
              hideThreadButton={hideThreadButton}
            />
          )}
        </div>
      </>
    );
  }

  const avatarFallback = authorName
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <ConfirmDialog />
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing &&
            "bg-[#f2c74433] hover:bg-[#f2c74433]",
          isRemovingMessage &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}
      >
        <div className="flex items-start gap-2">
          <button
            onClick={() =>
              onOpenProfile(memberId)
            }
          >
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
          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() =>
                  setEditingId(null)
                }
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button
                  onClick={() =>
                    onOpenProfile(memberId)
                  }
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

              <Reactions
                data={reactions}
                onChange={handleReaction}
              />
              <ThreadBar
                count={threadCount}
                image={threadImage}
                name={threadName}
                timestamp={threadTimestamp}
                onClick={() => onOpenMessage(id)}
              />
            </div>
          )}
        </div>

        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => {
              setEditingId(id);
            }}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleDelete}
            handleReaction={handleReaction}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    </>
  );
};
