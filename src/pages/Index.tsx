import { useEffect, useMemo, useState } from "react";
import { useMondayPatients } from "@/hooks/useMondayPatients";
import type { Patient } from "@/lib/workflow";
import { ChecklistPanel } from "@/components/dashboard/ChecklistPanel";
import { SecondaryPanel } from "@/components/dashboard/SecondaryPanel";
import { PatientsSidebar } from "@/components/dashboard/PatientsSidebar";
import { PatientProfileCard } from "@/components/dashboard/PatientProfileCard";
import { SendToMondayButton } from "@/components/dashboard/SendToMondayButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RotateCcw, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { sendPatientToMonday } from "@/lib/mondayWrite";

const Index = () => {
  const { patients, loading, error, refetch, update, clearOverlay } = useMondayPatients();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && patients.length > 0) setSelectedId(patients[0].id);
  }, [patients, selectedId]);

  const selected: Patient | undefined = useMemo(
    () => patients.find((p) => p.id === selectedId),
    [patients, selectedId],
  );

  const onCheckChange = (id: string, checked: boolean) => {
    if (!selected) return;
    const checklist = { ...selected.checklist, [id]: checked };
    update(selected.id, { checklist });
  };

  const resetForNewPatient = () => {
    if (!selected) return;
    clearOverlay(selected.id);
    update(selected.id, { notes: "", checklist: {} });
    toast.success("Cleared local edits — refetching from Monday");
    refetch();
  };

  const handleSend = async () => {
    if (!selected) return;
    try {
      await sendPatientToMonday(selected);
      toast.success("Sent to Monday");
    } catch (e) {
      toast.error("Send to Monday failed", {
        description: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <PatientsSidebar
          patients={patients}
          selectedId={selectedId}
          onSelect={setSelectedId}
          loading={loading}
          error={error}
          onRefresh={refetch}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-gradient-navy text-navy-foreground border-b border-sidebar-border">
            <div className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-navy-foreground hover:bg-white/10" />
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elevate">
                  <ClipboardCheck className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                    Medically Modern · Checklist Tool
                  </p>
                  <h1 className="text-xl font-semibold">
                    {selected ? `${selected.name} · Welcome Call` : "Welcome Call Checklist"}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={resetForNewPatient}
                  disabled={!selected}
                  className="gap-2 bg-white text-navy hover:bg-white/90 shadow-elevate"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-6">
            <section className="max-w-5xl mx-auto space-y-5">
              {!selected && (
                <div className="rounded-xl bg-card border shadow-card p-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    {loading
                      ? "Loading patients from Monday…"
                      : error
                        ? error
                        : "Select a patient from the sidebar to begin."}
                  </p>
                </div>
              )}

              {selected && (
                <Tabs defaultValue="checklist" className="space-y-5">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="checklist">Checklist</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  </TabsList>

                  <TabsContent value="checklist" className="space-y-5 mt-0">
                    <PatientProfileCard patient={selected} />

                    <ChecklistPanel
                      patient={selected}
                      onCheckChange={onCheckChange}
                      onNotesChange={(v) => update(selected.id, { notes: v })}
                    />

                    <SendToMondayButton onSend={handleSend} disabled={!selected} />
                  </TabsContent>

                  <TabsContent value="tab2" className="space-y-5 mt-0">
                    <PatientProfileCard patient={selected} />
                    <SecondaryPanel patient={selected} />
                    <SendToMondayButton onSend={handleSend} disabled={!selected} />
                  </TabsContent>
                </Tabs>
              )}
            </section>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
