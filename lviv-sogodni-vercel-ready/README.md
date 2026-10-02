# Львів Сьогодні — Vercel edition

Це окрема Vercel-сумісна версія сайту без залежності від AppDeploy.

### Важливо
Після оновлення використовується Tailwind CSS через PostCSS, тому production build на Vercel формує стилі коректно. API-функції використовують `@vercel/node`.

## Deploy

1. Створіть GitHub repository.
2. Завантажте всі файли з цього архіву.
3. Імпортуйте repository у Vercel.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Додайте Environment Variables:

`ADMIN_EMAIL` = `denys20smm@gmail.com`

`ADMIN_PASSWORD` = `LvivToday_2026!Admin#47`

## Важливо про дані

Ця стартова версія зберігає зміни CMS у пам'яті serverless-функції. Це підходить для демонстрації та першого deploy, але для production CMS потрібна зовнішня постійна база даних (наприклад PostgreSQL/Neon/Supabase) і окреме object storage для фотографій.

Тому перед реальним запуском редакції варто підключити persistent DB. Публічна частина та 20 стартових новин працюють без додаткової бази.

## Безпека

Адмін email перевіряється на сервері. Пароль не зберігається у коді — він задається через Vercel Environment Variables.

Не комітьте `.env` або паролі в GitHub.


## Дані для входу

Email: `denys20smm@gmail.com`

Пароль: `LvivToday_2026!Admin#47`

> Для production краще залишити пароль тільки у Vercel Environment Variables і прибрати його з коду.
