import type { CreateMethodOption, CreateSizeOption, CreateTipOption } from '../api/create';

export const CREATE_SIZES: CreateSizeOption[] = [
  { label: '小', cols: 9, rows: 9, desc: '钥匙扣', icon: 'key' },
  { label: '中', cols: 16, rows: 16, desc: '杯垫', icon: 'coffee' },
  { label: '大', cols: 24, rows: 24, desc: '挂画', icon: 'image' },
  { label: '宽幅', cols: 32, rows: 16, desc: '书签', icon: 'bookmark' },
];

export const CREATE_METHODS: CreateMethodOption[] = [
  { key: 'manual', icon: 'edit-2', title: '手动创作', desc: '逐颗放置珠子并手动调整结构。', color: '#4B78FF' },
  { key: 'image', icon: 'image', title: '图片转换', desc: '从照片生成基础拼豆图纸。', color: '#F97316' },
  { key: 'ai', icon: 'cpu', title: 'AI 生成', desc: '根据描述生成可继续编辑的草稿。', color: '#8B5CF6' },
];

export const CREATE_TIPS: CreateTipOption[] = [
  { icon: 'grid', title: '从规则图形开始', desc: '圆形、爱心和字母更容易控制结构。', bg: '#EEF2FF', mode: 'manual' },
  { icon: 'camera', title: '先选高对比图片', desc: '主体清晰的照片转换成功率更高。', bg: '#FEF3C7', mode: 'image' },
  { icon: 'cpu', title: '先写清尺寸和用途', desc: '描述里带尺寸和场景，更容易得到可用草稿。', bg: '#F3E8FF', mode: 'ai' },
];
