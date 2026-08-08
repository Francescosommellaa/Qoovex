import { redirect } from "next/navigation";

export default function SirioPage() {
  // Sirio conserva esclusivamente la foundation visuale condivisa.
  redirect("/foundations/colors");
}
