import type { AnnouncementConfig } from "@/types/announcementConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 公告栏配置
 * 组件显示由 sidebarConfig 统一控制
 */
export const announcementConfig: AnnouncementConfig = withUserConfig(
	"announcement",
	{
		title: "欢迎来到月莹清梦 🌙", // 公告标题，填空使用 i18n 字符串 Key.announcement
		content:
			"这里记录我们的开发日志、踩坑笔记与一些关于 AI 陪伴的胡思乱想。", // 公告内容
		closable: true, // 允许用户关闭公告
		link: {
			enable: true, // 启用链接
			text: "组织主页", // 链接文本
			url: "https://github.com/YueYingQingMeng", // 链接 URL
			external: true, // 外部链接
		},
	},
);
