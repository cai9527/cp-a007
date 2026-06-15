declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'element-ui' {
  const ElementUI: any
  export default ElementUI
}

declare module 'element-ui/lib/locale/lang/zh-CN' {
  const zhCN: any
  export default zhCN
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
