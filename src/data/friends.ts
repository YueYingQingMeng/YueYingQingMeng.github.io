/**
 * 友情链接数据配置。
 *
 * 消费方：
 * - 侧栏友链卡片 `src/components/molecules/FriendLinks.astro`（由 sidebarConfig 的
 *   `type: "friendLinks"` 驱动）；
 * - 独立友链页 `src/pages/friends.astro`（由 `friendsConfig.enable` 控制，当前关闭）。
 *
 * 添加友链：在 friendsData 中追加一项即可。
 */
export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
	{
		id: 1,
		title: "予念官网",
		imgurl: "https://lianyu.chat/favicon.ico",
		desc: "予念 YuNian 官方网站",
		siteurl: "https://lianyu.chat",
		tags: ["官网", "团队"],
	},
	{
		id: 2,
		title: "BINBIN 的个人博客",
		imgurl: "https://github.com/BB0813.png?size=96",
		desc: "Binbim —— AI Full-stack Developer",
		siteurl: "https://hi.binbim.top/",
		tags: ["博客", "友链"],
	},
	{
		id: 3,
		title: "林梓涵的个人博客",
		imgurl: "https://blog.linzihan.fun/logo/icon.webp",
		desc: "林梓涵 —— 个人博客",
		siteurl: "https://blog.linzihan.fun/",
		tags: ["博客", "友链"],
	},
];

// 获取所有友情链接数据（稳定顺序，测试可复现）
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据（避免固定排序，按需使用）
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
