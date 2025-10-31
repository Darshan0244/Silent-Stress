import AnxietyRelief from "@/components/AnxietyRelief";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Anxiety() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="border-b bg-card/95 backdrop-blur-sm p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
        <div className="font-semibold inline-flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Anxiety Relief Activities
        </div>
        <div className="w-0 sm:w-[64px]" />
      </div>
      <div className="flex-1 overflow-auto">
        <AnxietyRelief />
      </div>
    </div>
  );
}
