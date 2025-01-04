import dynamic from "next/dynamic";
const Editor = dynamic(
  () => import("@/components/editor"),
  { ssr: false }
);

import {
  differenceInMinutes,
  format,
  isToday,
  isYesterday,
} from "date-fns";
import Quill from "quill";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

import {
  AlertTriangle,
  Loader2,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Message } from "@/components/message";

import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { useGetMessage } from "@/features/messages/api/use-get-message";
import { useCurrentMember } from "@/features/members/api/use_current_member";
import { UseGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { UseCreateMessage } from "@/features/messages/api/use-create-message";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { PiCaretLeft } from "react-icons/pi";
import { useGetChannel } from "@/features/channels/api/use-get-channel";

const TIME_THRESHOLD = 5; // minutes

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);

  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  return format(date, "EEEE, MMMM d");
};

interface ThreadProps {
  messageId: Id<"messages">;
  onClose: () => void;
}

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  parentMessageId: Id<"messages">;
  body: string;
  image?: Id<"_storage"> | undefined;
};

export const Thread = ({
  messageId,
  onClose,
}: ThreadProps) => {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();

  const [editingId, setEditingId] =
    useState<Id<"messages"> | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] =
    useState(false);

  const editorRef = useRef<Quill | null>(null);
  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const { data: currentMember } =
    useCurrentMember({ workspaceId });
  const {
    data: message,
    isLoading: loadingMessage,
  } = useGetMessage({
    id: messageId,
  });
  const { data: channel } = useGetChannel({
    id: channelId,
  });

  const { results, status, loadMore } =
    useGetMessages({
      channelId,
      parentMessageId: messageId,
    });

  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  const { mutate: createMessage } =
    UseCreateMessage();
  const { mutate: generateUploadUrl } =
    UseGenerateUploadUrl();

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef?.current?.enable(false);

      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        parentMessageId: messageId,
        body,
        image: undefined,
      };

      if (image) {
        const url = await generateUploadUrl(
          {},
          { throwError: true }
        );

        if (!url) {
          throw new Error("URL not found");
        }

        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!result) {
          throw new Error(
            "Failed to upload image"
          );
        }

        const { storageId } = await result.json();
        values.image = storageId;
      }

      await createMessage(values, {
        throwError: true,
      });
    } catch (error) {
      toast.error("Falied to send message");
    } finally {
      setIsPending(false);
      editorRef?.current?.enable(true);
    }

    setEditorKey((prevKey) => prevKey + 1);
  };

  const groupMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(
        message._creationTime
      );

      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].unshift(message);

      return groups;
    },
    {} as Record<string, typeof results>
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [results]);

  if (
    loadingMessage ||
    status === "LoadingFirstPage"
  ) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-[49px] flex items-center px-4 border-b">
          <Button
            onClick={onClose}
            size="iconSm"
            variant="ghost"
          >
            <PiCaretLeft className="size-6 stroke-[1.5]" />
          </Button>
          <p className="text-lg font-bold">
            Thread{" "}
            <span className="text-sm font-normal text-muted-foreground">
              # {channel?.name}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-y-2 h-full items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-[49px] flex items-center px-4 border-b">
          <Button
            onClick={onClose}
            size="iconSm"
            variant="ghost"
          >
            <PiCaretLeft className="size-6 stroke-[1.5]" />
          </Button>
          <p className="text-lg font-bold">
            Thread{" "}
            <span className="text-sm font-normal text-muted-foreground">
              # {channel?.name}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-y-2 h-full items-center justify-center">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Message not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-[49px] flex items-center px-4 border-b">
        <Button
          onClick={onClose}
          size="iconSm"
          variant="ghost"
        >
          <PiCaretLeft className="size-6 stroke-[1.5]" />
        </Button>
        <p className="text-lg font-bold">
          Thread{" "}
          <span className="text-sm font-normal text-muted-foreground">
            # {channel?.name}
          </span>
        </p>
      </div>
      <div className="flex-1 flex flex-col pb-4 overflow-y-auto messages-scollbar">
        <Message
          hideThreadButton
          memberId={message.memberId}
          authorImage={message.user.image}
          authorName={message.user.name}
          isAuthor={
            message.memberId ===
            currentMember?._id
          }
          body={message.body}
          image={message.image}
          createdAt={message._creationTime}
          updatedAt={message.updatedAt}
          id={message._id}
          reactions={message.reactions}
          isEditing={editingId === message._id}
          setEditingId={setEditingId}
        />

        {results.length !== 0 && (
          <div className="my-2 mx-4 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-top border-gray-300" />
            <span className=" relative inline-block bg-white pr-4 text-xs text-muted-foreground">
              {results.length} replies
            </span>
          </div>
        )}

        {Object.entries(groupMessages || {}).map(
          ([dateKey, messages]) => (
            <div key={dateKey}>
              {messages.map((message, index) => {
                const prevMessage =
                  messages[index - 1];
                const isCompact =
                  prevMessage &&
                  prevMessage.user._id ===
                    message.user._id &&
                  differenceInMinutes(
                    new Date(
                      message._creationTime
                    ),
                    new Date(
                      prevMessage._creationTime
                    )
                  ) < TIME_THRESHOLD;

                return (
                  <Message
                    key={message._id}
                    id={message._id}
                    memberId={message.memberId}
                    authorImage={
                      message.user.image
                    }
                    authorName={message.user.name}
                    isAuthor={
                      message.memberId ===
                      currentMember?._id
                    }
                    reactions={message.reactions}
                    body={message.body}
                    image={message.image}
                    updatedAt={message.updatedAt}
                    createdAt={
                      message._creationTime
                    }
                    isEditing={
                      editingId === message._id
                    }
                    setEditingId={setEditingId}
                    isCompact={isCompact}
                    hideThreadButton
                    threadCount={
                      message.threadCount
                    }
                    threadImage={
                      message.threadImage
                    }
                    threadTimestamp={
                      message.threadTimestamp
                    }
                  />
                );
              })}
            </div>
          )
        )}

        <div
          className="h-1"
          ref={(el) => {
            if (el) {
              messagesEndRef.current = el;

              const observer =
                new IntersectionObserver(
                  ([entry]) => {
                    if (
                      entry.isIntersecting &&
                      canLoadMore
                    ) {
                      loadMore();
                    }
                  },
                  { threshold: 1.0 }
                );

              observer.observe(el);
              return () => observer.disconnect();
            }
          }}
        />

        {isLoadingMore && (
          <div className="text-center my-2 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-top border-gray-300" />
            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
              <Loader2 className="size-4 animate-spin" />
            </span>
          </div>
        )}

        <div className="px-4 pt-2">
          <Editor
            key={editorKey}
            onSubmit={handleSubmit}
            innerRef={editorRef}
            disabled={isPending}
            placeholder="Reply..."
          />
        </div>
      </div>
    </div>
  );
};
