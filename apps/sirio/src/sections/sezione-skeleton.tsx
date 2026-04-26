"use client";

import { Badge, Card, CardBody, Skeleton } from "@qoovex/ui";
import type { SkeletonSize, SkeletonTone, SkeletonVariant } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";
import { ShowcaseBlock } from "./showcase-block";

interface ShapeExample {
  variant: SkeletonVariant;
  label: string;
  size: SkeletonSize;
}

const SHAPES: ShapeExample[] = [
  { variant: "text", label: "Text", size: "md" },
  { variant: "title", label: "Title", size: "lg" },
  { variant: "block", label: "Block", size: "md" },
  { variant: "thumbnail", label: "Thumbnail", size: "sm" },
  { variant: "avatar", label: "Avatar", size: "lg" },
  { variant: "circle", label: "Circle", size: "md" },
];

const TONES: SkeletonTone[] = [
  "neutral",
  "primary",
  "success",
  "warning",
  "error",
];

function RecipeSkeletonCard() {
  return (
    <Card variant="surface">
      <CardBody className="flex flex-col gap-4">
        <Skeleton variant="thumbnail" size="md" radius="lg" />
        <div className="flex flex-col gap-3">
          <Skeleton variant="title" size="lg" width="72%" />
          <Skeleton
            variant="text"
            size="md"
            lines={3}
            lineWidths={["100%", "92%", "58%"]}
          />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="block" size="xs" radius="full" width="5rem" />
          <Skeleton variant="block" size="xs" radius="full" width="6.5rem" />
        </div>
      </CardBody>
    </Card>
  );
}

function TeamListSkeleton() {
  return (
    <Card variant="panel" tone="primary">
      <CardBody className="flex flex-col gap-4">
        {["chef", "sous-chef", "pastry"].map((member, index) => (
          <div key={member} className="flex items-center gap-3">
            <Skeleton
              variant="avatar"
              size="md"
              tone={index === 0 ? "primary" : "neutral"}
            />
            <div className="min-w-0 flex-1">
              <Skeleton
                variant="title"
                size="sm"
                width={index === 2 ? "42%" : "56%"}
              />
              <Skeleton
                className="mt-2"
                variant="text"
                size="sm"
                width={index === 1 ? "68%" : "48%"}
              />
            </div>
            <Skeleton variant="block" size="xs" radius="full" width="4rem" />
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

function FormSkeletonPanel() {
  return (
    <Card variant="surface" tone="success">
      <CardBody className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Skeleton variant="title" size="md" width="44%" tone="success" />
          <Skeleton variant="text" size="sm" width="64%" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton variant="block" size="lg" radius="md" />
          <Skeleton variant="block" size="lg" radius="md" />
          <Skeleton
            className="sm:col-span-2"
            variant="block"
            size="xl"
            radius="md"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton variant="block" size="sm" radius="full" width="5rem" />
          <Skeleton
            variant="block"
            size="sm"
            radius="full"
            width="7rem"
            tone="success"
          />
        </div>
      </CardBody>
    </Card>
  );
}

export function SezioneSkeleton() {
  return (
    <section id="skeleton" className="sirio-section">
      <SectionHeader label="Skeleton" id="skeleton" />

      <ShowcaseBlock
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        label="Loading compositi"
        description="Lo shimmer passa da sinistra a destra e resta solo presentazionale: il contenitore della pagina decide lo stato di caricamento."
      >
        <RecipeSkeletonCard />
        <TeamListSkeleton />
        <FormSkeletonPanel />
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Shape e size"
        description="Le varianti coprono testo, titoli, blocchi, media e avatar senza dover riscrivere classi custom ogni volta."
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6"
      >
        {SHAPES.map((shape) => (
          <Card key={shape.variant} variant="surface">
            <CardBody className="flex min-h-32 flex-col justify-between gap-4">
              <div className="flex min-h-16 items-center">
                <Skeleton
                  variant={shape.variant}
                  size={shape.size}
                  width={shape.variant === "title" ? "70%" : undefined}
                />
              </div>
              <p className="sirio-token-label">{shape.label}</p>
            </CardBody>
          </Card>
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Toni semantici"
        description="Il tono va usato con parsimonia per skeleton legati a uno stato o una superficie gia` semantica."
        className="grid grid-cols-1 gap-4 xl:grid-cols-5"
      >
        {TONES.map((tone) => (
          <Card key={tone} variant="surface" tone={tone}>
            <CardBody className="flex flex-col gap-4">
              <Badge tone={tone} variant="soft">
                {tone}
              </Badge>
              <Skeleton variant="title" size="md" tone={tone} width="62%" />
              <Skeleton
                variant="text"
                size="sm"
                tone={tone}
                lines={3}
                lineWidths={["100%", "84%", "54%"]}
              />
            </CardBody>
          </Card>
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Controllo animazione"
        description="Per stati statici, test visuali o preferenze di motion si puo` spegnere lo shimmer mantenendo le stesse dimensioni."
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <Card variant="surface">
          <CardBody className="flex flex-col gap-4">
            <Badge variant="outline">Animated</Badge>
            <Skeleton variant="title" size="lg" width="52%" />
            <Skeleton
              variant="text"
              size="md"
              lines={4}
              lineWidths={["100%", "92%", "76%", "48%"]}
            />
          </CardBody>
        </Card>

        <Card variant="surface">
          <CardBody className="flex flex-col gap-4">
            <Badge variant="outline">Static</Badge>
            <Skeleton animated={false} variant="title" size="lg" width="52%" />
            <Skeleton
              animated={false}
              variant="text"
              size="md"
              lines={4}
              lineWidths={["100%", "92%", "76%", "48%"]}
            />
          </CardBody>
        </Card>
      </ShowcaseBlock>
    </section>
  );
}

