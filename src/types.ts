export interface PluginSettings {
  mySetting: string
  defaultIM: string
  obtainCMD: string
  switchCMD: string
}

export type VimMode = 'insert' | 'normal' | 'visual'

export interface VimModeChangeEvt {
  mode: VimMode
  submode: string
}
