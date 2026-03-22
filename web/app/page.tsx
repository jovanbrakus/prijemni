import { loadData } from "@/lib/data";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  const { faculties, categoryOptions, lessons } = loadData();
  return <AppShell faculties={faculties} categoryOptions={categoryOptions} lessons={lessons} />;
}
