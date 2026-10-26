# 合成大太阳 · Merge Big Sun

一个基于 HTML5 Canvas + Matter.js 的物理合成小游戏。从冥王星开始，不断合成更高级的天体，最终合成太阳；同时收集 26 枚希腊神话主题的战功硬币。

本项目为**完全自包含**的静态站点：所有图片、音频均为本地资源、使用相对路径，无需后端，可直接部署到 GitHub Pages。

## 目录结构

```
merge-big-sun/
├── index.html              # 入口页面
├── css/
│   └── styles.css          # 全部样式（由原内联样式提取）
├── js/
│   └── game.js             # 游戏逻辑（物理、渲染、音效、图鉴）
├── data/
│   └── game-data.js        # 静态数据（天体、战功、稀有度）
├── assets/
│   ├── planets/            # 12 枚天体纪念币（PNG，用于知识卡背面神祇）
│   ├── cards/              # 12 张知识卡正面整卡图（PNG/WebP）
│   ├── merits/             # 26 枚战功纪念币（PNG）
│   └── audio/              # 7 个音效 / 配乐（MP3）
├── .gitignore
└── README.md
```

## 本地运行

### 方式一：直接双击（部分功能可用）

双击 `index.html` 即可在浏览器中打开：

- 图片（纪念币、卡片背景）正常显示；
- 物理合成、知识卡、战功弹窗、图鉴等玩法正常；
- 合成器（Synth）音效正常。

> 注意：Tone.js 的 `Player` 音频（文件配乐，如战功音乐、图鉴音乐）通过 XHR 加载，在 `file://` 协议下会被浏览器 CORS 策略拦截。要听到全部配乐，请使用下面的本地服务器方式。

### 方式二：本地静态服务器（推荐，功能完整）

在项目根目录执行：

```bash
# Python 3
python -m http.server 8766
```

然后浏览器访问：

```
http://localhost:8766/
```

其它等价方式：

```bash
npx serve .
# 或 VS Code 的 Live Server 插件
```

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库（例如 `merge-big-sun`）。
2. 将本文件夹内容推送到仓库：

   ```bash
   git init
   git add .
   git commit -m "feat: 合成大太阳自包含静态站点"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/merge-big-sun.git
   git push -u origin main
   ```

3. 打开仓库 **Settings → Pages**：
   - **Source** 选择 `Deploy from a branch`；
   - **Branch** 选择 `main`，目录选择 `/ (root)`，点击 **Save**。
4. 等待约 1 分钟，页面顶部会出现可访问链接：

   ```
   https://<你的用户名>.github.io/merge-big-sun/
   ```

   打开即可游玩，图片与全部音频均正常。


## 技术栈

- [Matter.js 0.19.0](https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js) — 2D 物理引擎
- [Tone.js 14.8.49](https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js) — Web Audio 音效
- [Tailwind CSS](https://cdn.tailwindcss.com) — 工具类样式（CDN）

> 物理球体本身完全由 Canvas 矢量绘制；`assets/cards` 用于知识卡正面，`assets/planets` 纪念币用于知识卡背面神祇，`assets/merits` 用于战功硬币与图鉴展示。
