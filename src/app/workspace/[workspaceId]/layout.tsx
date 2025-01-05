"use client";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Thread } from "@/features/messages/components/thread";
import { Profile } from "@/features/members/components/profile";
import { usePanel } from "@/hooks/use-panel";

import { SideBar } from "./sidebar";
import { Toolbar } from "./toolbar";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { Loader2 } from "lucide-react";

interface WorkspaceIdLayoutProps {
  children: React.ReactNode;
}

const WorkspaceLayout = ({
  children,
}: WorkspaceIdLayoutProps) => {
  const {
    profileMemberId,
    parentMessageId,

    onClose,
  } = usePanel();

  const showPanel =
    !!parentMessageId || !!profileMemberId;

  return (
    <div className="h-full">
      <Toolbar />

      <div className="flex h-[calc(100vh-40px)]">
        <SideBar />
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId="workspace-layout"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={20}
            className="bg-[#5E2C5F]"
          >
            <WorkspaceSidebar />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel minSize={20}>
            {children}
          </ResizablePanel>

          {showPanel && (
            <>
              <ResizableHandle />
              <ResizablePanel minSize={20}>
                {parentMessageId ? (
                  <Thread
                    messageId={
                      parentMessageId as Id<"messages">
                    }
                    onClose={onClose}
                  />
                ) : profileMemberId ? (
                  <Profile
                    memberId={
                      profileMemberId as Id<"members">
                    }
                    onClose={onClose}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
