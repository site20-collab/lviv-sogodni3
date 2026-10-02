import { useEffect, useMemo, useState } from 'react';
import { api, auth } from '@appdeploy/client';
import { ArrowLeft, ChevronRight, Clock3, LogIn, LogOut, Menu, Pencil, Search, Star, Trash2, X } from 'lucide-react';

type Article = {
  id: string;
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
  imagePath?: string;
  seoTitle?: string;
  seoDescription?: string;
};

const categories = ['Усі', 'Львів', 'Область', 'Політика', 'Кримінал', 'Інфраструктура', 'Суспільство'];

const formatDate = (value: string) =>
  new Date(value).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState('Усі');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Article | null>(null);
  const [admin, setAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', excerpt: '', category: 'Львів', body: '', status: 'published', featured: false, tags: '', slug: '', imageUrl: '', imagePath: '', seoTitle: '', seoDescription: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/api/articles');
      setArticles(res.data.articles || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    auth.getUser().then(async currentUser => {
      setUser(currentUser);
      if (!currentUser) return;
      try {
        const result = await api.get('/api/admin/check');
        setAdmin(Boolean(result.data.allowed));
      } catch {
        setAdmin(false);
      }
    }).catch(() => {
      setUser(null);
      setAdmin(false);
    });
  }, []);

  const published = useMemo(() => articles.filter(a => a.status !== 'draft'), [articles]);
  const filtered = useMemo(() => published.filter(a => {
    const inCategory = category === 'Усі' || a.category === category;
    const haystack = (a.title + ' ' + a.excerpt + ' ' + (a.tags || []).join(' ')).toLowerCase();
    return inCategory && haystack.includes(query.toLowerCase());
  }), [published, category, query]);

  const featured = filtered.find(a => a.featured) || filtered[0];
  const latest = filtered.filter(a => a.id !== featured?.id).slice(0, 6);
  const popular = [...published].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))).slice(0, 5);

  const signIn = async () => {
    try {
      const result = await auth.signIn();
      try {
        await api.get('/api/admin/check');
        setUser(result.user);
        setAdmin(true);
      } catch {
        await auth.signOut();
        setUser(null);
        setAdmin(false);
        alert('Доступ до редакції дозволений лише власнику сайту.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetEditor = () => {
    setEditingId(null);
    setNewArticle({ title: '', excerpt: '', category: 'Львів', body: '', status: 'published', featured: false, tags: '', slug: '', imageUrl: '', imagePath: '', seoTitle: '', seoDescription: '' });
  };

  const uploadCover = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 1800000) { alert('Файл завеликий. Максимум 1.8 МБ.'); return; }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const comma = dataUrl.indexOf(',');
      const result = await api.post('/api/media', { filename: file.name, content: comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl, contentType: file.type });
      setNewArticle(prev => ({ ...prev, imageUrl: result.data.url, imagePath: result.data.path }));
    } finally {
      setUploading(false);
    }
  };

  const saveArticle = async () => {
    if (!newArticle.title.trim()) return;
    const payload = {
      ...newArticle,
      tags: newArticle.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      author: user?.name || user?.email || 'Редакція',
      publishedAt: new Date().toISOString()
    };
    if (editingId) await api.put('/api/articles/' + editingId, payload);
    else await api.post('/api/articles', payload);
    resetEditor();
    await load();
  };

  const editArticle = (article: Article) => {
    setEditingId(article.id);
    setNewArticle({
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      body: article.body,
      status: article.status || 'published',
      featured: Boolean(article.featured),
      tags: (article.tags || []).join(', '),
      slug: article.slug || '',
      imageUrl: article.imageUrl || '',
      imagePath: article.imagePath || '',
      seoTitle: article.seoTitle || '',
      seoDescription: article.seoDescription || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeArticle = async (id: string) => {
    await api.delete('/api/articles/' + id);
    setSelected(null);
    await load();
  };

  if (selected) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] text-slate-950">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={18}/> До новин</button>
            <div className="brand text-lg">ЛЬВІВ <span>СЬОГОДНІ</span></div>
            <div className="w-20" />
          </div>
        </header>
        <article className="mx-auto max-w-5xl px-4 py-8 md:py-12">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm font-bold text-blue-700"><span>{selected.category}</span><span className="text-slate-300">•</span><span className="text-slate-500">{formatDate(selected.publishedAt)}</span></div>
          <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">{selected.title}</h1>
          {selected.imageUrl && <img src={selected.imageUrl} alt={selected.title} className="mt-8 max-h-[520px] w-full rounded-3xl object-cover" />}
          <p className="mt-6 max-w-3xl text-xl leading-relaxed text-slate-600">{selected.excerpt}</p>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-500"><span className="font-bold text-slate-800">{selected.author}</span><span>•</span><span>Львів Сьогодні</span></div>
          <div className="article-body mt-10 max-w-3xl whitespace-pre-wrap text-lg leading-8">{selected.body || 'Повний текст матеріалу буде доданий редакцією.'}</div>
          {selected.tags?.length ? <div className="mt-10 flex flex-wrap gap-2">{selected.tags.map(tag => <span key={tag} className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold">#{tag}</span>)}</div> : null}
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 hover:bg-slate-100"><Menu size={21}/></button>
          <button onClick={() => { setCategory('Усі'); setQuery(''); setAdmin(false); }} className="brand text-lg md:text-xl">ЛЬВІВ <span>СЬОГОДНІ</span></button>
          <div className="hidden flex-1 justify-center md:flex"><div className="flex w-full max-w-md items-center rounded-full border bg-slate-50 px-4"><Search size={17} className="text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Пошук новин..." className="w-full bg-transparent px-2 py-2 text-sm outline-none"/></div></div>
          <div className="ml-auto flex items-center gap-2">{user ? <button onClick={() => { auth.signOut(); setUser(null); setAdmin(false); }} className="hidden items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold md:flex"><LogOut size={15}/> Вийти</button> : <button onClick={signIn} className="flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-sm font-bold text-white"><LogIn size={15}/> <span className="hidden sm:inline">Увійти</span></button>}</div>
        </div>
        {menuOpen && <div className="border-t bg-white px-4 py-3 md:hidden"><div className="flex items-center rounded-xl border bg-slate-50 px-3"><Search size={17} className="text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Пошук новин..." className="w-full bg-transparent px-2 py-2 outline-none"/></div></div>}
        <nav className="overflow-x-auto border-t bg-white"><div className="mx-auto flex max-w-7xl gap-1 px-4 py-2">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold transition ${category === c ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{c}</button>)}{admin && user && <button onClick={() => setAdmin(!admin)} className={`ml-auto whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold ${admin ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>Редакція</button>}</div></nav>
      </header>

      {admin && user ? (
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-7 flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><div className="text-xs font-black uppercase tracking-[.18em] text-blue-600">CMS</div><h1 className="text-4xl font-black tracking-tight">Редакція</h1></div><div className="text-sm text-slate-500">{user.email || user.name}</div></div>
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">{editingId ? 'Редагувати матеріал' : 'Новий матеріал'}</h2>{editingId && <button onClick={resetEditor}><X size={18}/></button>}</div>
              <div className="space-y-3">
                <input value={newArticle.title} onChange={e => setNewArticle({...newArticle,title:e.target.value})} placeholder="Заголовок" className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"/>
                <textarea value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle,excerpt:e.target.value})} placeholder="Лід / короткий опис" rows={3} className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"/>
                <select value={newArticle.category} onChange={e => setNewArticle({...newArticle,category:e.target.value})} className="w-full rounded-xl border px-4 py-3">{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select>
                <textarea value={newArticle.body} onChange={e => setNewArticle({...newArticle,body:e.target.value})} placeholder="Текст матеріалу" rows={10} className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"/>
                <input value={newArticle.slug} onChange={e => setNewArticle({...newArticle,slug:e.target.value})} placeholder="Slug: novyna-pro-lviv" className="w-full rounded-xl border px-4 py-3" />
                <div className="rounded-xl border bg-slate-50 p-4"><div className="mb-2 text-sm font-bold">Обкладинка</div>{newArticle.imageUrl && <img src={newArticle.imageUrl} alt="" className="mb-3 h-40 w-full rounded-lg object-cover" />}<label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">{uploading ? 'Завантаження…' : 'Завантажити фото'}<input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={e => { const file = e.target.files?.[0]; if (file) uploadCover(file); }} /></label><div className="mt-2 text-xs text-slate-500">JPG, PNG, WebP · до 1.8 МБ</div></div>
                <input value={newArticle.seoTitle} onChange={e => setNewArticle({...newArticle,seoTitle:e.target.value})} placeholder="SEO title" className="w-full rounded-xl border px-4 py-3" />
                <textarea value={newArticle.seoDescription} onChange={e => setNewArticle({...newArticle,seoDescription:e.target.value})} placeholder="SEO description" rows={2} className="w-full rounded-xl border px-4 py-3" />
                <div className="grid gap-3 sm:grid-cols-2"><select value={newArticle.status} onChange={e => setNewArticle({...newArticle,status:e.target.value})} className="rounded-xl border px-4 py-3"><option value="published">Опубліковано</option><option value="draft">Чернетка</option></select><input value={newArticle.tags} onChange={e => setNewArticle({...newArticle,tags:e.target.value})} placeholder="Теги через кому" className="rounded-xl border px-4 py-3"/></div>
                <label className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold"><input type="checkbox" checked={newArticle.featured} onChange={e => setNewArticle({...newArticle,featured:e.target.checked})}/> Головний матеріал</label>
                <button onClick={saveArticle} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white">{editingId ? 'Зберегти зміни' : 'Опублікувати'}</button>
                {editingId && <button onClick={resetEditor} className="w-full rounded-xl border px-4 py-3 font-bold">Скасувати</button>}
              </div>
            </div>
            <div>
              <div className="mb-3 grid grid-cols-3 gap-3"><div className="rounded-2xl border bg-white p-4"><div className="text-xs text-slate-500">Матеріалів</div><b className="text-2xl">{articles.length}</b></div><div className="rounded-2xl border bg-white p-4"><div className="text-xs text-slate-500">Опубліковано</div><b className="text-2xl">{published.length}</b></div><div className="rounded-2xl border bg-white p-4"><div className="text-xs text-slate-500">Чернеток</div><b className="text-2xl">{articles.length-published.length}</b></div></div>
              <div className="space-y-2">{articles.map(a=><div key={a.id} className="flex items-center gap-3 rounded-2xl border bg-white p-4"><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap gap-2 text-[11px] font-black uppercase text-blue-600"><span>{a.category}</span>{a.featured&&<span>★ Головна</span>}{a.status==='draft'&&<span className="text-amber-600">Чернетка</span>}</div><div className="truncate font-bold">{a.title}</div></div><button onClick={()=>editArticle(a)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Pencil size={17}/></button><button onClick={()=>removeArticle(a.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17}/></button></div>)}</div>
            </div>
          </section>
        </main>
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          {loading ? <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">Завантаження новин…</div> : filtered.length === 0 ? <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">За вашим запитом матеріалів не знайдено.</div> : <>
            <section className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,.85fr)]">
              {featured && <button onClick={()=>setSelected(featured)} className="group overflow-hidden rounded-3xl bg-slate-950 p-7 text-left text-white shadow-sm md:p-10"><div className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-blue-300"><Star size={14} fill="currentColor"/> Головне</div><h1 className="max-w-4xl text-4xl font-black leading-[1.04] tracking-tight md:text-6xl">{featured.title}</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">{featured.excerpt}</p><div className="mt-8 flex items-center gap-3 text-sm text-slate-400"><span className="font-bold text-white">{featured.category}</span><span>•</span><span>{formatDate(featured.publishedAt)}</span></div><div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">Читати <ChevronRight size={16}/></div></button>}
              <aside className="rounded-3xl border bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Популярне</h2><Clock3 size={18} className="text-slate-400"/></div><div className="divide-y">{popular.map((a,i)=><button key={a.id} onClick={()=>setSelected(a)} className="flex w-full gap-4 py-4 text-left"><span className="text-2xl font-black text-slate-200">{String(i+1).padStart(2,'0')}</span><span><span className="mb-1 block text-xs font-black uppercase text-blue-600">{a.category}</span><span className="font-bold leading-snug">{a.title}</span></span></button>)}</div></aside>
            </section>
            <section className="mt-9"><div className="mb-4 flex items-end justify-between border-b pb-3"><div><div className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Оперативно</div><h2 className="text-2xl font-black">Останні новини</h2></div><span className="text-sm font-semibold text-slate-400">{filtered.length} матеріалів</span></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{latest.map(a=><button key={a.id} onClick={()=>setSelected(a)} className="group rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="mb-3 flex items-center justify-between text-xs font-black uppercase text-blue-600"><span>{a.category}</span><span className="text-slate-400">{formatDate(a.publishedAt)}</span></div><h3 className="text-xl font-black leading-snug group-hover:text-blue-700">{a.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{a.excerpt}</p></button>)}</div></section>
            {categories.slice(1).map(cat => { const items = published.filter(a => a.category === cat).slice(0, 3); if (!items.length) return null; return <section key={cat} className="mt-10"><div className="mb-4 flex items-center justify-between border-b pb-3"><h2 className="text-2xl font-black">{cat}</h2><button onClick={()=>setCategory(cat)} className="flex items-center gap-1 text-sm font-bold text-blue-700">Усі <ChevronRight size={15}/></button></div><div className="grid gap-4 md:grid-cols-3">{items.map(a=><button key={a.id} onClick={()=>setSelected(a)} className="rounded-2xl border bg-white p-5 text-left"><div className="text-xs font-black text-blue-600">{formatDate(a.publishedAt)}</div><h3 className="mt-2 font-black leading-snug">{a.title}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-500">{a.excerpt}</p></button>)}</div></section>; })}
          </>}
        </main>
      )}

      <footer className="mt-12 border-t bg-slate-950 text-slate-300"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3"><div><div className="brand text-xl text-white">ЛЬВІВ <span>СЬОГОДНІ</span></div><p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">Новинне медіа про Львів та область. Оперативно про події, рішення, людей та зміни.</p></div><div><div className="font-bold text-white">Розділи</div><div className="mt-3 grid grid-cols-2 gap-2 text-sm">{categories.slice(1).map(c=><button key={c} onClick={()=>{setCategory(c);window.scrollTo({top:0,behavior:'smooth'});}} className="text-left text-slate-400 hover:text-white">{c}</button>)}</div></div><div><div className="font-bold text-white">Редакція</div><p className="mt-3 text-sm text-slate-400">Матеріали публікуються редакцією «Львів Сьогодні».</p></div></div><div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} Львів Сьогодні</div></footer>
    </div>
  );
}

export default App;
