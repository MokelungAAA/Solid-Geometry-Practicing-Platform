/**
 * ThemeManager
 * 主题系统管理
 */

export class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themes = {
      light: {
        name: '浅色',
        colors: {
          primary: '#6200ee',
          onPrimary: '#ffffff',
          primaryContainer: '#e8ddff',
          onPrimaryContainer: '#21005d',
          secondary: '#625b71',
          onSecondary: '#ffffff',
          secondaryContainer: '#e8def8',
          onSecondaryContainer: '#1d192b',
          tertiary: '#7d5260',
          onTertiary: '#ffffff',
          tertiaryContainer: '#ffd8e4',
          onTertiaryContainer: '#31111d',
          error: '#b3261e',
          onError: '#ffffff',
          errorContainer: '#f9dedc',
          onErrorContainer: '#410e0b',
          background: '#fffbfe',
          onBackground: '#1c1b1f',
          surface: '#fffbfe',
          onSurface: '#1c1b1f',
          surfaceVariant: '#e7e0ec',
          onSurfaceVariant: '#49454f',
          outline: '#79747e',
          outlineVariant: '#cac4d0',
          shadow: '#000000',
          scrim: '#000000',
          inverseSurface: '#313033',
          inverseOnSurface: '#f4eff4',
          inversePrimary: '#d0bcff'
        }
      },
      dark: {
        name: '深色',
        colors: {
          primary: '#d0bcff',
          onPrimary: '#381e72',
          primaryContainer: '#4f378b',
          onPrimaryContainer: '#eaddff',
          secondary: '#ccc2dc',
          onSecondary: '#332d41',
          secondaryContainer: '#4a4458',
          onSecondaryContainer: '#e8def8',
          tertiary: '#efb8c8',
          onTertiary: '#492532',
          tertiaryContainer: '#633b48',
          onTertiaryContainer: '#ffd8e4',
          error: '#f2b8b5',
          onError: '#601410',
          errorContainer: '#8c1d18',
          onErrorContainer: '#f9dedc',
          background: '#1c1b1f',
          onBackground: '#e6e1e5',
          surface: '#1c1b1f',
          onSurface: '#e6e1e5',
          surfaceVariant: '#49454f',
          onSurfaceVariant: '#cac4d0',
          outline: '#938f99',
          outlineVariant: '#49454f',
          shadow: '#000000',
          scrim: '#000000',
          inverseSurface: '#e6e1e5',
          inverseOnSurface: '#313033',
          inversePrimary: '#6750a4'
        }
      },
      blue: {
        name: '蓝色',
        colors: {
          primary: '#0061a4',
          onPrimary: '#ffffff',
          primaryContainer: '#d1e4ff',
          onPrimaryContainer: '#001d36',
          secondary: '#535f70',
          onSecondary: '#ffffff',
          secondaryContainer: '#d7e3f7',
          onSecondaryContainer: '#101c2b',
          tertiary: '#6b5778',
          onTertiary: '#ffffff',
          tertiaryContainer: '#f2daff',
          onTertiaryContainer: '#251431',
          error: '#ba1a1a',
          onError: '#ffffff',
          errorContainer: '#ffdad6',
          onErrorContainer: '#410002',
          background: '#fdfcff',
          onBackground: '#1a1c1e',
          surface: '#fdfcff',
          onSurface: '#1a1c1e',
          surfaceVariant: '#dfe2eb',
          onSurfaceVariant: '#43474e',
          outline: '#73777f',
          outlineVariant: '#c3c7cf',
          shadow: '#000000',
          scrim: '#000000',
          inverseSurface: '#2f3033',
          inverseOnSurface: '#f1f0f4',
          inversePrimary: '#9ecaff'
        }
      },
      green: {
        name: '绿色',
        colors: {
          primary: '#386a20',
          onPrimary: '#ffffff',
          primaryContainer: '#b8f397',
          onPrimaryContainer: '#042100',
          secondary: '#55624c',
          onSecondary: '#ffffff',
          secondaryContainer: '#d9e7cb',
          onSecondaryContainer: '#131f0d',
          tertiary: '#386667',
          onTertiary: '#ffffff',
          tertiaryContainer: '#bbebec',
          onTertiaryContainer: '#002021',
          error: '#ba1a1a',
          onError: '#ffffff',
          errorContainer: '#ffdad6',
          onErrorContainer: '#410002',
          background: '#fdfdf5',
          onBackground: '#1a1c18',
          surface: '#fdfdf5',
          onSurface: '#1a1c18',
          surfaceVariant: '#e0e4d6',
          onSurfaceVariant: '#44483d',
          outline: '#74796d',
          outlineVariant: '#c4c8bb',
          shadow: '#000000',
          scrim: '#000000',
          inverseSurface: '#2f312d',
          inverseOnSurface: '#f1f1e9',
          inversePrimary: '#9dd67e'
        }
      }
    };
  }

  setTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return false;
    this.currentTheme = themeName;
    this.applyTheme(theme);
    this.saveToStorage();
    return true;
  }

  applyTheme(theme) {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--md-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-green');
    document.body.classList.add(`theme-${this.currentTheme}`);
  }

  getTheme() {
    return this.themes[this.currentTheme];
  }

  getThemeNames() {
    return Object.keys(this.themes);
  }

  addTheme(name, colors) {
    this.themes[name] = { name, colors };
  }

  removeTheme(name) {
    if (name !== 'light' && name !== 'dark') {
      delete this.themes[name];
      if (this.currentTheme === name) {
        this.setTheme('light');
      }
    }
  }

  toggleDarkMode() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  isDarkMode() {
    return this.currentTheme === 'dark';
  }

  saveToStorage() {
    try {
      localStorage.setItem('solid-geometry-theme', this.currentTheme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }

  loadFromStorage() {
    try {
      const theme = localStorage.getItem('solid-geometry-theme');
      if (theme && this.themes[theme]) {
        this.setTheme(theme);
      }
    } catch (e) {
      console.error('Failed to load theme:', e);
    }
  }

  init() {
    this.loadFromStorage();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!localStorage.getItem('solid-geometry-theme') && prefersDark) {
      this.setTheme('dark');
    }
  }
}
