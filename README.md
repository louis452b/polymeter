# 复拍 POLYMETER · 数学摇滚田野指南

## 文件结构

```
mathrock-site/
├── index.html              首页
├── anatomy.html            技术（拍号 / 复节奏 / 演奏技法 / 器材）
├── archive.html            乐队（按地理+年代分 6 类）
├── history.html            历史（4 时代 14 节点时间线）
├── discourse.html          讨论列表页（27 条样本帖子，6 条可点击）
├── login.html              登录页（保留，不在导航中）
│
├── shared/
│   ├── style.css           全站共享样式
│   └── core.js             导航 / 节拍器 / 共享数据
│
├── discourse/              帖子详情页（构建产物）
│   ├── slint-vs-king-crimson.html
│   ├── american-football-tuning.html
│   ├── post-toe-recommendations.html
│   ├── shimokitazawa-shelter-may.html
│   ├── spiderland-mastering-analysis.html
│   └── 11-8-practice-feedback.html
│
└── _threads/               帖子源文件（用 Markdown 写）
    ├── _template.html       详情页模板
    ├── build.py             构建脚本
    ├── thread-001.md        Slint vs King Crimson
    ├── thread-002.md        American Football 调弦
    ├── thread-003.md        toe 之后听啥
    ├── thread-004.md        东京演出
    ├── thread-005.md        Spiderland 母带考据
    └── thread-006.md        11/8 拍练习作品
```

## 如何编辑/新增帖子

### 编辑现有帖子
1. 打开 `_threads/thread-XXX.md` 直接改 Markdown 正文或 YAML 元数据
2. 在 `_threads/` 目录运行 `python3 build.py`
3. 对应的 `discourse/<slug>.html` 会被重新生成

### 新增帖子
1. 在 `_threads/` 复制一个现有 .md 文件，重命名为 `thread-007.md`
2. 修改 frontmatter（id、slug、tag、title 等）
3. 写正文（Markdown 格式，支持 **加粗**、*斜体*、列表、表格、代码块、引用块、链接）
4. 在 `---REPLIES---` 后用 YAML 列表格式写回复
5. 在 `discourse.html` 的 `THREADS` 数组中加入新条目并加上 `slug: 'your-slug'` 字段
6. 运行 `python3 build.py`

### Markdown 格式速查

```markdown
**加粗** *斜体* `代码`
[链接文字](https://url)
> 引用块

- 列表项
- 列表项

| 表格 | 表头 |
|------|------|
| 数据 | 数据 |

\`\`\`
代码块
\`\`\`
```

## 部署 + 接入真评论（未来）

### 选定方案：Cusdis
- 开源、免费、支持匿名评论
- 部署到 Vercel + Vercel Postgres
- 评论默认待审核，你通过邮件链接 approve/delete

### 部署步骤（未来执行）

1. **Fork Cusdis 仓库** → https://github.com/djyde/cusdis
2. **部署到 Vercel**：
   - 在 Vercel 上 New Project，选择你 fork 的 cusdis 仓库
   - 添加 Vercel Postgres 数据库（免费层够用）
   - 设置环境变量（详见 Cusdis 文档）
3. **拿到 app_id**：登录 Cusdis 后台后会自动生成
4. **替换详情页占位**：在每个 `discourse/*.html` 文件底部找到这段 HTML 注释：

```html
<!--
  FUTURE INTEGRATION · 未来部署 Cusdis 时的接入指南
  ...
-->
```

把它替换成：

```html
<div id="cusdis_thread"
     data-host="https://你的cusdis域名.vercel.app"
     data-app-id="你的-app-id-uuid"
     data-page-id="thread-001"
     data-page-url="https://你的网站域名/discourse/slint-vs-king-crimson.html"
     data-page-title="帖子标题">
</div>
<script async defer src="https://你的cusdis域名.vercel.app/js/cusdis.es.js"></script>
```

5. **配置邮件通知**：Cusdis 后台 → Settings → 启用邮件通知，每条新评论会发到你邮箱
6. **部署网站**：把整个 `mathrock-site/` 推到 GitHub，开启 Pages 或部署到 Vercel

### 将构建步骤纳入部署流程

如果你想让"修改 .md → 自动重新构建网站"成为部署流程的一部分，可以：
- 在 GitHub Actions 里配置 Python 构建脚本（推送时自动运行 `build.py`）
- 或本地构建后手动推送

## 当前状态：什么是真的、什么是假的

- ✅ **真**：所有乐队信息、专辑、年份、技术解释（已核实）
- ✅ **真**：核心特质 / 拍号 / 复节奏 / 演奏技法 / 器材（已核实）
- ✅ **真**：4 时代 14 节点的历史时间线（已核实，但 2024-2025 部分有些是合理推测）
- ⚠️ **假**：discourse 页面所有 27 条帖子 —— 它们是"虚构田野样本"
- ⚠️ **假**：信号面板的"187 活跃用户"等实时数据 —— 完全是装饰性 UI
- ⚠️ **假**：每条帖子的回复 —— 6 个详情页里的 5-6 条回复都是虚构对话
- ❌ **未启用**：评论功能 —— 占位框只是 placeholder，未连接到任何后端

待 Cusdis 部署完成后，最后一项才会从 ❌ 变成 ✅。
