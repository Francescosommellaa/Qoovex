"use client";

import type { ReactNode } from "react";
import {
  ChefHat,
  CrownSimple,
  SealCheck,
  UserGear,
} from "@phosphor-icons/react";
import { Avatar, Badge, Card, CardBody } from "@qoovex/ui";
import type { AvatarStatus, AvatarTone } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";

interface ShowcaseBlockProps {
  label: string;
  description: string;
  children: ReactNode;
  className?: string;
}

interface TeamMember {
  name: string;
  role: string;
  tone: AvatarTone;
  status: AvatarStatus;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Marta Costa",
    role: "Executive chef",
    tone: "primary",
    status: "online",
  },
  {
    name: "Luca Bianchi",
    role: "Sous chef",
    tone: "success",
    status: "busy",
  },
  {
    name: "Giulia Riva",
    role: "Pasticceria",
    tone: "warning",
    status: "away",
  },
  {
    name: "Nico Ferri",
    role: "Sala",
    tone: "neutral",
    status: "offline",
  },
];

const TONES: AvatarTone[] = [
  "neutral",
  "primary",
  "success",
  "warning",
  "error",
];

function ShowcaseBlock({
  label,
  description,
  children,
  className,
}: ShowcaseBlockProps) {
  return (
    <div className="mb-10">
      <div className="mb-4 max-w-3xl">
        <p className="sirio-row__label">{label}</p>
        <p className="sirio-preview-text">{description}</p>
      </div>
      <div
        className={
          className ??
          "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        }
      >
        {children}
      </div>
    </div>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card variant="surface" tone={member.tone}>
      <CardBody className="flex items-center gap-3">
        <Avatar
          name={member.name}
          tone={member.tone}
          status={member.status}
          size="lg"
        />
        <div className="min-w-0">
          <p className="truncate font-display text-(length:--text-base) font-semibold text-text">
            {member.name}
          </p>
          <p className="truncate text-(length:--text-xs) text-text-faint">
            {member.role}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

export function SezioneAvatar() {
  return (
    <section id="avatar" className="sirio-section">
      <SectionHeader label="Avatar" id="avatar" />

      <ShowcaseBlock
        label="Fallback e stati"
        description="Avatar resta presentazionale: immagine quando disponibile, iniziali o contenuto custom quando manca la foto."
      >
        {TEAM_MEMBERS.map((member) => (
          <TeamMemberCard key={member.name} member={member} />
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Size scale"
        description="La scala copre liste compatte, header utente e card con presenza piu` marcata."
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <Card variant="panel">
          <CardBody className="flex flex-wrap items-center gap-4">
            <Avatar name="Marta Costa" size="sm" tone="primary" />
            <Avatar name="Marta Costa" size="md" tone="primary" />
            <Avatar name="Marta Costa" size="lg" tone="primary" />
            <Avatar name="Marta Costa" size="xl" tone="primary" />
          </CardBody>
        </Card>

        <Card variant="panel" tone="success">
          <CardBody className="flex flex-wrap items-center gap-4">
            <Avatar
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"
              alt="Chef Marta Costa"
              size="xl"
              status="online"
            />
            <div className="min-w-0">
              <Badge
                tone="success"
                variant="soft"
                iconLeft={
                  <SealCheck size={13} weight="bold" aria-hidden="true" />
                }
              >
                Foto disponibile
              </Badge>
              <p className="mt-3 max-w-md text-(length:--text-sm) text-text-muted">
                La foto usa lo stesso contenitore, bordo e status delle
                iniziali.
              </p>
            </div>
          </CardBody>
        </Card>
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Toni e contenuto custom"
        description="I toni semantici colorano solo fallback e bordo; le foto restano neutrali e non alterate."
      >
        {TONES.map((tone) => (
          <Card key={tone} variant="surface" tone={tone}>
            <CardBody className="flex flex-col gap-4">
              <Avatar tone={tone} size="xl" aria-label={`Avatar ${tone}`}>
                {tone === "primary" ? (
                  <CrownSimple size={22} weight="bold" aria-hidden="true" />
                ) : tone === "success" ? (
                  <ChefHat size={22} aria-hidden="true" />
                ) : tone === "warning" ? (
                  <UserGear size={22} aria-hidden="true" />
                ) : (
                  tone.slice(0, 2).toUpperCase()
                )}
              </Avatar>
              <p className="sirio-token-label">{tone}</p>
            </CardBody>
          </Card>
        ))}
      </ShowcaseBlock>
    </section>
  );
}
