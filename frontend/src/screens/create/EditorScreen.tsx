import React, { useState, useCallback, useRef, useMemo, useEffect, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform, TextInput,
  ActivityIndicator, GestureResponderEvent, Alert, Modal, TouchableOpacity,
  AppState, Linking, Image, Dimensions, type AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import type { ThemeColors } from '../../theme';
import { HoverView, ALL_PATTERNS, PublishResultCard, type PublishResultCardData } from '../../components/common';
import type { RootScreenProps } from '../../navigation/types';
import { doubaoGenerate } from '../../api/doubao';
import { imageToGrid } from '../../api/imageToGrid';
import { designApi } from '../../api/design';
import { feedApi } from '../../api/community';
import { usePatternStore } from '../../store/usePatternStore';
import { useDesignStore } from '../../store/useDesignStore';
import { hapticSelection, hapticLight } from '../../hooks/useFeedback';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const PAD = wp(15);

/* ──────────────── 调色板 — 多套预设，与后端 AiController.PALETTES 镜像 ────────────── */

// "default" 36 色：原 24 + 肤色 / 头发 / 唇色 / 高光，能转人像照片
// "classic" 24 色：纯卡通 / 抽象用，无肤色
const PALETTES: Record<string, string[][]> = {
  default: [
    ['#EF4444', '#F87171', '#FCA5A5', '#FDA4AF', '#F9A8D4', '#EC4899'], // 红 / 粉
    ['#F97316', '#FB923C', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'], // 橙 / 黄
    ['#22C55E', '#16A34A', '#86EFAC', '#0EA5E9', '#7DD3FC', '#3B82F6'], // 绿 / 蓝
    ['#8B5CF6', '#A78BFA', '#C4B5FD', '#1E1B2E', '#6B7280', '#FAFAFA'], // 紫 / 中性
    ['#FDD9B4', '#F8C399', '#F4B68F', '#DDA67D', '#C68863', '#8B5A2B'], // 肤色阶
    ['#2C1810', '#5D4037', '#A0784A', '#DEB887', '#B8534F', '#F8F0E5'], // 头发 / 唇 / 高光
  ],
  classic: [
    ['#EF4444', '#F87171', '#FCA5A5', '#FDA4AF', '#F9A8D4', '#EC4899'],
    ['#F97316', '#FB923C', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
    ['#22C55E', '#16A34A', '#86EFAC', '#0EA5E9', '#7DD3FC', '#3B82F6'],
    ['#8B5CF6', '#A78BFA', '#C4B5FD', '#1E1B2E', '#6B7280', '#FAFAFA'],
  ],
};
type PaletteKey = keyof typeof PALETTES;
const PALETTE_OPTIONS: { key: PaletteKey; label: string; desc: string }[] = [
  { key: 'default', label: '标准 36', desc: '含肤色，适合人像 / 自拍' },
  { key: 'classic', label: '经典 24', desc: '无肤色，适合卡通 / 抽象' },
];

// AI 风格预设。和后端 buildStylePrompt 镜像。每个 key 对应一套 prompt 模板，
// 让 AI 用对应风格重绘原图。市场上 PixelMe 这类工具的核心就是风格预设——
// 同一张自拍换风格，效果完全不一样。
type StyleKey = 'auto' | 'portrait' | 'chibi' | 'anime' | 'scene';
const STYLE_OPTIONS: { key: StyleKey; label: string; desc: string }[] = [
  { key: 'auto',     label: '通用',     desc: '自适应' },
  { key: 'portrait', label: '真人头像', desc: '保留辨识度的卡通脸' },
  { key: 'chibi',    label: 'Q 版萌系', desc: '大眼小嘴可爱风' },
  { key: 'anime',    label: '动漫风格', desc: 'cel-shading 漫画感' },
  { key: 'scene',    label: '风景物体', desc: '保留构图扁平化' },
];

/* ──────────────── 工具定义 ──────────────── */

type ToolType = 'pen' | 'eraser' | 'fill' | 'picker';

const TOOLS: { key: ToolType; icon: string; label: string }[] = [
  { key: 'pen', icon: 'edit-3', label: '画笔' },
  { key: 'eraser', icon: 'x-circle', label: '橡皮' },
  { key: 'fill', icon: 'droplet', label: '填充' },
  { key: 'picker', icon: 'crosshair', label: '取色' },
];

/* ──────────────── 工具函数 ──────────────── */

const MAX_HISTORY = 30;

function cloneGrid(g: string[][]): string[][] { return g.map((r) => [...r]); }

function createEmptyGrid(cols: number, rows: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill('transparent'));
}

function floodFill(grid: string[][], row: number, col: number, newColor: string): string[][] {
  const result = cloneGrid(grid);
  const target = result[row][col];
  if (target === newColor) return result;
  const maxR = result.length, maxC = result[0].length;
  const stack: [number, number][] = [[row, col]];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= maxR || c < 0 || c >= maxC || result[r][c] !== target) continue;
    result[r][c] = newColor;
    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }
  return result;
}

function generateMockPattern(cols: number, rows: number): string[][] {
  const src = ALL_PATTERNS[Math.floor(Math.random() * ALL_PATTERNS.length)];
  const grid: string[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      const sr = Math.floor((r / rows) * src.length);
      const sc = Math.floor((c / cols) * src[0].length);
      row.push(src[sr]?.[sc] ?? 'transparent');
    }
    grid.push(row);
  }
  return grid;
}

/* ──────────────── 模式标题 ──────────────── */

const MODE_TITLES = { manual: '手动创作', image: '图片转换', ai: 'AI 生成' } as const;

/* ──────────────── 主屏幕 ──────────────── */

export const EditorScreen: React.FC<RootScreenProps<'Editor'>> = ({ route, navigation }) => {
  const { colors, dark } = useTheme();
  const { mode, cols, rows, initialGrid, designId: incomingDesignId } = route.params;

  // 把外部传入的 grid 拉成请求的 cols×rows 尺寸；不一致时居中裁剪 / transparent 补齐
  const fitInitialGrid = useCallback((src: string[][] | undefined): string[][] | null => {
    if (!src || !src.length || !src[0]?.length) return null;
    const out: string[][] = [];
    for (let r = 0; r < rows; r++) {
      const srcRow = src[r] || [];
      const row: string[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(srcRow[c] ?? 'transparent');
      }
      out.push(row);
    }
    return out;
  }, [cols, rows]);

  /* ---- 生成状态 ---- */
  const hasInitialGrid = !!initialGrid && initialGrid.length > 0;
  // 已有 initialGrid 时，跳过 image 模式默认的 1.5s 假 loading
  const [generating, setGenerating] = useState(mode !== 'manual' && !hasInitialGrid);
  const [genError, setGenError] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(mode === 'ai' && !hasInitialGrid);
  const useRealApi = true; // API Key 存后端数据库，始终尝试调用

  /* ---- 调色板：默认 36（含肤色），用户可切到经典 24 ---- */
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('default');
  const PALETTE_ROWS = PALETTES[paletteKey];
  const PALETTE = useMemo(() => PALETTE_ROWS.flat(), [PALETTE_ROWS]);

  /* ---- AI 增强：image 模式专用，让 GPT 先卡通化再 pixelize；默认开启 ---- */
  // 真人照片 / 复杂背景照片走纯算法效果有限，开启此项让 AI 重绘成"卡通色块"
  // 再做调色板匹配，能解决"主体识别"和"背景杂乱"两个本地算法做不到的事。
  // 慢 15-30s 且消耗 OpenAI 配额。卡通图 / 风景画自带色块感，可关闭省时间。
  const [aiEnhance, setAiEnhance] = useState(true);
  // AI 风格预设：选不同风格 → 后端用不同 prompt → AI 重绘出不同效果
  const [stylePreset, setStylePreset] = useState<StyleKey>('auto');

  /* ---- 偏好持久化：palette / style / aiEnhance 跨会话保留，省每次手动配 ---- */
  const PREFS_KEY = 'beadforge_editor_prefs_v1';
  const prefsLoadedRef = useRef(false); // 第一次 load 完才 enable 写入，避免覆盖了再读到 default
  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((json) => {
      if (json) {
        try {
          const saved = JSON.parse(json);
          if (saved.paletteKey === 'default' || saved.paletteKey === 'classic') {
            setPaletteKey(saved.paletteKey);
          }
          if (typeof saved.aiEnhance === 'boolean') setAiEnhance(saved.aiEnhance);
          const validStyles: StyleKey[] = ['auto', 'portrait', 'chibi', 'anime', 'scene'];
          if (validStyles.includes(saved.stylePreset)) {
            setStylePreset(saved.stylePreset);
          }
        } catch { /* JSON 损坏忽略，下次写入会覆盖 */ }
      }
      prefsLoadedRef.current = true;
    }).catch(() => { prefsLoadedRef.current = true; });
  }, []);
  useEffect(() => {
    if (!prefsLoadedRef.current) return;
    void AsyncStorage.setItem(PREFS_KEY, JSON.stringify({
      paletteKey, aiEnhance, stylePreset,
    }));
  }, [paletteKey, aiEnhance, stylePreset]);

  /* ---- 画布状态 ---- */
  const [grid, setGrid] = useState<string[][]>(() => fitInitialGrid(initialGrid) || createEmptyGrid(cols, rows));
  const [tool, setTool] = useState<ToolType>('pen');
  // 初始色用 default 的第一格；切换调色板不会自动改当前色（用户已选的色仍可继续画）
  const [color, setColor] = useState(PALETTES.default[0][0]);
  const [history, setHistory] = useState<string[][][]>([]);
  const [future, setFuture] = useState<string[][][]>([]);
  const [showGridLine, setShowGridLine] = useState(true);

  /* ---- 拖拽绘画 ---- */
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const drawingRef = useRef(false);
  const drawGridRef = useRef(grid);
  const lastCellRef = useRef<string | null>(null);
  drawGridRef.current = grid;

  /* ---- 历史操作 ---- */
  const pushHistory = useCallback((newGrid: string[][]) => {
    setGrid((prev) => {
      setHistory((h) => [...h.slice(-MAX_HISTORY), prev]);
      setFuture([]);
      return newGrid;
    });
  }, []);

  /* ---- 通用生成：尝试 AI → 失败回退 mock ---- */
  const doGenerate = useCallback(async (prompt: string) => {
    setGenError('');
    try {
      const result = await doubaoGenerate(prompt, cols, rows, PALETTE, paletteKey);
      if (result) { pushHistory(result); return; }
    } catch (e: any) {
      console.warn('AI 生成失败，使用 mock:', e?.message);
      setGenError(useRealApi ? '生成失败，已使用本地图案' : '');
    }
    // fallback: mock
    pushHistory(generateMockPattern(cols, rows));
  }, [cols, rows, pushHistory, useRealApi, PALETTE, paletteKey]);

  /* ---- 图片转拼豆：调相册 → 上传 → 拿 grid ---- */
  // isInitial=true：进页面首次自动唤起；用户取消则退回上一页（不留空白编辑器让人困惑）
  // isInitial=false：信息栏点"换一张"重新选；取消就留在当前画布
  const pickingRef = useRef(false);
  // 缓存最近一次成功选用的 source URI。用 state 而不是 ref，让 UI 能根据它的
  // 存在条件显示"重做" / "查看原图"按钮。
  const [lastImageUri, setLastImageUri] = useState<string | null>(null);
  // 查看原图全屏 modal 的开关
  const [sourcePreviewOpen, setSourcePreviewOpen] = useState(false);
  const pickAndConvertImage = useCallback(async (isInitial = false) => {
    // 重入锁：refresh 按钮在 setGenerating(true) 之前的窗口期还是可见可点的，
    // 用户连点会让两个 launchImageLibraryAsync 抢着 present，iOS 上是 UB。
    if (pickingRef.current) return;
    pickingRef.current = true;

    // 整个 picker + upload 流程包在 try-catch 里：设备存储错误 / Android intent 异常 /
    // 权限 API 抛错都会被捕获，不会变成 unhandled rejection 让编辑器卡在生成遮罩
    try {
      setGenError('');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setGenerating(false);
        // canAskAgain=false：用户之前选过"不允许"且系统已不再弹原生 prompt，
        //                   只能引导去系统设置；
        // canAskAgain=true ：系统刚弹过、用户这次点了拒绝，下次重试可能还会弹。
        // 两种情况都给"去设置"捷径（Linking.openSettings 直接跳到本 app 的权限页），
        // 比让用户自己翻设置友好得多。
        // 文案不写 "BeadForge"——跑在 Expo Go 里时跳的是 Expo Go 的设置页，
        // 用户看到的 app 名称是 "Expo Go" 而不是 "BeadForge"，写死会让人困惑
        const message = permission.canAskAgain === false
          ? '相册权限已被拒绝。请到系统设置中开启相册权限后重试。'
          : '需要相册权限才能选择图片。';
        const buttons: any[] = [
          {
            text: '去设置',
            onPress: () => {
              void Linking.openSettings();
              if (isInitial) navigation.goBack();
            },
          },
          {
            text: '取消',
            style: 'cancel',
            onPress: () => { if (isInitial) navigation.goBack(); },
          },
        ];
        // cancelable:false 防止 Android 硬件返回键吞掉 alert 让 goBack 不触发。
        Alert.alert('无法访问相册', message, buttons, { cancelable: false });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        // 让用户先按目标画布比例裁一刀，避免"长方形照片硬拉成正方形"那种压扁感
        allowsEditing: true,
        aspect: [cols, rows],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.length) {
        setGenerating(false);
        if (isInitial) navigation.goBack();
        return;
      }

      const asset = result.assets[0];
      setLastImageUri(asset.uri); // 记下来，让"重做" / "查看原图"能复用
      setGenerating(true);
      // imageToGrid 失败会抛错，外层 catch 透出 server 的 message
      const result2 = await imageToGrid(asset.uri, cols, rows, paletteKey, aiEnhance, stylePreset);
      pushHistory(result2.grid);
      // AI 增强请求了但实际没生效 → 显式告诉用户走的是本地算法
      // （后端 AI 调用失败时会静默降级，不告诉用户的话他会以为"AI 增强没用"）
      if (aiEnhance && !result2.aiUsed) {
        setGenError('AI 增强未生效，已用本地算法。检查后端日志确认 oaipro 是否支持 /images/edits');
      }
    } catch (e: any) {
      console.warn('图片转换链路异常:', e?.message);
      // 把后端的具体提示原样透给用户（"图片分辨率过高"、"图片解码失败，请换一张" 等）；
      // 拿不到 message（picker 抛的技术错）才用泛化兜底文案
      setGenError(e?.message || '图片处理失败，已使用本地图案');
      pushHistory(generateMockPattern(cols, rows));
    } finally {
      setGenerating(false);
      pickingRef.current = false;
    }
  }, [cols, rows, pushHistory, navigation, paletteKey, aiEnhance, stylePreset]);

  /* ---- 用上次的图重新生成（不打开 picker，节省一步操作）---- */
  // 用户在切风格 / 调色板 / 开关 AI 增强后想试新效果时用这个；
  // 没缓存 URI（首次进来）按钮不显示
  const regenerateFromCache = useCallback(async () => {
    const uri = lastImageUri;
    if (!uri || pickingRef.current) return;
    pickingRef.current = true;
    setGenerating(true);
    setGenError('');
    try {
      const result = await imageToGrid(uri, cols, rows, paletteKey, aiEnhance, stylePreset);
      pushHistory(result.grid);
      if (aiEnhance && !result.aiUsed) {
        setGenError('AI 增强未生效，已用本地算法。检查后端日志确认 oaipro 是否支持 /images/edits');
      }
    } catch (e: any) {
      console.warn('重新生成失败:', e?.message);
      // URI 失效（系统清了 temp 文件）会到这里——提示用户重新选图
      setGenError(e?.message || '重新生成失败，请换一张图试试');
    } finally {
      setGenerating(false);
      pickingRef.current = false;
    }
  }, [lastImageUri, cols, rows, pushHistory, paletteKey, aiEnhance, stylePreset]);

  /* ---- 初始化 ---- */
  useEffect(() => {
    // 已经从图纸 / 作品页带 initialGrid 进来：跳过模式默认占位
    if (hasInitialGrid) { setGenerating(false); return; }

    if (mode === 'image') {
      // 进页面立刻唤起相册；取消会 goBack 回创作页
      void pickAndConvertImage(true);
      return;
    }
    // manual 和 ai 模式都不显示 loading（ai 模式显示输入面板）
    setGenerating(false);
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setGrid((cur) => { setFuture((f) => [...f, cur]); return prev; });
      return h.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[f.length - 1];
      setGrid((cur) => { setHistory((h) => [...h, cur]); return next; });
      return f.slice(0, -1);
    });
  }, []);

  const clearCanvas = useCallback(() => pushHistory(createEmptyGrid(cols, rows)), [cols, rows, pushHistory]);

  /* ---- AI 生成 ---- */
  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setShowAiInput(false);
    setGenerating(true);
    await doGenerate(aiPrompt.trim());
    setGenerating(false);
  }, [aiPrompt, doGenerate]);

  /* ---- 画布尺寸计算 ---- */
  const canvasW = screenW - PAD * 2 - wp(24); // 减去 canvasWrap padding
  const gap = showGridLine ? 1 : 0;
  const cellSize = Math.min(Math.floor((canvasW - gap * (cols - 1)) / cols), wp(28));

  /* ---- 触摸 → 坐标转换 ---- */
  const canvasRef = useRef<View>(null);
  const canvasLayoutRef = useRef({ x: 0, y: 0 });

  const touchToCell = useCallback((pageX: number, pageY: number): [number, number] | null => {
    const { x, y } = canvasLayoutRef.current;
    const localX = pageX - x;
    const localY = pageY - y;
    const c = Math.floor(localX / (cellSize + gap));
    const r = Math.floor(localY / (cellSize + gap));
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return [r, c];
  }, [cellSize, gap, rows, cols]);

  /* ---- 绘画操作（单格） ---- */
  const applyTool = useCallback((row: number, col: number, currentGrid: string[][]): string[][] | null => {
    if (tool === 'picker') {
      const c = currentGrid[row]?.[col];
      if (c && c !== 'transparent') { setColor(c); setTool('pen'); }
      return null;
    }
    if (tool === 'fill') return floodFill(currentGrid, row, col, color);
    const newColor = tool === 'eraser' ? 'transparent' : color;
    if (currentGrid[row][col] === newColor) return null;
    const g = cloneGrid(currentGrid);
    g[row][col] = newColor;
    return g;
  }, [tool, color]);

  /* ---- 拖拽绘画手势 ---- */
  const handleTouchStart = useCallback((e: GestureResponderEvent) => {
    if (generating) return;
    const { pageX, pageY } = e.nativeEvent;
    const cell = touchToCell(pageX, pageY);
    if (!cell) return;

    drawingRef.current = true;
    lastCellRef.current = `${cell[0]},${cell[1]}`;
    setScrollEnabled(false);

    // fill 和 picker 只在 start 时触发
    if (tool === 'fill' || tool === 'picker') {
      const result = applyTool(cell[0], cell[1], drawGridRef.current);
      if (result) pushHistory(result);
      drawingRef.current = false;
      return;
    }

    const result = applyTool(cell[0], cell[1], drawGridRef.current);
    if (result) {
      // 拖拽期间直接 setGrid 不推历史，结束时再推
      setHistory((h) => [...h.slice(-MAX_HISTORY), drawGridRef.current]);
      setFuture([]);
      setGrid(result);
    }
  }, [generating, touchToCell, tool, applyTool, pushHistory]);

  const handleTouchMove = useCallback((e: GestureResponderEvent) => {
    if (!drawingRef.current || tool === 'fill' || tool === 'picker') return;
    const { pageX, pageY } = e.nativeEvent;
    const cell = touchToCell(pageX, pageY);
    if (!cell) return;

    const cellKey = `${cell[0]},${cell[1]}`;
    if (cellKey === lastCellRef.current) return;
    lastCellRef.current = cellKey;

    const newColor = tool === 'eraser' ? 'transparent' : color;
    if (drawGridRef.current[cell[0]][cell[1]] === newColor) return;
    const g = cloneGrid(drawGridRef.current);
    g[cell[0]][cell[1]] = newColor;
    setGrid(g);
  }, [touchToCell, tool, color]);

  const handleTouchEnd = useCallback(() => {
    drawingRef.current = false;
    lastCellRef.current = null;
    setScrollEnabled(true);
  }, []);

  /* ---- 统计 ---- */
  const stats = useMemo(() => {
    let beadCount = 0;
    const colorSet = new Set<string>();
    for (const row of grid) for (const c of row) {
      if (c !== 'transparent') { beadCount++; colorSet.add(c); }
    }
    return { beadCount, colorCount: colorSet.size };
  }, [grid]);

  // 监听画布变化标记 dirty；初次/AI生成回填的那次（skipNextDirtyRef=true）不算改动
  useEffect(() => {
    if (skipNextDirtyRef.current) {
      skipNextDirtyRef.current = false;
      return;
    }
    setDirtySinceSave(true);
  }, [grid]);

  /* ---- 保存 / 发布 ---- */
  const [showPublish, setShowPublish] = useState(false);
  const [pubTitle, setPubTitle] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubPoints, setPubPoints] = useState('');
  const [pubCat, setPubCat] = useState('抽象');
  const [pubAccessMode, setPubAccessMode] = useState<'free' | 'points' | 'member'>('free');
  // 防重复发布：本次编辑会话内，每种目标只能发一次
  const [hasPublishedToFeed, setHasPublishedToFeed] = useState(false);
  const [hasPublishedToPattern, setHasPublishedToPattern] = useState(false);
  // 脏检测：只有当画布相对"上次落库"有新改动时，才显示保存/更新选项
  // 从草稿进来时 hasSaved 一开始就 true（这条 design 已在后端）
  const [hasSaved, setHasSaved] = useState(!!incomingDesignId);
  const [dirtySinceSave, setDirtySinceSave] = useState(false);
  const skipNextDirtyRef = useRef(true);
  const publishPattern = usePatternStore((s) => s.publish);

  // 当前作品在后端的 ID（首次保存后获得；后续保存复用同一条记录，避免重复创建）
  // 进编辑器时若带 incomingDesignId（从草稿恢复），直接复用，让保存走 update 而不是新建
  const savedDesignIdRef = useRef<number | null>(incomingDesignId ?? null);
  // 串行化锁：保证 persistDesign 永远不会有两路并发（如 autosave 与发布按钮同时触发）
  // 否则两路都看到 savedDesignIdRef=null 会各自 create 出两条 design
  const persistQueueRef = useRef<Promise<number>>(Promise.resolve(0));

  // 发布结果：富卡片，3 秒自动消，主操作可选；保持"留在当前页"的承诺
  const [publishResult, setPublishResult] = useState<PublishResultCardData | null>(null);

  // 把本地 grid 落到后端 t_design.design_data；返回 design id
  // 用 persistQueueRef 串行化：每次调用都接在上一个之后跑，避免并发 create 出重复 design
  const persistDesign = useCallback(async (extra?: { titleHint?: string; status?: 'DRAFT' | 'PUBLISHED' }) => {
    const previous = persistQueueRef.current;
    const next = (async () => {
      // 等前一个完成，但不要因为前一个失败而拒绝执行后续（catch 吞）
      await previous.catch(() => undefined);

      const fallbackTitle = mode === 'ai' ? `AI：${aiPrompt || '创意图案'}` : '我的创作';
      const title = extra?.titleHint?.trim() || fallbackTitle;
      const description = mode === 'ai'
        ? `AI 生成：${aiPrompt || ''}`
        : `${cols}×${rows} 手工创作`;

      // 与 DesignDetailScreen 期望保持一致：直接序列化 grid 二维数组
      const designData = JSON.stringify(grid);

      if (savedDesignIdRef.current) {
        await designApi.update(savedDesignIdRef.current, {
          title,
          description,
          category: '抽象',
          designData,
          ...(extra?.status ? { status: extra.status } : {}),
        });
        return savedDesignIdRef.current;
      }

      const created = await designApi.create({ title, description, category: '抽象' });
      const id = created.data?.id;
      if (!id) throw new Error('创建作品失败');
      // 创建后立即写入 designData（create 接口不接受 designData）
      await designApi.update(id, {
        title,
        description,
        category: '抽象',
        designData,
        ...(extra?.status ? { status: extra.status } : {}),
      });
      savedDesignIdRef.current = id;
      return id;
    })();
    persistQueueRef.current = next;
    return next;
  }, [aiPrompt, cols, grid, mode, rows]);

  const fallbackTitleForMode = useCallback(() => {
    return mode === 'ai' ? `AI：${aiPrompt || '创意图案'}` : '我的创作';
  }, [mode, aiPrompt]);

  const handleSave = useCallback(() => {
    if (stats.beadCount === 0) { Alert.alert('提示', '画布是空的，先画点什么吧'); return; }

    // 动态构建菜单：
    //   - 保存项：仅当从未保存 / 自上次保存后有新改动时才显示
    //   - 发布到动态 / 发现页：本次会话发过的不再列出，避免重复入库
    type Btn = { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' };
    const buttons: Btn[] = [];

    const showSaveOption = !hasSaved || dirtySinceSave;
    if (showSaveOption) {
      const saveLabel = hasSaved ? '更新到我的作品' : '保存到我的作品';
      buttons.push({ text: saveLabel, onPress: async () => {
        try {
          await persistDesign();
          setHasSaved(true);
          setDirtySinceSave(false);
          setPublishResult({
            variant: 'save',
            title: fallbackTitleForMode(),
            cols, rows,
            beadCount: stats.beadCount,
            colorCount: stats.colorCount,
          });
        } catch (e: any) {
          Alert.alert('保存失败', e?.message || '请检查登录状态后重试');
        }
      }});
    }

    if (!hasPublishedToFeed) {
      buttons.push({ text: '发布到动态', onPress: async () => {
        try {
          const designId = await persistDesign({ status: 'PUBLISHED' });
          const fallbackContent = mode === 'ai' ? `AI 生成：${aiPrompt || ''}` : `分享我的拼豆作品（${cols}×${rows}）`;
          await feedApi.create({ content: fallbackContent.trim(), designId });
          setHasPublishedToFeed(true);
          setHasSaved(true);
          setDirtySinceSave(false);
          setPublishResult({
            variant: 'feed',
            title: fallbackTitleForMode(),
            cols, rows,
            beadCount: stats.beadCount,
            colorCount: stats.colorCount,
          });
        } catch (e: any) {
          Alert.alert('发布失败', e?.message || '请检查登录状态后重试');
        }
      }});
    }

    if (!hasPublishedToPattern) {
      buttons.push({ text: '发布资源到发现页', onPress: () => {
        setPubTitle(mode === 'ai' ? aiPrompt || '' : '');
        setPubDesc('');
        setPubPoints('');
        setPubAccessMode('free');
        setShowPublish(true);
      }});
    }

    buttons.push({ text: '取消', style: 'cancel' });

    // 全部完成 → 不弹菜单，给一段「无改动」提示，省得用户再点一次只看到取消
    if (buttons.length === 1) {
      Alert.alert(
        '已完成',
        '本次创作已保存并发布到 动态 / 发现页；继续编辑后再点完成可更新到「我的作品」',
        [{ text: '好的', style: 'cancel' }],
      );
      return;
    }

    // Alert 副标题：告知已发布到哪 + 当前菜单为啥这样
    const published: string[] = [];
    if (hasPublishedToFeed) published.push('动态');
    if (hasPublishedToPattern) published.push('发现页');
    const parts: string[] = [];
    if (published.length > 0) parts.push(`已发布到 ${published.join('、')}`);
    if (hasSaved && !dirtySinceSave) parts.push('当前画布已保存，无新改动');
    const subtitle = parts.length > 0 ? parts.join('；') : '选择操作';

    Alert.alert('完成', subtitle, buttons);
  }, [aiPrompt, cols, dirtySinceSave, fallbackTitleForMode, hasPublishedToFeed, hasPublishedToPattern, hasSaved, mode, persistDesign, rows, stats.beadCount, stats.colorCount]);

  // 顶部「保存草稿」快捷按钮：单击落 DRAFT，无需走完成菜单
  const [savingDraft, setSavingDraft] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState<number | null>(null);
  const saveDraft = useCallback(async (silent = false) => {
    if (savingDraft) return false;
    if (stats.beadCount === 0) {
      if (!silent) Alert.alert('提示', '画布是空的，先画点什么吧');
      return false;
    }
    setSavingDraft(true);
    try {
      // 注意：不传 status —— 已发布的作品被编辑时也用这个按钮，强制 DRAFT 会把它从"已发布"列表挤下去
      // 新建场景下 backend createDesign 默认就是 DRAFT，所以省略也安全
      await persistDesign();
      setHasSaved(true);
      setDirtySinceSave(false);
      setAutoSavedAt(Date.now());
      // 主动让创作首页"继续创作"区块在用户返回时能立刻看到这条草稿
      // （否则 useFocusEffect 的 fetch 可能比当前的 save HTTP 先完成，看不见刚保存的）
      void useDesignStore.getState().loadRecentDrafts();
      if (!silent) {
        setPublishResult({
          variant: 'draft',
          title: fallbackTitleForMode(),
          cols, rows,
          beadCount: stats.beadCount,
          colorCount: stats.colorCount,
        });
      }
      return true;
    } catch (e: any) {
      if (!silent) Alert.alert('保存失败', e?.message || '请检查登录状态后重试');
      return false;
    } finally {
      setSavingDraft(false);
    }
  }, [cols, fallbackTitleForMode, persistDesign, rows, savingDraft, stats.beadCount, stats.colorCount]);

  // —— 自动保存：脏 30s 后静默落 DRAFT；切后台立即落
  const AUTO_SAVE_MS = 30_000;
  const saveDraftRef = useRef(saveDraft);
  saveDraftRef.current = saveDraft;
  const dirtyRef = useRef(dirtySinceSave);
  dirtyRef.current = dirtySinceSave;

  useEffect(() => {
    if (!dirtySinceSave) return;
    const t = setTimeout(() => {
      void saveDraftRef.current(true /* silent */);
    }, AUTO_SAVE_MS);
    return () => clearTimeout(t);
  }, [dirtySinceSave, grid]);

  // 切到后台 → 强制落一次
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if ((next === 'background' || next === 'inactive') && dirtyRef.current) {
        void saveDraftRef.current(true /* silent */);
      }
    });
    return () => sub.remove();
  }, []);

  // 离开编辑器（unmount）时若仍有未保存改动，兜底再保存一次
  // AppState 不会捕获到应用内的 navigation.goBack，必须靠这条
  useEffect(() => {
    return () => {
      if (dirtyRef.current) {
        // 不能 await unmount cleanup，best-effort 即可
        void saveDraftRef.current(true);
      }
    };
  }, []);

  // 顶部"已自动保存 N 秒前"指示
  const [, tickRender] = useState(0);
  useEffect(() => {
    if (!autoSavedAt) return;
    const t = setInterval(() => tickRender((v) => v + 1), 15_000);
    return () => clearInterval(t);
  }, [autoSavedAt]);

  const autoSavedHint = useMemo(() => {
    if (!autoSavedAt) return '';
    const sec = Math.floor((Date.now() - autoSavedAt) / 1000);
    if (sec < 60) return '已保存 · 刚刚';
    const min = Math.floor(sec / 60);
    if (min < 60) return `已保存 · ${min} 分钟前`;
    return '已保存 · 较早';
  }, [autoSavedAt]);

  const handlePublish = useCallback(async () => {
    if (!pubTitle.trim()) { Alert.alert('提示', '请输入资源标题'); return; }
    const pointsCost = pubAccessMode === 'points' ? Math.max(0, parseInt(pubPoints, 10) || 0) : 0;
    if (pubAccessMode === 'points' && pointsCost <= 0) {
      Alert.alert('提示', '请输入有效的积分数量');
      return;
    }
    try {
      const newId = await publishPattern({
        title: pubTitle.trim(),
        author: '我',
        authorId: 1,
        patIdx: 0,
        cat: pubCat,
        cols,
        rows,
        desc: pubDesc.trim() || `${cols}×${rows} 拼豆资源`,
        gridData: grid,
        accessMode: pubAccessMode,
        pointsCost,
      });
      setShowPublish(false);
      if (newId === -1) {
        Alert.alert('发布失败', '请检查登录状态后重试');
        return;
      }
      setHasPublishedToPattern(true);
      // 注意：发现页路径走的是 t_pattern_listing.previewData，并未写 t_design，
      //       所以这里不更新 hasSaved/dirtySinceSave —— 用户可能还想把 design 落到自己的作品里
      setPublishResult({
        variant: 'pattern',
        title: pubTitle.trim(),
        cols, rows,
        beadCount: stats.beadCount,
        colorCount: stats.colorCount,
      });
    } catch (e: any) {
      setShowPublish(false);
      Alert.alert('发布失败', e?.message || '请稍后重试');
    }
  }, [pubTitle, pubDesc, pubPoints, pubCat, pubAccessMode, cols, rows, grid, publishPattern, stats.beadCount, stats.colorCount]);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* ── 顶部导航 ── */}
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={() => navigation.goBack()} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </HoverView>
        <Text style={[$.navTitle, { color: colors.text }]} numberOfLines={1}>{MODE_TITLES[mode]}</Text>
        <View style={$.navActions}>
          <NavAction icon="corner-up-left" onPress={undo} disabled={!history.length} colors={colors} />
          <NavAction icon="corner-up-right" onPress={redo} disabled={!future.length} colors={colors} />
          <HoverView
            onPress={() => { void saveDraft(false); }}
            style={[$.draftBtn, { backgroundColor: dirtySinceSave ? colors.gold : colors.inputBg, opacity: savingDraft ? 0.6 : 1 }]}
            hoverScale={1.05}
            hoverLift={0}
          >
            {savingDraft
              ? <ActivityIndicator size="small" color={dirtySinceSave ? '#fff' : colors.text} />
              : <Feather name="save" size={fp(14)} color={dirtySinceSave ? '#fff' : colors.text} />}
            <Text style={[$.draftBtnText, { color: dirtySinceSave ? '#fff' : colors.text }]}>
              {savingDraft ? '保存中' : (hasSaved && !dirtySinceSave ? '已保存' : '草稿')}
            </Text>
          </HoverView>
        </View>
      </View>

      {/* ── 自动保存指示条 ── */}
      {autoSavedHint && !dirtySinceSave ? (
        <View style={[$.savedHint, { backgroundColor: colors.inputBg }]}>
          <Feather name="cloud" size={fp(11)} color={colors.success} />
          <Text style={[$.savedHintText, { color: colors.textSecondary }]}>{autoSavedHint}</Text>
        </View>
      ) : null}

      {/* ── AI 输入面板 ── */}
      {showAiInput && (
        <View style={[$.aiPanel, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[$.aiIconWrap, { backgroundColor: useRealApi ? '#8B5CF6' : '#6B7280' }]}>
            <Feather name={useRealApi ? 'cpu' : 'cpu'} size={fp(18)} color="#fff" />
          </View>
          <TextInput
            style={[$.aiInput, { backgroundColor: colors.inputBg, color: colors.text }]}
            placeholder="描述你想要的图案，如：可爱的小猫咪"
            placeholderTextColor={colors.textHint}
            value={aiPrompt}
            onChangeText={setAiPrompt}
            onSubmitEditing={handleAiGenerate}
            returnKeyType="go"
          />
          <HoverView
            onPress={handleAiGenerate}
            style={[$.aiGenBtn, { backgroundColor: aiPrompt.trim() ? '#8B5CF6' : colors.inputBg }]}
            hoverScale={1.05} hoverLift={1}
          >
            <Feather name="zap" size={fp(14)} color={aiPrompt.trim() ? '#fff' : colors.textHint} />
          </HoverView>
        </View>
      )}
      {/* AI 状态提示 */}
      {showAiInput && (
        <View style={[$.aiHintBar, { backgroundColor: colors.surface }]}>
          <View style={[$.aiDot, { backgroundColor: useRealApi ? '#22C55E' : '#FBBF24' }]} />
          <Text style={[$.aiHintText, { color: colors.textHint }]}>
            {useRealApi ? '已连接 AI 服务' : '未配置 API Key，将使用本地图案'}
          </Text>
        </View>
      )}
      {/* 生成错误提示 */}
      {genError ? (
        <View style={[$.errorBar, { backgroundColor: dark ? '#3a2020' : '#FEF2F2' }]}>
          <Feather name="alert-circle" size={fp(12)} color={colors.error} />
          <Text style={[$.errorText, { color: colors.error }]}>{genError}</Text>
        </View>
      ) : null}

      {/* ── 生成中遮罩 ── */}
      {generating && (
        <View style={$.genOverlay}>
          <View style={[$.genCard, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[$.genText, { color: colors.text }]}>
              {mode === 'image'
                ? (aiEnhance ? 'AI 卡通化中... 约 20-30 秒' : '正在解析图片...')
                : 'AI 创作中...'}
            </Text>
            <View style={$.genDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[$.genDot, { backgroundColor: colors.accent, opacity: 0.3 + i * 0.3 }]} />
              ))}
            </View>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={scrollEnabled} contentContainerStyle={{ paddingBottom: wp(90) }}>
        {/* ── 画布信息栏 ── */}
        <View style={[$.infoBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <InfoChip icon="grid" text={`${cols}×${rows}`} colors={colors} />
          <InfoChip icon="circle" text={`${stats.beadCount} 颗`} colors={colors} />
          <InfoChip icon="droplet" text={`${stats.colorCount} 色`} colors={colors} />
          <View style={{ flex: 1 }} />
          <HoverView onPress={() => setShowGridLine(!showGridLine)} style={[$.infoBtn, { backgroundColor: showGridLine ? colors.accentLight : colors.inputBg }]} hoverScale={1.05} hoverLift={0}>
            <Feather name="grid" size={fp(12)} color={showGridLine ? colors.accent : colors.textHint} />
          </HoverView>
          <HoverView onPress={clearCanvas} style={[$.infoBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.05} hoverLift={0}>
            <Feather name="trash-2" size={fp(12)} color={colors.error} />
          </HoverView>
          {mode === 'ai' && !showAiInput && (
            <HoverView onPress={() => setShowAiInput(true)} style={[$.infoBtn, { backgroundColor: dark ? '#2a1e4a' : '#F3E8FF' }]} hoverScale={1.05} hoverLift={0}>
              <Feather name="refresh-cw" size={fp(12)} color="#8B5CF6" />
            </HoverView>
          )}
          {mode === 'image' && !generating && lastImageUri && (
            <HoverView
              onPress={() => setSourcePreviewOpen(true)}
              style={[$.infoBtn, { backgroundColor: dark ? '#252a3a' : '#EFF6FF' }]}
              hoverScale={1.05} hoverLift={0}
            >
              <Feather name="eye" size={fp(12)} color="#3B82F6" />
            </HoverView>
          )}
          {mode === 'image' && !generating && lastImageUri && (
            <HoverView
              onPress={() => { void regenerateFromCache(); }}
              style={[$.infoBtn, { backgroundColor: dark ? '#3a2a1d' : '#FEF3C7' }]}
              hoverScale={1.05} hoverLift={0}
            >
              <Feather name="refresh-cw" size={fp(12)} color="#F59E0B" />
            </HoverView>
          )}
          {mode === 'image' && !generating && (
            <HoverView
              onPress={() => { void pickAndConvertImage(false); }}
              style={[$.infoBtn, { backgroundColor: dark ? '#1d3a2a' : '#ECFDF5' }]}
              hoverScale={1.05} hoverLift={0}
            >
              <Feather name="image" size={fp(12)} color="#22C55E" />
            </HoverView>
          )}
        </View>

        {/* ── 画布 ── */}
        <View
          ref={canvasRef}
          onLayout={() => {
            canvasRef.current?.measureInWindow((x, y) => {
              canvasLayoutRef.current = { x, y };
            });
          }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleTouchStart}
          onResponderMove={handleTouchMove}
          onResponderRelease={handleTouchEnd}
          style={[$.canvasWrap, { backgroundColor: dark ? '#1a1a1a' : '#f0f0f0' }]}
        >
          <CanvasGrid
            grid={grid}
            cellSize={cellSize}
            gap={gap}
            colors={colors}
          />
        </View>

        {/* ── 当前颜色 + 工具提示 ── */}
        <View style={[$.colorBar, { borderColor: colors.border }]}>
          <View style={[$.currentDot, { backgroundColor: color }]} />
          <Text style={[$.currentHex, { color: colors.textSecondary }]}>{color.toUpperCase()}</Text>
          <View style={{ flex: 1 }} />
          <Text style={[$.toolHint, { color: colors.textHint }]}>
            {tool === 'pen' ? '点击或拖拽绘制' : tool === 'eraser' ? '拖拽擦除珠子' : tool === 'fill' ? '点击区域填充' : '点击拾取颜色'}
          </Text>
        </View>

        {/* ── AI 增强开关（仅 image 模式可见，影响"换一张图"行为）── */}
        {mode === 'image' && (
          <View style={[$.aiEnhanceBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[$.aiEnhanceIcon, { backgroundColor: aiEnhance ? '#8B5CF6' : colors.inputBg }]}>
              <Feather name="zap" size={fp(13)} color={aiEnhance ? '#fff' : colors.textHint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[$.aiEnhanceTitle, { color: colors.text }]}>AI 增强</Text>
              <Text style={[$.aiEnhanceDesc, { color: colors.textHint }]} numberOfLines={2}>
                {aiEnhance
                  ? 'AI 先把图卡通化再转拼豆，质量更好（人像 / 复杂背景推荐），慢 20-30 秒'
                  : '直接走本地算法，即时返回（适合卡通图 / 风景）'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => { hapticSelection(); setAiEnhance(!aiEnhance); }}
              style={[
                $.aiEnhanceToggle,
                { backgroundColor: aiEnhance ? '#8B5CF6' : colors.inputBg },
              ]}
            >
              <View style={[
                $.aiEnhanceToggleThumb,
                { transform: [{ translateX: aiEnhance ? wp(16) : 0 }] },
              ]} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── AI 风格预设（仅 image 模式 + AI 增强开启时显示）── */}
        {mode === 'image' && aiEnhance && (
          <View style={$.styleBar}>
            <Text style={[$.styleBarLabel, { color: colors.textSecondary }]}>风格</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={$.styleChipRow}
            >
              {STYLE_OPTIONS.map((opt) => {
                const active = stylePreset === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.75}
                    onPress={() => { hapticSelection(); setStylePreset(opt.key); }}
                    style={[
                      $.styleChip,
                      {
                        backgroundColor: active ? '#8B5CF6' : colors.inputBg,
                        borderColor: active ? '#8B5CF6' : colors.border,
                      },
                    ]}
                  >
                    <Text style={[$.styleChipLabel, { color: active ? '#fff' : colors.text }]}>
                      {opt.label}
                    </Text>
                    <Text style={[$.styleChipDesc, { color: active ? 'rgba(255,255,255,0.85)' : colors.textHint }]} numberOfLines={1}>
                      {opt.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── 调色板 ── */}
        <View style={$.section}>
          <View style={$.paletteHeader}>
            <Text style={[$.secLabel, { color: colors.textSecondary }]}>调色板</Text>
            <View style={$.palettePresetRow}>
              {PALETTE_OPTIONS.map((opt) => {
                const active = paletteKey === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.75}
                    onPress={() => { hapticSelection(); setPaletteKey(opt.key); }}
                    style={[
                      $.palettePresetChip,
                      {
                        backgroundColor: active ? colors.accent : colors.inputBg,
                        borderColor: active ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text style={[$.palettePresetText, { color: active ? '#fff' : colors.textSecondary }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {PALETTE_ROWS.map((row, ri) => (
            <View key={ri} style={$.paletteRow}>
              {row.map((c) => (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.6}
                  onPress={() => { hapticSelection(); setColor(c); if (tool === 'eraser') setTool('pen'); }}
                  style={[
                    $.paletteCell,
                    { backgroundColor: c },
                    c === color && $.paletteCellActive,
                    c === color && { borderColor: colors.accent },
                  ]}
                >
                  {c === color && <Feather name="check" size={fp(10)} color={isLightColor(c) ? '#333' : '#fff'} />}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── 底部工具栏 ── */}
      <View style={[$.toolbar, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
        {TOOLS.map((t) => (
          <ToolBtn key={t.key} icon={t.icon} label={t.label} active={tool === t.key} colors={colors} onPress={() => { hapticSelection(); setTool(t.key); }} />
        ))}
        <View style={{ flex: 1 }} />
        <HoverView onPress={handleSave} style={[$.saveBtn, { backgroundColor: colors.accent }]} hoverScale={1.03} hoverLift={2}>
          <Feather name="check" size={fp(14)} color="#fff" />
          <Text style={$.saveBtnText}>完成</Text>
        </HoverView>
      </View>

      {/* ── 原图预览全屏 modal ── */}
      <Modal
        visible={sourcePreviewOpen && !!lastImageUri}
        transparent
        animationType="fade"
        onRequestClose={() => setSourcePreviewOpen(false)}
      >
        <TouchableOpacity
          style={$.sourcePreviewOverlay}
          activeOpacity={1}
          onPress={() => setSourcePreviewOpen(false)}
        >
          {lastImageUri ? (
            <Image
              source={{ uri: lastImageUri }}
              style={$.sourcePreviewImage}
              resizeMode="contain"
            />
          ) : null}
          <View style={$.sourcePreviewHint}>
            <Feather name="x" size={fp(14)} color="#fff" />
            <Text style={$.sourcePreviewHintText}>点击空白处关闭</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── 发布资源弹窗 ── */}
      <Modal visible={showPublish} animationType="fade" transparent onRequestClose={() => setShowPublish(false)}>
        <TouchableOpacity style={$.pubOverlay} activeOpacity={1} onPress={() => setShowPublish(false)}>
          <View style={[$.pubSheet, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <Text style={[$.pubTitle, { color: colors.text }]}>发布资源到发现页</Text>

            <Text style={[$.pubLabel, { color: colors.textSecondary }]}>标题</Text>
            <TextInput style={[$.pubInput, { backgroundColor: colors.inputBg, color: colors.text }]}
              placeholder="给你的资源起个名字" placeholderTextColor={colors.textHint}
              value={pubTitle} onChangeText={setPubTitle} maxLength={20} />

            <Text style={[$.pubLabel, { color: colors.textSecondary }]}>描述</Text>
            <TextInput style={[$.pubInput, $.pubInputMulti, { backgroundColor: colors.inputBg, color: colors.text }]}
              placeholder="简单描述你的资源（选填）" placeholderTextColor={colors.textHint}
              value={pubDesc} onChangeText={setPubDesc} multiline maxLength={100} />

            <Text style={[$.pubLabel, { color: colors.textSecondary }]}>分类</Text>
            <View style={$.pubCatRow}>
              {['抽象', '动物', '卡通', '花卉', '美食', '像素'].map((c) => (
                <TouchableOpacity key={c} activeOpacity={0.7} onPress={() => setPubCat(c)}
                  style={[$.pubCatChip, { backgroundColor: pubCat === c ? colors.accent : colors.inputBg }]}>
                  <Text style={{ fontSize: fp(11), fontWeight: '500', color: pubCat === c ? '#fff' : colors.textSecondary }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[$.pubLabel, { color: colors.textSecondary }]}>获取方式</Text>
            <View style={$.pubAccessRow}>
              {[
                { key: 'free', label: '免费' },
                { key: 'points', label: '积分获取' },
                { key: 'member', label: '会员可得' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.7}
                  onPress={() => setPubAccessMode(item.key as 'free' | 'points' | 'member')}
                  style={[$.pubPriceOpt, { backgroundColor: pubAccessMode === item.key ? colors.accent : colors.inputBg }]}
                >
                  <Text style={{ fontSize: fp(12), fontWeight: '600', color: pubAccessMode === item.key ? '#fff' : colors.textSecondary }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {pubAccessMode === 'points' && (
              <>
                <Text style={[$.pubLabel, { color: colors.textSecondary }]}>积分数量</Text>
                <View style={$.pubPriceRow}>
                  <TextInput style={[$.pubPriceInput, { backgroundColor: colors.inputBg, color: colors.text }]}
                    placeholder="输入积分" placeholderTextColor={colors.textHint}
                    value={pubPoints} onChangeText={setPubPoints} keyboardType="numeric" />
                  <Text style={[$.pubPriceUnit, { color: colors.textHint }]}>积分</Text>
                </View>
              </>
            )}

            <View style={$.pubInfo}>
              <Feather name="info" size={fp(11)} color={colors.textHint} />
              <Text style={[$.pubInfoT, { color: colors.textHint }]}>资源尺寸 {cols}×{rows}，含 {stats.beadCount} 颗珠子，{stats.colorCount} 种颜色</Text>
            </View>

            <View style={$.pubBtns}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowPublish(false)} style={[$.pubCancelBtn, { borderColor: colors.border }]}>
                <Text style={[$.pubCancelT, { color: colors.textSecondary }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} onPress={handlePublish} style={[$.pubSubmitBtn, { backgroundColor: colors.accent }]}>
                <Feather name="upload" size={fp(14)} color="#fff" />
                <Text style={$.pubSubmitT}>发布</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <PublishResultCard
        data={publishResult}
        onClose={() => setPublishResult(null)}
        onAction={publishResult ? () => {
          // 跳到对应 tab 让用户去看新发布的内容；用户主动点才跳，自动消失不跳
          const targetTab = publishResult.variant === 'feed'
            ? 'Publish'
            : publishResult.variant === 'pattern'
              ? 'Home'
              : 'Profile';
          navigation.navigate('Main' as any, { screen: targetTab } as any);
        } : undefined}
      />
    </SafeAreaView>
  );
};

/* ──────────────── 判断浅色 ──────────────── */

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}

/* ──────────────── 导航操作按钮 ──────────────── */

const NavAction: React.FC<{ icon: string; onPress: () => void; disabled: boolean; colors: ThemeColors }> = memo(
  ({ icon, onPress, disabled, colors }) => (
    <HoverView onPress={disabled ? undefined : onPress} style={[$.navBtn, { backgroundColor: colors.inputBg, opacity: disabled ? 0.3 : 1 }]} hoverScale={1.1} hoverLift={0}>
      <Feather name={icon as any} size={fp(16)} color={colors.text} />
    </HoverView>
  ),
);

/* ──────────────── 信息条标签 ──────────────── */

const InfoChip: React.FC<{ icon: string; text: string; colors: ThemeColors }> = ({ icon, text, colors }) => (
  <View style={$.infoChip}>
    <Feather name={icon as any} size={fp(10)} color={colors.textHint} />
    <Text style={[$.infoText, { color: colors.textSecondary }]}>{text}</Text>
  </View>
);

/* ──────────────── 画布网格（纯渲染） ──────────────── */

const CanvasGrid: React.FC<{
  grid: string[][]; cellSize: number; gap: number; colors: ThemeColors;
}> = memo(({ grid, cellSize, gap, colors }) => {
  const r = cellSize / 2;
  const hlSize = Math.max(cellSize * 0.28, 2);
  const hlOff = Math.max(cellSize * 0.15, 1);

  return (
    <View style={{ alignItems: 'center', gap }}>
      {grid.map((row, y) => (
        <View key={y} style={{ flexDirection: 'row', gap }}>
          {row.map((c, x) => {
            const empty = c === 'transparent';
            return (
              <View
                key={x}
                style={[
                  { width: cellSize, height: cellSize, borderRadius: r },
                  empty
                    ? { borderWidth: 0.5, borderColor: colors.border }
                    : {
                        backgroundColor: c,
                        ...(Platform.OS === 'web'
                          ? { boxShadow: '0 0.5px 1px rgba(0,0,0,0.12)' }
                          : { shadowColor: '#000', shadowOffset: { width: 0, height: 0.5 }, shadowOpacity: 0.12, shadowRadius: 0.5 }
                        ) as any,
                      },
                ]}
              >
                {!empty && cellSize >= 6 && (
                  <View style={{
                    position: 'absolute', top: hlOff, left: hlOff,
                    width: hlSize, height: hlSize, borderRadius: hlSize / 2,
                    backgroundColor: 'rgba(255,255,255,0.4)',
                  }} />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
});

/* ──────────────── 工具按钮 ──────────────── */

const ToolBtn: React.FC<{
  icon: string; label: string; active: boolean; colors: ThemeColors; onPress: () => void;
}> = memo(({ icon, label, active, colors, onPress }) => (
  <HoverView
    onPress={onPress}
    style={[$.toolBtn, { backgroundColor: active ? colors.accent : colors.inputBg }]}
    hoverScale={1.08} hoverLift={1}
  >
    <Feather name={icon as any} size={fp(16)} color={active ? '#fff' : colors.textSecondary} />
    <Text style={[$.toolLabel, { color: active ? '#fff' : colors.textHint }]}>{label}</Text>
  </HoverView>
));

/* ──────────────── 样式 ──────────────── */

const $ = StyleSheet.create({
  root: { flex: 1 },

  nav: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(50), paddingHorizontal: PAD,
    borderBottomWidth: 1, gap: wp(10),
  },
  navTitle: { flex: 1, fontSize: fp(16), fontWeight: '600' },
  navBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    justifyContent: 'center', alignItems: 'center',
  },
  navActions: { flexDirection: 'row', gap: wp(6), alignItems: 'center' },
  draftBtn: {
    flexDirection: 'row', alignItems: 'center', gap: wp(4),
    paddingHorizontal: wp(10), height: wp(34), borderRadius: wp(17),
  },
  draftBtnText: { fontSize: fp(12), fontWeight: '600' },
  savedHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: wp(4), paddingVertical: wp(4),
  },
  savedHintText: { fontSize: fp(10), fontWeight: '500' },

  // AI
  aiPanel: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, paddingVertical: wp(10),
    borderBottomWidth: 1, gap: wp(10),
  },
  aiIconWrap: {
    width: wp(36), height: wp(36), borderRadius: wp(10),
    justifyContent: 'center', alignItems: 'center',
  },
  aiInput: {
    flex: 1, height: wp(36), borderRadius: BorderRadius.md,
    paddingHorizontal: wp(12), fontSize: FontSize.md,
  },
  aiGenBtn: {
    width: wp(36), height: wp(36), borderRadius: wp(10),
    justifyContent: 'center', alignItems: 'center',
  },

  // AI 提示
  aiHintBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, paddingVertical: wp(6), gap: wp(6),
  },
  aiDot: { width: wp(6), height: wp(6), borderRadius: wp(3) },
  aiHintText: { fontSize: fp(11) },
  errorBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: PAD, marginTop: wp(6),
    paddingHorizontal: wp(10), paddingVertical: wp(6),
    borderRadius: BorderRadius.md, gap: wp(6),
  },
  errorText: { fontSize: fp(11) },

  // 生成遮罩
  genOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 100,
  },
  genCard: {
    paddingHorizontal: wp(40), paddingVertical: wp(30),
    borderRadius: BorderRadius.xl,
    alignItems: 'center', gap: wp(14),
    ...shadow(4, 16, 0.15, '#000', 6),
  },
  genText: { fontSize: FontSize.lg, fontWeight: '600' },
  genDots: { flexDirection: 'row', gap: wp(6) },
  genDot: { width: wp(6), height: wp(6), borderRadius: wp(3) },

  // 信息栏
  infoBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, paddingVertical: wp(8),
    borderBottomWidth: 1, gap: wp(6),
  },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: wp(4),
    paddingHorizontal: wp(8), paddingVertical: wp(4),
    borderRadius: wp(10),
  },
  infoText: { fontSize: FontSize.xs },
  infoBtn: {
    width: wp(28), height: wp(28), borderRadius: wp(7),
    justifyContent: 'center', alignItems: 'center',
  },

  // 画布
  canvasWrap: {
    margin: PAD, borderRadius: BorderRadius.lg,
    padding: wp(12), alignItems: 'center', justifyContent: 'center',
    ...shadow(2, 8, 0.06, '#000', 2),
  },

  // 当前颜色栏
  colorBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: PAD, paddingVertical: wp(8),
    paddingHorizontal: wp(4),
    gap: wp(8),
  },
  currentDot: {
    width: wp(20), height: wp(20), borderRadius: wp(5),
    ...shadow(0, 1, 0.1, '#000', 1),
  },
  currentHex: {
    fontSize: FontSize.xs, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  toolHint: { fontSize: FontSize.xs },

  // AI 增强栏（仅 image 模式显示）
  aiEnhanceBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: PAD, marginTop: wp(8),
    padding: wp(10), borderRadius: BorderRadius.md,
    borderWidth: 1, gap: wp(10),
  },
  aiEnhanceIcon: {
    width: wp(28), height: wp(28), borderRadius: wp(8),
    justifyContent: 'center', alignItems: 'center',
  },
  aiEnhanceTitle: { fontSize: fp(13), fontWeight: '700' },
  aiEnhanceDesc: { fontSize: fp(10), marginTop: wp(2), lineHeight: fp(14) },
  aiEnhanceToggle: {
    width: wp(36), height: wp(20), borderRadius: wp(10),
    padding: 2, justifyContent: 'center',
  },
  aiEnhanceToggleThumb: {
    width: wp(16), height: wp(16), borderRadius: wp(8),
    backgroundColor: '#fff',
  },

  // AI 风格预设栏
  styleBar: {
    marginHorizontal: PAD, marginTop: wp(8),
  },
  styleBarLabel: { fontSize: fp(11), fontWeight: '600', marginBottom: wp(6) },
  styleChipRow: { gap: wp(8), paddingRight: wp(8) },
  styleChip: {
    paddingHorizontal: wp(12), paddingVertical: wp(8),
    borderRadius: BorderRadius.md, borderWidth: 1,
    minWidth: wp(80),
  },
  styleChipLabel: { fontSize: fp(12), fontWeight: '700' },
  styleChipDesc: { fontSize: fp(9), marginTop: wp(2) },

  // 调色板
  section: { paddingHorizontal: PAD, marginTop: wp(4) },
  secLabel: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: wp(8) },
  paletteHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: wp(8),
  },
  palettePresetRow: { flexDirection: 'row', gap: wp(6) },
  palettePresetChip: {
    paddingHorizontal: wp(10), paddingVertical: wp(4),
    borderRadius: wp(10), borderWidth: 1,
  },
  palettePresetText: { fontSize: fp(11), fontWeight: '600' },
  paletteRow: {
    flexDirection: 'row', gap: wp(8), marginBottom: wp(8),
  },
  paletteCell: {
    flex: 1, aspectRatio: 1, borderRadius: wp(8),
    justifyContent: 'center', alignItems: 'center',
    maxWidth: wp(42),
    ...shadow(0, 1, 0.08, '#000', 1),
  },
  paletteCellActive: {
    borderWidth: 2.5,
    transform: [{ scale: 1.1 }],
  },

  // 底部工具栏
  toolbar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, paddingTop: wp(8),
    paddingBottom: Math.max(BOTTOM_SAFE_H, wp(8)),
    borderTopWidth: 1, gap: wp(6),
  },
  toolBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: wp(12), paddingVertical: wp(8),
    borderRadius: BorderRadius.md, gap: wp(2),
  },
  toolLabel: { fontSize: fp(9), fontWeight: '500' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: wp(20), paddingVertical: wp(10),
    borderRadius: BorderRadius.full, gap: wp(6),
    ...shadow(2, 6, 0.15, '#4b78ff', 3),
  },
  saveBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },

  // 原图预览
  sourcePreviewOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  sourcePreviewImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  sourcePreviewHint: {
    position: 'absolute', bottom: wp(40),
    flexDirection: 'row', alignItems: 'center', gap: wp(6),
    paddingHorizontal: wp(14), paddingVertical: wp(8),
    borderRadius: wp(20),
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sourcePreviewHintText: { color: '#fff', fontSize: fp(11), fontWeight: '500' },

  // 发布弹窗
  pubOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pubSheet: { borderTopLeftRadius: wp(16), borderTopRightRadius: wp(16), padding: wp(20) },
  pubTitle: { fontSize: fp(17), fontWeight: '700', marginBottom: wp(14) },
  pubLabel: { fontSize: fp(12), fontWeight: '600', marginTop: wp(10), marginBottom: wp(6) },
  pubInput: { height: wp(40), borderRadius: wp(10), paddingHorizontal: wp(12), fontSize: fp(14) },
  pubInputMulti: { height: wp(70), paddingTop: wp(10), textAlignVertical: 'top' },
  pubCatRow: { flexDirection: 'row', flexWrap: 'wrap' },
  pubAccessRow: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(8) },
  pubCatChip: { paddingHorizontal: wp(12), paddingVertical: wp(5), borderRadius: wp(12), marginRight: wp(6), marginBottom: wp(6) },
  pubPriceRow: { flexDirection: 'row', alignItems: 'center' },
  pubPriceOpt: { paddingHorizontal: wp(14), paddingVertical: wp(8), borderRadius: wp(10), marginRight: wp(8) },
  pubPriceInput: { flex: 1, height: wp(38), borderRadius: wp(10), paddingHorizontal: wp(12), fontSize: fp(14) },
  pubPriceUnit: { fontSize: fp(13), marginLeft: wp(6) },
  pubInfo: { flexDirection: 'row', alignItems: 'center', marginTop: wp(12) },
  pubInfoT: { fontSize: fp(10), marginLeft: wp(4) },
  pubBtns: { flexDirection: 'row', marginTop: wp(16) },
  pubCancelBtn: { flex: 1, height: wp(44), borderRadius: wp(12), borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: wp(10) },
  pubCancelT: { fontSize: fp(14), fontWeight: '500' },
  pubSubmitBtn: { flex: 2, height: wp(44), borderRadius: wp(12), flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  pubSubmitT: { color: '#fff', fontSize: fp(14), fontWeight: '700', marginLeft: wp(6) },
});
