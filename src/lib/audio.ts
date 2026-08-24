const waitFor = (el: HTMLMediaElement, event: 'canplaythrough' | 'error') =>
  new Promise<void>((resolve, reject) => {
    el.addEventListener(
      event,
      () => {
        if (event === 'error') reject(new Error('Failed to load audio'))
        else resolve()
      },
      { once: true },
    )
  })

export class ClipPlayer {
  private audio: HTMLAudioElement | null = null
  private stopTimer: ReturnType<typeof setTimeout> | null = null
  private url: string | null = null

  async load(url: string) {
    if (this.url === url && this.audio) return
    this.dispose()
    this.url = url
    this.audio = new Audio(url)
    this.audio.preload = 'auto'
    this.audio.load()

    await Promise.race([waitFor(this.audio, 'canplaythrough'), waitFor(this.audio, 'error')])
  }

  async playClip(seconds: number) {
    if (!this.audio) throw new Error('Audio not loaded')
    if (this.stopTimer) clearTimeout(this.stopTimer)
    this.audio.pause()
    this.audio.currentTime = 0
    await this.audio.play()
    this.stopTimer = setTimeout(() => {
      this.audio?.pause()
      if (this.audio) this.audio.currentTime = 0
    }, Math.max(50, seconds * 1000))
  }

  stop() {
    if (this.stopTimer) clearTimeout(this.stopTimer)
    this.stopTimer = null
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }

  dispose() {
    this.stop()
    if (this.audio) {
      this.audio.src = ''
      this.audio = null
    }
    this.url = null
  }
}
