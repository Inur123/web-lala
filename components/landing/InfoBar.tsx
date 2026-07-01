import { EVENT_INFO } from "@/constants/landing";
import { Calendar, MapPin, Users } from "lucide-react";

export default function InfoBar() {
  const getIcon = (id: string) => {
    switch (id) {
      case "date":
        return <Calendar className="h-5 w-5 text-[#1a4d2e]" />;
      case "location":
        return <MapPin className="h-5 w-5 text-[#1a4d2e]" />;
      case "quota":
        return <Users className="h-5 w-5 text-[#1a4d2e]" />;
      default:
        return null;
    }
  };

  return (
    <section id="info" className="bg-white px-6 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-gray-100 bg-[#f8fafc] p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {EVENT_INFO.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 ${
                  index > 0 ? "sm:border-l sm:border-gray-200/60 sm:pl-8" : ""
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a4d2e]/10">
                  {getIcon(item.id)}
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    {item.label}
                  </p>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
