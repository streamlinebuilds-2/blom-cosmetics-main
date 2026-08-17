-- Backfill bundle_id on historical bundle line items.
--
-- Before 20260817000000, bundle line items were written with product_id = NULL and only a
-- product_name. create-order.ts takes that name verbatim from `bundles.name`, so an exact
-- (case/whitespace-insensitive) name match can recover the linkage.
--
-- Name matching is NOT inherently safe, so every statement below is guarded:
--   * only names matching EXACTLY ONE bundle are linked (normalized bundle names are not
--     guaranteed unique; an unguarded UPDATE ... FROM would pick an arbitrary row);
--   * only product orders are touched, so a course whose title happens to match a bundle
--     name can never be relinked;
--   * only rows that are still unlinked (product_id and bundle_id both null) are touched.
--
-- RUN STEP 1 AND 1b FIRST and eyeball the output. Only then run STEP 2.

-- ---------------------------------------------------------------------------
-- Names that map to exactly one bundle. Reused by every step below.
-- ---------------------------------------------------------------------------
-- (Inlined per-statement rather than as a view so this file can be pasted in pieces.)

-- ---------------------------------------------------------------------------
-- STEP 1 - PREVIEW. Exactly the rows STEP 2 would write. Read-only.
-- ---------------------------------------------------------------------------
WITH unique_bundle_names AS (
  SELECT lower(btrim(b.name)) AS norm_name, min(b.id) AS bundle_id
  FROM public.bundles b
  WHERE b.name IS NOT NULL AND btrim(b.name) <> ''
  GROUP BY lower(btrim(b.name))
  HAVING count(*) = 1
)
SELECT
  oi.id            AS order_item_id,
  o.order_number,
  oi.product_name,
  u.bundle_id      AS matched_bundle_id
FROM public.order_items oi
JOIN public.orders o ON o.id = oi.order_id
JOIN unique_bundle_names u ON u.norm_name = lower(btrim(oi.product_name))
WHERE oi.product_id IS NULL
  AND oi.bundle_id IS NULL
  AND COALESCE(o.order_kind, 'product') = 'product'
ORDER BY oi.product_name, o.order_number;

-- ---------------------------------------------------------------------------
-- STEP 1b - AMBIGUOUS names: match more than one bundle, so STEP 2 skips them.
-- If anything shows up here it must be mapped by hand.
-- ---------------------------------------------------------------------------
SELECT lower(btrim(b.name)) AS norm_name, count(*) AS bundle_rows,
       array_agg(b.id) AS candidate_bundle_ids
FROM public.bundles b
WHERE b.name IS NOT NULL AND btrim(b.name) <> ''
GROUP BY lower(btrim(b.name))
HAVING count(*) > 1;

-- ---------------------------------------------------------------------------
-- STEP 1c - LEFTOVERS: unlinked product-order rows that match no bundle name.
-- Expect bundles renamed after the order was placed (e.g. the old ambiguous
-- "Blom Pro Series - 10-Pack Bundle"). Map those by hand if you want them counted.
-- ---------------------------------------------------------------------------
SELECT
  oi.product_name,
  count(*)          AS line_items,
  min(o.created_at) AS first_seen,
  max(o.created_at) AS last_seen
FROM public.order_items oi
JOIN public.orders o ON o.id = oi.order_id
WHERE oi.product_id IS NULL
  AND oi.bundle_id IS NULL
  AND COALESCE(o.order_kind, 'product') = 'product'
  AND NOT EXISTS (
    SELECT 1 FROM public.bundles b
    WHERE lower(btrim(b.name)) = lower(btrim(oi.product_name))
  )
GROUP BY oi.product_name
ORDER BY line_items DESC;

-- ---------------------------------------------------------------------------
-- STEP 2 - APPLY. Only run after reviewing STEP 1 / 1b / 1c.
-- Uncomment to execute.
-- ---------------------------------------------------------------------------
-- WITH unique_bundle_names AS (
--   SELECT lower(btrim(b.name)) AS norm_name, min(b.id) AS bundle_id
--   FROM public.bundles b
--   WHERE b.name IS NOT NULL AND btrim(b.name) <> ''
--   GROUP BY lower(btrim(b.name))
--   HAVING count(*) = 1
-- )
-- UPDATE public.order_items oi
-- SET bundle_id = u.bundle_id
-- FROM unique_bundle_names u, public.orders o
-- WHERE o.id = oi.order_id
--   AND u.norm_name = lower(btrim(oi.product_name))
--   AND oi.product_id IS NULL
--   AND oi.bundle_id IS NULL
--   AND COALESCE(o.order_kind, 'product') = 'product';

-- ---------------------------------------------------------------------------
-- STEP 3 - VERIFY. How many line items are now linked, per bundle.
-- ---------------------------------------------------------------------------
-- SELECT b.name, count(*) AS linked_line_items
-- FROM public.order_items oi
-- JOIN public.bundles b ON b.id = oi.bundle_id
-- GROUP BY b.name
-- ORDER BY linked_line_items DESC;
