"use client";

import { useState, Suspense } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { AIAssistant } from "@/components/dashboard/ai-assistant";
import { UploadModal } from "@/components/dashboard/upload-modal";

export default function DischargeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Horizontal Dashboard Top Navbar */}
      <Navbar />

      {/* Main Dashboard Content Area */}
      <main className="flex-1 overflow-y-auto bg-background">
        <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-muted-foreground">Loading Page...</div>}>
          {children}
        </Suspense>
      </main>

      {/* Interactive AI Assistant Floating Widget */}
      <AIAssistant
        isOpen={aiAssistantOpen}
        onToggle={() => setAiAssistantOpen(!aiAssistantOpen)}
      />

      {/* Document Upload Modal */}
      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  );
}
