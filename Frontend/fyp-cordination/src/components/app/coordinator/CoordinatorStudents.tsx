"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getStudents } from "@/store/user/userThunk";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Mail, Users, Hash, Calendar, Loader2 } from "lucide-react";

export default function CoordinatorStudents() {
  const dispatch = useAppDispatch();
  const { students } = useAppSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dispatch(getStudents()).finally(() => setIsLoading(false));
  }, [dispatch]);

  const filteredStudents = students.filter(
    (student) =>
      student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name?: string) =>
    (name || "?").split(" ").map((w) => w[0] || "").join("").substring(0, 2).toUpperCase();

  return (
    <div className="container mx-auto space-y-6 md:p-6 mt-2 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 md:items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Students</h1>
          <p className="text-muted-foreground mt-2">
            A complete list of all students registered in your department.
          </p>
        </div>
        
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary/50" />
          <p>Loading students...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl bg-muted/10">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-primary/40" />
          </div>
          <h3 className="text-base font-semibold">No students found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {searchQuery ? "No students match your search criteria." : "There are no students registered in your department yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map((student) => (
            <Card key={student._id} className="p-5 flex flex-col hover:border-primary/40 transition-colors bg-card/60 hover:bg-card">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 border shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(student.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate" title={student.fullName}>
                    {student.fullName}
                  </h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-0.5 truncate" title={student.email}>
                    <Mail className="w-3 h-3 mr-1 shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                </div>
              </div>
              
              
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
