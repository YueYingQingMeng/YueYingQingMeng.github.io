# 月莹清梦 · 团队博客

> 月莹照清梦，予你一份念想。

这里是 **月莹清梦（YueYingQingMeng）** 的团队博客源码，基于 [Shirone](https://github.com/LyraVoid/Shirone) 主题构建，托管在 GitHub Pages。

**线上地址：** https://yueyingqingmeng.github.io/

## 技术栈

- **框架**：[Astro 7](https://astro.build/) + [Svelte 5](https://svelte.dev/)
- **样式**：[Tailwind CSS 4](https://tailwindcss.com/) + [Stylus](https://stylus-lang.com/)
- **设计体系**：[Material 3 Expressive](https://m3.material.io/)
- **搜索**：[Pagefind](https://pagefind.app/) 离线全文搜索
- **包管理**：pnpm

## 本地开发

```bash
pnpm install
pnpm dev        # 开发服务器
pnpm build      # 生产构建（产物在 dist/）
pnpm preview    # 预览构建产物
npx astro check # 类型与内容校验，需 0 errors
```

## 写文章

在 `src/content/posts/` 下新建 `.md` 文件：

```markdown
---
title: 文章标题
published: 2026-10-07
description: 一句话摘要
tags: [标签]
category: 分类
---

正文……
```

## 常用配置位置

| 想改什么 | 改哪里 |
| :--- | :--- |
| 站点标题 / 域名 / 首页横幅文案 | `src/config/siteConfig.ts` |
| 侧栏头像 / 昵称 / 简介 / 社交链接 | `src/config/profileConfig.ts` |
| 导航栏结构 | `src/config/navBarConfig.ts` |
| 项目页数据 | `src/data/projects.ts` |
| 技术栈页数据 | `src/data/skills.ts` |
| 里程碑时间线 | `src/data/timeline.ts` |
| 关于页正文 | `src/content/spec/about.md` |
| 公告栏 | `src/config/announcementConfig.ts` |

> 主题自带的功能页（番剧 / 攻略 / 设备 / 游戏 / 相册 / 动态 / 友链）目前在对应 `src/config/*Config.ts` 里设为 `enable: false`，需要时改回 `true` 即可，导航会自动恢复入口。

## 部署

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建并部署到 GitHub Pages。

**首次部署前**需在仓库 `Settings → Pages → Source` 中选择 **GitHub Actions**。

## 致谢

站点基于开源主题 [Shirone](https://github.com/LyraVoid/Shirone) 构建（MIT 协议），感谢原作者。
