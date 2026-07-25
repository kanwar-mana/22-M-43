"use client";

import { useEffect, useState } from "react";
import { FolderPlus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { createSession, getSessions } from "@/store/session/sessionThunk";
import SessionForm, {
  DEFAULT_SESSION_FORM_VALUES,
  type SessionFormSubmitPayload,
} from "./SessionForm";

interface CreateSessionProps {
  startInForm?: boolean;
  onBack?: () => void;
}

function CreateSession({ startInForm = false, onBack }: CreateSessionProps) {
  const dispatch = useAppDispatch();
  const [isFormOpen, setIsFormOpen] = useState(startInForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsFormOpen(startInForm);
  }, [startInForm]);

  const handleCreate = async (payload: SessionFormSubmitPayload) => {
    setIsSubmitting(true);

    try {
      await dispatch(createSession(payload)).unwrap();
      await dispatch(getSessions()).unwrap();

      if (onBack) {
        onBack();
        return;
      }

      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onBack) {
      onBack();
      return;
    }

    setIsFormOpen(false);
  };

  if (!isFormOpen) {
    return (
      <div className="mx-auto flex flex-col items-center justify-center w-2/3 bg-transparent border-none shadow-none">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <FolderPlus className="size-7" />
          </div>
          <div className="text-2xl font-medium">Create Your First Session</div>
          <div className="max-w-4/5 text-base font-light text-center mb-6 text-muted-foreground">
            Start by creating a semester session for your department to manage
            groups, deadlines, and FYP milestones in one place.
          </div>
        </div>
        <div className="justify-center pb-8">
          <Button onClick={() => setIsFormOpen(true)}>
            <Sparkles />
            Create Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SessionForm
      title="Create New FYP Session"
      description="Fill the details below to create a new FYP session."
      submitLabel="Create Session"
      initialValues={DEFAULT_SESSION_FORM_VALUES}
      isSubmitting={isSubmitting}
      onSubmit={handleCreate}
      onCancel={handleCancel}
    />
  );
}

export default CreateSession;
