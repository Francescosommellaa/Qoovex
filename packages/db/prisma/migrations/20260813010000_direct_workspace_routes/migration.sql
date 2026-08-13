UPDATE "Notification"
SET "actionHref" = CASE
  WHEN regexp_replace("actionHref", '^/org/[^/]+', '') = '' THEN '/'
  ELSE regexp_replace("actionHref", '^/org/[^/]+', '')
END
WHERE "actionHref" ~ '^/org/[^/]+';

UPDATE "NotificationDelivery"
SET "safePayload" = jsonb_set(
  "safePayload",
  '{actionHref}',
  to_jsonb(
    CASE
      WHEN regexp_replace("safePayload" ->> 'actionHref', '^/org/[^/]+', '') = '' THEN '/'
      ELSE regexp_replace("safePayload" ->> 'actionHref', '^/org/[^/]+', '')
    END
  ),
  false
)
WHERE "safePayload" ->> 'actionHref' ~ '^/org/[^/]+';
