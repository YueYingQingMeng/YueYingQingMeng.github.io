/**
 * 项目页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/projectsConfig.ts 控制。
 */
import type { ProjectItem } from "@/types/projectsConfig";

export const projectsData: ProjectItem[] = [
	{
		key: "yunian",
		title: "予念 · YuNian",
		summary:
			"你的 AI 伴侣 —— 会聊天、会记事儿、会主动找你。Rust Agent 主干、六类核心记忆、主动陪伴与亲密度、微信 / QQ 通道、表情包与自动生图。",
		category: "app",
		phase: "building",
		technologies: ["Android", "Kotlin", "Jetpack Compose", "Rust"],
		icon: "material-symbols:favorite-rounded",
		featured: true,
		repository: "https://github.com/YueYingQingMeng/YuNian",
		year: "2026",
	},
	{
		key: "lianyu",
		title: "恋语 · LianYu",
		summary:
			"面向 Android 的 AI 虚拟陪伴应用开源框架。feature / core 多模块工程样板，角色、聊天、记忆、群聊与本地模型框架开箱即用。",
		category: "framework",
		phase: "shipped",
		technologies: ["Kotlin", "Jetpack Compose", "Room", "Material 3"],
		icon: "material-symbols:deployed-code-outline-rounded",
		featured: true,
		repository: "https://github.com/YueYingQingMeng/LianYu-app",
		year: "2026",
	},
];

/** 获取所有项目数据列表 */
export function getProjectsList(): ProjectItem[] {
	return projectsData;
}
