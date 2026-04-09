const tintColorLight = '#2f95dc';
const tintColorDark = '#3b82f6'; // primary web color

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#09090b', // main bg from web (zinc-950)
    tint: tintColorDark,
    tabIconDefault: '#71717a',
    tabIconSelected: tintColorDark,
    panel: '#18181b',      // secondary/glass panel
    primary: '#3b82f6',
    warning: '#f59e0b',
    destructive: '#ef4444',
    accent: '#8b5cf6',
    success: '#10b981',
    border: '#27272a',
  },
};
