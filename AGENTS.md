# AGENTS.md — 项目记忆与协作约定（Codex 每个会话自动加载）

> 这是本项目**跨会话的持久记忆**，也是我和用户之间的协作契约。
> 任何会话开始时：**先完整读本文件，再读 `docs/PROJECT-CONTEXT.md`，然后才开始工作。**
> 记忆维护是**强制性义务**（第 0 节），不是建议 —— 用户已明确要求关键沟通与工作内容必须及时落盘。

最后更新：2026-09-14

---

## 0. 记忆维护协议（强制，最高优先级）

### 0.1 何时必须更新记忆

满足**任意一条**就要更新，不要等用户提醒：

1. 用户提出**新需求**、改变范围、或做出任何**决定**（品牌名、域名、部署平台、语言、技术选型、设计方向……）
2. 第 7 节「待确认」里的某一项**被回答了** -> 立刻移到第 6 节「已确认决策」
3. 发生**任何代码或配置改动**（哪怕只改一个文件）-> 记录改了什么、为什么、验证结果
4. **修复**了 `docs/PROJECT-CONTEXT.md` 第 8 节里的某个已知问题 -> 该项标记为已修复并注明文件/提交
5. **发现新问题**或新踩坑机制
6. **基线数字变化**（页面数、产物体积、构建耗时）
7. 出现**阻塞/风险**及其应对方案
8. 用户表达了对**协作方式**的偏好（语言、风格、流程、节奏）
9. **路线或计划调整**，以及某个步骤的完成状态变化

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

- **必须在同一轮对话结束之前完成，不能留到「下次」。** 上下文随时可能被压缩，一轮结束后细节就可能丢失。
- 用户刚说了要做某事或改了主意 -> **先落盘，再继续干活**。
- 大批量改动可以分批更新，但**每一批做完立刻同步**，不要攒到最后。
- 如果一轮里发生了很多事，宁可先写一个简短的条目，也不要什么都不写。

### 0.4 每轮结束前的自检（必须回答这 4 个问题）

1. 这一轮有没有产生「新决定 / 新需求 / 新发现的问题」？-> 有的话是否已写入？
2. 第 5 节「当前状态」和第 7 节「待确认」是否仍然准确？
3. 第 9 节「变更日志」有没有漏记？
4. 我有没有写下**未经验证**的结论？-> 有的话删掉，或显式标注为推断并移进「待确认」。

### 0.5 写作规范

- 只写**验证过的**结论，附证据（`文件:行号` / 命令 / 产物路径）。
- 推断必须显式写「推断」或放进「待确认」，不要伪装成事实。
- 本文件保持**精简可扫读**（目标 < 12 KB），细节放 `docs/PROJECT-CONTEXT.md`。
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
- 参考站点：**https://www.petmd.com/** —— 只作为**内容形态与信息架构的参考**，**不是要对标的目标**。
- **首要目标是「快速搭建一个健康的、轻量级的内容站并上线」**，不追求功能对标；开发与资源成本和 petmd 不是一个量级。任何方案先问「是否必要、是否够轻」。
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
| 页面数 | 构建产出 19 个 HTML |
| 内容集合 | `cats` / `members`（`file()` loader 读 JSON）、`blog`（`glob()` 扫 `src/content/blog/**/[^_]*.md`） |

**核心机制（最容易踩坑的地方）：**

- `blog` 的 **URL 来自 frontmatter 的 `slug`**，不是文件名。例：`src/content/blog/new-cat.md` 的 URL 是 `/blog/new-arrival-luna/`。
- `cats` / `members` 的 **URL 来自 JSON 里的 `id` 字段**。
- 首页用**硬编码 id 数组**拉内容（`src/pages/index.astro:116` 和 `:157`）—— 重命名内容会导致首页卡片**静默消失且构建不报错**。
- 所有客户端脚本必须监听 **`astro:page-load`**（不是 `DOMContentLoaded`），因为 ClientRouter 让页面不重载。
- **`Layout.astro` 的 props 契约（2026-09-14 重写，勿按旧模板用法写）**：
  `title`（必填，不含站点后缀）、`description`（必填）、`image?`（默认 `/images/og-image.jpg`）、`type?`（`website|article`）、`noindex?`、`exactTitle?`。
  旧的 `pageTitle` prop **已删除**。标题默认拼成 ``{title} | Meepal``，首页用 `exactTitle` 直接用 `siteTitle`。
  canonical 与 og:image 由 `Astro.site`（即 `astro.config.mjs` 的 `site`）推导，**改域名只需改那一处**。

## 4. 协作硬性约定

1. **及时更新记忆**（第 0 节），这是每次交互的收尾动作，不是可选项。
2. **不要碰用户的未提交改动**：`src/pages/index.astro`（已修改）和 `src/assets/images/meepal-hero.png`（新增未跟踪）属于用户。
3. 改代码用 `apply_patch`；不要用 `cat` 或 shell 写文件技巧。
4. 每次实质性改动后跑 `npm run build` 验证，并把验证结果写进对话。**不要声称没验证过的结果。**
5. Git 有 **dubious ownership** 问题，直接跑 `git` 会失败。用：
   `git -c safe.directory=D:/WorkSpace/meepal-site-Templte/pawstronaut <cmd>`
   （如需永久解决，请先征得用户同意再写 `git config --global`。）
6. 现有 remote 指向模板作者仓库 `PaperColdzZ/pawstronaut.git`，**上线前必须换成用户自己的仓库**。
7. `dist/` 是构建产物（已 gitignore），可以随时重建。
8. 用户没有明确要求时**不要初始化 sub-agent / 并行 agent**。

## 5. 当前状态

### 已完成

- 全项目代码通读 + 产物级实测取证（体积、meta、h1、死类名）。
- 建立持久记忆机制（`AGENTS.md` + `docs/PROJECT-CONTEXT.md`，均为**新增未跟踪**文件）。
- 目标与范围定性完成（见第 6 节）。
- **第 1 步「止血」已完成并实测通过**（2026-09-14）：19 页全部有 title / description / canonical，每页恰好 1 个 h1，desc 全部 <= 160 字符；sitemap + robots.txt 生成；og-image 就位。详见 `docs/PROJECT-CONTEXT.md` 第 8 节状态标记。

### 未开始

- 第 2~4 步：立骨架（分类/作者/pagination/面包屑）、结构化数据（JSON-LD/RSS/TOC）、性能与表单。

### 待用户决策（阻塞下一步）

- **第 2 步「立骨架」的范围待定**：用户 2026-09-14 提出两个前置疑问 —— (a) 立骨架是否会导致现有页面结构大变？(b) 激进改造是否会偏离模板风格？已回复，等其拍板。
  - 已澄清的关键事实（有代码证据）：现有 9 个页面**没有任何删除需求**；项目里**完全不存在** 分类/标签/作者/topic 概念（全库 `rg` 只命中隐私政策里的 "authorised" 一词）；`members` collection 已存在但只有 About 页列表、无详情路由，**天然可作为作者体系复用**。
  - 修正后的计划方向：**schema 现在就留好字段位，新页面等真正需要时再加**（而不是「砍掉」）。理由：schema 决策现在做成本几乎为零，内容变多后再改 frontmatter 就贵了。
  - 已向用户提议的保障机制：先提交一个 commit 冻结当前基线（现 21 个改动全未提交）；立骨架前给出**文件级改动清单**逐项确认；可选做**改造前后全站截图对比**。
- 我为本步**临时撰写**了品牌文案与各页 meta 文案（`siteSlogan` / `siteTitle` / `siteDescription` + 9 个页面的 description），**全部是占位，需要用户审阅替换**。
- 表单后端方案（依赖 Cloudflare 部署形态）。

**4 步路线：**

1. ~~**止血**~~ —— **已完成**（2026-09-14）。Layout props 契约 + canonical + sitemap + robots + og:image + 品牌字符串 + 清模板作者痕迹。
2. **立骨架**：新建 topics/分类体系，强化 blog schema（作者、更新时间、分类、标签），加分页、面包屑。
3. **结构化数据**：JSON-LD（Article / FAQPage / BreadcrumbList）、RSS、TOC。
4. **性能与表单**：hero 图、`@playform/inline` 重复投递、View Transitions 的 `<style>` 爆炸、表单后端（依赖 Cloudflare 部署形态）。

> 第 1 步已超出原计划，额外修掉：失效类名（`text-brand-red` / `divide-gray-fuchsia-200`）、`--header-height` 首屏归零、`/contact` 无 h1。

## 6. 已确认决策

用户明确拍板的事项。**没写在这里的都不算已决定**，不要当作前提去推进。

| 日期 | 决策 | 影响 |
|---|---|---|
| 2026-09-14 | 建立持久记忆机制，用 `AGENTS.md`（每会话自动加载）+ `docs/PROJECT-CONTEXT.md`（详细知识库）两层结构 | 后续所有会话以此为唯一事实来源；每次进展必须回写 |
| 2026-09-14 | **关键沟通与工作内容必须及时跟进、更新到记忆里**（用户明确追加要求） | 升级为第 0 节的强制协议：含触发条件、动作清单、时机、收尾自检 |
| 2026-09-14 | 目标确定为 **petmd.com 风格的结构化内容营销站** | 架构重点在内容层与 SEO 层，而非视觉层 |
| 2026-09-14 | **品牌名 = meepal** | `config.ts` 的 `siteName`、Layout 里写死的品牌字符串、Logo 资源按下此改 |
| 2026-09-14 | **上线域名 = meepal.pet** | `astro.config.mjs` 的 `site` 取此值，作为 sitemap / canonical / og:url 的基础 |
| 2026-09-14 | **测试站已部署在 Cloudflare** | 部署平台基本确定；项目名与分支待确认 |
| 2026-09-14 | **雏形改好前不碰线上**（不部署、不管线上内容） | 本步所有工作只在本地，**不做任何部署动作** |
| 2026-09-14 | **范围下调：不做 petmd 对标，只做「健康、轻量级、快速上线」的内容站** | 砍掉非必要功能；信息架构按「够用」设计；petmd 仅作内容形态参考 |
| 2026-09-14 | **授权开始第 1 步「止血」** | 用户确认该步不引起大范围内容变更后放行 |
| 2026-09-14 | **不删减任何现有页面或功能**；对「砍掉」这类说法高度敏感 | 第 2~4 步一律**只增不删**。我此前用词「砍掉作者页/面包屑」指的是**不新建**，不是删除 —— 措辞已澄清 |
| 2026-09-14 | **改造必须保守，避免偏离模板既有风格**（用户选这个模板就是因为样式与内容接近期望） | 后续新功能一律**沿用模板自身写法与组件**，不引入新架构风格、不重写现有组件 |
| 2026-09-14 | **动手前先确认范围**：大改动要先把计划讲清楚再执行 | 流程约定：文件级改动清单先给用户过目；一次只推进一步；每步可构建、可回退 |

## 7. 待确认（不要自行假设）

1. **品牌显示大小写**：meepal / Meepal / MEEPAL？（当前暂用 Meepal，一处常量即可换）
2. **「先不要碰线上」的确切边界**：当前理解为「不部署到 Cloudflare、不改线上内容，只在本地改代码」。原句「先不要观赏显得内容」疑似笔误，若理解有误请纠正。
3. **Cloudflare 部署细节**：项目名、生产分支、Pages 还是 Workers？（本步用不到，后续接表单要用）
4. **内容来源**：继续 Markdown + JSON 还是接 CMS？（按轻量原则，**推断**建议先用 Markdown，量大再迁移）
5. **是否需要多语言？**（按轻量原则，**推断**建议先只做英文）
6. **品牌标语与联系方式**：现值为模板占位（`The best pet shelter in the galaxy!`、太空街地址、`info@pawstronaut.com`）。本步只替换品牌相关部分，其余保持占位并标注。

## 8. 给未来会话的建议阅读顺序

1. 本文件（尤其第 0 节和第 5 节）
2. `docs/PROJECT-CONTEXT.md`（完整架构分析 + 已验证问题清单 + 证据）
3. 只在需要时按需读源码：`src/layouts/Layout.astro` -> `src/content.config.ts` -> `src/data/config.ts` -> `src/pages/index.astro`
4. 要重新取证时：直接读 `dist/` 里的产物，不要凭记忆下判断

## 9. 变更日志

| 日期 | 事件 |
|---|---|
| 2026-09-14 | 用户要求建立持久记忆，创建本文件与 `docs/PROJECT-CONTEXT.md`。当日完成全项目通读、一次成功构建（19 页）、产物级取证，并交付分析报告。 |
| 2026-09-14 | 记录仓库基线状态：代码尚无任何修改；用户已自行改过 `src/pages/index.astro` 并新增 `src/assets/images/meepal-hero.png`（用户的改动，勿动）。 |
| 2026-09-14 | 用户追加要求：关键沟通与工作内容都必须及时跟进更新记忆。据此新增第 0 节「记忆维护协议（强制）」，并新增第 6 节「已确认决策」。 |
| 2026-09-14 | 用户确认：品牌 **meepal**、域名 **meepal.pet**、测试站托管 **Cloudflare**；**范围下调**为「快速上线的健康轻量内容站，不对标 petmd」；**授权开始第 1 步「止血」**。已同步第 2/5/6/7 节。 |
| 2026-09-14 | **第 1 步「止血」实施完成**。改动文件（12 处）：`astro.config.mjs`（site 改 `https://meepal.pet`、加 `sitemap()`）、`package.json`（name→meepal、加 `@astrojs/sitemap` 依赖）、`src/data/config.ts`、**重写** `src/layouts/Layout.astro`（props 契约变更）、新增 `src/utils/seo.ts`、`LogoContainer`（h1→span）、`Header`（`text-brand-red`→`text-brand-fuchsia`）、`Faq`（`divide-gray-fuchsia-200`→`divide-gray-200`）、`global.css`（补 `--header-height: 7rem` 默认值）、9 个页面文件加 title/description、`contact.astro`（首个 h2→h1）、新增 `public/robots.txt` 与 `public/images/og-image.jpg`、重写 `public/humans.txt` 与 `public/site.webmanifest`、重写 `README.md`。 |
| 2026-09-14 | 第 1 步**实测验证**：构建 exit 0、19 页 2.35s；19/19 页 title 非空、desc 非空且 <=160 字符、canonical 存在、h1 恰好 1 个；`sitemap-0.xml` 含 18 条 URL（404 已正确排除）；产物 CSS 中 `brand-red`/`gray-fuchsia` 残留为 0。 |
| 2026-09-14 | 过程中发现并修正 2 个自己引入的问题：(a) `/contact` 页在 h1 去重后变成 0 个 h1，已把首个 `h2` 提升为 `h1`；(b) 首次补丁把旧声明留成上下文行导致 `description` 重复声明、构建失败，已修。 |
| 2026-09-14 | 新增待观察项：安装 `@astrojs/sitemap` 时 `npm audit` 报 **16 个漏洞（1 low / 14 high / 1 critical）**，尚未排查是否仅限 dev 链路；npm 亦提示 `esbuild`、`sharp` 的 install script 被 allowScripts 策略拦截（构建与图片优化实测仍正常）。 |
| 2026-09-14 | 用户在开工第 2 步前提出两个前置疑问（立骨架是否大改页面结构 / 激进改造是否偏离模板风格），并要求**暂时保留**后续可能需要的页面。据此新增 3 条决策记录（只增不删、保守改造、动手前先确认范围），并修正第 5 节里「砍掉作者页/面包屑」的表述 —— 原意是**不新建**而非删除。**本轮未写任何代码。** |
