import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ListFilter,
  SquarePen,
} from "lucide-react";
import { Hint } from "@/components/ui/hint";
import { Doc } from "../../../../convex/_generated/dataModel";
import { PreferenceModal } from "./prefrences-modal";

interface WorkspaceHeaderProps {
  workspace: Doc<"workspaces">;
  isAdmin: boolean;
}

export const WorkspaceHeader = ({
  workspace,
  isAdmin,
}: WorkspaceHeaderProps) => {
  const [preferencesOpen, setPreferencesOpen] =
    useState(false);

  return (
    <>
      <PreferenceModal
        open={preferencesOpen}
        setOpen={setPreferencesOpen}
        initialValue={workspace.name}
      />

      <div className="flex items-center justify-between px-4 h-[49px] gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="transparent"
              className="font-semibold text-lg w-auto p-1.5 overflow-hidden"
            >
              <span className="truncate">
                {workspace.name}
              </span>
              <ChevronDown className="size-4 ml-1 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            className="w-64"
          >
            <DropdownMenuItem className="cursor-pointer capitalize">
              <div className="shrink-0 size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-lg rounded-md flex items-center justify-center mr-2">
                {workspace.name
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="flex flex-col items-start">
                <p className="font-bold">
                  {workspace.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Active Workspace
                </p>
              </div>
            </DropdownMenuItem>

            {isAdmin && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {}}
                  className="cursor-pointer py-2"
                >
                  Invite people to{" "}
                  {workspace.name}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() =>
                    setPreferencesOpen(true)
                  }
                  className="cursor-pointer py-2"
                >
                  Preference
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-0.5">
          <Hint
            label="Filter Conversation"
            side="bottom"
          >
            <Button
              variant="transparent"
              size="iconSm"
            >
              <ListFilter className="size-4" />
            </Button>
          </Hint>

          <Hint label="New Message" side="bottom">
            <Button
              variant="transparent"
              size="iconSm"
            >
              <SquarePen className="size-4" />
            </Button>
          </Hint>
        </div>
      </div>
    </>
  );
};