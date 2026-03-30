import { loadData } from "@/lib/data";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  const { faculties, categoryOptions, lessons, facultiesV2 } = loadData();
  return <AppShell faculties={faculties} categoryOptions={categoryOptions} lessons={lessons} facultiesV2={facultiesV2} />;
}
