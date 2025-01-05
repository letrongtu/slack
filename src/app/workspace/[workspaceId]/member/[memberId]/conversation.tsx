import { Id } from "../../../../../../convex/_generated/dataModel";
import { useMemberId } from "@/hooks/use-member-id";
import { MessageList } from "@/components/message-list";
import { useGetMember } from "@/features/members/api/use_get_member";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { Loader2 } from "lucide-react";
import { Header } from "./header";
import { ChatInputPage } from "./chat-input";

interface ConversationProps {
  id: Id<"conversations">;
}

export const Conversation = ({
  id,
}: ConversationProps) => {
  const memberId = useMemberId();

  const {
    data: member,
    isLoading: memberLoading,
  } = useGetMember({ id: memberId });

  const { results, status, loadMore } =
    useGetMessages({ conversationId: id });

  if (
    memberLoading ||
    status === "LoadingFirstPage"
  ) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader2 className="size-5 animate-spin text-muted-foreground " />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        memberImage={member?.user.image}
        memberName={member?.user.name}
        onClick={() => {}}
      />

      <MessageList
        data={results}
        variant="conversation"
        memberImage={member?.user.image}
        memberName={member?.user.name}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />

      <ChatInputPage
        placeholder={`Message ${member?.user.name}`}
        conversationId={id}
      />
    </div>
  );
};