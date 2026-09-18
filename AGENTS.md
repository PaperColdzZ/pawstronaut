# AGENTS.md — 项目记忆与协作约定（Codex 每个会话自动加载）

> 这是本项目**跨会话的持久记忆**，也是我和用户之间的协作契约。
> 任何会话开始时：**先完整读本文件，再读 `docs/PROJECT-CONTEXT.md`，然后才开始工作。**
> 记忆维护是**强制性义务**（第 0 节），不是建议 —— 用户已明确要求关键沟通与工作内容必须及时落盘。

最后更新：2026-09-15

---

## 0. 记忆维护协议（强制，最高优先级）

### 0.1 何时必须更新记忆

满足**任意一条**就要更新，不要等用户提醒：

1. 用户提出**新需求**、改变范围、或做出任何**决定**（品牌名、域名、部署平台、语言、技术选型、设计方向……）
2. 第 7 节「待确认」里的某一项**被回答了** -> 立刻移到第 6 节「已确认决策」
3. 发生**任何代码或配置改动**（哪怕只改一个文件）-> 记录改了什么、为什么、验证结果
4. **修复**了 `docs/PROJECT-CONTEXT.md` 第 8 节里的某个已知问题 -> 该项标记为已修复并注明文件/提交
5. **发现新问题**或新踩坑机制
6. **基线数字变化**（页面数、产物体积、构建耗时）；出现**阻塞/风险**及应对方案
7. 用户表达了对**协作方式**的偏好（语言、风格、流程、节奏）；**路线或计划调整**，或某步骤的完成状态变化

**例外（2026-09-15 用户明确）**：**小优化不必急着落盘** —— 纯样式微调（数值 / 间距 / 颜色）可以攒到下一次有实质改动时一起写；新功能、新决策、新问题、基线变化仍必须当轮写入。

### 0.2 更新到哪里（动作清单）

| 位置 | 动作 |
|---|---|
| 本文件 第 6 节「已确认决策」 | 追加一行：决策内容 + 日期 + 原因/影响 |
| 本文件 第 7 节「待确认」 | 已答的删除；新出现的补上 |
| 本文件 第 5 节「当前状态」 | 改写为最新事实，保持精简（<= 15 行） |
| 本文件 第 9 节「变更日志」 | **每次更新都要追加一行** |
| `docs/PROJECT-CONTEXT.md` 对应章节 | 同步细节；第 8 节问题清单必须标注状态（未修/已修） |
| `docs/PROJECT-CONTEXT.md` 第 7 节 | 基线数字（体积/页面数/耗时）变化时更新 |

### 0.3 更新时机（关键）

- **必须在同一轮对话结束前完成，不能留到「下次」**：上下文随时可能被压缩，一轮结束后细节就可能丢失。用户刚说了要做某事或改了主意 -> **先落盘，再继续干活**。
- 大批量改动可以分批，但**每批做完立刻同步**，不要攒到最后；宁可先写一句简短条目，也不要什么都不写。

### 0.4 每轮结束前的自检（必须回答这 4 个问题）

1. 这一轮有没有产生「新决定 / 新需求 / 新发现的问题」？-> 有的话是否已写入？
2. 第 5 节「当前状态」和第 7 节「待确认」是否仍然准确？
3. 第 9 节「变更日志」有没有漏记？
4. 我有没有写下**未经验证**的结论？-> 有的话删掉，或显式标注为推断并移进「待确认」。

### 0.5 写作规范

- 只写**验证过的**结论，附证据（`文件:行号` / 命令 / 产物路径）。
- 推断必须显式写「推断」或放进「待确认」，不要伪装成事实。
- 本文件保持**精简可扫读**（**目标 < 24 KB**；2026-09-15 为 23.9 KB）。超出时按此优先级瘦身：先删第 5 节的历史叙述，再删第 9 节最旧的日志行，再压第 6/7 节措辞 —— **都先搬进 `docs/PROJECT-CONTEXT.md`，不要直接丢。**
- **写补丁时注意（已犯过的错误，别再犯）**：
  1. 要删除的旧行必须带 `-` 前缀；写成上下文行（` ` 前缀）会让新旧内容并存。**改行 = 删一行 + 加一行。**
  2. **补丁里的行必须与文件逐字节一致**（含行尾与前导空格）；表格行最容易多写或少写 `|`；**改行 = 删一行 + 加一行**。
  4. 别整块替换 40 行大段（拆成 3~4 个小补丁）；补丁后**必须回读验证**，`{}` 只代表语法通过；多个 `@@` 必须按文件先后顺序排列。
- **第 5 节只放「现在是什么状态」**，历史过程一律移入 `docs/PROJECT-CONTEXT.md` 的对应小节，不要在本文件里堆积叙述。
- 第 9 节变更日志只保留最近约 15 条，更早的整批移入 `docs/PROJECT-CONTEXT.md`。
- 日期一律用绝对日期（YYYY-MM-DD），不要写「今天/昨天/上周」。

---

## 1. 我的身份（Codex 的角色）

- 面向本项目的**全能开发兼上线运营负责人**：精通 Astro、Tailwind v4、静态站 SEO、内容站信息架构、性能优化、部署运维。
- 工作方式：先读代码拿证据再下结论；改动后用 `npm run build` 实测验证；结论要能指到具体文件行号。
- 沟通语言：**中文**。用户是 C++ 背景开发者，Web 概念（hydration、View Transitions、SSG、CLS 等）需要简短解释，但技术深度不用降。

## 2. 用户与目标

- 用户：**C++ 开发者**，Web 前端/SEO/运维不是主战场，但技术理解力强。
- 目标：基于 **Astro 免费模板 Pawstronaut** 改造并**上线一个营销内容站**。
- **品牌名：meepal（已确认）｜上线域名：meepal.pet（已确认）｜测试站托管在 Cloudflare**
- 参考站点 **https://www.petmd.com/** 只作**内容形态与信息架构的参考**，**不是对标目标**。
- **首要目标：快速搭建健康的轻量内容站并上线**；成本和 petmd 不是一个量级，任何方案先问「是否必要、是否够轻」。
- 仓库路径：`D:\WorkSpace\meepal-site-Templte\pawstronaut`

## 3. 项目关键事实（速查）

| 项 | 值 |
|---|---|
| 模板 | Pawstronaut（Astro 免费模板，MIT，Copyright WP Infusion） |
| Astro | v6，`output: "static"`（纯 SSG，无服务端） |
| 样式 | Tailwind CSS **v4**（走 `@tailwindcss/vite` 插件，**不是** `@astrojs/tailwind`） |
| 交互 | Alpine.js 3（`@astrojs/alpinejs`）+ View Transitions（`<ClientRouter />`） |
| 额外集成 | `@astrojs/mdx`、`@playform/inline`（把 CSS 内联进每个 HTML） |
| 路径别名 | `~/*` -> `src/*` |
| 页面数 | 构建产出 **20** 个 HTML（止血阶段为 19，立骨架 +1 个 `/topics/adoption/`） |
| 内容集合 | `cats` / `members`（`file()` loader 读 JSON）、`blog`（`glob()` 扫 `src/content/blog/**/[^_]*.md`） |

**核心机制（最容易踩坑的地方）：**

- `blog` 的 **URL 来自 frontmatter 的 `slug`**，不是文件名。例：`src/content/blog/new-cat.md` 的 URL 是 `/blog/new-arrival-luna/`。
- `cats` / `members` 的 **URL 来自 JSON 里的 `id` 字段**。
- 首页用**硬编码 id 数组**拉内容（`index.astro:252` 的 `<ShowCats>`、`:293` 的 `<ShowBlogs>`）—— 重命名内容会导致首页卡片**静默消失且构建不报错**。
- 所有客户端脚本必须监听 **`astro:page-load`**（不是 `DOMContentLoaded`），因为 ClientRouter 让页面不重载。
- **`Layout.astro` 的 props 契约（2026-09-14 重写，勿按旧模板用法写）**：
  `title`（必填，不含站点后缀）、`description`（必填）、`image?`（默认 `/images/og-image.jpg`）、`type?`（`website|article`）、`noindex?`、`exactTitle?`。
  旧的 `pageTitle` prop **已删除**。标题默认拼成 ``{title} | Meepal``，首页用 `exactTitle` 直接用 `siteTitle`。
  canonical 与 og:image 由 `Astro.site`（即 `astro.config.mjs` 的 `site`）推导，**改域名只需改那一处**。

- **分类体系（2026-09-14 立骨架新增）**：唯一真相源是 `src/data/topics.json`；`content.config.ts` 直接 import 它生成 `z.enum` 校验，**写错分类名会构建失败**，不会静默产生第二个分类。
- **归档页一律走 `src/components/BlogArchive.astro`**（Heading + TopicNav + grid + Pagination 的共享外壳）。新增归档页不要另写一套。
- **分页 URL 是 `/blog/page/N/` 与 `/topics/<id>/page/N/`**，用 `blog/page/[page].astro` 手动实现。**不能用 Astro 内置 `[...page]`** —— 会与 `blog/[...slug].astro` 的路由模式冲突。
- **只发布有内容的分类页**（`getPublishedTopics()`）。空分类页不生成：否则会出现「noindex 但仍列在 sitemap 里」的自相矛盾。
- **分类筛选是服务端链接，不是客户端 JS**（点分类 = 跳 `/topics/<id>/`），这样爬虫能抓到。**刻意没照抄 `/cats` 页的客户端筛选。**
- **分页在内容不足时不触发**：要验证分页得把 `src/utils/blog.ts` 的 `POSTS_PER_PAGE` 临时调小（如 2）再构建，验完改回。**当前 12。**
- **首页 hero / Trust badges / 4 advantages / 场景叠卡这四处全在 `src/pages/index.astro` 主模板里**（hero 是内联的，不是组件）。**行号会随文件增长漂移，找代码按关键字搜，别依赖旧行号。**
- **Trust badges（信任徽章）**：`index.astro` 的 `badges` 数组（label / color / SVG path）+ `{badges.map(...)}`。Heroicons v2 outline 内联 SVG，**项目无图标库依赖，不要为此新增**。增删徽章只改数组。
- **首页「4 advantages」区块**（2026-09-15 新增）：`index.astro` 的 `benefits` 数组 + 组件 `CardBenefit.astro`（上插画 / 下文字）。插画 `src/assets/images/{meditating_cat,playful_cat,cat_with_food}_illustration.png`，来自参考项目 `purrfectly-zen-astro`（MIT）。
- **图片一律放 `src/assets/` 并用 `astro:assets` 的 `<Image>` 渲染，不要丢进 `public/`**（实测插画源 PNG 570~680 KB -> webp 约 3 KB/张）。
- **`prose` 里的 h2 会被 typography 插件加 120px `margin-top`**（只有 h2 是 `.prose` 第一个子元素时才自动清零）。所以「眉标 + h2」结构必须给 h2 显式加 `mt-0`，否则会出现一大段空隙。
- **首页「场景叠放卡片」区块（2026-09-15 新增）**：`index.astro` 的 `scenes` 数组（`image`/`number`/`title`/`text`）+ 组件 `SceneStack.astro`。三张卡**同占一个 grid 单元格**（`col-start-1 row-start-1`）靠 `transform` 叠放，偏移走 CSS 变量 `--deck-x` / `--deck-y` / `--deck-scale-step`。交互用 Alpine（`x-data` 值来自 frontmatter 的 `deckState` 常量），**点哪张哪张翻到最前**。图片 `src/assets/images/scene-card1~3.jpeg`。**尺寸看 `.scene-deck` 的 `max-width`；错开量的公式与坑见 8.11。**
- **首页「起步指南」区块（2026-09-15 新增）**：`index.astro` 的 `guides` 数组 + 组件 `GuideCards.astro`。两张纯色卡，底色是参考稿的 `--yellow(#f8d264)` / `--mint(#b7dbca)`（**全站调色板之外的新色相**）。配图用 `aspect-[3/2]` + `object-cover` 居中裁切（两张源图尺寸不同）。**Tailwind 只认字面量类名** —— `bg-[#f8d264]` 必须写成完整字符串，拼字符串不会生成 CSS。详见 8.12。
- **首页「Dog health」区块（2026-09-15 新增）**：组件 `HealthCard.astro`（单卡：浅绿底 `#d8ecad` + 居中配图 + 标题），配图 `src/assets/images/dog-health-card.avif`。**hover 放大必须用外层 `overflow-hidden` 包一层**，详见 8.13。
- **全站页脚 2026-09-15 已换成参考项目的版式**：品牌列（复用 `LogoContainer`）+ 三组横排导航（Explore / Company / Legal）+ 底栏版权与社交图标；参考稿的订阅 CTA 已按用户要求删除。图标是**只读 lucide dist 的几何数据**内联的，**没加图标库依赖**。详见 8.14。
- **`@playform/inline` 级联风险**（09-15 发现，未修）：内联的关键 CSS 若排在样式表 `<link>` **之后**，其 `.grid-cols-1` 会压过样式表里的 `sm:`/`lg:`（同权重、后到者胜）→ **全站响应式静默失效**。本地 `dist/` 顺序是对的，线上/Mac 侧疑此。详见 8.15。
- **blog 文章页 2026-09-18 已换成新版**：`/blog/<slug>/` 由 `src/pages/blog/[...slug].astro`（新版）生成；旧的同名文件**整文件搬到 `src/pages/_legacy/blog/[...slug].astro`**（Astro 不路由 `_` 开头的目录，纯留档、内容逐字未改）。新版 = `PostHero` + `TableOfContents` + `FeaturedArticles` 三个新组件，分享按钮是 `ShareIcons`。
- **文章页标题排版走 `.post-headings` 类**（`global.css` 末尾）：把 h1~h6 从 Caveat Brush 手写体改成无衬线粗体 + 深藏青 `#192c58`，并给带 `id` 的标题加 `scroll-margin-top`。**这个类只挂在 hero 和正文容器上**，首页 / 归档页 / 卡片仍是手写体；要全站推行就把类挂到 `body` 或改 `global.css:128` 那条 h1~h6 规则。
- **blog schema 新增可选字段 `takeaway`**（`src/content.config.ts`）：文章页「Key Takeaway」那段引导语；不填退回 `excerpt`，老文章照常构建。
- **首页已有两段被 HTML 注释包住**：`Adopt a pet today!`（我按用户要求隐藏）、`Contact us today to adopt a cat`（**用户自己注释的，不是我删的**）。**代码逐字保留**，恢复只需删掉注释标记。实测 Astro **不渲染注释里的内容**；但**注释文本会原样进 HTML**，别往里塞大段内容。
- **`Faq.astro` 曾被写出嵌套 `<dl>` 且只闭合一次**（2026-09-15 已修）。教训：**验证「失效类名」不能只看产物 CSS** —— 旧类名本就产不出 CSS，恰好掩盖了标记错误，必须回读标记本身。

## 4. 协作硬性约定

1. **及时更新记忆**（第 0 节），这是每次交互的收尾动作，不是可选项。
2. **不要碰用户的改动**：要改 `index.astro` / `meepal-hero.png` 这类「用户的东西」先说明一声（那批改动已于 commit `4f51880` 入库）。
3. 改代码用 `apply_patch`；不要用 `cat` 或 shell 写文件。**补丁规则见第 0.5 节。**
4. 每次实质性改动后跑 `npm run build` 验证，并把验证结果写进对话。**不要声称没验证过的结果。**（用户 2026-09-15 免掉了「渲染 / 截图」这类重验证，但这条最低成本的构建检查保留 —— 见本条第 10 项。）
5. Git 有 **dubious ownership** 问题，直接跑 `git` 会失败，要加 `-c safe.directory=D:/WorkSpace/meepal-site-Templte/pawstronaut`（永久解决需先征得用户同意）。
6. remote 指向 `PaperColdzZ/pawstronaut.git` —— **已确认这是用户自有仓库、目前只有用户维护**，可以正常推送。仍建议在正式上线前确认它的定位（个人仓库 vs 生产仓库）。
7. `dist/` 是构建产物（已 gitignore），可以随时重建。
8. **代码里要写中文注释**（用户 2026-09-15 明确要求，长期规则）：日常的修改 / 新增代码，都要在关键处加中文注释说明「这段在干什么、为什么这么写」。前端模板里的 JS 逻辑、条件分支、样式 hack、数据结构尤其要有。**注意 Astro 的 `<!-- -->` 注释会原样进产物**，注释写精炼一点，别让 HTML 无谓变大。
9. 用户没有明确要求时**不要初始化 sub-agent / 并行 agent**。
10. **用户 2026-09-15 说明：不需要我验证结果**（「我会确认你的工作结果，如需要更改会告诉你」）。即不必再跑浏览器渲染 / 截图。**我的处理（待用户纠正）：保留第 4 条的 `npm run build`** —— 几秒就能挡住白屏级错误，也是第 5 节与 `docs/PROJECT-CONTEXT.md` 第 7 节基线数字的唯一来源。**仍不允许声称未验证过的结论。**

## 5. 当前状态

> 这里**只写「现在是什么状态」**；历史过程一律放 `docs/PROJECT-CONTEXT.md` 第 8 节。

**已完成**（证据与细节见 `docs/PROJECT-CONTEXT.md` 第 8.1~8.14、8.17 节）

- **第 1、2 步（止血 / 立骨架）✅**（09-14），20 页全绿。
- **首页五处区块 ✅ + 全站页脚改版 ✅**：hero 改版 + Trust badges（09-14）；「4 advantages」「场景叠放卡片」（含隐藏 `Adopt a pet today!`，代码原样保留）「起步指南」「Dog health」+ 页脚换参考稿版式（09-15）。顺手修掉 `Faq.astro` 的嵌套 `<dl>`。
 - **blog 文章页改版 ✅ + 首篇真实长文入库 ✅**（09-18）：新版三段式页面接管 `/blog/<slug>/`；长文 `first-time-cat-owner-guide.md`（含 6 张配图 + FAQ 结构化数据）已转入，构建产物增至 **21 页**（详见 8.17~8.18）。

**开发状态**：用户已解除「暂停」指示，改为按功能需求逐项推进；第 3 步（结构化数据）与第 4 步（性能与表单）仍未开始。

**最近一次实测**（2026-09-18，长文入库后）：exit 0、**21 页 2.80s**、sitemap 20 条；长文 HTML 195422 字节、`dist/` 89 文件 10.4 MB。Node 要求 `^20.19.1 || >=22.12.0`（无 `.nvmrc`）。

**当前状态**

- 用户指示：**代码由用户自行审阅提交，我不代 commit / push**；**我不再验证渲染结果**；**小优化不必急着更新记忆**（第 4 节第 10 条 / 第 0.1 节）。
- 工作区**有未提交改动**（等用户审阅）：`AGENTS.md` + `docs/PROJECT-CONTEXT.md`（记忆）、`src/content.config.ts`、`src/styles/global.css`、`src/pages/blog/[...slug].astro`、**`src/pages/index.astro`（用户自己改的，不是我动的）**，另有 4 个新组件与 `src/pages/_legacy/`。`HEAD = origin/main = 2dd5855`。
- **部署进展**：Worker / Workers Builds 流程已放弃（wrangler 自动装适配器失败，见 7.4），**已改用 Pages 部署成功**。**当前唯一待办 = 把自定义域从旧测试项目迁到新 Pages 项目**（步骤见 `docs/PROJECT-CONTEXT.md` 7.4）。
- 仍待拍板：见第 7 节（我 09-14 交付的待办清单见 `PROJECT-CONTEXT.md` 8.7）。



## 6. 已确认决策

用户明确拍板的事项。**没写在这里的都不算已决定**，不要当作前提去推进。

| 日期 | 决策 | 影响 |
|---|---|---|
| 2026-09-14 | 建立持久记忆机制：`AGENTS.md` + `docs/PROJECT-CONTEXT.md` 两层 | 关键沟通/工作内容必须及时落盘（第 0 节强制协议） |
| 2026-09-14 | **品牌名 meepal / 域名 meepal.pet / Cloudflare 托管 / 目标 = petmd 风格的结构化内容营销站但不对标 / 范围下调为「健康、轻量、快速上线」** | 这几条基础事实同时写在第 2 节，此处不重复展开；细节见 `docs/PROJECT-CONTEXT.md` |
| 2026-09-14 | **只增不删**：不删任何现有页面或功能（「砍掉」= 不新建），先留字段后建页面 | 标签/作者页暂不建但 schema 留位；petmd 仅作内容形态参考 |
| 2026-09-14 | **改造保守**（沿用模板写法与组件）+ **大改动先讲清计划再执行** | 文件级清单先给用户过目；一次一步；每步可构建、可回退 |
| 2026-09-14 | **`PaperColdzZ/pawstronaut` 是用户自有仓库，目前只有其在维护** | 「推送到他人仓库」的顾虑解除；上线前仍宜确认 remote 定位 |
| 2026-09-14 | **代码由用户自行审阅并提交，我不代为 commit** | 除非用户明确要求，否则不执行 `git commit` / `git push` |
| 2026-09-14 | **第 1、2 步（止血 / 立骨架 2a->2b->2c）均获授权并已完成** | 基线 commit `4f51880` 已推送，后续可 `git diff` / `git revert`。详见 8.1~8.5 |
| 2026-09-14 | **标签与作者只留 schema 字段、不建页面**；**分类名先占位**（我起草的 6 个） | 字段已存在但无页面；**无真人作者则不可启用署名**。改分类名只动 `src/data/topics.json` + 各文章 `category` |
| 2026-09-15 | **代码里要加中文注释**（长期规则） | 见第 4 节第 8 条；后续所有代码改动都要带中文注释 |
| 2026-09-15 | **隐藏首页「Adopt a pet today!」区块，且用注释而非删除** | 用户明确要求保留代码。恢复 = 删掉那对 `<!-- -->`；实测注释内容不渲染 |
| 2026-09-15 | **首页新增「场景叠放卡片」区块**：交互沿用已有的 Alpine.js、**不新增依赖**；点击语义 = 点哪张哪张翻到最前 | 新增 `SceneStack.astro`；数据在 `index.astro` 的 `scenes` 数组；图片 `scene-card1~3.jpeg` |
| 2026-09-15 | **用户说明不需要我验证结果**（自己看，要改会告诉我） | 见第 4 节第 10 条；我保留最低成本的 `npm run build` 检查 |
| 2026-09-18 | **文章页底部「Featured Articles」放 3 篇文章卡**（不是参考稿画的猫卡） | 复用 `CardBlogPost`；用户原话「你的想法是对的」 |
| 2026-09-18 | **文章页标题不再用手写体**，按参考稿改成无衬线粗体 | 通过 `.post-headings` 只作用于文章页；要不要全站铺开见第 7 节 |
| 2026-09-18 | **旧版文章页不需要还能打开**，静默留档即可 | 整文件搬进 `src/pages/_legacy/`，不建对比路由、不进 sitemap |

## 7. 待确认（不要自行假设）

1. **第 3 步（结构化数据）与第 4 步（性能与表单）何时启动** —— 暂停已解除，但目前是逐条需求驱动，这两步没有排期。
2. **分类名定稿** —— 暂用我起草的 6 个占位（已确认不阻塞）；改名只需动 `src/data/topics.json` + 各文章 `category` 字段。
3. **品牌显示大小写**：meepal / Meepal / MEEPAL？（当前暂用 Meepal，`src/data/config.ts` 一处常量）
4. **占位文案等用户给正式版**（用户亲自写，还是我先出草稿供改？完整清单见 `docs/PROJECT-CONTEXT.md` 第 8.7 节）：
   - **首页 hero**：`h1` 仍是 `Welcome to our pet shelter!` + 领养口吻正文，用户 mockup 写的是 `Warm, practical guidance… without second-guessing every little thing.` —— **我没擅自替换**。
   - **Trust badges**：照搬参考图，其中 `5 Rated` 不够地道（常见 `5-Star Rated`），**已提出待定**。
   - **首页几个卡片类区块**（4 advantages / 场景叠卡 / 起步指南 / dog health）的眉标、标题、正文、卡片文字**全部沿用参考稿或参考项目原文**；`alt` 多为占位，上线前要补成真正的图片描述。
   - 其余：`siteSlogan` / `siteTitle` / `siteDescription` / 9 页 meta / 首页 FAQ 与 blog 引言。
5. **联系方式**：`config.ts:28-29` 的 street / city 与 phone 仍是模板占位（email 已改为 `info@meepal.pet`）；Contact 页与页脚会显示。
6. **是否更换 favicon / logo / 页脚分组名**（logo 仍是模板猫爪；分组名 Explore / Company / Legal 是我定的占位）；**是否压缩 hero 图**（源 2.4 MB -> 3.67 MB PNG 回退）。
7. **表单后端选型**：Cloudflare Pages Functions / Formspree / Web3Forms？`output` 现为 `static`，接函数需评估是否改 `server`。
8. **Cloudflare 部署细节**：**已定 = Pages**（部署成功）。剩余：自定义域从旧测试项目迁到新项目（步骤见 7.4）、旧测试项目何时删、是否要 `www` 301 到 apex。
9. **是否把未发布的空分类也做成页面**（当前不生成）。若要，需同时解决 sitemap 排除问题。
10. **内容来源 / 多语言**：Markdown + JSON 还是接 CMS？要不要多语言？（按轻量原则，**推断**都先不上 —— Markdown + 只做英文）
11. **场景叠卡的点击语义**：我实现的是「点哪张哪张翻到最前」；参考稿 `meepal-home-v3.html` 的 `scene-grid` 原本是三列平铺、没有现成交互可对照。若想要轮换 / 自动播放 / 只让最上面那张可点，说一声就改（改 `SceneStack.astro` 的 `bring()`）。
12. **复制过来的插画能否商用**：素材来自 `purrfectly-zen-astro`（MIT，作者 Fauzira Alpiandi）。**推断** MIT 覆盖代码，模板内附插画的授权需用户上线前自行确认。
13. **「指南」类链接全是占位**：起步指南的 `Open guide`（cat → `/topics/adoption/`，dog → `/blog/`）与 dog health 的 `Read the dental guide`（→ `/blog/`）。原因：`/topics/behavior/`、`/topics/grooming/` **目前没有文章、不会生成页面**，指过去会 404。等有真正的指南页要换掉。
14. **文章页的「无衬线标题」要不要全站铺开**？09-18 只改到文章页（`.post-headings`）；首页 / 归档页 / 卡片仍是 Caveat Brush 手写体。
15. **文章页两处占位待处理**：`PostHero` 里的 `FOLLOW ON GOOGLE`（`href="#"` + 字母 G 圆牌，本站还没有 Google 发布者主页）与 `ShareIcons` 的分享入口（只做了 Facebook / X / 邮件三个真链接，参考稿画了 8 个）。上线前要么补真实链接、要么删掉。
16. **文章页 Featured 位**：站内现有 4 篇文章；打开其他旧文时，Featured 位已自动填满 3 张推荐卡（新长文被推荐）；打开新长文时展示其余 3 篇旧文。
17. **文章页左栏目录在小屏（< lg）整块隐藏**（`hidden lg:block`），避免长目录把正文顶下去。参考稿只有桌面稿，移动端要不要做可折叠目录待定。

## 8. 给未来会话的建议阅读顺序

1. 本文件（尤其第 0 节和第 5 节）
2. `docs/PROJECT-CONTEXT.md`（完整架构分析 + 已验证问题清单 + 证据）
3. 只在需要时按需读源码：`src/layouts/Layout.astro` -> `src/content.config.ts` -> `src/data/config.ts` -> `src/pages/index.astro`
4. 要重新取证时：直接读 `dist/` 里的产物，不要凭记忆下判断

## 9. 变更日志

| 日期 | 事件 |
|---|---|
| 2026-09-14~15 | 早期逐条日志**已归档到 `docs/PROJECT-CONTEXT.md` 8.1~8.10**。 |
| 2026-09-15 | 场景叠卡视觉调优（`--deck-x` 3rem / 卡片加 `max-width`）、新增「起步指南」区 + `GuideCards.astro`、新增「Dog health」区 + `HealthCard.astro`、全站页脚换参考稿版式（订阅 CTA 整块删除）—— 这 4 项**已归档到 `docs/PROJECT-CONTEXT.md` 8.11~8.14**，各次实测均 20 页 exit 0（2.56~2.74s）。 |
| 2026-09-15 | **部署阶段**：用户提交推送 `2dd5855` 后转干净；Worker / Workers Builds 路径因 wrangler 自动装适配器失败而放弃（根因是 `output: "static"` 不需要适配器），**改用 Cloudflare Pages 部署成功**（`npm run build` + output `dist`）。**待办 = 自定义域从旧测试项目迁到新 Pages 项目**。细节见 `docs/PROJECT-CONTEXT.md` 7.4。 |
| 2026-09-15 | **排查「Mac 端排版异常」**（**未改任何代码**，只取证）：截图实测证明该页面里基础规则压过了响应式规则；本地 `dist/` 的顺序正确 ⇒ 差异在另一次构建（线上/Mac 侧）。详见 8.15。 |
| 2026-09-18 | **用户提出 blog 文章页改版**（新模板 + 旧版隐藏不删，参考 `D:\WorkSpace\Group 2.svg/png`）：本轮只做取证（配色/色带/结构像素实测）与方案 + 5 个待确认问题，**未改任何代码**。详见 8.16。另：本轮瘦身约 0.7 KB（合并 3 条已过时的 §6 决策行、压缩 §0.5/§5 措辞），仍约 24.4 KB、略超目标，下轮继续搬 §5/§6 历史到 `PROJECT-CONTEXT.md`。 |
| 2026-09-18 | **blog 文章页改版已实现并构建通过**：新增 `PostHero` / `TableOfContents` / `ShareIcons` / `FeaturedArticles` 四个组件，新页接管 `/blog/<slug>/`，旧页整文件搬进 `src/pages/_legacy/blog/[...slug].astro`（内容逐字未改）；`global.css` 加 `.post-headings`（无衬线粗体 + 深藏青 + 锚点余量）与 `.toc-link` 系列；`content.config.ts` 加可选 `takeaway`。实测 `npm run build` exit 0 / **20 页 2.58s** / sitemap 19 条 / 产物里没有 `_legacy` 路由。详见 8.17。 |
| 2026-09-18 | **添加长文 `first-time-cat-owner-guide`**：从 `D:\WorkSpace\src\kitten-care` 导入；配图 6 张（含 2 张微信临时命名图）对齐并复制到 `src/assets/images/blog/first-time-cat-owner/`；清洗内联 HTML 图片为 markdown 语法，代码块内 JSON-LD 释放为真正 `<script type="application/ld+json">`；实测构建 21 页 exit 0 / sitemap 20 条。详见 8.18。 |
| 2026-09-18 | **长目录滑动条与封面图薄荷绿层视觉优化**：`TableOfContents.astro` 增内部 `.toc-scroll`（4px 极简条，标题与底部分享固定不滚动，阅读位置自动居中）；`PostHero.astro` 薄荷绿底卡加横向/底部错位与 `-3°` 旋转，配图增加白底边框（对齐 Figma Frame 67/66）；实测构建 21 页 exit 0（3.56s）。详见 8.19。 |
