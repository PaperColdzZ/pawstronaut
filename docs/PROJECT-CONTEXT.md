# Pawstronaut 项目知识库（详细记忆）

> 配套 `AGENTS.md` 使用。本文件保存**完整技术分析 + 经过实测验证的问题清单 + 证据**。
> 每条结论都标注了验证方式。**未标注验证方式的属于推断，请重新取证后再依赖。**
>
> **记忆维护协议在 `AGENTS.md` 第 0 节（强制）**：何时更新、更新到哪一节的清单、更新时机、每轮收尾自检，都在那里。
> 本文件的第 8 节问题清单需要按该协议**标注修复状态**。

分析日期：2026-09-14
分析时的仓库状态：`M src/pages/index.astro`（用户已改）、`?? src/assets/images/meepal-hero.png`（用户新增）

---

## 1. 技术栈与配置（源码级，已验证）

```
package.json
  dependencies:
    astro ^6.0.4
    tailwindcss ^4.2.1  +  @tailwindcss/vite ^4.2.1
    @astrojs/alpinejs ^0.5.0  +  alpinejs ^3.15.8
    @astrojs/mdx ^5.0.0
    @playform/inline ^0.1.2
    @types/alpinejs ^3.13.11
  devDependencies:
    @tailwindcss/typography ^0.5.15
  scripts: dev / build / preview / astro   （就这 4 个，没有 lint / format / test）
```

`astro.config.mjs` 要点：

- `site: "https://pawstronaut.netlify.app"`（第 9 行）—— **模板作者的域名，必须换**
- `base: "/"`
- `integrations: [@playform/inline, alpinejs(), mdx()]`
- `output: "static"`
- `devToolbar.enabled = false`
- `vite.plugins = [tailwindcss()]`（Tailwind v4 走 Vite 插件）

`tsconfig.json`：extends `astro/tsconfigs/strict`，`strictNullChecks: true`，`allowJs: true`，alias `~/*` -> `src/*`。

注意 `@types/alpinejs` 在 `dependencies` 里（应在 devDependencies），属于小瑕疵。

## 2. 目录与文件清单

```
src/
  layouts/Layout.astro          全站唯一布局壳
  pages/
    index.astro                 首页（长页，多 Section）
    about-us.astro
    contact.astro
    404.astro
    privacy-policy.mdx
    cats/index.astro            列表 + 客户端筛选脚本
    cats/[...slug].astro        详情 + 领养表单
    blog/index.astro            列表
    blog/[...slug].astro        详情（MD 正文）
    blog/page/[page].astro      博客分页（2026-09-14 立骨架新增）
    topics/[slug].astro         分类归档页（2026-09-14 立骨架新增）
    topics/[slug]/page/[page].astro  分类归档分页（2026-09-14 立骨架新增）
  components/                   35 个 .astro（含 forms/ 下 2 个；详见第 6 节，含 4 个死组件）
  data/
    config.ts                   站点级常量（品牌/联系/社交/营业时间）
    menus.js                    menuMain 导航数组
    cats.json                   9 条猫数据
    members.json                6 条成员数据
    names.json                  随机起名用的前后缀词表
  content/blog/                 3 篇 .md：hello-world / new-cat / new-site-launched
  content.config.ts             3 个 Collection 的 schema
  styles/global.css             Tailwind v4 的 @theme / @utility / 全局样式
  assets/images/                图片（含 meepal-hero.png 2.4MB；2026-09-15 新增 3 张 *_illustration.png 卡片插画 + scene-card1~3.jpeg 场景卡图）
  assets/icons/                 facebook / instagram / x / youtube SVG
public/                         favicon 系列 / pattern.jpg / fonts/caveat / site.webmanifest / humans.txt
```

## 3. 内容模型与数据流（核心机制）

### 3.1 三个 Collection（`src/content.config.ts`）

`cats` —— `loader: file("src/data/cats.json")`，schema 字段：
`name, breed, gender("male"|"female"), age, birthDate?, description?, image(image()), listDate, childFriendly, dogFriendly, catFriendly, outsideCat, sterilized`
（后 5 个布尔字段都有 `.default(false)`）

`members` —— `loader: file("src/data/members.json")`，字段：`name, role, image, description`

`blog` —— `loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" })`，字段：
`title, slug, image, imageAlt, excerpt?, publishDate(default 2014-01-01)`

### 3.2 URL 是怎么来的（**最容易搞错的地方**）

| 集合 | URL 来源 | 证据 |
|---|---|---|
| `cats` | JSON 里的 `id` 字段 | `cats/[...slug].astro` 用 `cat.id` 做 `params.slug`；构建产出 `/cats/reckoning/` 等 |
| `blog` | **frontmatter 的 `slug`**，不是文件名 | `src/content/blog/new-cat.md`（`slug: new-arrival-luna`）构建产出 `/blog/new-arrival-luna/` |
| `members` | JSON `id` | 只用于列表展示，没有详情路由 |

`blog` 的 `slug` 字段在代码里**从未被读取**，但 schema 里是**必填**。文件名与 URL 不一致，长期维护是陷阱。

### 3.3 路由 -> 数据源 -> 渲染方式 对照

| 路由 | 文件 | 数据来源 | 渲染 |
|---|---|---|---|
| `/` | index.astro | 硬编码内容 + config.ts + 硬编码 id 数组 | 纯 Astro，多 Section 长页 |
| `/about-us` | about-us.astro | 硬编码 + `Members` 组件 | 纯 Astro |
| `/contact` | contact.astro | 硬编码 + `FormContact` / `Map` / `TableHours` / `Address` | 纯 Astro |
| `/cats` | cats/index.astro | `getCollection("cats")` | 列表 + 内联筛选脚本 |
| `/cats/<id>` | cats/[...slug].astro | `getStaticPaths` | 详情 + `FormAdoption` |
| `/blog` | blog/index.astro | `getCollection("blog")` | 列表 |
| `/blog/<slug>` | blog/[...slug].astro | `getStaticPaths` + `render()` | MD 正文 |
| `/privacy-policy` | privacy-policy.mdx | MDX 内联内容 | MDX |
| `/404` | 404.astro | 无 | 纯 Astro |

### 3.4 结构性脆弱点

首页用**硬编码 id 数组**拉内容：

- `src/pages/index.astro:116` -> `<ShowCats cats={["reckoning", "chairman-meow", "pawdre-hepburn"]} />`
- `src/pages/index.astro:157` -> `<ShowBlogs posts={["hello-world", "new-arrival-luna", "new-site-launched"]} />`

这两处走 `getEntries()`。重命名内容 -> 首页对应卡片**静默消失，构建不报错**。

## 4. 渲染与交互机制

**布局**：`Layout.astro` = `<head>` 元信息 + `Header` + `<main><slot/></main>` + `Footer`。

**导航**：`<ClientRouter />`（View Transitions）。因此**所有客户端脚本必须监听 `astro:page-load`**，否则软导航后失效。已有组件都遵守了这个约定（Header / cats 筛选 / CatNameGenerator），这点是对的。

**交互分工**：

- Alpine.js 负责声明式：Header 的 `x-data="{ open: false }"` 移动端抽屉、Faq 的 `x-data="{ open: 0 }"` 手风琴
- 原生 JS 负责命令式：`cats/index.astro` 的四维筛选（gender / breed / childFriendly / sterilized，用 `data-cat` 属性携带 JSON 并在客户端动态重建 option 列表）、`CatNameGenerator` 的随机起名、`Header.astro` 用 JS 测量并注入 `--header-height`

**跨页动画**：`CardCat` / `CardBlogPost` / `HeadingBlog` 用 `transition:name={"cat-image-"+id}` 等做图片/标题的 morph。

**组件规范**：`Badge` / `Hero` / `Heading` / `Article` 用具名 slot（`hero-content-left/right`、`heading-title/content`），`Button` 支持 `As` 参数换标签名。这套抽象是干净的，可以作为设计系统底座复用。

## 5. 样式系统（Tailwind v4，CSS-first）

全部集中在 `src/styles/global.css`：

- `@import "tailwindcss"` + `@plugin "@tailwindcss/typography"`
- `@theme` 定义：`--font-caveat`、`--color-brand-teal(#14b8a6)`、`--color-brand-fuchsia(#ec4899)`
- `@utility container`：`margin-inline:auto; padding-inline:2rem`
- `@utility prose`（**第 15 行**）：**覆盖** typography 插件的 `.prose`，把标题尺寸抬得很大（h1/h2 桌面端 `--text-7xl` = 4.5rem，h2 移动端 3rem）；并统一 `p/li` 为 `--text-lg`、`--leading-relaxed`
- 全局 `h1..h6` 用 `@apply font-bold wrap-break-word font-caveat` —— **Caveat Brush 手写字体是全站标题基调**
- `body` 背景是 `url("/pattern.jpg")` 平铺
- 语义类：`.button` / `.button-teal` / `.button-fuchsia` / `.button-white` / `.menu-item-active` / `.menu-item-highlighted`
- `@font-face` 自托管 Caveat Brush（`/fonts/caveat/caveat-brush-v11-latin-regular.woff2`），`font-display: swap`

**已验证**：自定义 `@utility prose` 确实生效。产物 CSS 里同时存在两套 `.prose` 规则，自定义那套在 `@media(min-width:64rem)` 内产出 `.prose h1{font-size:var(--text-7xl)}`。

### 5.1 失效的类名（**实测确认，产物 CSS 里出现 0 次**）

| 位置 | 类名 | 后果 |
|---|---|---|
| `src/components/Header.astro:82` | `text-brand-red` | 移动端抽屉关闭按钮**没有颜色**（`brand-red` 在 `@theme` 里不存在） |
| `src/components/Faq.astro:15` | `divide-gray-fuchsia-200` | FAQ 分隔线**不生效**（类名拼错） |
| `src/components/Badge.astro:5` | 类型 `color?: "red" | "teal"` | 与第 9-13 行的实际颜色表 `{fuchsia, teal, white}` 不匹配；传 `"red"` 会渲染出 `class="undefined"` |

验证方式：`rg` 搜索产物 `dist/_astro/*.css`，`brand-red` 与 `gray-fuchsia` 命中次数均为 0。

## 6. 组件清单与死代码

在用（32 个）：Article, Address, Button, CallToAction, CardBlogPost, CardCat, CardMember, CatNameGenerator, Container, Faq, Footer, Header, Heading, HeadingBlog, Hero, Map, Members, Section, ShowBlogs, ShowCats, SocialMediaIcons, TableHours, LogoContainer, forms/FormContact, forms/FormAdoption + 立骨架/首页新增的 6 个：BlogArchive, Breadcrumbs, CardBenefit, Pagination, SceneStack, TopicNav

**死组件（全项目无引用，已验证）**：

- `Card.astro` —— 空壳 `<div>`，无 slot
- `HeadingMain.astro` —— 完全空的模板
- `WideImage.astro` —— 未被任何页面使用
- `Badge.astro` —— 未被任何页面使用，且有上述类型 bug

**未使用的资源**：`src/assets/images/logo.webp`

## 7. 构建与产物实测数据

验证方式：`npm run build`（在 `D:/WorkSpace/meepal-site-Templte/pawstronaut`），随后直接读取 `dist/` 产物进行度量。

### 7.1 构建本身是健康的

```
20 page(s) built in 2.68s          OK          <- 2026-09-15「场景叠放卡片」区块后的最新基线
Successfully inlined a total of 20 HTML files
```

> 历史基线：止血前 19 页 2.86s -> 止血后 19 页 2.35s -> 立骨架后 20 页 2.57s -> hero 改版 2.49s -> 4 advantages 区块 2.29s -> 场景叠放卡片 2.68s。
> 耗时在 **2.3~3.0s** 间波动，属正常区间；页数从立骨架起稳定为 **20**。
> `dist/_astro` 图片产物共 **39 个文件 / 6049 KB** —— 其中 3.67 MB 是 hero 的 PNG 回退（第 4 步待优化），新增的 3 张插画各约 3 KB、3 张场景卡 webp 分别 76.7 / 53.7 / 26.7 KB。

唯一警告：`[vite] "matchHostname" ... imported from external module "@astrojs/internal-helpers/remote" but never used`（Astro 内部的无害警告）

### 7.2 页面体积（**问题**）

| 页面 | HTML 体积 | `<style>` 块数 | `view-transition-name` 规则数 |
|---|---|---|---|
| `/cats` | **169.5 KB** | 29 | 27 |
| `/` | **152.6 KB** | 19 | 18 |
| `/blog` | 111 KB | 11 | 9 |
| `/contact` 等 | 99.7 KB | 5 | 0 |

> 上表为 **2026-09-14 止血步骤完成后**的复测值（此前 `/` 为 169 KB）。
> 止血步骤**未触及**性能问题：View Transitions 的 `<style>` 膨胀、`@playform/inline` 的 CSS 重复投递、hero 图的 3.67 MB PNG 回退，**全部仍在**，留待第 4 步。

其他固定开销：共享 CSS **59 KB**、`ClientRouter` **15.5 KB**、Alpine `page.js` **45 KB**

**根因 1 —— View Transitions 的 CSS 爆炸**：Astro 为**每一个** `transition:name` 生成一个独立 `<style>` 块。`/cats` 有 9 只猫 × 3 个名字 = 27 条规则 -> 27 个 `<style>`。这是 Astro 的实现方式，代价就是列表页凭空多几十 KB。

**根因 2 —— `@playform/inline` 在重复投递 CSS**：它把 59 KB 中的约 32 KB 内联进每个页面（构建日志："Inlined 31.68 kB (53% of original 59.02 kB)"），**同时保留** `<link rel="stylesheet">` 指向完整 59 KB 文件（还带一个 `media="print" onload="this.media='all'"` 的异步加载技巧）。等于每页搬运约 91 KB CSS。

### 7.3 Hero 图是性能地雷（**实测**）

`index.astro:43` 的 `<Picture src={CatBackground} ...>`（`CatBackground` = `meepal-hero.png`，源文件 **2.4 MB**）产出：

```
dist/_astro/meepal-hero.*_RkBVV.png    3666.2 KB   <- 回退图，比源文件还大
dist/_astro/meepal-hero.*_ZdJV3d.webp    141.5 KB
```

DOM：

```html
<picture>
  <source srcset="/_astro/meepal-hero....webp" type="image/webp">
  <img src="/_astro/meepal-hero....png" loading="eager" fetchpriority="high" width="1586" height="992">
</picture>
```

问题：(a) 3.66 MB 的 PNG 照样进部署；(b) **没有 `sizes` / 响应式 `srcset`**，手机端也按 1586px 原图下载。
`index.astro:135` 和 `:162` 还用同一张图做全屏背景的 `<Image>`，同样缺响应式宽度。

## 8. 已实测验证的问题清单（按优先级）

### P0 —— 不修不能上线

| # | 问题 | 证据 / 位置 |
|---|---|---|
| 1 | **绝大多数页面没有 `<title>` 和 meta description** | 逐页提取 `dist/**/*.html` 实测（见 8.1） |
| 2 | **没有 canonical、没有 sitemap、没有 robots.txt** | `Test-Path dist/robots.txt` = False；无 `sitemap-index.xml`；产物里 `rel="canonical"` 命中 0 次；未安装 `@astrojs/sitemap` |
| 3 | **og:image 指向不存在的文件** | `Layout.astro:32` 硬编码 `/images/og-image.jpg`；`public/images/` 目录不存在 -> 所有社交分享卡片空图 |
| 4 | **og:site_name 写死 `"WP Infusion"`** | `Layout.astro:34` —— 模板作者品牌 |
| 5 | **每页多个 h1** | `LogoContainer.astro:11` 用 `<h1>` 渲染站名，而它在 `Header` 里出现两次（桌面导航 + 移动端抽屉）。首页实测 3 个 h1：Pawstronaut / Pawstronaut / Welcome to our pet shelter! |
| 6 | **表单是死胡同** | `FormContact.astro` / `FormAdoption.astro` 都是 `<form action="#">`；`output: "static"` 无服务端。必须接 Netlify Forms / Formspree / 或改 `output: "server"` + 适配器 |

#### 8.1 title / description 逐页实测结果

| 页面 | `<title>` | description |
|---|---|---|
| `/` | `Home` | 有 |
| `/blog` | **空** | **无** |
| `/cats` | **空** | **无** |
| `/contact` | **空** | **无** |
| `/about-us` | **空** | **无** |
| `/blog/hello-world` | **空** | **无** |
| `/cats/reckoning` | **空** | **无** |
| `/privacy-policy` | **空** | `Our privacy policy.` |
| `/404` | **空** | **无** |

**根因**：`Layout.astro:6` 的 `const { pageTitle, title, description } = Astro.props` 全是可选 props，而 9 个页面里有 6 个是**无参** `<Layout>`。同时 `pageTitle` 与 `title` 两个名字语义重叠（前者给 `<title>`，后者给 og:title），是设计缺陷。

### P1 —— 上线前应修

| # | 问题 | 位置 / 证据 |
|---|---|---|
| 7 | **域名两个真相源** | `astro.config.mjs:9` = `pawstronaut.netlify.app`；`src/data/config.ts:4` `siteDomain` = `pawstronaut.com` |
| 8 | **theme-color 三处不一致** | `config.ts:7` `#FF0000`（正红）；`site.webmanifest` `#a09be7`（紫）；实际视觉是 teal/fuchsia |
| 9 | **首屏 CLS / 头部遮挡** | `global.css:203` `main > section:first-child { padding-top: var(--header-height) }`，而 `--header-height` **在整个 CSS 里只出现这一次**（实测计数 = 1，仅有这一处引用、无任何定义）。它完全靠 `Header.astro` 的 JS 运行时注入 -> JS 执行前该声明无效，padding 归零，首屏内容顶到固定头部下面再跳下来 |
| 10 | **`rel="author"` 是相对路径** | `Layout.astro:16` `href="humans.txt"`；在 `/cats/reckoning/` 解析成 `/cats/reckoning/humans.txt` -> 404（实测确认） |
| 11 | **cats.json 命名不一致** | `id: "chairman-meow"` 的 `image` 是 `captain-meow.jpg` |
| 12 | **模板作者痕迹必须清干净** | `public/humans.txt`（Christian Gelici / WP Infusion / LinkedIn / info@wpinfusion.com）、`README.md`、`LICENSE`（Copyright 2025 WP Infusion） |
| 13 | **Git 与仓库** | dubious ownership（需 `git config --global --add safe.directory`）；remote = `PaperColdzZ/pawstronaut.git` 需替换；无 CI / lint / format / test |

### P2 —— 工程卫生

| # | 问题 |
|---|---|
| 14 | favicon 系列仍是猫爪 logo；`assets/images/logo.webp` 未被引用 |
| 15 | 无 `netlify.toml` / `vercel.json`；无安全头、无缓存策略 |
| 16 | `Card.astro` / `HeadingMain.astro` / `WideImage.astro` / `Badge.astro` 死组件 |
| 17 | `@types/alpinejs` 错放在 `dependencies` |
| 18 | `cats/index.astro` 把整个 `cat.data`（含 ImageMetadata）序列化进 `data-cat` 属性，每张卡片重复冗余 JSON |

### 8.2 修复状态（2026-09-14 第 1 步「止血」后）

**已修复（实测验证通过）**

| 编号 | 问题 | 修复方式 |
|---|---|---|
| P0-1 | 大多页面无 title / description | 重写 `Layout.astro` 的 props 契约；9 个页面全部传入 |
| P0-2 | 无 canonical / sitemap / robots.txt | Layout 输出 canonical；接入 `@astrojs/sitemap`；新增 `public/robots.txt` |
| P0-3 | og:image 指向不存在的文件 | 新增 `public/images/og-image.jpg`（1200x630，142.6 KB，由 `meepal-hero.png` 用 Pillow 裁切生成） |
| P0-4 | `og:site_name` 写死 WP Infusion | 改为读 `siteName` |
| P0-5 | 每页多个 h1 | `LogoContainer` 的 h1 改为 span（保留 `font-caveat` 与尺寸，视觉不变） |
| P1-7 | 域名两个真相源 | 两处统一为 `meepal.pet`；canonical/og 已改为从 `Astro.site` 单一推导。**注意 `config.ts` 的 `siteDomain` 仍是冗余常量** |
| P1-8 | theme-color 三处不一致 | `config.ts` 与 `site.webmanifest` 统一为品牌青 `#14b8a6` |
| P1-9 | 首屏 CLS / 头部遮挡 | `global.css` 补 `:root { --header-height: 7rem }` 静态默认值（JS 仍会在运行时覆写） |
| P1-10 | `rel=author` 相对路径 404 | 从 Layout 移除该 link（`humans.txt` 保留并重写为 meepal 信息） |
| P1-12 | 模板作者痕迹 | 重写 `public/humans.txt` 与 `README.md`。**`LICENSE` 有意保留** —— MIT 要求保留版权声明，移除反而不合规 |
| 5.1 | 三个失效类名 | `text-brand-red`→`text-brand-fuchsia`；`divide-gray-fuchsia-200`→`divide-gray-200`。产物 CSS 残留实测为 0。**2026-09-15 复查发现这次替换没做干净** —— `Faq.astro` 当时是「加了一行」而不是「改掉一行」，残留出一层嵌套 `<dl>` 且只闭合一次（`1724` 字节 / `62` 个 CRLF），当日已清理为单层 `<dl>` + `divide-gray-200`。**教训：验证失效类名不能只看产物 CSS**（旧类名本来就产不出 CSS，恰好掩盖了标记错误），**还要回读标记本身**。 |

**仍然未修（留给后续步骤）**

- P0-6 表单后端（依赖 Cloudflare 部署形态，属第 4 步）
- P1-11 `cats.json` 的 `chairman-meow` / `captain-meow.jpg` 命名不一致
- P1-13 Git remote、CI、lint、format、test
- P2-14~18（favicon、部署配置、死组件、依赖归类、`data-cat` 冗余 JSON）
- 第 7 节全部性能问题

### 8.3 止血步骤带来的新事实（后续会话必须知道）

**1. `Layout.astro` 的 props 契约已变更（破坏性）**

| prop | 必填 | 说明 |
|---|---|---|
| `title` | 是 | 不含站点后缀。默认渲染为 `title + " | " + siteName` |
| `description` | 是 | meta description |
| `image` | 否 | 默认 `/images/og-image.jpg` |
| `type` | 否 | `website`（默认）或 `article` |
| `noindex` | 否 | 输出 `noindex,nofollow`，404 页在用 |
| `exactTitle` | 否 | 直接用 `title`，不拼后缀。首页在用（配 `siteTitle`） |

**旧模板的 `pageTitle` prop 已删除。** 新增页面必须传 `title` 与 `description`，否则 TS 报错（props 已声明为必填接口）。

**2. canonical / og:image 单一真相源**：二者都由 `Astro.site` 推导，而 `Astro.site` 来自 `astro.config.mjs` 的 `site`。**换域名只需改那一处。**

**3. 新增 `src/utils/seo.ts`**：导出 `clampDescription(text, max = 155)`，按词边界截断并补省略号，用于把过长描述压进 SERP 显示长度。两个详情页在用。

**4. 占位文案清单（必须替换）**：本步骤为让站点可运行而**临时撰写**了以下文案，全部是占位：

- `src/data/config.ts` 的 `siteSlogan`，以及新增的 `siteTitle` / `siteDescription`（文件内已有 NOTE 注释标注）
- 9 个页面的 `description` 字符串
- 首页 hero 的 `h1` 仍是 shelter 主题的 `"Welcome to our pet shelter!"`，与「宠物内容站」定位不符，**需要改写**

**5. 构建基线更新**：19 页、exit 0、约 2.3~2.4s。新增 `dist/sitemap-index.xml`、`dist/sitemap-0.xml`（18 条 URL，404 正确排除）、`dist/robots.txt`。

**6. 依赖变化**：新增 `@astrojs/sitemap`（`npm install` 需联网，沙箱内被拒、需提权执行）。安装后 `npm audit` 报 **16 个漏洞（1 low / 14 high / 1 critical）**，**尚未排查是否只影响 dev 链路**。npm 同时提示 `esbuild`、`sharp` 的 install script 被 allowScripts 策略拦截，但构建与图片优化实测正常。

### 8.4 「立骨架」方案（2026-09-14 提出 -> 用户确认 -> 已实施，见 8.5）

#### 8.4.1 为什么必须做 —— 三条实测出来的硬伤

**硬伤 1：`publishDate` 是从未被读取的死数据。**

全库搜 `publishDate` 只有 4 处命中：schema 定义 + 3 个 md 的 frontmatter。**代码里没有任何读取**（卡片不显示、详情页不显示、排序不用它）。
同时 `/blog` 列表页**没有任何 `sort()` 调用**，顺序就是 glob 的文件顺序。对内容站而言这是根本性问题：新文章不会排前面。

复现命令：

```powershell
rg -n 'publishDate' src          # 只命中 schema + 3 个 md
rg -n 'sort|order' src/pages/blog/index.astro   # 无命中

**硬伤 2：没有分页，而这是体积问题不是 UX 问题。**

`/blog` 用 `posts.map(...)` 全量渲染。每个 `CardBlogPost` 带 **3 个 `transition:name`**，Astro 为每一个生成一个独立 `<style>` 块：

| 文章数 | view-transition 规则 | 页面体积 |
|---|---|---|
| 3 篇（现状） | 9 条 | 111 KB |
| 100 篇 | 约 300 条 | 数 MB 级 |

横向证据：`/cats` 页 9 张卡片 -> 27 条规则 / 169.5 KB。**所以分页是防止列表页体积失控的结构手段。**

**硬伤 3：内容无法被组织。** 没有分类字段，第 20 篇文章之后 `/blog` 只是一坨平铺卡片，读者找不到主题，搜索引擎读不出主题结构。

#### 8.4.2 必要性分层

| 分类 | 项目 | 理由 |
|---|---|---|
| 必须做 | `updatedDate` | 内容站靠持续更新旧文章，只有 publishDate 会让读者与搜索引擎都误判时效 |
| 必须做 | 修排序缺失 + 让 `publishDate` 生效 | bug 级别 |
| 必须做 | 分页 | 见硬伤 2 |
| 必须做 | `category` | 内容站的基本组织维度 |
| 建议做 | 面包屑 | 可产出 `BreadcrumbList` 结构化数据，强化内链 |
| 建议做 | `/topics/<slug>` 归档页 | 让分类能被单独收录，成为内链枢纽 |
| **只留字段不做页面** | `tags` | 轻量站早期做标签会产生「每篇挂 5 个标签、每标签仅 1 篇」的稀薄页面，**反而伤 SEO** |
| **只留字段不做页面** | 作者署名 | **若无真人作者，署名虚构作者具欺骗性**，Google spam policy 要求作者信息真实可验证 |

#### 8.4.3 代码层面影响

新增文件：

| 文件 | 作用 |
|---|---|
| `src/data/topics.json` | 分类清单（id / name / description）。用 JSON 而非自由字符串，是为避免 `Nutrition` / `nutrition` 变成两个分类 |
| `src/pages/topics/[slug].astro` | 分类归档页，复用 `/blog` 的 grid + `CardBlogPost` |
| `src/components/Pagination.astro` | 分页控件，沿用 `Button.astro` 的 class 组织方式 |
| `src/components/Breadcrumbs.astro` | 面包屑 |

修改文件：

| 文件 | 改什么 | 影响现有行为 |
|---|---|---|
| `src/content.config.ts` | blog schema 加 4 个**可选**字段（`updatedDate` / `category` / `tags` / `author`）+ 新增 `topics` collection | 否 |
| `src/pages/blog/index.astro` | 加排序 + 分页 + 分类筛选 | **是**（纯加法） |
| `src/pages/blog/[...slug].astro` | 加元信息行 + 面包屑 | **是**（纯加法） |
| 3 个 .md | 补 frontmatter | 否 |
| `src/data/menus.js` | 可选：导航加 Topics 一项 | 是（但用户本来就要） |

**完全不动**：`cats` 两页、`members`、`about-us`、`contact`、`404`、`privacy-policy`、`Layout.astro`、`Header`/`Footer`（除导航项）、`global.css`、Tailwind 主题、所有现有视觉组件。

blog 的 URL 依然来自 frontmatter 的 `slug` —— 核心机制不变。

#### 8.4.4 页面视觉影响（逐页）

| 页面 | 会变吗 | 变成什么样 | 幅度 |
|---|---|---|---|
| `/` | 否 | 除非另外加「热门分类」区块 | 无 |
| `/blog` | **是** | 列表上方多一条分类筛选；超过每页条数后底部出现分页 | 小，纯加法 |
| `/blog/<slug>` | **是** | 正文上方多一行「分类 · 发布 · 更新」，标题上方多一条面包屑 | 小，纯加法 |
| `/topics/<slug>` | 新增 | 全新页面 | 新 |
| `/cats`、`/cats/<id>` | **否** | —— | 无 |
| `/about-us`、`/contact`、`/404`、`/privacy-policy` | **否** | —— | 无 |

**结论：9 个现有页面里只有 2 个会变，都是「多一条/多一行」，无重构、无改版、无删除。**

不跑偏的保证来自复用：骨架继续用 `Section` / `Container` / `Heading`，卡片继续用 `CardBlogPost`，标题字号与颜色继续用 `h2` class 与 `text-teal-500` —— 与 `/cats` 页同一套。

#### 8.4.5 建议的 3 步拆法（等用户选择）

| 步骤 | 内容 | 视觉变化 |
|---|---|---|
| **2a（推荐先做）** | schema 扩字段 + 新建 `topics.json` + 3 篇文章补 frontmatter + 修排序缺失 | **零**（纯数据层） |
| 2b | `/topics/<slug>` 归档页 | 纯新增 |
| 2c | `/blog` 分页 + 面包屑 + 详情页元信息行 | 会动现有页面 |

推荐先做 2a 的理由：风险为零（无视觉变化），但能先确认**数据模型**是否正确；分类体系若要调整，此时改最便宜。

#### 8.4.6 待用户拍板

1. **分类名字**（内容决策）：初步候选 `Health` / `Nutrition` / `Behavior` / `Grooming` / `Adoption` / `Breeds`
2. 是否按 2a -> 2b -> 2c 节奏走
3. 是否接受「标签与作者只留字段、不做页面」

### 8.5 「立骨架」实施记录（2026-09-14 已完成并实测）

**新增文件（9 个）**

| 文件 | 作用 |
|---|---|
| `src/data/topics.json` | 6 个分类的唯一真相源（id / name / description） |
| `src/utils/blog.ts` | 排序、分页、分类聚合、日期格式化 |
| `src/components/TopicNav.astro` | 分类导航胶囊，当前分类高亮 |
| `src/components/Pagination.astro` | 分页控件（上/下一页 + 窗口化页码） |
| `src/components/Breadcrumbs.astro` | 面包屑 |
| `src/components/BlogArchive.astro` | 归档页共享外壳（Heading + TopicNav + grid + Pagination） |
| `src/pages/topics/[slug].astro` | 分类归档第 1 页 |
| `src/pages/topics/[slug]/page/[page].astro` | 分类归档第 2 页起 |
| `src/pages/blog/page/[page].astro` | 博客归档第 2 页起 |

**修改文件（5 个）**

- `src/content.config.ts`：新增 `topics` collection；blog schema 加 `updatedDate` / `category` / `tags` / `author`（**全部可选**）
- `src/pages/blog/index.astro`：改用 `BlogArchive` + 按日期排序
- `src/pages/blog/[...slug].astro`：加面包屑 + 元信息行
- `src/components/HeadingBlog.astro`：**新增一个 `meta` 具名 slot**（不传则输出与从前完全一致）
- `src/content/blog/hello-world.md`：加 `category: adoption` + `tags`；`new-cat.md`：加 `category: adoption` + `updatedDate: 2024-02-05`

**故意未改**：`src/content/blog/new-site-launched.md` 保持零改动，用来验证「所有新增字段都可选」这条路径。

#### 关键设计决策

1. **分类用 `z.enum(topicIds)` 校验**：`content.config.ts` 直接 import `topics.json` 生成枚举，写错分类名会**构建失败**，而不是静默产生第二个分类。
2. **只发布有内容的分类页**（`getPublishedTopics()`）。第一版生成全部 6 个分类页并对空的加 `noindex`，实测发现**空页仍在 sitemap 里**（24 条 URL）—— 自相矛盾。改为不生成空分类页后 sitemap 降到 19 条，且无死链。
3. **分页 URL 用 `/blog/page/N/` 而非 Astro 内置的 `[...page]`**：内置方案要求 `blog/[...page].astro`，会与 `blog/[...slug].astro` 的路由模式冲突。改用 `blog/page/[page].astro` 后构建通过。
4. **分类筛选是服务端链接而非客户端 JS**：点分类 = 跳到 `/topics/<id>/`，可被爬虫抓取。**刻意没有照抄 `/cats` 页的客户端筛选**（那会让内容对爬虫不可见）。
5. **`POSTS_PER_PAGE = 12`**：把列表页的 `transition:name` 式样块数量限制在 36 条左右，避免第 7 节记录的体积膨胀。

#### 实测验证（全部通过）

- 构建 exit 0，**20 页**、2.43s（止血后为 19 页）
- 全站 20 页：title 非空、desc 非空且 <= 160 字符、canonical 存在、h1 恰好 1 个 —— **全部 0 异常**
- `sitemap-0.xml` 19 条 URL（18 + `/topics/adoption/`）
- `/blog` 3 张卡、`/topics/adoption` 2 张卡（分类过滤生效）
- 面包屑：有分类的文章 = `Home / Blog / Adoption / 标题`；无分类的 `new-site-launched` = `Home / Blog / 标题`
- 元信息行：`Adoption / Published January 21, 2024`；`new-arrival-luna` 额外显示 `Updated February 5, 2024`；两条都带 `<time datetime>`
- TopicNav 高亮：`/topics/adoption` 上 Adoption 为 `bg-brand-teal text-white` + `aria-current="page"`
- **分页真实路径已验证**：把 `POSTS_PER_PAGE` 临时改为 2 -> 生成 `/blog/page/2/`（1 张卡、canonical 正确、sitemap 含该页、控件渲染出禁用的 Previous / 高亮 1 / 链接 2 / `rel="next"` 的 Next），随后改回 12。
  **可复用技巧：分页在内容不足时不触发，验证时必须临时调小 pageSize。**
- 页面体积：`/blog` 110.9 KB、`/topics/adoption` 102.5 KB、文章详情 97.2 KB

#### 遗留与后续

- 分类名与各分类 description 是我起草的**占位**，需用户审阅
- `tags` 与 `author` 字段已留位但无页面；**若没有真人作者，不要启用作者署名**
- 本轮改动的提交状态：**截至 2026-09-14 仍未提交**，用户明确表示将自行审阅后 commit（我不代为提交）。准确计数见 8.7。

### 8.6 早期变更日志归档（从 `AGENTS.md` 第 9 节移入）

> 2026-09-14 会话早期的事件，细节已在 8.1~8.5 各节展开，此处仅保留时间线以备追溯。

| 日期 | 事件 |
|---|---|
| 2026-09-14 | 用户要求建立持久记忆，创建 `AGENTS.md` 与 `docs/PROJECT-CONTEXT.md`。当日完成全项目通读、一次成功构建（19 页）、产物级取证，并交付分析报告。 |
| 2026-09-14 | 记录仓库基线状态：代码尚无任何修改；用户已自行改过 `src/pages/index.astro` 并新增 `src/assets/images/meepal-hero.png`（用户的改动，勿动）。 |
| 2026-09-14 | 用户追加要求：关键沟通与工作内容都必须及时跟进更新记忆。据此在 `AGENTS.md` 新增第 0 节「记忆维护协议（强制）」与第 6 节「已确认决策」。 |
| 2026-09-14 | 用户确认：品牌 **meepal**、域名 **meepal.pet**、测试站托管 **Cloudflare**；**范围下调**为「快速上线的健康轻量内容站，不对标 petmd」；**授权开始第 1 步「止血」**。 |
| 2026-09-14 | **第 1 步「止血」实施完成**。改动 12 处：`astro.config.mjs`（site 改 `https://meepal.pet`、加 `sitemap()`）、`package.json`（name->meepal、加 `@astrojs/sitemap`）、`src/data/config.ts`、**重写** `src/layouts/Layout.astro`、新增 `src/utils/seo.ts`、`LogoContainer`（h1->span）、`Header`、`Faq`、`global.css`（补 `--header-height` 默认值）、9 个页面加 title/description、`contact.astro`（首个 h2->h1）、新增 `public/robots.txt` 与 `public/images/og-image.jpg`、重写 `public/humans.txt` 与 `public/site.webmanifest` 与 `README.md`。 |
| 2026-09-14 | 止血**实测验证**：构建 exit 0、19 页 2.35s；19/19 页 title 非空、desc 非空且 <=160、canonical 存在、h1 恰好 1 个；`sitemap-0.xml` 18 条 URL（404 已排除）；产物 CSS 中 `brand-red`/`gray-fuchsia` 残留为 0。 |
| 2026-09-14 | 止血过程中发现并修正 2 个自己引入的问题：(a) `/contact` 在 h1 去重后变成 0 个 h1，已把首个 `h2` 提升为 `h1`；(b) 首次补丁把旧声明留成上下文行导致 `description` 重复声明、构建失败。 |
| 2026-09-14 | 新增待观察项：安装 `@astrojs/sitemap` 时 `npm audit` 报 **16 个漏洞（1 low / 14 high / 1 critical）**，**尚未排查是否仅限 dev 链路**；npm 亦提示 `esbuild`、`sharp` 的 install script 被 allowScripts 策略拦截（构建与图片优化实测仍正常）。 |

### 8.7 2026-09-14「暂停开发」轮次记录 + 用户待办清单

**用户在本轮的四项决定**：

1. 分类名**暂用我起草的占位** —— 最终定稿待定，不阻塞开发
2. 反问「需要我做什么」 —— 回答即下方清单（本节为该回答的落盘版本）
3. **不需要我代为提交** —— 用户审阅代码后自行 commit
4. **暂时只更新记忆，不要继续后续工作** —— 第 3、4 步均未获授权

**本轮实际动作**：只改记忆文件（`AGENTS.md` + 本节）。复验 `npm run build` = exit 0 / **20 页** / 2.57s；核实工作区未提交改动 = **9 个新增文件** + **6 个修改的源码文件** + **2 个记忆文件**。

#### 用户待办清单（每项附 `文件:行号` 证据）

| # | 要做的事 | 位置 | 现状（2026-09-14 实测） |
|---|---|---|---|
| 1 | 品牌文案 | `src/data/config.ts:11-14` | `siteSlogan` / `siteTitle` / `siteDescription` 全是我写的占位；文件顶部 `:3-6` 有 NOTE 注释 |
| 2 | 首页 hero 文案（标题 + 正文） | `src/pages/index.astro:80-85` | 仍是 `Welcome to our pet shelter!` + 领养口吻正文。**布局已改（左对齐），文案未动** —— 见 8.8 |
| 3 | 首页 FAQ 问答 | `src/pages/index.astro:25,29,33,37` | 4 组问答仍是领养 / 收容所主题 |
| 4 | 首页 blog 引言 | `src/pages/index.astro:193` 起 | `News from our shelter` 等 shelter 措辞 |
| 5 | 9 个页面的 meta description | `src/pages/**` 各页的 `<Layout>` 调用 | 我撰写的占位 |
| 6 | 分类名与描述 | `src/data/topics.json`（6 条） | 我撰写的占位（用户已确认先用） |
| 7 | 联系方式 | `src/data/config.ts:17-33` | phone `(123) 456-789`（`:19`）、street `1234 Space Street`（`:28`）、city `Galaxy City`（`:29`）、zip/state/country 同为太空梗；email 已改为 `info@meepal.pet`（`:23-24`） |
| 8 | favicon / logo | `public/`、`src/assets/images/` | 仍是模板的猫爪图标 |
| 9 | 模板演示内容去留 | 3 篇 blog md、9 只猫、6 位成员 | 全站可见；**删或留由用户决定**（按第 6 节「只增不删」，我不主动删） |
| 10 | hero 图优化 | `src/assets/images/meepal-hero.png` | 源 **2.4 MB** -> 产出 **3.67 MB** PNG 回退且无 `srcset`（第 4 步处理） |
| 11 | 审阅并提交 | 工作区 | 改动清单见 8.5 |

**建议的代码审阅顺序**（按影响面从大到小）：

1. `src/content.config.ts` —— 唯一决定 schema 的文件，也是 `z.enum` 校验的来源
2. `src/utils/blog.ts` —— 所有排序 / 分页 / 分类聚合逻辑
3. `src/components/BlogArchive.astro` —— 三个归档页共用的外壳
4. `src/pages/blog/[...slug].astro` —— 文章详情页（面包屑 + 元信息行）
5. 其余 7 个新增文件与 4 个修改的源码文件


### 8.8 首页 hero 改版 + Trust badges（2026-09-14 已完成并实测）

**用户要求**：(1) 把首页 hero 的文案块挪到左侧并改为左对齐；(2) 在正文与按钮之间加入参考图里那组徽章，代码可从 `D:\WorkSpace\meepal-site-Templte\purrfectly-zen-astro` 取，允许按本项目做样式调整。

#### 这组东西叫什么

**Trust Badges（信任徽章 / 信任标识）**。原项目源码里的注释就写作 `{/* Trust Badges */}`（`purrfectly-zen-astro/src/components/HomePage.tsx:218`）。作用是在主 CTA 之前用 3~4 个短标签降低决策成本、补充社会认同（评分、免费、专业性、口碑）。

#### 控制这部分的文件

**全部在 `src/pages/index.astro`** —— 首页 hero 是主模板内联写的，**不是独立组件**。

| 位置 | 控制什么 |
|---|---|
| `index.astro:78` | `mr-auto` —— 内容块靠左（原来是 `ml-auto`，靠右） |
| `index.astro:79` | `lg:text-left` —— 文字左对齐（原来是 `lg:text-right`） |
| `index.astro:81` | `max-w-2xl` —— 给左对齐正文限制行宽 |
| `index.astro:41-63` | `badges` 数据数组（label / color / SVG path）—— **增删徽章只改这里** |
| `index.astro:87-104` | 徽章渲染（胶囊 span + 内联 SVG） |
| `index.astro:106-108` | 「Adopt now!」按钮（样式来自 `src/components/Button.astro` + `global.css` 的 `.button-white`） |

#### 实现方式（相对原项目改了什么）

原项目是 React：`lucide-react` 图标（`Star` / `Lock` / `CheckCircle` / `Heart`）+ framer-motion 入场动画。本项目**没有图标库依赖**，按第 6 节「不引入新架构风格、不新增依赖」，改写为：

- Astro 模板 + **Heroicons v2 outline 内联 SVG**，写法与 `Header.astro` / `Faq.astro` 现有图标完全一致（`fill="none"` / `viewBox="0 0 24 24"` / `stroke-width="1.5"` / `data-slot="icon"`）
- 去掉 framer-motion 动画（纯 CSS，**不引入 JS**）
- 样式适配：原项目在浅灰底上用「浅底深字」胶囊；我们的 hero 是照片 + 紫青渐变遮罩，所以改成玻璃质感白字胶囊 `border-white/40 bg-white/20 backdrop-blur-sm`，图标用 `*-300` 亮色调（amber / emerald / violet / rose）

**样式迭代记录**：第一版用 `border-white/30 bg-white/15`，实测截图发现胶囊边界几乎看不见、读起来像悬浮文字；加强为 `border-white/40 bg-white/20 shadow-sm` 后边界清晰。**两版都截图对比过。**

#### 验证

- `npm run build`：20 页、exit 0、2.49s
- 用本地 `npm run preview`（:4321，视口 1280×720，`lg` 断点生效）在**真实浏览器**里渲染并截图：确认文案块已在左侧、文字左对齐、4 个图标（星 / 锁 / 对勾 / 心）形状正确、正文行宽合理、按钮位置正常

#### 明确没有做的事

- **没有替换 hero 文案**。用户给的 mockup 里正文写的是 `Warm, practical guidance for raising happy cats and dogs without second-guessing every little thing.`，与仓库现状（`Welcome to our pet shelter!` + 领养口吻正文）不同 —— 属于「用户没让我改的内容」，**不擅自替换**。已记入 `AGENTS.md` 第 7 节 4b。
- **没有改 `5 Rated` 这个标签**。照搬参考图原文；但英文里更常见的是 `5-Star Rated`，已向用户提出，等其决定（`AGENTS.md` 第 7 节 4c）。

### 8.9 首页新增「4 advantages」区块（2026-09-15 已完成并实测）

**用户要求**：

1. 在主页**第一个 Section 下面**新增一个 Section，包含参考图里的全部内容：眉标 `4 advantages` + 标题 `The Benefits of Feeding a Pet` + 正文 + **4 张卡片**
2. 卡片实现可从参考项目 `D:\WorkSpace\meepal-site-Templte\purrfectly-zen-astro` 取；**那里只有 3 张，第 4 张复用其中一个素材**；素材文件要复制进本项目；文案先用占位，样式可按本项目风格调整

**用户同时新增长期规则**：以后改代码要加**中文注释**（已写入 `AGENTS.md` 第 4 节第 8 条）。

#### 落地位置

`src/pages/index.astro`，紧跟 hero Section 之后、`Adopt a pet today!` Section 之前 —— 即整页**第 2 个 Section**。

#### 新增文件

| 文件 | 作用 |
|---|---|
| `src/components/CardBenefit.astro` | 单张「利益点」卡片：上方插画区（`bg-teal-50`，h-48）+ 下方文字区（白底居中） |
| `src/assets/images/meditating_cat_illustration.png` | 插画素材（复制自参考项目，1024×1024） |
| `src/assets/images/playful_cat_illustration.png` | 同上（1024×1024） |
| `src/assets/images/cat_with_food_illustration.png` | 同上（1024×1024）；**第 4 张卡复用它** |

**修改文件**：`src/pages/index.astro` —— 新增 3 个图片 import、`CardBenefit` import、`benefits` 数据数组、以及新 Section 的标记。

#### 关键实现决策

1. **React -> Astro 改写**：参考项目的 `FeatureCard`（`HomePage.tsx:307-347`）用 React + `framer-motion`（滚动入场 + hover 位移）。本项目没有这些依赖，按第 6 节「不引入新架构」改成纯 Astro + CSS `transition-shadow`。**零新增依赖、零新增 JS。**
2. **插画走 `src/assets` + `<Image>`，不放 `public/`**：源 PNG 各 570~680 KB，Astro 构建转 webp 后**每张约 3 KB**（实测 3.1 / 2.6 / 3.1 KB）。这是本次最大的性能收益点。
3. **区块背景沿用模板既有节奏**：用不带 `bg-white` 的 `<Section>`，显示 body 的 `pattern.jpg` 猫咪底纹，与相邻的 `bg-white` 区块交替。**有意不改成白色** —— 否则会触发 `section.bg-white + section.bg-white > .container { pt-0 }`，改动既有区块的间距。
4. **标题组居中**：参考图是居中版式，而项目既有的 `Heading.astro` 是左对齐、且不接受 class 参数。为了**不动共享组件**，这里按 `Heading.astro` 同样的排版约束（`max-w-3xl prose mb-16`）内联写，额外加 `mx-auto text-center`。

#### 踩坑（已修，值得记）

- **`prose` 里的 h2 会被 typography 插件加 `margin-top: 120px`**（`--text-6xl` 时按 em 计算）。插件只在 **h2 是 `.prose` 的第一个子元素**时才把它清零。
- 本例眉标 `<span>` 排在 h2 前面，h2 成了第二个子元素 -> 眉标与标题之间出现约 105px 空白，比参考图松散很多。
- 修法：h2 加 `mt-0`（utilities 层优先级高于插件样式，**实测有效**），眉标加 `block mb-2` 自成一行。**实测间距 120px -> 8px。**
- 过程坑：`apply_patch` 里如果把 `+` 行写在 ` ---` 上下文行**之后**，内容会被插到 frontmatter 围栏外（本次 `benefits` 数组一度落到 `---` 之后，已修正）。**要把 `---` 一起当作被替换行。**

#### 验证

- `npm run build`：20 页、exit 0、**2.29s**（页数不变，只改首页内容）
- 全站审计：20 页 title / description / canonical / h1 **全部通过，0 异常**；sitemap 仍 19 条 URL
- 真实浏览器渲染（本地 dev server，1280×720）：眉标、标题、正文、4 张卡片全部正常；4 张插画 webp 正常加载；卡片标题用模板的 Caveat Brush，与全站一致
- 截图留在 `C:\Users\Administrator\.codex\visualizations\2026\09\14\01a09ff5-3ce0-7e81-8d21-7a788420220d\`（`benefits-final.png` / `cards-final.png`）

#### 遗留

- 卡片标题/正文是**占位**（沿用参考项目原文 `Master of Chill` / `Playful Spirit` / `Soul Nourishment`×2，与宠物喂养主题不符），等用户给正式文案
- 第 4 张卡复用第 3 张插画，将来有素材再换
- 参考项目是 MIT（作者 Fauzira Alpiandi）—— **推断** MIT 覆盖代码，附带插画的可商用性建议用户上线前自行确认


### 8.10 首页「场景叠放卡片」区块 + 隐藏「Adopt a pet today!」（2026-09-15 已完成并实测）

#### 用户要求（2026-09-15 第二次请求）

1. **隐藏**主页第 3 个 Section「Adopt a pet today!」—— **不要删除代码，可以先注释掉**。
2. 在原位置**替换为新区域**：左侧文本（先占位即可），右侧**三个叠在一起的卡片**，可点击切换显示顺序。卡片原始实现见 `D:\WorkSpace\meepal-site\meepal-home-v3.html` 的 `<div class="scene-grid">`；图片依次替换为 `src/assets/images/scene-card1/2/3.jpeg`。
3. 样式可按本项目风格优化。
4. **用户明确说明：不再需要我验证结果**，由用户自己确认，需要更改会告诉我。（本条已写入 `AGENTS.md` 第 4 节）

#### 落地内容

- `src/pages/index.astro`：原 `Adopt a pet today!` 整段 `<Section>` 用 `<!-- ... -->` 包住，**代码逐字保留**（恢复只需删掉这对注释标记）；紧随其后新增一个新 `<Section class:list={"bg-white"}>`，左 2 栏文案 / 右 3 栏卡片（`lg:grid-cols-5`）。
- **新增组件** `src/components/SceneStack.astro`（3504 字节 / 99 行）。
- frontmatter 新增 `scenes` 数组（3 项：`image` / `number` / `title` / `text`）+ 3 个 `scene-card*.jpeg` 的 import。

#### 关键实现决策（5 条）

1. **交互沿用项目已有的 Alpine.js**（写法对齐 `Faq.astro`），**不引入新依赖**。
2. `x-data` 的状态字符串写成 frontmatter 里的 `deckState` 常量，避免模板属性里出现多层嵌套引号。状态含 `order` / `bring(i)` / `depth(i)` / `deckStyle(i)`。
3. 三张卡放进**同一个 grid 单元格**（`col-start-1 row-start-1`）=> 容器高度等于最高的一张，其余靠 `transform` 叠上去；避免绝对定位把容器高度压没。
4. 叠放偏移走 **CSS 变量** `--deck-x` / `--deck-y` / `--deck-scale-step`，手机与 `lg` 断点分别取值，改这几个数字即可调「扇形」张开程度。
5. 点击语义 = **点哪张，哪张翻到最前面**（`bring(i)`），z-index 与位移按层级实时计算。

#### 顺手修掉的真 bug

`src/components/Faq.astro` 里残留的嵌套 `<dl>`（来源见 8.2 节 5.1 行）当日已清理为单层 `<dl>` + `divide-gray-200`。

#### 实测

- `npm run build`：**20 页 / exit 0 / 2.68s**，页数与改前一致（本步只改首页内容）。
- 产物核对（`dist/index.html`，166427 字节）：`Adopt a pet today` / `Adopt a cat` 出现 **0 次** => Astro 不会把 HTML 注释里的内容渲染出去，隐藏是干净的；`scene-deck` 出现 3 次、`deckStyle` 4 次、新标题 1 次 => 新区块已正常产出。
- 场景卡图经 `astro:assets` 转 webp：76.7 / 53.7 / 26.7 KB。

#### 遗留

- 新区块**左侧文案是占位**：标题 `Life, with a little more life in it.` 与首段沿用用户参考稿，第二段是我写的英文占位说明。
- 三张卡的 `number` / `title` / `text` 也是占位；`alt` 暂用 `title` 兜底，**上线前要补成真正的图片描述**（SEO 相关）。
- `Adopt a pet today!` 的注释文本会原样进 HTML（可接受，但别往里塞大段内容）。
- `scene-card1.jpeg` 转 webp 后反而最大（76.7 KB），它也是三张里唯一的竖构图（900×1349）；若要压，限制输出宽度即可。


### 8.11 场景叠卡的尺寸与错开量调优（2026-09-15，用户反馈后已改）

**用户反馈**（附截图）：(1) 卡片展示得太大；(2) 卡片重叠度过高，能点到的地方太小，要求加大错开位置。

#### 根因（关键，别再犯）

旧参数是 `--deck-x: 1.5rem` / `--deck-scale-step: 0.05`（lg 断点）。卡片**以自身中心为原点缩放**，缩放会从左右各吃掉 `step * 卡片宽 / 2`：

    可见错开量 ≈ --deck-x - --deck-scale-step * 卡片宽 / 2

代入旧值：`24px - 0.05 * 755px / 2 = 24 - 18.9 ≈ 5px` —— 后面两张只露出 5px 的细边，所以「点不到」。**位移几乎被缩放抵消光，这是本次问题的唯一根因**，不是 z-index 或点击区域写错。

#### 改法

| 参数 | 旧（lg） | 新（lg） | 新（手机 / 平板） |
|---|---|---|---|
| `--deck-x` | 1.5rem | **3rem** | 1rem |
| `--deck-y` | 0.7rem | **1.625rem** | 0.6rem |
| `--deck-scale-step` | 0.05 | **0.03** | 0.02 |
| 卡片整体宽度 | 无上限（≈755px） | **`max-width: 38rem`**（≈512px） | `max-width: 30rem` |
| 容器内边距 | `pr-5 lg:pr-12` | `pr-12 pb-8 lg:pr-24 lg:pb-12` | 同左 |

- **内边距是必须的**：最深层卡片的探出量（lg 约 右 80px / 下 37px）要落在 padding 里，否则会被裁掉或撑出横向滚动条。**约束：`pr-*` ≥ 2 × `--deck-x`。**
- **`mx-auto`**：卡片变小后在 `lg:col-span-3`（1456px 视口下约 803px）的栏里居中，避免贴着文案或在右侧留出空洞。
- 改完的可见错开量：水平每层 ≈ **40px**（旧 5px），垂直每层 ≈ **19px**，两层累计约 81px —— 点击区域从「一条细边」变成明显的阶梯。
- 以后再调，只改 `.scene-deck` 里这 3 个变量 + `max-width`，并同步检查 `pr-*`。

#### 验证

`npm run build`：20 页 / exit 0 / **2.70s**。产物 `dist/index.html` 里确认两条规则都已生成：
`.scene-deck[data-astro-cid-…]{max-width:30rem;--deck-x:1rem;--deck-y:.6rem;--deck-scale-step:.02}` 和 `@media(min-width:1024px)` 下的 38rem / 3rem 那一版。**按用户要求未做浏览器渲染验证。**


### 8.12 首页「起步指南」区块（2026-09-15 已完成并实测）

**用户要求**：在上面（场景叠放卡片）那个 Section 下面新增一块 Section，如图所示；代码从 `D:\WorkSpace\meepal-site\meepal-home-v3.html` 的 `<section class="guides reveal" id="guides">` 找，两张配图分别换成 `src/assets/images/guide-card-cat.avif` 与 `guide-card-dog.avif`，样式可适当调整。

#### 参考稿位置（下次不用再找）

| 内容 | 位置 |
|---|---|
| 标记 | `meepal-home-v3.html:885-916` |
| 基础 CSS | `:276-345`（`.guides` / `.guide-layout` / `.guide-card` 等） |
| 按钮样式 | `:757-758`（`.guide-card .text-action`） |
| 响应式 | `:505-523`（窄屏文案单列）、`:610-619`（卡片单列） |
| 色值 | `:18-32` 的 `--yellow:#f8d264`、`--mint:#b7dbca`、`--green:#0e4b40` |

#### 落地内容

- **新增组件** `src/components/GuideCards.astro`（只负责两张卡片；左侧文案列写在页面里，与 `SceneStack.astro` 的做法一致）。
- `src/pages/index.astro`：新增 2 个图片 import（`:33-34`）+ `guides` 数组（`:115-132`）+ 新 `<Section class:list={"bg-white"}>`（`:265-285`，紧跟场景叠放卡片那个 Section）。
- 布局沿用邻块的 `lg:grid-cols-5`（左 2 / 右 3），与场景区块保持同一节奏。

#### 相对参考稿做的 3 处调整（组件头部注释里也写了）

1. **配图不再 absolute 定位**：原稿把图绝对定位、卡片靠 `padding-top: 210px` 给图让位，图高写死 170px。改成正常文档流 + `aspect-[3/2]` + `object-cover`，响应式下不用手算留白。
2. **标题字体**：原稿是 Playfair Display 衬线，这里换成项目全局的 Caveat Brush（`global.css` 里 `h1~h6` 都 `@apply font-caveat`），与全站标题一致。
3. **按钮配色**：原稿是深绿描边（`--green`），这里换成品牌色 `teal-900`，交互逻辑不变（浅底 + 深色描边，hover 翻转为深底白字）。

#### 素材与裁切（用 sharp 实测过，不要再猜）

两张 avif 的原始尺寸**并不一样**：

| 文件 | 尺寸 | 构建后 webp |
|---|---|---|
| `guide-card-cat.avif` | 900×900（方图） | 71.1 KB |
| `guide-card-dog.avif` | 900×1443（竖图） | 89.1 KB |

按 3:2 居中裁切预览确认过：猫的脸、狗的头+郁金香都能完整取到，所以卡片配图定 `aspect-[3/2]`（等价于 CSS `object-position: center` 默认居中裁切）。**换图时记得重新确认裁切位置。**

#### 实测

- `npm run build`：**20 页 / exit 0 / 2.63s**（页数不变，只改首页）。
- `dist/index.html` 168909 字节；`New here?` / 卡片标题各 1 次，`Open guide` 2 次。
- 产物 CSS（`dist/_astro/Container.xxx.css`）里确认生成了 `.bg-\[\#f8d264\]{background-color:#f8d264}`、`.bg-\[\#b7dbca\]{background-color:#b7dbca}`、`.aspect-\[3\/2\]{aspect-ratio:3/2}`。**Tailwind 只认字面量类名** —— 组件里必须把 `bg-[#f8d264]` 写成完整字符串，拼字符串不会生成 CSS。
- 因为紧跟在同样 `bg-white` 的场景区块后面，`global.css` 的 `section.bg-white + section.bg-white > .container { pt-0 }` 会生效，两块之间的间距由上一块的 `pb` 提供。
- 按用户要求**未做浏览器渲染验证**。

#### 遗留

- 左侧文案（`New here?` / 标题 / 引导语）与两张卡片的标题描述**全部是参考稿原文，属占位**。
- **`Open guide` 的链接是临时占位**：cat → `/topics/adoption/`（该分类页真实存在）；dog → `/blog/`（`/topics/behavior/` 目前没有文章、不会生成页面，指过去会 404）。等有了真正的 cat / dog 指南页要换掉。
- 卡片底色直接用了参考稿的 `--yellow` / `--mint`，是全站调色板（teal + fuchsia）之外的**新色相**；若觉得跟站点不搭，改 `GuideCards.astro` 里 `tones` 的两个类名即可。


### 8.13 首页「Dog health」区块（2026-09-15 已完成并实测）

> **注意：用户在本轮之前手动改过 `index.astro`** —— 把「Available Cats」整个 Section 用 HTML 注释注释掉了（原 `:302-315`），并调整过区块顺序。新区块插在**被注释掉的 Available Cats 之后、FAQ 之前**。

**用户要求**：在 FAQ Section 上面新增一个 Section，内容如图；代码从 `meepal-home-v3.html` 的 `<section class="dog-health reveal" id="journal">` 找，图片改用本地 `src/assets/images/dog-health-card.avif`，样式可适当调整。

#### 参考稿位置（下次不用再找）

| 内容 | 位置 |
|---|---|
| 标记 | `meepal-home-v3.html:957-976` |
| 基础 CSS | `:402-441`（`.dog-health` / `.health-layout` / `.health-card`） |
| 卡片 hover 放大 | `:703-708`（`.health-card:hover img { scale(1.04) }`） |
| 响应式 | `:505-529`、`:630-636`（`.health-layout` 转单列、`.health-card` 降 min-height） |
| 卡片底色 | `#d8ecad`（浅黄绿） |
| 按钮 | `.text-action` 基础款在 `:737-756`：实心深色胶囊，hover 反转为描边 |

#### 落地内容

- **新增组件** `src/components/HealthCard.astro`（单卡：浅绿底 + 居中配图 + 标题）。
- `src/pages/index.astro`：组件 import（`:17`）、图片 import（`:36-37`）、新 `<Section class:list={"bg-white"}>`（`:320-353`）。
- 布局用 `lg:grid-cols-2` + `lg:gap-20`（参考稿是 1fr 1fr / gap 80px）。

#### 相对参考稿做的调整

1. **图片不再固定尺寸**：原稿是 `width:65% / height:190px`，hover 放大 1.04 倍时**卡片没有 `overflow:hidden`**，图片会盖住卡片内边距。这里改成「外层 `overflow-hidden rounded-2xl` 容器 + 内层图片 `aspect-[3/2]` + `group-hover:scale-105`」，放大被圆角裁掉。
2. **标题字体**：换成项目全局的 Caveat Brush（`h5`）。
3. **按钮**：参考稿是实心深色胶囊、hover 反转为描边；这里换成本站品牌色 `teal-900`。它与同页 guides 区块的「浅底描边」胶囊**刻意不同** —— 参考稿里两者本来就是不同主次。
4. 卡片底色保留参考稿的 `#d8ecad`。

#### 素材与裁切（实测过）

`dog-health-card.avif` 是 **900×1125（4:5 竖图）**，内容是蓝底上的黄色毛衣法斗。用 sharp 按 3:2 与 4:3 居中裁切对比过：**3:2 能把狗头和黄毛衣完整取到**（4:3 会多留一点身体），所以定 `aspect-[3/2]`。

#### 实测

- `npm run build`：**20 页 / exit 0 / 2.74s**。
- `dist/index.html` **143400 字节** —— 比上一轮小，因为用户注释掉了 Available Cats 区块（`ShowCats` 在 HTML 里占了不少字节）。
- 产物核对：`Dog health` / `Healthy smile.` / `Read the dental guide` / `A beginner…` 各 1 次，且用 `indexOf` 位置比较确认 **dog health 出现在 FAQ 之前**。
- CSS 里确认生成了 `.bg-\[\#d8ecad\]{background-color:#d8ecad}`；配图输出 webp **30.1 KB**。
- 按用户要求**未做浏览器渲染验证**。

#### 遗留

- 左侧文案（`Dog health` / `Healthy smile. Happier dog.` / 正文）与卡片标题**全部是参考稿原文，属占位**。
- **`Read the dental guide` 的链接是占位**，指向 `/blog/`。原稿语义应指向「狗牙科护理」指南页，但站上还没有；`/topics/grooming/`（描述里正好含 dental）**当前没有文章、不会生成页面**，指过去会 404。


### 8.14 全站页脚改版（2026-09-15 已完成并实测）

> **前置**：用户在本轮之前又手动改了 `index.astro` —— 注释掉了「Contact us today to adopt a cat」那个 Section（原 `:371-381`）。那是**用户自己的决定，不是我删的**。

**用户要求**：把参考项目 `purrfectly-zen-astro` 主页的底部区域搬到本项目，风格可适当调整；并在截图上标注了两点：

1. **底部导航区域「可以设计成横着的」** —— 原稿的 Learn / Community / Legal 三组是竖着堆在一列里，要改成横排；
2. **订阅 / CTA 区域可以删除** —— 原稿右侧的「Join Our Community」+「Join the Clowder」按钮去掉。

#### 参考稿位置（下次不用再找）

| 内容 | 位置 |
|---|---|
| Footer 组件 | `purrfectly-zen-astro/src/components/HomePage.tsx:498-650`（`export const Footer`） |
| 品牌列 | `:504-521`（PawPrint 图标 + 站名 + 一句描述） |
| 三组导航 | `:524-597`（Learn `:531-553` / Community `:555-579` / Legal `:581-596`） |
| 订阅 CTA | `:599-626`（**本次按要求删掉**） |
| 底栏 | `:629-646`（分隔线 + 版权 + `Built with ♥ for cat lovers`） |

原实现是 React + framer-motion（滚动入场动画），这里全部去掉，改成纯 Astro。

#### 落地内容

**只改了 1 个文件**：`src/components/Footer.astro`（被 `Layout.astro` 引用，改一处 20 页全变）。旧文件 633 字节 -> 新文件 3961 字节。

#### 关键决策

1. **品牌列直接复用 `<LogoContainer />`** —— 它本身就是「logo + 站名 + slogan（`siteSlogan`）」，正好对应参考稿的「品牌 + slogan」，而且与页头同源，品牌视觉不会跑偏。
2. **三组导航横排**：外层 `lg:grid-cols-[1.1fr_2fr]`（左品牌 / 右导航），导航内部 `grid-cols-2 sm:grid-cols-3`，三组并排。
   注意：`grid-cols-[1.1fr_2fr]` 是任意值，产物里是 `.lg\\:grid-cols\\[1\\.1fr_2fr\\]`，**搜 CSS 要按转义后的写法找**（我第一次按原样搜，误判成「没生成」）。
3. **订阅区整块删除**（用户要求），没有替代方案。
4. **图标不引依赖**：参考稿用的是 `lucide-react`，本项目没有图标库（AGENTS.md 第 3 节硬规矩）。做法是从 `purrfectly-zen-astro/node_modules/lucide-react/dist/esm/icons/` **只读几何数据**（book-open / users / lock，ISC 许可），以内联 `set:html` 塞进 `<svg>`。**比凭记忆手写图标 path 靠谱** —— 另外注意 lucide 图标不只有 `path`，还有 `circle` / `rect`。
5. **底栏右侧放社交图标**（复用 `SocialMediaIcons`），对应参考稿写 `Built with ♥` 的位置。旧页脚的功能**一个没丢**：社交链接还在，Privacy Policy 从独立链接移进了 Legal 分组。
6. **分组标题改成 Explore / Company / Legal**（原稿是 Learn / Community / Legal）：Explore 组放 Home / Adopt / Blog，Company 组放 About Us / Contact。**所有链接都指向真实存在的路由**，没有 404。
7. **底色换成浅色品牌渐变** `bg-gradient-to-br from-teal-50 via-white to-fuchsia-50` + 顶部细边框，取代旧页脚的大块 teal->fuchsia 实色渐变 —— 对应参考稿的淡色页脚，同时用 teal / fuchsia 保持与本项目的色彩关联。

#### 实测

- `npm run build`：**20 页 / exit 0 / 2.56s**（2026-09-15 复验，连跑两次产物字节数一致）。
- `dist/index.html` **168254 字节**（首页 h1 x1 / h2 x10）。
- 产物核对：`<footer` / `</footer>` 各 **1 次**（确认没被渲染两遍）；`Explore` / `Company` / `Legal` / `Privacy Policy` / `All rights reserved` 各 1 次；**`Join Our Community` 与 `Clowder` 都是 0 次**（订阅区确实删干净了）。
- CSS 核对：`.lg\\:grid-cols\\[1\\.1fr_2fr]\\{grid-template-columns:1.1fr 2fr}`、`.bg-gradient-to-br{--tw-gradient-position:to bottom right in oklab;...}`、`.from-teal-50` / `.via-white` / `.to-fuchsia-50` 都已生成。
- 注意：`aria-label="Facebook"` 在 `dist/index.html` 里出现 **2 次** —— 不是页脚重复渲染，而是**页头也渲染了 `SocialMediaIcons`**，页头 / 页脚各一份。
- 按用户要求**未做浏览器渲染验证**。

#### 遗留

- 页脚导航的分组名（Explore / Company / Legal）与顺序是我定的，属内容层面的占位，用户随时可改。
- 页脚仍显示模板自带的猫爪 logo（`logo-pawstronaut.svg`）—— favicon / logo 是否换成本站品牌视觉，见第 12 节待确认第 6 条。
- **社交图标仍指向模板的通用地址**（`facebook.com` / `x.com` / `instagram.com` / `youtube.com`，来自 `src/components/SocialMediaIcons.astro`），**上线前要换成本站真实账号**。页脚 hrefs 实测 = `/` `/cats` `/blog` `/about-us` `/contact` `/privacy-policy` + 4 个社交链接，**全部指向存在的路由，没有 404**。


## 9. 目标站点（petmd.com）的差距分析

> **范围已调整（2026-09-14，用户明确要求）**：petmd **不是对标目标**，只是内容形态与信息架构的参考。
> 首要目标是「快速搭建一个健康的、轻量级的内容站并上线」，开发与资源成本和 petmd 不是一个量级。
> 因此下面这份清单应视为**「可选增强菜单」而非待办列表** —— 采用前先问「是否必要、是否够轻」。

petmd 的本质是**大规模结构化内容站**，而不是企业宣传页。核心特征：主题分类树（Dogs / Cats / Birds / Reptiles ...）、每篇文章带作者 + 兽医审核人（medical review）、发布日期 + 最后更新日期、目录锚点（TOC）、相关阅读、FAQ 结构化数据、面包屑、分页归档、术语表。

当前 `blog` collection 只有 6 个字段：`title / slug / image / imageAlt / excerpt? / publishDate`。缺：

1. **分类与标签体系** —— collection、schema、路由（`/topics/<slug>`）、导航全都要新建
2. **作者与审核人体系** —— `members` 可勉强改造，但没有作者页路由
3. **文章增强字段** —— `updatedDate`、`author`、`reviewer`、`category`、`tags`、`related`、`toc`、`medicalReviewed`
4. **SEO 基础设施** —— canonical、sitemap、robots、JSON-LD（`Article` / `FAQPage` / `BreadcrumbList` / `MedicalWebPage`）、RSS
5. **分页** —— `paginate()` 用于 blog 归档
6. **面包屑导航**
7. **分析埋点 + Cookie 同意**（petmd 面向美国，但若面向欧盟/英国则需要）

**好消息**：Astro 的 Content Layer 天生适合接 CMS（Contentful / Sanity / Strapi），而且模板的 `Hero` / `Section` / `Container` / `Card*` 抽象干净，可作设计系统底座。**真正要重写的是内容层和 SEO 层，不是视觉层。**

## 10. 已提出的改造路线（用户尚未选择起点）

1. **止血** —— Layout 的 title/description 契约 + canonical + sitemap + robots + og:image + 清模板作者痕迹（纯增量，不动设计）
2. **立骨架** —— 新建 topics/分类体系，强化 blog schema（作者、更新时间、分类、标签），补分页与面包屑
3. **结构化数据** —— JSON-LD、RSS、TOC
4. **性能与表单** —— hero 图、`@playform/inline` 重复投递、View Transitions 的 `<style>` 爆炸、表单后端

## 11. 复现分析所用的命令（便于重新取证）

```powershell
# 构建
npm run build

# 逐页提取 title / description / h1
$f = 'dist/cats/index.html'
$h = Get-Content -Raw $f
[regex]::Match($h,'<title>(.*?)</title>').Groups[1].Value
[regex]::Match($h,'name="description" content="(.*?)"').Groups[1].Value
([regex]::Matches($h,'<h1[^>]*>(.*?)</h1>') | ForEach-Object { $_.Groups[1].Value }) -join ' | '

# 页面体积 / style 块数 / view-transition 规则数
([regex]::Matches($h,'<style>')).Count
([regex]::Matches($h,'view-transition-name:')).Count

# 死类名取证（命中 0 次）
$css = Get-ChildItem dist/_astro/*.css | Select-Object -First 1
$raw = Get-Content -Raw $css.FullName
([regex]::Matches($raw,'brand-red')).Count
([regex]::Matches($raw,'gray-fuchsia')).Count

# --header-height 定义检查（只应有 1 处引用、0 处定义）
([regex]::Matches($raw,'--header-height')).Count

# git（dubious ownership 绕过）
git -c safe.directory=D:/WorkSpace/meepal-site-Templte/pawstronaut status --porcelain
```

## 12. 待确认问题（等用户回答，不要自行假设）

> **唯一事实来源是 `AGENTS.md` 第 7 节**（已整理为编号 1~14）。此处不再重复维护同一份清单，只补细节，避免两处漂移。

**已确认（2026-09-14）**：品牌名 **meepal**；上线域名 **meepal.pet**；测试站托管 **Cloudflare**；范围 = 轻量级、快速上线、不对标 petmd；分类名**暂用占位**（不阻塞）。

**细节补充**（编号对应 `AGENTS.md` 第 7 节）：

- **第 4 条「占位文案由谁写」**：现有占位文案的完整清单见 8.3 第 4 条，以及 8.7 的「用户待办清单」表。
- **第 5 条「联系方式」**：实测取值 —— `src/data/config.ts:17-20` phone = `(123) 456-789` / `tel:+123456789`；`:27-33` address = `1234 Space Street` / `Galaxy City` / `12345` / `Milky Way` / `Space`。**Contact 页与页脚会显示，上线前必须替换。**
- **第 6 条「favicon / logo」**：当前仍是模板猫爪图标，未替换为 meepal 的品牌视觉。
- **第 13 条「场景叠卡点击语义」**：我实现的是「点哪张哪张翻到最前」。用户参考稿 `D:\WorkSpace\meepal-site\meepal-home-v3.html` 的 `.scene-grid` 原本是**三列平铺网格**（CSS 在 243~275 行，标记在 854~882 行），**没有现成交互可对照** —— 所以「点击切换顺序」的具体行为是我按字面要求设计的，需用户确认。若要改成轮换 / 自动播放，只动 `SceneStack.astro` 的 `bring()`。
- **第 14 条「插画能否商用」**：4 advantages 的 3 张插画复制自 `D:\WorkSpace\meepal-site-Templte\purrfectly-zen-astro`（`package.json` 声明 MIT、作者 Fauzira Alpiandi）。**推断** MIT 覆盖的是代码，模板内附插画的授权范围需用户上线前自行确认。
