import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use_current_member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useGetMembers } from "@/features/members/api/use_get_members";

import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizontalIcon,
} from "lucide-react";
import { WorkspaceHeader } from "./workspace-header";
import { SidebarItem } from "./sidebar-item";
import { WorkspaceSection } from "./workpspace-section";
import { UserItem } from "./user-item";

export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();

  const [open, setOpen] = useCreateChannelModal();

  const {
    data: member,
    isLoading: memberLoading,
  } = useCurrentMember({ workspaceId });
  const {
    data: workspace,
    isLoading: workspaceLoading,
  } = useGetWorkspace({ id: workspaceId });

  const {
    data: channels,
    isLoading: channelsLoading,
  } = useGetChannels({ workspaceId });

  const {
    data: members,
    isLoading: membersLoading,
  } = useGetMembers({ workspaceId });

  if (workspaceLoading || memberLoading) {
    return (
      <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
        <Loader className="size-5 animate-spin text-white" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
        <AlertTriangle className="size-5 text-white" />
        <p className="text-white text-sm">
          Workspace Not Found
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col bg-[#5E2C5F] h-full">
      <WorkspaceHeader
        workspace={workspace}
        isAdmin={member.role === "admin"}
      />
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem
          label="Threads"
          icon={MessageSquareText}
          id="threads"
        />
        <SidebarItem
          label="Drafts & Sent"
          icon={SendHorizontalIcon}
          id="drafts"
        />
      </div>

      <WorkspaceSection
        label="Channels"
        hint="New Channel"
        onNew={
          member.role === "admin"
            ? () => {
                setOpen(true);
              }
            : undefined
        }
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            icon={HashIcon}
            label={item.name}
            id={item._id}
          />
        ))}
      </WorkspaceSection>

      <WorkspaceSection
        label="Dirrect Messages"
        hint="New Direct Message"
        onNew={() => {}}
      >
        {members?.map((item) => (
          <UserItem
            key={item._id}
            id={item._id}
            label={item.user.name}
            image={item.user.image}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
};
