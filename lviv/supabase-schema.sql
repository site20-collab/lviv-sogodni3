create table public.articles (
  id bigint generated always as identity primary key,
  title text not null,
  excerpt text default '',
  category text default 'Львів',
  author text default 'Редакція',
  published_at timestamptz default now(),
  body text default '',
  status text default 'published',
  featured boolean default false,
  tags text[] default '{}',
  slug text unique,
  image_url text default '',
  seo_title text default '',
  seo_description text default '',
  created_at timestamptz default now()
);

alter table public.articles enable row level security;

create policy "Public can read published articles"
on public.articles
for select
to anon
using (status = 'published');
