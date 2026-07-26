import { redirect } from "next/navigation";

export default async function InvitePersonPage() {
  redirect("/people/access/invite");
}
