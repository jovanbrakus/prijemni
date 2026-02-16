import { loadData } from "@/lib/data";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  const faculties = loadData();
  return <AppShell faculties={faculties} />;
}
