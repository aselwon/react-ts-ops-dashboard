import { getUser } from "@/lib/auth";
import { summarize } from "@/lib/domain";
import { tickets } from "@/lib/store";
export async function GET() {
  if (!(await getUser()))
    return Response.json({ error: "Please sign in" }, { status: 401 });
  return Response.json(summarize(tickets));
}
