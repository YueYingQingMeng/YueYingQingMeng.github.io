/**
 * 时间线页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/timelineConfig.ts 控制。
 */
import type { TimelineItem } from "@/types/timelineConfig";

export const timelineData: TimelineItem[] = [
	{
		title: "月莹清梦组织成立",
		date: "2026.10",
		category: "milestone",
		subtitle: "YueYingQingMeng",
		description:
			"把散落在各个仓库里的想法收拢到一面旗帜下。从这里开始，我们以「月莹清梦」的名义一起做点温柔的东西。",
		highlights: [
			"确定组织名与它的由来：月莹是温柔，清梦是不愿醒的相遇",
			"搭好组织主页与团队博客",
			"统一了成员与协作方式",
		],
		tags: ["组织", "起点"],
		icon: "material-symbols:flag-rounded",
		featured: true,
	},
	{
		title: "予念 YuNian v2.1",
		date: "2026.10",
		category: "project",
		subtitle: "你的 AI 伴侣",
		description:
			"文本聊天回合由 Rust 实现的 Agent 接管，记忆、技能、世界书的召回决策全部下沉到 Rust 侧，Kotlin 只保留副作用与流式落盘。",
		highlights: [
			"Rust Cordis Agent 成为文本回合主干，UniFFI 暴露给 Kotlin",
			"六类核心记忆 + 情感日记，记忆只存本地",
			"主动陪伴、按亲密度调整频率、免打扰",
		],
		tags: ["Android", "Kotlin", "Rust", "Compose"],
		links: [
			{
				label: "GitHub Repository",
				url: "https://github.com/YueYingQingMeng/YuNian",
				icon: "fa7-brands:github",
			},
		],
		icon: "material-symbols:favorite-rounded",
		featured: true,
	},
	{
		title: "恋语 LianYu 开源发布",
		date: "2026",
		category: "project",
		subtitle: "AI 虚拟陪伴应用开源框架",
		description:
			"把陪伴应用的工程骨架整理成 Public Edition 开源出来：feature / core 多模块、单向依赖、ServiceRegistry 解耦，方便别人直接二次开发。",
		highlights: [
			"整理为 Public Edition，移除私有服务与加固链路",
			"留下角色、聊天、记忆、群聊、本地模型等完整框架",
			"Apache-2.0 协议，收到 200+ Star",
		],
		tags: ["Android", "Kotlin", "开源", "Apache-2.0"],
		links: [
			{
				label: "GitHub Repository",
				url: "https://github.com/YueYingQingMeng/LianYu-app",
				icon: "fa7-brands:github",
			},
		],
		icon: "material-symbols:deployed-code-outline-rounded",
	},
	{
		title: "从聊天 Demo 到「会记得你」",
		date: "2025",
		category: "life",
		subtitle: "想法的起点",
		description:
			"最初只是想做一个能一直聊下去的机器人，后来发现真正难的不是对话，而是记忆 —— 于是有了后来的长期记忆、情感沉淀与主动消息。",
		tags: ["想法", "记录"],
		icon: "material-symbols:edit-note-rounded",
	},
];

/** 获取所有时间线数据列表 */
export function getTimelineList(): TimelineItem[] {
	return timelineData;
}
