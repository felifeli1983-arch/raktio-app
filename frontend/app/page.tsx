import { redirect } from "next/navigation";

/** Root redirect — authenticated users go to /overview, others to /login */
export default function RootPage() {
  redirect("/overview");
}
