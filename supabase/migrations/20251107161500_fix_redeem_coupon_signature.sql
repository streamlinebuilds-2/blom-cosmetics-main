-- Redeem coupon function: standardize signature to p_order_total_cents and allow anon execute
create or replace function public.redeem_coupon(
  p_code text,
  p_email text,
  p_order_total_cents int
)
returns table(valid boolean, message text, discount_cents int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon public.coupons%rowtype;
  v_min int;
begin
  select *
    into v_coupon
  from public.coupons
  where code = p_code
  limit 1;

  if not found then
    return query select false, 'Invalid coupon code', 0;
    return;
  end if;

  if coalesce(v_coupon.status, 'inactive') <> 'active' then
    return query select false, 'Coupon is not active', 0;
    return;
  end if;

  if v_coupon.valid_until is not null and now() > v_coupon.valid_until then
    return query select false, 'Coupon expired', 0;
    return;
  end if;

  if coalesce(v_coupon.used_count,0) >= coalesce(v_coupon.max_uses,1) then
    return query select false, 'Coupon already used', 0;
    return;
  end if;

  if v_coupon.lock_email is not null and lower(v_coupon.lock_email) <> lower(p_email) then
    return query select false, 'Coupon locked to another email', 0;
    return;
  end if;

  v_min := coalesce(v_coupon.min_order_cents, 50000);
  if p_order_total_cents < v_min then
    return query select false, 'Order must be at least R500 (products only)', 0;
    return;
  end if;

  return query select true,
                       'Coupon Applied',
                       floor( (coalesce(v_coupon.percent,0) * p_order_total_cents) / 100.0 )::int;
end;
$$;

-- permissions
revoke all on function public.redeem_coupon(text, text, int) from public;
grant execute on function public.redeem_coupon(text, text, int) to anon, authenticated, service_role;