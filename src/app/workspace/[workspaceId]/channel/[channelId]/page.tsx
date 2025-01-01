"use client";
import { Header } from "./header";
import { ChatInputPage } from "./chat-input";

import { useChannelId } from "@/app/hooks/use-channel-id";
import { useGetChannel } from "@/features/channels/api/use-get-channel";
import {
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { MessageList } from "@/components/message-list";

const ChannelIdPage = () => {
  const channelId = useChannelId();
  const {
    data: channel,
    isLoading: channelLoading,
  } = useGetChannel({ id: channelId });

  const { results, status, loadMore } =
    useGetMessages({
      channelId,
    });

  if (
    channelLoading ||
    status === "LoadingFirstPage"
  ) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader2 className="size-5 animate-spin text-muted-foreground " />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <TriangleAlert className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Channel not found
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={channel.name} />

      <MessageList
        channelName={channel.name}
        channelCreationTime={
          channel._creationTime
        }
        data={results}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInputPage
        placeholder={`Message #${channel.name}`}
      />
    </div>
  );
};

export default ChannelIdPage;
