import type { App } from 'obsidian'
import { PluginSettingTab, Setting } from 'obsidian'
import type IMPlugin from 'src/main'
import { DEFAULT_SETTINGS } from 'src/state'

export default class SettingTab extends PluginSettingTab {
  plugin: IMPlugin

  constructor(app: App, plugin: IMPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl)
      .setName('obtainCMD')
      .setDesc('default input method code')
      .addText(text => text
        .setPlaceholder('')
        .setValue(DEFAULT_SETTINGS.defaultIM)
        .onChange(async (value) => {
          this.plugin.settings.defaultIM = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('obtainCMD')
      .setDesc('path to im-select')
      .addText(text => text
        .setPlaceholder('')
        .setValue(DEFAULT_SETTINGS.obtainCMD)
        .onChange(async (value) => {
          this.plugin.settings.obtainCMD = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('switchCMD')
      .setDesc('command to switch im-select')
      .addText(text => text
        .setPlaceholder('')
        .setValue(DEFAULT_SETTINGS.switchCMD)
        .onChange(async (value) => {
          this.plugin.settings.switchCMD = value
          await this.plugin.saveSettings()
        }))
  }
}
