# Львів Сьогодні

Повна поточна структура сайту «Львів Сьогодні», експортована з AppDeploy.

## Що всередині

- React + Vite + TypeScript
- Tailwind CSS
- Backend на AppDeploy SDK
- Авторизація редакції
- CMS для створення/редагування/видалення новин
- SEO title/description та slug
- Завантаження обкладинок через AppDeploy Storage
- База статей
- robots.txt та sitemap.xml
- 20 актуальних локальних матеріалів
- E2E/QA тести

## Важливо

Цей проєкт використовує `@appdeploy/client` та `@appdeploy/sdk`, які надаються середовищем AppDeploy. Сам по собі цей ZIP не є незалежним Node.js backend без AppDeploy.

Адміністратор CMS: `denys20smm@gmail.com`.

Не зберігайте секрети або токени в GitHub.

## Запуск frontend

```bash
npm install
npm run dev
```

Для повної роботи backend, database, auth і storage потрібне відповідне середовище AppDeploy.
