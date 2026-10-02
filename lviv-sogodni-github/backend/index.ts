import { router, json, error, requireAuth } from '@appdeploy/sdk';
import { db, storage } from '@appdeploy/sdk';

type Article = {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  body: string;
  status?: 'published' | 'draft';
  featured?: boolean;
  tags?: string[];
  slug?: string;
  imageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  imagePath?: string;
};

const ADMIN_EMAIL = 'denys20smm@gmail.com';

const requireAdmin = () => async (ctx: any) => {
  const email = ctx.user?.email?.trim().toLowerCase();
  if (email !== ADMIN_EMAIL) return error('Admin access required', 403);
};

const seedArticles: Article[] = [
  {
    title: 'На Львівщині автомобіль наїхав на півторарічного хлопчика: дитину госпіталізували',
    excerpt: 'У селі Ременів Львівського району водій Subaru Ascent наїхав на півторарічну дитину. Хлопчика з травмами доправили до лікарні.',
    category: 'Область', author: 'Редакція', publishedAt: '2026-10-02T10:50:00+03:00',
    body: 'ДТП сталася у Ременові Львівського району. За повідомленням поліції Львівщини, автомобіль Subaru Ascent здійснив наїзд на півторарічного хлопчика. Дитину госпіталізували з травмами.\n\nДжерело: LVIV.MEDIA та поліція Львівської області.',
    status: 'published', featured: true, tags: ['ДТП', 'Львівщина', 'Ременів'], slug: 'dtp-remeniv-ditina-2-zhovtnya-2026'
  },
  {
    title: 'У Львові 2 жовтня попрощаються із сімома військовими',
    excerpt: 'Львівщина проводить в останню путь сімох захисників, які загинули у війні з Росією.',
    category: 'Суспільство', author: 'Редакція', publishedAt: '2026-10-02T10:26:00+03:00',
    body: 'У Львові та області 2 жовтня відбуваються прощання із сімома військовослужбовцями. Подробиці щодо місць та часу прощань оприлюднили місцеві медіа.\n\nДжерело: Суспільне Львів та LVIV.MEDIA.',
    status: 'published', tags: ['війна', 'захисники', 'Львів'], slug: 'lviv-proshchannya-z-simoma-vijskovimi-2-zhovtnya-2026'
  },
  {
    title: 'На Львівщині 12-річній дівчині провели малоінвазивну операцію на серці',
    excerpt: 'Ваду серця у дівчини з Львівщини виявили випадково, після чого лікарі провели малоінвазивне втручання.',
    category: 'Суспільство', author: 'Редакція', publishedAt: '2026-10-02T11:52:00+03:00',
    body: 'Медики виявили ваду серця у 12-річної дівчини з Львівщини та провели малоінвазивну операцію. За даними Суспільного, проблему виявили випадково.\n\nДжерело: Суспільне Львів.',
    status: 'published', tags: ['медицина', 'Львівщина', 'діти'], slug: 'operaciya-na-serci-divchyni-lvivshchyna-2-zhovtnya-2026'
  },
  {
    title: 'На Львівщині прикордонники виявили незадекларований товар на 1,3 млн гривень',
    excerpt: 'У пункті пропуску «Шегині» прикордонники виявили товар, який намагалися перемістити без декларування.',
    category: 'Область', author: 'Редакція', publishedAt: '2026-10-02T12:23:00+03:00',
    body: 'У ПП «Шегині» прикордонники виявили незадекларований товар орієнтовною вартістю 1,3 млн гривень. Обставини переміщення та подальші процесуальні дії повідомили прикордонники.\n\nДжерело: Суспільне Львів.',
    status: 'published', tags: ['кордон', 'Шегині', 'митниця'], slug: 'shehyni-nezadeklarovanyj-tovar-13-mln-2-zhovtnya-2026'
  },
  {
    title: 'У Львові заявили про ризик затримки зарплат двірникам і водіям електротранспорту',
    excerpt: 'У міськраді повідомили про складну ситуацію з проведенням окремих казначейських платежів.',
    category: 'Інфраструктура', author: 'Редакція', publishedAt: '2026-10-02T10:52:00+03:00',
    body: 'У Львові заявили про ризик затримки виплат працівникам комунальної сфери, зокрема двірникам і водіям електротранспорту. Причиною називають призупинення окремих казначейських платежів.\n\nДжерело: LVIV.MEDIA.',
    status: 'published', featured: true, tags: ['Львів', 'комунальні підприємства', 'зарплати'], slug: 'lviv-zarplaty-komunalnykam-kaznachejstvo-2-zhovtnya-2026'
  },
  {
    title: 'Біля Львова 51-річний водій Toyota протаранив приватну огорожу',
    excerpt: 'Дорожньо-транспортна пригода сталася поблизу Львова. Інформацію про подію оприлюднили місцеві медіа.',
    category: 'Кримінал', author: 'Редакція', publishedAt: '2026-10-02T10:59:00+03:00',
    body: 'Поблизу Львова 51-річний водій автомобіля Toyota протаранив приватну огорожу. Деталі щодо обставин аварії та наслідків повідомили місцеві медіа.\n\nДжерело: LVIV.MEDIA.',
    status: 'published', tags: ['ДТП', 'Львівщина'], slug: 'toyota-protaranyla-ohorozhu-lviv-2-zhovtnya-2026'
  },
  {
    title: 'Суд зобов’язав винуватця ДТП на Львівщині компенсувати потерпілим понад 500 тисяч гривень',
    excerpt: 'Суд зобов’язав винуватця дорожньо-транспортної пригоди компенсувати потерпілим завдані збитки.',
    category: 'Кримінал', author: 'Редакція', publishedAt: '2026-10-02T08:32:00+03:00',
    body: 'Суд на Львівщині ухвалив рішення у справі про ДТП та зобов’язав винуватця компенсувати потерпілим понад 500 тисяч гривень.\n\nДжерело: LVIV.MEDIA.',
    status: 'published', tags: ['суд', 'ДТП', 'Львівщина'], slug: 'sud-kompensaciya-dtp-500-tysyach-lvivshchyna-2026'
  },
  {
    title: 'На Львівщині очікують до +22°: якою буде погода 2 жовтня',
    excerpt: 'Синоптики прогнозували мінливу хмарність і без опадів, температура вдень мала піднятися до 22 градусів.',
    category: 'Суспільство', author: 'Редакція', publishedAt: '2026-10-02T08:55:00+03:00',
    body: 'На Львівщині 2 жовтня прогнозували мінливу хмарність без істотних опадів. У різних районах області вдень очікувалася температура до 22° тепла.\n\nДжерело: Суспільне Львів та Львівський регіональний центр з гідрометеорології.',
    status: 'published', tags: ['погода', 'Львівщина'], slug: 'pogoda-lvivshchyna-2-zhovtnya-2026'
  },
  {
    title: 'На Львівщині суд розірвав договір оренди комунальної землі через борг',
    excerpt: 'Судове рішення стосується оренди земельної ділянки комунальної власності та заборгованості за договором.',
    category: 'Область', author: 'Редакція', publishedAt: '2026-10-01T21:07:00+03:00',
    body: 'На Львівщині суд розірвав договір оренди комунальної землі через наявну заборгованість. Рішення набуло розголосу після публікації 1 жовтня.\n\nДжерело: LVIV.MEDIA.',
    status: 'published', tags: ['суд', 'земля', 'Львівщина'], slug: 'sud-zemlya-orenda-borg-lvivshchyna-2026'
  },
  {
    title: 'АМКУ викрив змову на земельних аукціонах у Львівській та ще двох областях',
    excerpt: 'Антимонопольний комітет повідомив про виявлені ознаки змови під час земельних торгів.',
    category: 'Область', author: 'Редакція', publishedAt: '2026-10-01T19:05:00+03:00',
    body: 'Антимонопольний комітет повідомив про виявлення змови під час земельних аукціонів у Львівській та ще двох областях.\n\nДжерело: LVIV.MEDIA.',
    status: 'published', tags: ['АМКУ', 'земельні аукціони', 'Львівщина'], slug: 'amku-zmova-zemelni-aukciony-lvivshchyna-2026'
  },
  {
    title: 'У Львові 29 боривітрів після лікування випустили у природу',
    excerpt: 'Після карантину, догляду та реабілітації птахи зміцніли й були готові повернутися у природне середовище.',
    category: 'Суспільство', author: 'Редакція', publishedAt: '2026-10-01T18:48:00+03:00',
    body: 'У Львові після лікування та реабілітації 29 боривітрів випустили у природу. Птахи пройшли необхідний карантин і догляд перед поверненням у природне середовище.\n\nДжерело: Суспільне Львів.',
    status: 'published', tags: ['природа', 'птахи', 'Львів'], slug: 'u-lvovi-29-boryvitriv-vypustyly-u-pryrodu-2026'
  },
  {
    title: 'У Львові з даху поїзда зняли 24-річного «зайця»',
    excerpt: 'На львівському залізничному об’єкті виявили чоловіка, який перебував на даху поїзда.',
    category: 'Кримінал', author: 'Редакція', publishedAt: '2026-10-01T17:35:00+03:00',
    body: 'У Львові з даху поїзда зняли 24-річного чоловіка, який перебував там без законних підстав. Подію висвітлили місцеві медіа.\n\nДжерело: LVIV.MEDIA.',
    status: 'published', tags: ['залізниця', 'Львів', 'події'], slug: 'lviv-24-richnyj-zajac-na-dahu-poyizda-2026'
  },
  {
    title: 'Середня зарплата на Львівщині перевищила 30 тисяч гривень',
    excerpt: 'Опубліковані дані показують, що середній рівень заробітної плати в області перевищив позначку 30 тисяч гривень.',
    category: 'Область', author: 'Редакція', publishedAt: '2026-10-01T17:06:00+03:00',
    body: 'Середня заробітна плата на Львівщині перевищила 30 тисяч гривень. Деталі та статистичні показники оприлюднили місцеві медіа.\n\nДжерело: LVIV.MEDIA.',
    status: 'published', tags: ['економіка', 'зарплати', 'Львівщина'], slug: 'serednya-zarplata-lvivshchyna-30-tysyach-2026'
  },
  {
    title: 'На Львівщині командира взводу НГУ підозрюють в отриманні хабаря за службу в тилу',
    excerpt: 'Правоохоронці повідомили про підозру командиру взводу військової частини НГУ.',
    category: 'Кримінал', author: 'Редакція', publishedAt: '2026-10-01T15:50:00+03:00',
    body: 'На Львівщині правоохоронці повідомили про підозру командиру взводу військової частини НГУ. За даними слідства, йдеться про отримання 4,1 тисячі доларів за сприяння у проходженні служби в тилу.\n\nДжерело: Суспільне Львів та LVIV.MEDIA. Остаточну оцінку діям підозрюваного має надати суд.',
    status: 'published', tags: ['НГУ', 'корупція', 'підозра'], slug: 'komandyr-vzvodu-ngu-habar-lvivshchyna-2026'
  },
  {
    title: 'Зінченка засудили до довічного позбавлення волі у справі про вбивство Ірини Фаріон',
    excerpt: 'Шевченківський районний суд Львова 1 жовтня оголосив вирок Вячеславу Зінченку.',
    category: 'Кримінал', author: 'Редакція', publishedAt: '2026-10-01T15:29:00+03:00',
    body: '1 жовтня Шевченківський районний суд Львова оголосив вирок Вячеславу Зінченку у справі про вбивство Ірини Фаріон. Суд призначив покарання у вигляді довічного позбавлення волі. Вирок може бути оскаржений у встановленому законом порядку.\n\nДжерело: Суспільне Львів та LVIV.MEDIA.',
    status: 'published', featured: true, tags: ['суд', 'Ірина Фаріон', 'Львів'], slug: 'zinchenko-dovichne-uvyaznennya-farion-1-zhovtnya-2026'
  },
  {
    title: 'Суд частково задовольнив позов Софії Особи: Зінченко має виплатити 5 млн грн',
    excerpt: 'Суд частково задовольнив цивільний позов доньки Ірини Фаріон щодо морального відшкодування.',
    category: 'Кримінал', author: 'Редакція', publishedAt: '2026-10-01T16:38:00+03:00',
    body: 'Суд частково задовольнив позов Софії Особи та визначив суму морального відшкодування у 5 мільйонів гривень. Рішення є частиною судового розгляду справи.\n\nДжерело: Суспільне Львів та LVIV.MEDIA.',
    status: 'published', tags: ['суд', 'Фаріон', 'відшкодування'], slug: 'pozov-sofiyi-osoby-5-mln-1-zhovtnya-2026'
  },
  {
    title: 'У Львові автобус №51 зіткнувся з інкасаторським авто: семеро людей травмовані',
    excerpt: 'Аварія на вулиці Науковій сталася 1 жовтня. Семеро людей отримали травми.',
    category: 'Кримінал', author: 'Редакція', publishedAt: '2026-10-01T12:34:00+03:00',
    body: 'На вулиці Науковій у Львові зіткнулися автобус маршруту №51 та інкасаторське авто. За даними Суспільного, внаслідок ДТП травмувалися семеро людей.\n\nДжерело: Суспільне Львів.',
    status: 'published', tags: ['ДТП', 'Наукова', 'Львів'], slug: 'avtobus-51-inkasatorske-avto-naukova-2026'
  },
  {
    title: 'Через ремонт дороги М-09 змінять рух двох автобусів у Великих Грибовичах',
    excerpt: 'У зв’язку з ремонтом дороги Львів — Рава-Руська автобусні маршрути тимчасово курсуватимуть за зміненою схемою.',
    category: 'Інфраструктура', author: 'Редакція', publishedAt: '2026-10-01T14:24:00+03:00',
    body: 'Через ремонт дороги М-09 Львів — Рава-Руська у Великих Грибовичах змінили організацію руху двох автобусних маршрутів. Пасажирам рекомендували враховувати тимчасові зміни.\n\nДжерело: Суспільне Львів.',
    status: 'published', tags: ['транспорт', 'дороги', 'Великі Грибовичі'], slug: 'remont-m09-avtobusy-grybovychi-2026'
  },
  {
    title: 'Львівщина передала військову допомогу кільком бригадам ЗСУ',
    excerpt: 'Область повідомила про чергову передачу військового майна та обладнання підрозділам Сил оборони.',
    category: 'Суспільство', author: 'Редакція', publishedAt: '2026-10-01T14:38:00+03:00',
    body: 'Львівщина передала допомогу кільком бригадам Збройних сил України. Про передачу повідомили в межах регіональної підтримки підрозділів Сил оборони.\n\nДжерело: LVIV.MEDIA.',
    status: 'published', tags: ['ЗСУ', 'допомога', 'Львівщина'], slug: 'lvivshchyna-dopomoga-bryhady-zsu-2026'
  },
  {
    title: 'На Львівщині будівельна компанія приховала 48 млн грн доходу',
    excerpt: 'Правоохоронці та контролюючі органи повідомили про виявлені порушення у діяльності будівельної компанії.',
    category: 'Кримінал', author: 'Редакція', publishedAt: '2026-10-01T15:17:00+03:00',
    body: 'На Львівщині виявили будівельну компанію, яка, за повідомленням місцевих медіа, приховала 48 мільйонів гривень доходу. Матеріали передані для подальших процесуальних дій.\n\nДжерело: LVIV.MEDIA.',
    status: 'published', tags: ['економіка', 'податки', 'Львівщина'], slug: 'budivelna-kompaniya-48-mln-dohodu-lvivshchyna-2026'
  },
  {
    title: 'Львівські комунальники демонтували ще один кіоск біля нового ЦУМу',
    excerpt: 'У центральній частині Львова продовжують демонтаж тимчасових споруд, які міські служби вважають незаконними.',
    category: 'Інфраструктура', author: 'Редакція', publishedAt: '2026-10-01T14:47:00+03:00',
    body: 'Львівські комунальники демонтували ще один кіоск біля нового ЦУМу. Роботи є частиною міських заходів із впорядкування тимчасових споруд.\n\nДжерело: LVIV.MEDIA.',
    status: 'published', tags: ['Львів', 'комунальні служби', 'ЦУМ'], slug: 'lviv-demontazh-kiosku-novyj-cum-2026'
  },
  {
    title: 'Львів отримає з Нідерландів ще 200 тисяч тюльпанів',
    excerpt: 'У Львові планують продовжити квіткову ініціативу із Нідерландами та висадити нову партію тюльпанів.',
    category: 'Львів', author: 'Редакція', publishedAt: '2026-10-01T20:13:00+03:00',
    body: 'Львів отримає з Нідерландів ще 200 тисяч тюльпанів. Квіткову ініціативу планують продовжити навесні.\n\nДжерело: LVIV.MEDIA.',
    status: 'published', tags: ['Львів', 'тюльпани', 'місто'], slug: 'lviv-otrimaye-200-tysyach-tyulpaniv-2026'
  }
];

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-zа-яіїєґ0-9\\s-]/gi, '').replace(/\\s+/g, '-').replace(/-+/g, '-').slice(0, 100);

const ensureSeedArticles = async () => {
  const result = await db.list<Article>('articles', { limit: 100 });
  const existing = new Set(result.items.map(article => article.slug).filter(Boolean));
  const missing = seedArticles.filter(article => article.slug && !existing.has(article.slug));
  if (missing.length) await db.add('articles', missing);
};

export const handler = router({
  'POST /api/media': [
    requireAuth(),
    requireAdmin(),
    async ctx => {
      const body = ctx.body as { filename?: string; content?: string; contentType?: string };
      if (!body.content || !body.contentType) return error('Image data is required', 400);
      if (!body.contentType.startsWith('image/')) return error('Only image files are allowed', 400);
      if (body.content.length > 2500000) return error('Image is too large', 413);
      const safeName = (body.filename || 'image').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80);
      const path = 'media/' + ctx.user!.userId + '/' + Date.now() + '-' + safeName;
      const [ok] = await storage.write([{ path, content: body.content, contentType: body.contentType }]);
      if (!ok) return error('Could not upload image', 500);
      const [{ url }] = await storage.url([path]);
      return json({ path, url }, 201);
    },
  ],
  'GET /api/media': [
    async ctx => {
      const path = ctx.query.path;
      if (!path) return error('Missing media path', 400);
      const [{ url }] = await storage.url([path]);
      return json({ url });
    },
  ],
  'GET /api/_healthcheck': [async () => json({ message: 'Success' })],
  'GET /api/admin/check': [
    requireAuth(),
    requireAdmin(),
    async ctx => json({ allowed: true, email: ctx.user?.email || '' }),
  ],
  'GET /robots.txt': [async () => json({ content: 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml' })],
  'GET /sitemap.xml': [async () => {
    const result = await db.list<Article>('articles', { limit: 50 });
    const urls = result.items.filter(a => a.status !== 'draft').map(a => '<url><loc>/novyny/' + (a.slug || a.id) + '</loc><lastmod>' + a.publishedAt + '</lastmod></url>').join('');
    return json({ content: '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + '</urlset>' });
  }],
  'GET /api/articles': [
    async () => {
      await ensureSeedArticles();
      const result = await db.list<Article>('articles', { limit: 100 });
      const articles = result.items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      return json({ articles });
    },
  ],
  'POST /api/articles': [
    requireAuth(),
    requireAdmin(),
    async ctx => {
      const body = ctx.body as Partial<Article>;
      if (!body.title?.trim()) return error('Title is required', 400);
      const record: Article = {
        title: body.title.trim(),
        excerpt: body.excerpt?.trim() || '',
        category: body.category?.trim() || 'Львів',
        author: body.author?.trim() || ctx.user?.name || ctx.user?.email || 'Редакція',
        publishedAt: body.publishedAt || new Date().toISOString(),
        body: body.body?.trim() || '',
        status: body.status === 'draft' ? 'draft' : 'published',
        featured: Boolean(body.featured),
        tags: Array.isArray(body.tags) ? body.tags.filter(tag => typeof tag === 'string').slice(0, 12) : [],
        slug: body.slug?.trim() || slugify(body.title),
        imageUrl: body.imageUrl?.trim() || '',
        seoTitle: body.seoTitle?.trim() || body.title.trim(),
        seoDescription: body.seoDescription?.trim() || body.excerpt?.trim() || '',
        imagePath: body.imagePath?.trim() || '',
      };
      const [id] = await db.add('articles', [record]);
      if (!id) return error('Could not create article', 500);
      return json({ id, article: { ...record, id } }, 201);
    },
  ],
  'PUT /api/articles/:id': [
    requireAuth(),
    requireAdmin(),
    async ctx => {
      const [existing] = await db.get<Article>('articles', [ctx.params.id]);
      if (!existing) return error('Article not found', 404);
      const body = ctx.body as Partial<Article>;
      const updated: Article = {
        ...existing,
        title: body.title?.trim() || existing.title,
        excerpt: body.excerpt?.trim() ?? existing.excerpt,
        category: body.category?.trim() || existing.category,
        body: body.body?.trim() ?? existing.body,
        status: body.status === 'draft' ? 'draft' : body.status === 'published' ? 'published' : existing.status || 'published',
        featured: typeof body.featured === 'boolean' ? body.featured : Boolean(existing.featured),
        tags: Array.isArray(body.tags) ? body.tags.filter(tag => typeof tag === 'string').slice(0, 12) : existing.tags || [],
        slug: body.slug?.trim() || existing.slug || slugify(body.title || existing.title),
        imageUrl: body.imageUrl?.trim() ?? existing.imageUrl ?? '',
        seoTitle: body.seoTitle?.trim() ?? existing.seoTitle ?? existing.title,
        seoDescription: body.seoDescription?.trim() ?? existing.seoDescription ?? existing.excerpt,
        imagePath: body.imagePath?.trim() ?? existing.imagePath ?? '',
      };
      const [ok] = await db.update('articles', [{ id: ctx.params.id, record: updated }]);
      if (!ok) return error('Could not update article', 500);
      return json({ article: { ...updated, id: ctx.params.id } });
    },
  ],
  'DELETE /api/articles/:id': [
    requireAuth(),
    requireAdmin(),
    async ctx => {
      const [ok] = await db.delete('articles', [ctx.params.id]);
      if (!ok) return error('Article not found', 404);
      return json({ ok: true });
    },
  ],
});
