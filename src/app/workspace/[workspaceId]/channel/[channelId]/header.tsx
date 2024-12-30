import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { UseUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useChannelId } from "@/app/hooks/use-channel-id";
import { toast } from "sonner";
import { UseRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useConfirm } from "@/app/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use_current_member";

interface HeaderProps {
  title: string;
}
export const Header = ({
  title,
}: HeaderProps) => {
  const router = useRouter();

  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();

  const [ConfirmDiaglog, confirm] = useConfirm(
    "Delete this channel?",
    "You are about to delete this channel."
  );

  const [value, setValue] = useState(title);
  const [editOpen, setEditOpen] = useState(false);

  const { data: member } = useCurrentMember({
    workspaceId,
  });

  const {
    mutate: updateChannel,
    isPending: isUpdatingChannel,
  } = UseUpdateChannel();

  const {
    mutate: removeChannel,
    isPending: isRemovingChannel,
  } = UseRemoveChannel();

  const handleEditOpen = (value: boolean) => {
    if (member?.role !== "admin") {
      return;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
      .replace(/\s+/g, "-")
      .toLowerCase();
    setValue(value);
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    updateChannel(
      { id: channelId, name: value },
      {
        onSuccess: () => {
          toast.success("Channel updated");
        },
        onError: () => {
          toast.error("Failed to update channel");
        },
      }
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;

    removeChannel(
      { id: channelId },
      {
        onSuccess: () => {
          toast.success("Channel deleted");
          router.push(
            `/workspace/${workspaceId}`
          );
        },
        onError: () => {
          toast.error("Failed to delete channel");
        },
      }
    );
  };

  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
      <ConfirmDiaglog />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="text-lg font-semibold px-2 overflow-hidden w-auto"
          >
            <span className="truncate">
              # {title}
            </span>
            <FaChevronDown className="size-2.5 ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle># {title}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog
              open={editOpen}
              onOpenChange={handleEditOpen}
            >
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Channel name
                    </p>
                    {member?.role === "admin" && (
                      <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                        Edit
                      </p>
                    )}
                  </div>
                  <p className="text-sm ">
                    # {title}
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Rename this channel
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <Input
                    value={value}
                    disabled={isUpdatingChannel}
                    onChange={handleChange}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    placeholder="e.g. plan-budget"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        disabled={
                          isUpdatingChannel
                        }
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      disabled={isUpdatingChannel}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {member?.role === "admin" && (
              <button
                disabled={isRemovingChannel}
                onClick={handleDelete}
                className="flex items-center gap-x-2 px-5 py-4 rounded-lg bg-white cursor-pointer border hover:bg-gray-50 text-rose-600"
              >
                <TrashIcon className="size-4" />
                <p className="text-sm font-semibold">
                  Delete Channel
                </p>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
