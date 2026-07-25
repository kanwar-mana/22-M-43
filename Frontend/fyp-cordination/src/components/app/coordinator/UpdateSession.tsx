"use client";

import { useMemo, useState } from "react";

import { useAppDispatch } from "@/store/hooks";
import { getSessions, updateSession } from "@/store/session/sessionThunk";
import type { Session } from "@/types/session.types";
import SessionForm, {
  mapSessionToFormValues,
  type SessionFormSubmitPayload,
} from "./SessionForm";

interface UpdateSessionProps {
  session: Session;
  onBack?: () => void;
}

function UpdateSession({ session, onBack }: UpdateSessionProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = useMemo(
    () => mapSessionToFormValues(session),
    [session],
  );

  const handleUpdate = async (payload: SessionFormSubmitPayload) => {
    const sessionId = session._id;
    if (!sessionId) return;

    setIsSubmitting(true);
    try {
      await dispatch(updateSession({ sessionId, payload })).unwrap();
      await dispatch(getSessions()).unwrap();
      onBack?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SessionForm
      title="Update FYP Session"
      description="Update session details, settings, and milestones."
      submitLabel="Update Session"
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      onSubmit={handleUpdate}
      onCancel={onBack}
    />
  );
}

export default UpdateSession;
