/**
 * 技能页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/skillsConfig.ts 控制。
 */
import type { SkillItem } from "@/types/skillsConfig";

export const skillsData: SkillItem[] = [
	{
		name: "Kotlin",
		description: "团队的主力语言，从 App 到后端服务都靠它。",
		icon: "simple-icons:kotlin",
		category: "client",
		level: "expert",
	},
	{
		name: "Jetpack Compose",
		description: "声明式 UI 与 Material 3 Expressive 实践。",
		icon: "simple-icons:jetpackcompose",
		category: "client",
		level: "advanced",
	},
	{
		name: "Android",
		description: "多模块工程、后台保活、权限与系统适配。",
		icon: "simple-icons:android",
		category: "client",
		level: "advanced",
	},
	{
		name: "TypeScript",
		description: "站点、工具链与脚本的类型化底座。",
		icon: "simple-icons:typescript",
		category: "client",
		level: "advanced",
	},
	{
		name: "Svelte",
		description: "交互岛组件与状态驱动的界面逻辑。",
		icon: "simple-icons:svelte",
		category: "client",
		level: "intermediate",
	},
	{
		name: "Astro",
		description: "内容站的静态渲染与构建期优化。",
		icon: "simple-icons:astro",
		category: "client",
		level: "intermediate",
	},
	{
		name: "Rust",
		description: "Agent 主干与性能敏感路径，交给它。",
		icon: "simple-icons:rust",
		category: "backend",
		level: "advanced",
	},
	{
		name: "Node.js",
		description: "构建脚本、内容管线与轻量服务。",
		icon: "simple-icons:nodedotjs",
		category: "backend",
		level: "advanced",
	},
	{
		name: "Python",
		description: "打包加固脚本、数据处理与实验代码。",
		icon: "simple-icons:python",
		category: "backend",
		level: "intermediate",
	},
	{
		name: "Java",
		description: "JVM 生态与既有服务层的胶水。",
		icon: "simple-icons:openjdk",
		category: "backend",
		level: "intermediate",
	},
	{
		name: "Gradle",
		description: "多模块构建、变体与打包链路编排。",
		icon: "simple-icons:gradle",
		category: "tooling",
		level: "advanced",
	},
	{
		name: "Git",
		description: "分支策略、协作流程与历史整理。",
		icon: "simple-icons:git",
		category: "tooling",
		level: "advanced",
	},
	{
		name: "Docker",
		description: "本地环境与部署链路的容器化。",
		icon: "simple-icons:docker",
		category: "tooling",
		level: "intermediate",
	},
	{
		name: "Playwright",
		description: "端到端回归与可访问性测试。",
		icon: "simple-icons:playwright",
		category: "tooling",
		level: "intermediate",
	},
];

/** 获取所有技能数据列表 */
export function getSkillsList(): SkillItem[] {
	return skillsData;
}
