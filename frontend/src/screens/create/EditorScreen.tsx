import React, { useState, useCallback, useRef, useMemo, useEffect, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput,
  ActivityIndicator, GestureResponderEvent, Alert, Modal, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import type { ThemeColors } from '../../theme';
import { HoverView, ALL_PATTERNS } from '../../components/common';
import type { RootScreenProps } from '../../navigation/types';
import { doubaoGenerate } from '../../api/doubao';
import { usePatternStore } from '../../store/usePatternStore';
import { hapticSelection, hapticLight } from '../../hooks/useFeedback';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const PAD = wp(15);

/* ──────────────── 调色板 — 按色相排列 ──────────────── */

const PALETTE_ROWS: string[][] = [
  ['#EF4444', '#F87171', '#FCA5A5', '#FDA4AF', '#F9A8D4', '#EC4899'],
  ['#F97316', '#FB923C', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
  ['#22C55E', '#16A34A', '#86EFAC', '#0EA5E9', '#7DD3FC', '#3B82F6'],
  ['#8B5CF6', '#A78BFA', '#C4B5FD', '#1E1B2E', '#6B7280', '#FAFAFA'],
];
const PALETTE = PALETTE_ROWS.flat();

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
  const { mode, cols, rows } = route.params;

  /* ---- 生成状态 ---- */
  const [generating, setGenerating] = useState(mode !== 'manual');
  const [genError, setGenError] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(mode === 'ai');
  const useRealApi = true; // API Key 存后端数据库，始终尝试调用

  /* ---- 画布状态 ---- */
  const [grid, setGrid] = useState<string[][]>(() => createEmptyGrid(cols, rows));
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState(PALETTE[0]);
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

  /* ---- 通用生成：尝试豆包 API → 失败回退 mock ---- */
  const doGenerate = useCallback(async (prompt: string) => {
    setGenError('');
    try {
      const result = await doubaoGenerate(prompt, cols, rows, PALETTE);
      if (result) { pushHistory(result); return; }
    } catch (e: any) {
      console.warn('豆包 API 失败，使用 mock:', e?.message);
      setGenError(useRealApi ? '生成失败，已使用本地图案' : '');
    }
    // fallback: mock
    pushHistory(generateMockPattern(cols, rows));
  }, [cols, rows, pushHistory, useRealApi]);

  /* ---- 初始化 ---- */
  useEffect(() => {
    if (mode === 'image') {
      const t = setTimeout(() => { pushHistory(generateMockPattern(cols, rows)); setGenerating(false); }, 1500);
      return () => clearTimeout(t);
    }
    if (mode === 'manual') setGenerating(false);
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

  /* ---- 保存 / 发布 ---- */
  const [showPublish, setShowPublish] = useState(false);
  const [pubTitle, setPubTitle] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubPrice, setPubPrice] = useState('');
  const [pubCat, setPubCat] = useState('抽象');
  const publishPattern = usePatternStore((s) => s.publish);

  const handleSave = useCallback(() => {
    if (stats.beadCount === 0) { Alert.alert('提示', '画布是空的，先画点什么吧'); return; }
    Alert.alert('完成', '选择操作', [
      { text: '保存到我的作品', onPress: () => {
        navigation.navigate('DesignDetail', {
          item: {
            id: Date.now(), userId: 1, authorName: '我',
            title: mode === 'ai' ? `AI：${aiPrompt || '创意图案'}` : '我的创作',
            description: mode === 'ai' ? `AI 生成：${aiPrompt}` : '手工创作的拼豆图纸',
            category: '抽象', coverImage: null, designData: grid,
            status: 'DRAFT', likeCount: 0, viewCount: 0,
            createdAt: new Date().toISOString().slice(0, 10),
          },
        });
      }},
      { text: '发布到图纸市场', onPress: () => {
        setPubTitle(mode === 'ai' ? aiPrompt || '' : '');
        setPubDesc('');
        setPubPrice('');
        setShowPublish(true);
      }},
      { text: '取消', style: 'cancel' },
    ]);
  }, [navigation, grid, mode, aiPrompt, stats.beadCount]);

  const handlePublish = useCallback(() => {
    if (!pubTitle.trim()) { Alert.alert('提示', '请输入图纸标题'); return; }
    const price = parseFloat(pubPrice) || 0;
    publishPattern({
      title: pubTitle.trim(),
      author: '我',
      authorId: 1,
      price,
      free: price <= 0,
      patIdx: 0,
      cat: pubCat,
      cols,
      rows,
      desc: pubDesc.trim() || `${cols}×${rows} 拼豆图纸`,
      gridData: grid,
    });
    setShowPublish(false);
    Alert.alert('发布成功', `「${pubTitle.trim()}」已上架图纸市场`, [
      { text: '查看市场', onPress: () => navigation.navigate('Main' as any, { screen: 'Market' } as any) },
      { text: '继续创作' },
    ]);
  }, [pubTitle, pubDesc, pubPrice, pubCat, cols, rows, grid, publishPattern, navigation]);

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
        </View>
      </View>

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
            {useRealApi ? '已连接豆包 AI' : '未配置 API Key，将使用本地图案'}
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
              {mode === 'image' ? '正在解析图片...' : useRealApi ? '豆包 AI 创作中...' : 'AI 创作中...'}
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

        {/* ── 调色板 ── */}
        <View style={$.section}>
          <Text style={[$.secLabel, { color: colors.textSecondary }]}>调色板</Text>
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

      {/* ── 发布到市场弹窗 ── */}
      <Modal visible={showPublish} animationType="fade" transparent onRequestClose={() => setShowPublish(false)}>
        <Pressable style={$.pubOverlay} onPress={() => setShowPublish(false)}>
          <Pressable style={[$.pubSheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <Text style={[$.pubTitle, { color: colors.text }]}>发布到图纸市场</Text>

            <Text style={[$.pubLabel, { color: colors.textSecondary }]}>标题</Text>
            <TextInput style={[$.pubInput, { backgroundColor: colors.inputBg, color: colors.text }]}
              placeholder="给你的图纸起个名字" placeholderTextColor={colors.textHint}
              value={pubTitle} onChangeText={setPubTitle} maxLength={20} />

            <Text style={[$.pubLabel, { color: colors.textSecondary }]}>描述</Text>
            <TextInput style={[$.pubInput, $.pubInputMulti, { backgroundColor: colors.inputBg, color: colors.text }]}
              placeholder="简单描述你的图纸（选填）" placeholderTextColor={colors.textHint}
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

            <Text style={[$.pubLabel, { color: colors.textSecondary }]}>定价</Text>
            <View style={$.pubPriceRow}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setPubPrice('')}
                style={[$.pubPriceOpt, { backgroundColor: !pubPrice ? colors.accent : colors.inputBg }]}>
                <Text style={{ fontSize: fp(12), fontWeight: '600', color: !pubPrice ? '#fff' : colors.textSecondary }}>免费</Text>
              </TouchableOpacity>
              <TextInput style={[$.pubPriceInput, { backgroundColor: colors.inputBg, color: colors.text }]}
                placeholder="输入价格" placeholderTextColor={colors.textHint}
                value={pubPrice} onChangeText={setPubPrice} keyboardType="numeric" />
              <Text style={[$.pubPriceUnit, { color: colors.textHint }]}>元</Text>
            </View>

            <View style={$.pubInfo}>
              <Feather name="info" size={fp(11)} color={colors.textHint} />
              <Text style={[$.pubInfoT, { color: colors.textHint }]}>图纸尺寸 {cols}×{rows}，含 {stats.beadCount} 颗珠子，{stats.colorCount} 种颜色</Text>
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
          </Pressable>
        </Pressable>
      </Modal>
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
  navActions: { flexDirection: 'row', gap: wp(6) },

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

  // 调色板
  section: { paddingHorizontal: PAD, marginTop: wp(4) },
  secLabel: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: wp(8) },
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

  // 发布弹窗
  pubOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pubSheet: { borderTopLeftRadius: wp(16), borderTopRightRadius: wp(16), padding: wp(20) },
  pubTitle: { fontSize: fp(17), fontWeight: '700', marginBottom: wp(14) },
  pubLabel: { fontSize: fp(12), fontWeight: '600', marginTop: wp(10), marginBottom: wp(6) },
  pubInput: { height: wp(40), borderRadius: wp(10), paddingHorizontal: wp(12), fontSize: fp(14) },
  pubInputMulti: { height: wp(70), paddingTop: wp(10), textAlignVertical: 'top' },
  pubCatRow: { flexDirection: 'row', flexWrap: 'wrap' },
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
