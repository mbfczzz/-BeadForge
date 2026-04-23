export type EditorMode = 'manual' | 'image' | 'ai';

export interface CreateSizeOption {
  label: string;
  cols: number;
  rows: number;
  desc: string;
  icon: string;
}

export interface CreateMethodOption {
  key: EditorMode;
  icon: string;
  title: string;
  desc: string;
  color: string;
}

export interface CreateTipOption {
  icon: string;
  title: string;
  desc: string;
  bg: string;
  mode: EditorMode;
}
