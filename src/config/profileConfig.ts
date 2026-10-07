import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 博主资料：头像 / 名称 / 简介 / 社交链接（侧栏 Profile 卡片、页脚、RSS 作者等消费）。
 * 类型见 src/types/config.ts。
 */
export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "assets/images/team-avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "月莹清梦",
	bio: "莹莹的月光洒落大地，留下婉如甘霖般清甜的梦境。",
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github", // Visit https://icones.js.org/ for icon codes
			url: "https://github.com/YueYingQingMeng",
		},
		{
			name: "予念 YuNian",
			icon: "material-symbols:favorite-rounded",
			url: "https://github.com/YueYingQingMeng/YuNian",
		},
		{
			name: "Email",
			icon: "material-symbols:mail-rounded",
			url: "mailto:YueYingQingMeng@163.com",
		},
	],
});
