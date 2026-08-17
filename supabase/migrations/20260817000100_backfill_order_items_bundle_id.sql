-- Backfill bundle_id on historical bundle line items.
--
-- Before 20260817000000, bundle line items were written with product_id = NULL and only a
-- product_name. create-order.ts takes that name verbatim from `bundles.name`, so an exact
-- (case/whitespace-insensitive) name match is a safe way to recover the linkage.
--
-- RUN STEP 1 FIRST and eyeball the matches. Only then run STEP 2.

-- ---------------------------------------------------------------------------
-- STEP 1 - PREVIEW. Rows this backfill would link. Read-only.
-- ---------------------------------------------------------------------------
SELECT
  oi.id AS order_item_id,
  oi.product_name,
  b.id   AS matched_bundle_id,
  b.name AS matched_bundle_name
FROM public.order_items oi
JOIN public.bundles b
  ON lower(btrim(oi.product_name)) = lower(btrim(b.name))
WHERE oi.product_id IS NULL
  AND oi.bundle_id IS NULL
ORDER BY oi.product_name;

-- ---------------------------------------------------------------------------
-- STEP 1b - PREVIEW the leftovers: null-product_id items that did NOT match a
-- bundle name. Expect course items here (correctly unmatched), plus any bundle
-- that was renamed after the order was placed (e.g. the old ambiguous
-- "Blom Pro Series - 10-Pack Bundle"). Those need mapping by hand.
-- ---------------------------------------------------------------------------
SELECT
  oi.product_name,
  count(*) AS line_items,
  min(o.created_at) AS first_seen,
  max(o.created_at) AS last_seen
FROM public.order_items oi
JOIN public.orders o ON o.id = oi.order_id
WHERE oi.product_id IS NULL
  AND oi.bundle_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.bundles b
    WHERE lower(btrim(b.name)) = lower(btrim(oi.product_name))
  )
GROUP BY oi.product_name
ORDER BY line_items DESC;

-- ---------------------------------------------------------------------------
-- STEP 2 - APPLY. Only run after reviewing STEP 1.
-- ---------------------------------------------------------------------------
-- UPDATE public.order_items oi
-- SET bundle_id = b.id
-- FROM public.bundles b
-- WHERE lower(btrim(oi.product_name)) = lower(btrim(b.name))
--   AND oi.product_id IS NULL
--   AND oi.bundle_id IS NULL;

-- ---------------------------------------------------------------------------
-- STEP 3 - VERIFY. Should report how many bundle line items are now linked.
-- ---------------------------------------------------------------------------
-- SELECT b.name, count(*) AS linked_line_items
-- FROM public.order_items oi
-- JOIN public.bundles b ON b.id = oi.bundle_id
-- GROUP BY b.name
-- ORDER BY linked_line_items DESC;
