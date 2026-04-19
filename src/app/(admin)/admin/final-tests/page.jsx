"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";
import { PageLoader } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";
import { FinalTestFormModal } from "@/components/admin/final-test-form-modal";

export default function AdminFinalTestsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-final-tests"],
    queryFn: () => api.get("/final-test"),
  });

  if (isLoading) return <PageLoader />;
  const tests = data?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-1">
            Management
          </p>
          <h1 className="text-[28px] font-semibold tracking-tight">Final Tests</h1>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
          New Final Test
        </Button>
      </div>

      {tests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No final tests yet"
          description="Click the button above to create a new final test."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((test) => (
            <div key={test._id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold tracking-tight">{test.title}</p>
                  <p className="text-xs text-muted mt-1">
                    Semester {test.semester} · {test.academicYear}
                  </p>
                </div>
                <Badge variant={test.isActive ? "success" : "neutral"}>
                  {test.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-mist rounded-xl p-3">
                  <p className="text-[10px] text-faint font-semibold uppercase tracking-wider">
                    Questions
                  </p>
                  <p className="font-display text-2xl font-normal tracking-tight mt-0.5">
                    {test.questionCount}
                  </p>
                </div>
                <div className="bg-mist rounded-xl p-3">
                  <p className="text-[10px] text-faint font-semibold uppercase tracking-wider">
                    Attempts
                  </p>
                  <p className="font-display text-2xl font-normal tracking-tight mt-0.5">
                    {test.stats?.totalAttempts || 0}
                  </p>
                </div>
                <div className="bg-mist rounded-xl p-3">
                  <p className="text-[10px] text-faint font-semibold uppercase tracking-wider">
                    Avg Score
                  </p>
                  <p className="font-display text-2xl font-normal tracking-tight mt-0.5">
                    {test.stats?.avgScore != null ? test.stats.avgScore : "—"}
                  </p>
                </div>
              </div>

              <div className="border-t border-line pt-3 space-y-2">
                {[
                  { l: "Duration", v: `${Math.floor(test.timeLimit / 60)} min` },
                  {
                    l: "Total points",
                    v: `${(test.questionCount * test.pointsPerQuestion).toFixed(1)}`,
                  },
                  { l: "Per question", v: `${test.pointsPerQuestion} pts` },
                ].map((row) => (
                  <div key={row.l} className="flex justify-between text-[13px]">
                    <span className="text-muted">{row.l}</span>
                    <span className="font-semibold">{row.v}</span>
                  </div>
                ))}
              </div>

              {test.stats?.totalAttempts > 0 && (
                <div className="mt-3 pt-3 border-t border-line">
                  <div className="flex justify-between text-[11px] text-muted mb-1.5">
                    <span>Graded</span>
                    <span>
                      {test.stats.gradedAttempts} / {test.stats.totalAttempts}
                    </span>
                  </div>
                  <div className="h-1 bg-mist rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{
                        width: `${
                          (test.stats.gradedAttempts / test.stats.totalAttempts) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <FinalTestFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
