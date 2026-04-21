"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardMedia,
  Button,
} from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";
import {
  ChefHat,
  Star,
  ClockCountdown,
  Lightning,
  Tag,
  UsersThree,
  Flame,
  Leaf,
  Info,
} from "@phosphor-icons/react";

// ─── Row helper ──────────────────────────────────────────────────────────────

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sirio-row">
      <p className="sirio-row__label">{label}</p>
      <div className="sirio-row__grid sirio-row__grid--card">{children}</div>
    </div>
  );
}

// ─── Dati mockup ─────────────────────────────────────────────────────────────

const RICETTE = [
  {
    titolo: "Cacio e pepe",
    categoria: "Primo",
    tempo: "30 min",
    difficoltà: "Media",
    starred: true,
  },
  {
    titolo: "Ossobuco",
    categoria: "Secondo",
    tempo: "90 min",
    difficoltà: "Alta",
    starred: false,
  },
  {
    titolo: "Panna cotta",
    categoria: "Dolce",
    tempo: "20 min",
    difficoltà: "Facile",
    starred: true,
  },
];

// ─── Sezione ──────────────────────────────────────────────────────────────────

export function SezioneCard() {
  return (
    <section id="card" className="sirio-section">
      <SectionHeader label="Card" id="card" />

      {/* 1. Varianti superficie */}
      <Row label="Varianti — flat / elevated / outlined / ghost / tinted">
        <Card variant="flat">
          <CardBody>
            <p className="sirio-token-label">flat</p>
            <p className="sirio-preview-text">
              Superficie base. Per contenuti secondari o liste dense.
            </p>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <p className="sirio-token-label">elevated</p>
            <p className="sirio-preview-text">
              Ombra media. Per card principali e panel.
            </p>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardBody>
            <p className="sirio-token-label">outlined</p>
            <p className="sirio-preview-text">
              Background trasparente, solo bordo. Per UI leggera.
            </p>
          </CardBody>
        </Card>

        <Card variant="ghost">
          <CardBody>
            <p className="sirio-token-label">ghost</p>
            <p className="sirio-preview-text">
              Nessun bordo né ombra. Contenitore puro per layout.
            </p>
          </CardBody>
        </Card>

        <Card variant="tinted">
          <CardBody>
            <p className="sirio-token-label">tinted</p>
            <p className="sirio-preview-text">
              Tinta primaria. Per highlight, suggerimenti IA, onboarding.
            </p>
          </CardBody>
        </Card>
      </Row>

      {/* 2. Variante interactive */}
      <Row label="Interactive — microinterazione ombra/bordo al hover">
        {RICETTE.map((r) => (
          <Card key={r.titolo} variant="interactive" onCardClick={() => {}}>
            <CardHeader>
              <ChefHat
                size={14}
                weight="regular"
                aria-hidden="true"
                className="card-icon-primary"
              />
              <span className="card-category-label">{r.categoria}</span>
              {r.starred && (
                <Star
                  size={13}
                  weight="fill"
                  aria-hidden="true"
                  className="card-icon-gold card-icon-ml-auto"
                />
              )}
            </CardHeader>
            <CardBody>
              <h3 className="card-title">{r.titolo}</h3>
              <div className="card-tags">
                <span className="card-tag">{r.tempo}</span>
                <span className="card-tag">{r.difficoltà}</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </Row>

      {/* 3. Con header + footer */}
      <Row label="Slot header + footer">
        <Card variant="elevated">
          <CardHeader>
            <ChefHat
              size={15}
              weight="regular"
              aria-hidden="true"
              className="card-icon-primary"
            />
            <span className="card-slot-title">Risotto al tartufo</span>
            <span className="card-slot-meta card-icon-ml-auto">Primo</span>
          </CardHeader>
          <CardBody>
            <p className="sirio-preview-text">
              Riso Carnaroli, tartufo nero, burro di bufala. Mantecato al
              momento del servizio.
            </p>
          </CardBody>
          <CardFooter>
            <Button size="sm" variant="ghost">
              Annulla
            </Button>
            <span className="card-footer-spacer" />
            <Button size="sm" variant="primary">
              Salva ricetta
            </Button>
          </CardFooter>
        </Card>

        <Card variant="flat">
          <CardHeader>
            <span className="card-slot-title">Piano del giorno</span>
            <span className="card-slot-meta card-icon-ml-auto">Oggi</span>
          </CardHeader>
          <CardBody>
            <p className="sirio-preview-text">
              3 task completati su 7. Prep serale da avviare alle 17:00.
            </p>
          </CardBody>
          <CardFooter>
            <ClockCountdown
              size={13}
              weight="regular"
              aria-hidden="true"
              className="card-icon-faint"
            />
            <span className="card-footer-meta">Aggiornato 12:45</span>
          </CardFooter>
        </Card>
      </Row>

      {/* 4. Con media full-bleed */}
      <Row label="Con slot media (immagine full-bleed)">
        <Card variant="elevated" noPadding>
          <CardMedia>
            <div className="card-media-placeholder">
              <ChefHat
                size={32}
                weight="thin"
                aria-hidden="true"
                className="card-media-icon"
              />
            </div>
          </CardMedia>
          <CardBody>
            <h3 className="card-title">Immagine full-bleed</h3>
            <p className="sirio-preview-text">
              CardMedia elimina il padding e occupa tutta la larghezza. Ideale
              per ricette con foto.
            </p>
          </CardBody>
        </Card>

        <Card variant="interactive" noPadding onCardClick={() => {}}>
          <CardMedia>
            <div className="card-media-placeholder card-media-placeholder--tall">
              <Flame
                size={28}
                weight="thin"
                aria-hidden="true"
                className="card-media-icon"
              />
            </div>
          </CardMedia>
          <CardBody>
            <h3 className="card-title">Media + Interactive</h3>
            <p className="sirio-preview-text">
              Hover: ombra e bordo primario. Nessun translate.
            </p>
          </CardBody>
          <CardFooter>
            <Leaf
              size={13}
              weight="regular"
              aria-hidden="true"
              className="card-icon-success"
            />
            <span className="card-footer-meta">Vegetariano · 25 min</span>
          </CardFooter>
        </Card>
      </Row>

      {/* 5. Card semantiche (tinted + status) */}
      <Row label="Uso semantico — info, warning, alert (via className override)">
        <Card variant="tinted">
          <CardBody>
            <div className="card-semantic-row">
              <Info
                size={15}
                weight="regular"
                aria-hidden="true"
                className="card-icon-primary"
              />
              <div>
                <p className="card-semantic-title">Suggerimento IA</p>
                <p className="sirio-preview-text">
                  Questo menu ha 3 allergeni sovrapposti. Vuoi ottimizzarlo?
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardBody>
            <div className="card-semantic-row">
              <Lightning
                size={15}
                weight="regular"
                aria-hidden="true"
                className="card-icon-warning"
              />
              <div>
                <p className="card-semantic-title">Piano attivo</p>
                <p className="sirio-preview-text">
                  Servizio serale — 4 chef, 12 task, inizio ore 18:00.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="outlined">
          <CardBody>
            <div className="card-semantic-row">
              <UsersThree
                size={15}
                weight="regular"
                aria-hidden="true"
                className="card-icon-success"
              />
              <div>
                <p className="card-semantic-title">Team</p>
                <p className="sirio-preview-text">
                  8 membri attivi nel workspace. Piano Pro attivo.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </Row>

      {/* 6. Card composita con tag multipli */}
      <Row label="Card ricetta completa">
        {RICETTE.map((r) => (
          <Card
            key={`full-${r.titolo}`}
            variant="interactive"
            noPadding
            onCardClick={() => {}}
          >
            <CardMedia>
              <div className="card-media-placeholder">
                <ChefHat
                  size={24}
                  weight="thin"
                  aria-hidden="true"
                  className="card-media-icon"
                />
              </div>
            </CardMedia>
            <CardHeader>
              <Tag
                size={13}
                weight="regular"
                aria-hidden="true"
                className="card-icon-faint"
              />
              <span className="card-category-label">{r.categoria}</span>
              {r.starred && (
                <Star
                  size={12}
                  weight="fill"
                  aria-hidden="true"
                  className="card-icon-gold card-icon-ml-auto"
                />
              )}
            </CardHeader>
            <CardBody>
              <h3 className="card-title">{r.titolo}</h3>
              <div className="card-tags">
                <span className="card-tag">{r.tempo}</span>
                <span className="card-tag">{r.difficoltà}</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </Row>
    </section>
  );
}
