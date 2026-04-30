create table if not exists public.blog_post_views (
  slug text primary key,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_post_views enable row level security;

create policy "Blog post views are public readable"
  on public.blog_post_views
  for select
  using (true);

create policy "Blog post views are public insertable"
  on public.blog_post_views
  for insert
  with check (true);

create policy "Blog post views are public updatable"
  on public.blog_post_views
  for update
  using (true)
  with check (true);

create or replace function public.increment_blog_post_views(post_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_views integer;
begin
  insert into public.blog_post_views (slug, views)
  values (post_slug, 1)
  on conflict (slug)
  do update set
    views = public.blog_post_views.views + 1,
    updated_at = now()
  returning views into next_views;

  return next_views;
end;
$$;

grant execute on function public.increment_blog_post_views(text) to anon, authenticated;
