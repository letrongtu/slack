import { useState } from "react";
import { useRouter } from "next/navigation";

import { TrashIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { UseUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { UseRemoveWorkspace } from "@/features/workspaces/api/use-remove-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useConfirm } from "@/hooks/use-confirm";

interface PreferenceModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValue: string;
}
export const PreferenceModal = ({
  open,
  setOpen,
  initialValue,
}: PreferenceModalProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This action is irreversible."
  );

  const [value, setValue] =
    useState(initialValue);
  const [editOpen, setEditOpen] = useState(false);

  const {
    mutate: updateWorkspace,
    isPending: IsUpdatingWorkspace,
  } = UseUpdateWorkspace();

  const {
    mutate: removeWorkspace,
    isPending: IsRemovingWorkspace,
  } = UseRemoveWorkspace();

  const handleEdit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    updateWorkspace(
      { id: workspaceId, name: value },
      {
        onSuccess: () => {
          toast.success("Workspace updated");
          setEditOpen(false);
        },
        onError: () => {
          toast.error(
            "Failed to update workspace"
          );
        },
      }
    );
  };

  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;

    removeWorkspace(
      { id: workspaceId },
      {
        onSuccess: () => {
          toast.success("Workspace removed");
          router.replace("/");
        },
        onError: () => {
          toast.error(
            "Failed to remove workspace"
          );
        },
      }
    );
  };
  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>{value}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog
              open={editOpen}
              onOpenChange={setEditOpen}
            >
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Workspace name
                    </p>
                    <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                      Edit
                    </p>
                  </div>

                  <p className="text-sm">
                    {value}
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Rename this workspace
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleEdit}
                  className="space-y-4"
                >
                  <Input
                    value={value}
                    disabled={IsUpdatingWorkspace}
                    onChange={(e) =>
                      setValue(e.target.value)
                    }
                    required
                    autoFocus
                    minLength={3}
                    placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        disabled={
                          IsUpdatingWorkspace
                        }
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      disabled={
                        IsUpdatingWorkspace
                      }
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <button
              disabled={IsRemovingWorkspace}
              onClick={handleRemove}
              className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600"
            >
              <TrashIcon className="size-4" />
              <p className="text-sm font-semibold">
                Delete workspace
              </p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
