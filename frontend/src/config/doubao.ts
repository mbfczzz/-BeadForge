/**
 * 豆包文生图 API 配置
 *
 * 使用火山方舟 Ark API（兼容 OpenAI 格式）
 * 控制台：https://console.volcengine.com/ark
 *
 * 步骤：
 * 1. 注册火山引擎账号
 * 2. 开通火山方舟服务
 * 3. 创建 API Key
 * 4. 创建推理接入点（Endpoint），选择图像生成模型
 * 5. 将 API Key 和 Endpoint ID 填入下方
 */

/** 火山方舟 API Key（Bearer Token） */
export const ARK_API_KEY = '';

/** 推理接入点 ID（在方舟控制台创建） */
export const ARK_ENDPOINT_ID = '';

/** API Base URL */
export const ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';

/** 是否已配置（有 Key 才走真实 API，否则走 mock） */
export const isDoubaoConfigured = (): boolean =>
  ARK_API_KEY.length > 0 && ARK_ENDPOINT_ID.length > 0;
