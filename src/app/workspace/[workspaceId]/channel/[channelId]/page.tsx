"use client";
import { Header } from "./header";
import { ChatInputPage } from "./chat-input";

import { useChannelId } from "@/app/hooks/use-channel-id";
import { useGetChannel } from "@/features/channels/api/use-get-channel";
import {
  Loader2,
  TriangleAlert,
} from "lucide-react";

const ChannelIdPage = () => {
  const channelId = useChannelId();
  const {
    data: channel,
    isLoading: channelLoading,
  } = useGetChannel({ id: channelId });

  if (channelLoading) {
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
      <div className="flex-1" />
      <ChatInputPage
        placeholder={`Message #${channel.name}`}
      />
    </div>
  );
};

export default ChannelIdPage;
