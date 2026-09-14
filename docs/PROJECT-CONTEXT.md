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
  components/                   29 个（详见第 6 节，含 4 个死组件）
  data/
    config.ts                   站点级常量（品牌/联系/社交/营业时间）
    menus.js                    menuMain 导航数组
    cats.json                   9 条猫数据
    members.json                6 条成员数据
    names.json                  随机起名用的前后缀词表
  content/blog/                 3 篇 .md：hello-world / new-cat / new-site-launched
  content.config.ts             3 个 Collection 的 schema
  styles/global.css             Tailwind v4 的 @theme / @utility / 全局样式
  assets/images/                图片（含用户新增的 meepal-hero.png 2.4MB）
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

在用（26 个）：Article, Address, Button, CallToAction, CardBlogPost, CardCat, CardMember, CatNameGenerator, Container, Faq, Footer, Header, Heading, HeadingBlog, Hero, Map, Members, Section, ShowBlogs, ShowCats, SocialMediaIcons, TableHours, LogoContainer, forms/FormContact, forms/FormAdoption

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
19 page(s) built in 2.86s          OK
generating optimized images: 15 个 OK
Successfully inlined a total of 19 HTML files
```

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
| 5.1 | 三个失效类名 | `text-brand-red`→`text-brand-fuchsia`；`divide-gray-fuchsia-200`→`divide-gray-200`。产物 CSS 残留实测为 0 |

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

**已确认（2026-09-14）**：品牌名 **meepal**；上线域名 **meepal.pet**；测试站托管 **Cloudflare**；范围 = 轻量级、快速上线、不对标 petmd。

**仍待确认**：

1. **品牌大小写**：meepal / Meepal / MEEPAL？当前暂用 `Meepal`（`config.ts` 一处常量）
2. **「雏形改好前不碰线上」的边界** —— 当前理解为「不部署、不改线上内容，只在本地改代码」。原句疑似笔误，需确认
3. **Cloudflare 部署细节**：项目名、生产分支、Pages 还是 Workers？（接表单后端时才需要）
4. **品牌文案审阅**：见 8.3 第 4 条的「占位文案清单」，含我临时撰写的 slogan、首页 title/description、9 页 meta 文案
5. **内容来源**：继续 Markdown + JSON 还是接 CMS？（按轻量原则，**推断**建议先用 Markdown）
6. **是否多语言**？（按轻量原则，**推断**建议先只做英文）
7. **联系方式的真实性**：`config.ts` 里仍是模板占位（`"1234 Space Street" / "Galaxy City" / "(123) 456-789"`），Contact 页与页脚会显示，上线前必须替换
