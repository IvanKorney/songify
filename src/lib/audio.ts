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

export type ClipPlayer = {
  load: (url: string) => Promise<void>
  playClip: (seconds: number) => Promise<void>
  stop: () => void
  dispose: () => void
}

export const createClipPlayer = (): ClipPlayer => {
  let audio: HTMLAudioElement | null = null
  let stopTimer: ReturnType<typeof setTimeout> | null = null
  let loadedUrl: string | null = null

  const stop = () => {
    if (stopTimer) clearTimeout(stopTimer)
    stopTimer = null
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  const dispose = () => {
    stop()
    if (audio) {
      audio.src = ''
      audio = null
    }
    loadedUrl = null
  }

  const load = async (url: string) => {
    if (loadedUrl === url && audio) return
    dispose()
    loadedUrl = url
    audio = new Audio(url)
    audio.preload = 'auto'
    audio.load()
    await Promise.race([waitFor(audio, 'canplaythrough'), waitFor(audio, 'error')])
  }

  const playClip = async (seconds: number) => {
    if (!audio) throw new Error('Audio not loaded')
    if (stopTimer) clearTimeout(stopTimer)
    audio.pause()
    audio.currentTime = 0
    await audio.play()
    stopTimer = setTimeout(() => {
      audio?.pause()
      if (audio) audio.currentTime = 0
    }, Math.max(50, seconds * 1000))
  }

  return { load, playClip, stop, dispose }
}
