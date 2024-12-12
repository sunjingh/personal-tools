import type { Preset } from 'unocss'
import {
  defineConfig,
  presetAttributify,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

const presets: Preset[] = [presetUno(), presetAttributify()]

export default defineConfig({
  content: {
    filesystem: ['src/helper/unocss-auto-svg.ts'],
  },
  presets: [...presets],
  /**
   * 自定义快捷语句
   * @see https://github.com/unocss/unocss#shortcuts
   */
  shortcuts: [
    ['center', 'flex justify-center items-center'],
    ['between-center', 'flex justify-between items-center'],
    [
      'btn',
      'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
    ],
    [
      'icon-btn',
      'text-[0.9em] inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600 !outline-none',
    ],
    ['overflow-omit', 'overflow-hidden whitespace-nowrap text-ellipsis'],
  ],
  theme: {
    colors: {
      //  主色
      primary: '#605BFF', // class="text-primary"
      mainBgColor: '#f3f3fb',
      // 功能色
      functional: {
        success: '#52c41a', // 成功  // class="bg-functional-success"
        warning: '#faad14', // 提醒
        risk: '#fd7b4d', // 高危
        error: '#ff4d4f', // 错误
        temporary: '#e8bd4b', // 临时池主色
        posts: '#bd5bff', // 职位晋升主色
      },
      // 提示背景色
      promptBg: {
        warning: '#FFF6ED',
        success: '#F1FFFD',
        error: '#eae0f1',
        grey: '#F9F9F9',
        darkGray: '#E3E6F1',
        primary: '#F6F5FE',
      },
      // 提示文本色
      promptText: {
        warning: '#FAAD14',
        success: '#07B9B9',
        error: '#BD5BFF',
        grey: '#B4B4BF',
        primary: '#605BFF',
        darkGray: '#5D667B',
      },
      // 文本色
      text: {
        primary: '#262626', // 高强调 多用于标题
        regular: '#333333', // 中强调 多用于标题、正文
        secondary: '#5C6268', // 次强调 多用于次级标题
        placeholder: '#cccccc', // 文字 多用于弱化、次要文字
      },
      // 中性色
      neutral: {
        base: '#ffffff', // 背景 多用于背景
        regular: '#f7f7f7', // 视图 多用于次级背景
        dark: '#b8bec8', // 背景色 多用于按钮延期、取消背景色
        dividing: '#f0f0f0', // 分割线 多用于分割线
        stroke: '#d3d9e2', // 描边色 多用于控件、边框颜色
        disable: '#f5f5f5', // 禁用 控件禁用背景色、文本框背景色
        hover: '#f2f5fa', // hover 列表hover背景色
        error: '#FEF1ED',
      },
    },
  },
  transformers: [
    transformerDirectives(), // 启用 @apply 功能
    transformerVariantGroup(), // 启用 () 分组功能
  ],
})
