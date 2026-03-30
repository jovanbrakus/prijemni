import { loadData } from "@/lib/data";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  const { faculties, categoryOptions, facultiesV2 } = loadData();
  return <AppShell faculties={faculties} categoryOptions={categoryOptions} facultiesV2={facultiesV2} />;
}
