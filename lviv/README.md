# Львів Сьогодні — Vercel + Supabase

Повноцінна Vercel-сумісна версія новинного сайту з CMS та постійним збереженням новин у Supabase PostgreSQL.

## Що вже є

- React + Vite + TypeScript
- Tailwind CSS
- Vercel API Functions
- CMS: створення, редагування, видалення новин
- Чернетки / опубліковані матеріали
- Пошук і категорії
- Авторизація редактора тільки для `ADMIN_EMAIL`
- Підписаний сесійний токен замість передачі пароля в API
- Supabase PostgreSQL як постійна база
- Автоматичне завантаження 20 стартових матеріалів у базу, якщо таблиця порожня

## 1. Supabase

У Supabase SQL Editor уже має бути створена таблиця `public.articles`.

Для серверної частини потрібні:

- Project URL
- Secret API key (`sb_secret_...`)

Secret key використовується тільки у Vercel serverless API і не потрапляє у браузер.

## 2. Vercel Environment Variables

У Vercel відкрий:

**Project → Settings → Environment Variables**

Додай:

`SUPABASE_URL` = URL твого Supabase-проєкту

`SUPABASE_SECRET_KEY` = Secret API key із Supabase

`ADMIN_EMAIL` = `denys20smm@gmail.com`

`ADMIN_PASSWORD` = твій пароль редактора

`SESSION_SECRET` = довільний довгий випадковий секрет для сесій

Для `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD` та `SESSION_SECRET` у Vercel використовуй тип **Secret**.

Після додавання змінних зроби **Redeploy**. Environment Variables застосовуються до нових deployment-ів. 

## 3. Важливо

Publishable key для цієї версії не потрібен у frontend: сайт працює через власні `/api/*` endpoints, а Supabase Secret key використовується тільки на сервері.

Не комітьте `.env`, секретні ключі або паролі в GitHub.
