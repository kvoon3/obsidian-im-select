import { exec } from 'node:child_process'
import type { App, Editor, Setting } from 'obsidian'
import { MarkdownView, Modal, Notice, Plugin, PluginSettingTab } from 'obsidian'
import { DEFAULT_SETTINGS } from './state'
import SampleModal from './components/Modal'
import SettingTab from './components/SettingTab'
import type { PluginSettings, VimMode, VimModeChangeEvt } from './types'

export default class IMPlugin extends Plugin {
  settings: PluginSettings
  cmVersion: 5 | 6 = 6
  lastInsertModeIM: string = ''
  curMode: VimMode | undefined = undefined

  async onload() {
    await this.loadSettings()

    this.setupRibbon()
    this.setupStatusBar()
    this.setupPluginCmd()
    this.setupTimer()
    this.setupSettingTab()

    this.app.workspace.on('file-open', () => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView)
      console.debug('view', view)

      const cmVersion = (this.app as any).commands.editorCommands['editor:toggle-source']
        ? 6
        : 5

      const editor = (
        cmVersion === 6
          ? (view as any).sourceMode?.cmEditor?.cm?.cm
          : (view as any).sourceMode?.cmEditor
      ) as CodeMirror.Editor | undefined

      console.debug('editor', editor)

      if (!editor)
        return

      // @ts-expect-error - obsidian not defined `vim-mode-change` event
      editor.on('vim-mode-change', (modeEvt: VimModeChangeEvt) => {
        console.debug('---------', 'mode event', modeEvt, '---------------')
        console.log('form mode', this.curMode)
        console.log('lastInsertModeIM', this.getLastInsertIM())
        const {
          defaultIM,
          switchCMD,
          obtainCMD,
        } = this.settings
        switch (modeEvt.mode) {
          case 'insert': {
            const lastInsertModeIM = this.getLastInsertIM()
            if (lastInsertModeIM) {
              console.log('exec', switchCMD.replace('{im}', lastInsertModeIM))
              exec(switchCMD.replace('{im}', lastInsertModeIM), (error, stdout, stderr) => {
                if (error || stderr) {
                  console.error('error', error)
                  console.log('stderr', stderr)
                }
              })
            }
            this.curMode = 'insert'
            break
          }
          case 'normal': {
            console.log('exec', obtainCMD)
            if (this.curMode === 'insert') {
              // 时序问题：如何保证 vim mode 变为 normal 前执行
              exec(obtainCMD, (error, stdout, stderr) => {
                if (error || stderr) {
                  console.error('error', error)
                  console.log('stderr', stderr)
                  return
                }

                console.log('stdout', stdout)
                this.setLastInsertIM(stdout)
              })
            }

            console.log('exec', switchCMD.replace('{im}', defaultIM))
            exec(switchCMD.replace('{im}', defaultIM), (error, stdout, stderr) => {
              if (error || stderr) {
                console.error('error', error)
                console.log('stderr', stderr)
              }
            })

            this.curMode = 'normal'
            break
          }
          case 'visual': {
            this.curMode = 'visual'
            break
          }
        }
      })
    })
  }

  onunload() {

  }

  setLastInsertIM(imCode: string) {
    console.log('set last insert im', imCode)
    this.lastInsertModeIM = imCode
  }

  getLastInsertIM() {
    console.log('get last insert im', this.lastInsertModeIM)
    return this.lastInsertModeIM
  }

  async loadSettings() {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...await this.loadData(),
    } as PluginSettings
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  setupRibbon() {
    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon('dice', 'obsidian-im-select', (evt: MouseEvent) => {
      // Called when the user clicks the icon.
      const notice = new Notice('This is a notice!')
      console.debug('notice instance', notice)
      console.debug('event', evt)
    })
    // Perform additional things with the ribbon
    ribbonIconEl.addClass('obsidian-im-select-ribbon-class')
  }

  setupStatusBar() {
    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    const statusBarItemEl = this.addStatusBarItem()
    statusBarItemEl.setText('Status Bar Text')
  }

  setupPluginCmd() {
    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-sample-modal-simple',
      name: 'Open sample modal (simple)',
      callback: () => {
        new SampleModal(this.app).open()
      },
    })
    // This adds an editor command that can perform some operation on the current editor instance
    this.addCommand({
      id: 'sample-editor-command',
      name: 'Sample editor command',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        console.debug(editor.getSelection())
        console.debug('view', view)
        editor.replaceSelection('Sample Editor Command')
      },
    })
    // This adds a complex command that can check whether the current state of the app allows execution of the command
    this.addCommand({
      id: 'open-sample-modal-complex',
      name: 'Open sample modal (complex)',
      checkCallback: (checking: boolean) => {
        // Conditions to check
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (markdownView) {
          // If checking is true, we're simply "checking" if the command can be run.
          // If checking is false, then we want to actually perform the operation.
          if (!checking)
            new SampleModal(this.app).open()

          // This command will only show up in Command Palette when the check function returns true
          return true
        }
      },
    })
  }

  setupSettingTab() {
    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SettingTab(this.app, this))
  }

  setupTimer() {
    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    // this.registerInterval(window.setInterval(() => console.debug('setInterval'), 5 * 60 * 1000))
  }
}
