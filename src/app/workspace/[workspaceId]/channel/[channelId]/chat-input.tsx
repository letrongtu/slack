import { useChannelId } from "@/app/hooks/use-channel-id";
import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { UseCreateMessage } from "@/features/messages/api/use-create-message";
import { UseGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";

const Editor = dynamic(
  () => import("@/components/editor"),
  { ssr: false }
);

interface ChatInputProps {
  placeholder: string;
}

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage"> | undefined;
};

export const ChatInputPage = ({
  placeholder,
}: ChatInputProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] =
    useState(false);

  const editorRef = useRef<Quill | null>(null);

  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

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
  return (
    <div className="px-5 w-full">
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  );
};