"use client";
import { useEffect } from "react";
import StudentSubmissions from "@/components/app/student/StudentSubmissions";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getGroup } from "@/store/group/groupThunk";
import { SubmissionsSkeleton } from "@/components/app/skeleton/SubmissionsSkeleton";

export default function SubmissionsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentGroup } = useAppSelector((state) => state.group);

  useEffect(() => {
    if (user?.role === "student" && user?.studentProfile?.group && !currentGroup) {
      dispatch(getGroup(user.studentProfile.group as string));
    }
  }, [user, currentGroup, dispatch]);

  if (!user) {
    return (
      <div className="container mx-auto md:p-6">
        <SubmissionsSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto md:p-6">
      {user.role === "student" ? (
        <StudentSubmissions />
      ) : user.role === "supervisor" ? (
        <div>Supervisor Submissions View - Coming Soon</div>
      ) : user.role === "coordinator" ? (
        <div>Coordinator Submissions View - Coming Soon</div>
      ) : (
        <SubmissionsSkeleton />
      )}
    </div>
  );
}
