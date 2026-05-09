import { Share } from 'react-native';

/**
 * 系统级分享：拉起原生分享菜单（微信 / 微博 / 复制等由用户选）。
 * iOS 接受 message + url，Android 只看 message。
 * 用户取消或失败一律静默——分享是辅助操作，不应该跳错误弹窗打断流程。
 */
export async function shareText(message: string, title?: string): Promise<void> {
  try {
    await Share.share({ message, title }, { dialogTitle: title });
  } catch {
    /* silent */
  }
}

export function buildFeedShareMessage(authorName: string, content: string): string {
  const trimmed = (content || '').trim();
  const preview = trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
  return `看看「${authorName}」在 BeadForge 分享的动态：${preview}`;
}

export function buildUserShareMessage(userName: string): string {
  return `来 BeadForge 关注「${userName}」，看 ta 的拼豆作品`;
}

export function buildProductShareMessage(title: string, price?: number | null): string {
  const priceTag = price != null ? ` · ¥${price}` : '';
  return `BeadForge 商品推荐：${title}${priceTag}`;
}

export function buildDesignShareMessage(authorName: string, designTitle: string): string {
  return `看看「${authorName}」的拼豆作品「${designTitle}」`;
}
