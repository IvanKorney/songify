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
    await new Promise<void>((resolve, reject) => {
      if (!this.audio) return reject(new Error('No audio'))
      const onReady = () => {
        cleanup()
        resolve()
      }
      const onError = () => {
        cleanup()
        reject(new Error('Failed to load audio'))
      }
      const cleanup = () => {
        this.audio?.removeEventListener('canplaythrough', onReady)
        this.audio?.removeEventListener('error', onError)
      }
      this.audio.addEventListener('canplaythrough', onReady)
      this.audio.addEventListener('error', onError)
      void this.audio.load()
    })
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
