// 音效管理器
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private musicEnabled: boolean = true;
  
  // 背景音乐相关
  private bgmGainNode: GainNode | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmIsPlaying: boolean = false;
  private bgmLoopTimeout: number | null = null;

  constructor() {
    // 延迟初始化 AudioContext，在用户交互后创建
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      // @ts-ignore - 处理浏览器兼容性
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
    } catch (e) {
      console.warn('Web Audio API 不可用', e);
      this.enabled = false;
    }
  }

  // 在用户交互时初始化音频（移动端必需）
  async initOnUserInteraction(): Promise<void> {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('音频上下文已激活');
      } catch (e) {
        console.warn('无法激活音频上下文', e);
      }
    }
  }

  // 确保音频上下文已启动（需要用户交互）
  private async ensureAudioContext(): Promise<AudioContext | null> {
    if (!this.enabled || !this.audioContext) return null;

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('无法恢复音频上下文', e);
      }
    }

    return this.audioContext;
  }

  // 播放敌人被击毁音效
  async playEnemyKill(): Promise<void> {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 第一层：低频冲击波（爆炸的"轰"声）
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    
    bass.connect(bassGain);
    bassGain.connect(ctx.destination);
    
    bass.type = 'sine';
    bass.frequency.setValueAtTime(120, now);
    bass.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    
    bassGain.gain.setValueAtTime(0.6, now); // 强劲的低音
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    bass.start(now);
    bass.stop(now + 0.15);

    // 第二层：爆裂声（快速的高频噪声）
    const crack = ctx.createOscillator();
    const crackGain = ctx.createGain();
    
    crack.connect(crackGain);
    crackGain.connect(ctx.destination);
    
    crack.type = 'sawtooth';
    crack.frequency.setValueAtTime(2000, now);
    crack.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    
    crackGain.gain.setValueAtTime(0.5, now);
    crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    crack.start(now);
    crack.stop(now + 0.05);

    // 第三层：金属碎片声（高频颤抖）
    const shatter = ctx.createOscillator();
    const shatterGain = ctx.createGain();
    
    shatter.connect(shatterGain);
    shatterGain.connect(ctx.destination);
    
    shatter.type = 'square';
    shatter.frequency.setValueAtTime(3500, now + 0.01);
    shatter.frequency.exponentialRampToValueAtTime(1800, now + 0.06);
    
    shatterGain.gain.setValueAtTime(0.4, now + 0.01);
    shatterGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
    
    shatter.start(now + 0.01);
    shatter.stop(now + 0.06);

    // 第四层：白噪声冲击（模拟爆炸气流）
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.type = 'square';
    noise.frequency.setValueAtTime(80, now);
    
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1000, now);
    noiseFilter.Q.setValueAtTime(0.5, now);
    
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    noise.start(now);
    noise.stop(now + 0.08);

    // 第五层：次声冲击（增强低频感）
    const subBass = ctx.createOscillator();
    const subBassGain = ctx.createGain();
    
    subBass.connect(subBassGain);
    subBassGain.connect(ctx.destination);
    
    subBass.type = 'triangle';
    subBass.frequency.setValueAtTime(60, now);
    subBass.frequency.exponentialRampToValueAtTime(20, now + 0.12);
    
    subBassGain.gain.setValueAtTime(0.5, now);
    subBassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    subBass.start(now);
    subBass.stop(now + 0.12);
  }

  // 播放玩家受伤音效
  async playPlayerHit(): Promise<void> {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 第一层：冲击音（低沉的撞击声）
    const impact = ctx.createOscillator();
    const impactGain = ctx.createGain();
    
    impact.connect(impactGain);
    impactGain.connect(ctx.destination);
    
    impact.type = 'sine';
    impact.frequency.setValueAtTime(200, now);
    impact.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    
    impactGain.gain.setValueAtTime(0.5, now);
    impactGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    impact.start(now);
    impact.stop(now + 0.1);

    // 第二层：尖锐痛感音（表示受伤）
    const pain = ctx.createOscillator();
    const painGain = ctx.createGain();
    
    pain.connect(painGain);
    painGain.connect(ctx.destination);
    
    pain.type = 'sawtooth';
    pain.frequency.setValueAtTime(800, now);
    pain.frequency.linearRampToValueAtTime(400, now + 0.08);
    
    painGain.gain.setValueAtTime(0.4, now);
    painGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    pain.start(now);
    pain.stop(now + 0.08);

    // 第三层：金属变形音（飞机受损）
    const damage = ctx.createOscillator();
    const damageGain = ctx.createGain();
    
    damage.connect(damageGain);
    damageGain.connect(ctx.destination);
    
    damage.type = 'square';
    damage.frequency.setValueAtTime(600, now + 0.02);
    damage.frequency.exponentialRampToValueAtTime(300, now + 0.12);
    
    damageGain.gain.setValueAtTime(0.3, now + 0.02);
    damageGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    damage.start(now + 0.02);
    damage.stop(now + 0.12);
  }

  // 播放拾取护盾音效
  async playPickupShield(): Promise<void> {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 创建两个振荡器，制造和谐音效
    for (let i = 0; i < 2; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      const baseFreq = 600;
      oscillator.frequency.setValueAtTime(baseFreq + i * 200, now);
      oscillator.frequency.linearRampToValueAtTime(baseFreq + i * 200 + 400, now + 0.2);

      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      oscillator.start(now + i * 0.05);
      oscillator.stop(now + 0.25);
    }
  }

  // 播放拾取核弹音效
  async playPickupNuke(): Promise<void> {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.linearRampToValueAtTime(50, now + 0.3);

    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  // 播放拾取导弹音效
  async playPickupMissile(): Promise<void> {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  // 播放拾取救援音效
  async playPickupRescue(): Promise<void> {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 治疗音效：柔和的上升音调
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, now);
    oscillator.frequency.linearRampToValueAtTime(880, now + 0.25);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    oscillator.start(now);
    oscillator.stop(now + 0.25);
  }

  // 启用/禁用音效
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // 获取音效状态
  isEnabled(): boolean {
    return this.enabled;
  }

  // 启用/禁用背景音乐
  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    } else {
      // 如果启用音乐，重新开始播放
      this.playBackgroundMusic();
    }
  }

  // 获取背景音乐状态
  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  // 播放背景音乐
  async playBackgroundMusic(): Promise<void> {
    if (!this.musicEnabled || this.bgmIsPlaying) return;

    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    this.bgmIsPlaying = true;
    this.playBGMLoop(ctx);
  }

  // 停止背景音乐
  stopBackgroundMusic(): void {
    this.bgmIsPlaying = false;
    
    // 停止所有振荡器
    for (const osc of this.bgmOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // 忽略已停止的错误
      }
    }
    this.bgmOscillators = [];

    // 清除循环定时器
    if (this.bgmLoopTimeout !== null) {
      clearTimeout(this.bgmLoopTimeout);
      this.bgmLoopTimeout = null;
    }

    // 断开并重置增益节点
    if (this.bgmGainNode) {
      try {
        this.bgmGainNode.disconnect();
      } catch (e) {
        // 忽略断开连接错误
      }
      this.bgmGainNode = null;
    }
  }

  // 播放一个循环的背景音乐片段
  private playBGMLoop(ctx: AudioContext): void {
    if (!this.bgmIsPlaying || !this.musicEnabled) return;

    // 创建主增益节点控制整体音量
    if (!this.bgmGainNode) {
      this.bgmGainNode = ctx.createGain();
      this.bgmGainNode.gain.setValueAtTime(0.15, ctx.currentTime); // 背景音乐音量较低
      this.bgmGainNode.connect(ctx.destination);
    }

    const now = ctx.currentTime;
    const bpm = 140; // 节拍每分钟
    const beatDuration = 60 / bpm; // 每拍时长（秒）
    const loopDuration = beatDuration * 16; // 16拍一循环

    // 像素风格的和弦进行：C - Am - F - G
    const chordProgression = [
      [261.63, 329.63, 392.00], // C major (C-E-G)
      [220.00, 261.63, 329.63], // A minor (A-C-E)
      [174.61, 220.00, 261.63], // F major (F-A-C)
      [196.00, 246.94, 293.66], // G major (G-B-D)
    ];

    // 贝斯线（低音）
    const bassNotes = [130.81, 110.00, 87.31, 98.00]; // C2, A2, F2, G2

    // 旋律线（简单的像素风旋律）
    const melodyPattern = [
      523.25, 659.25, 523.25, 392.00,  // C5 E5 C5 G4
      440.00, 523.25, 440.00, 329.63,  // A4 C5 A4 E4
      349.23, 440.00, 523.25, 440.00,  // F4 A4 C5 A4
      392.00, 493.88, 587.33, 493.88,  // G4 B4 D5 B4
    ];

    // 播放和弦
    chordProgression.forEach((chord, chordIndex) => {
      const chordStartTime = now + chordIndex * (loopDuration / 4);
      
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square'; // 方波，像素风格
        osc.frequency.setValueAtTime(freq, chordStartTime);
        
        // ADSR 包络
        gain.gain.setValueAtTime(0, chordStartTime);
        gain.gain.linearRampToValueAtTime(0.08, chordStartTime + 0.02); // Attack
        gain.gain.linearRampToValueAtTime(0.05, chordStartTime + 0.1); // Decay
        gain.gain.setValueAtTime(0.05, chordStartTime + loopDuration / 4 - 0.1); // Sustain
        gain.gain.linearRampToValueAtTime(0, chordStartTime + loopDuration / 4); // Release
        
        osc.connect(gain);
        gain.connect(this.bgmGainNode!);
        
        osc.start(chordStartTime);
        osc.stop(chordStartTime + loopDuration / 4);
        
        this.bgmOscillators.push(osc);
      });
    });

    // 播放贝斯
    bassNotes.forEach((freq, index) => {
      const bassStartTime = now + index * (loopDuration / 4);
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle'; // 三角波贝斯
      osc.frequency.setValueAtTime(freq, bassStartTime);
      
      gain.gain.setValueAtTime(0, bassStartTime);
      gain.gain.linearRampToValueAtTime(0.12, bassStartTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, bassStartTime + loopDuration / 4);
      
      osc.connect(gain);
      gain.connect(this.bgmGainNode!);
      
      osc.start(bassStartTime);
      osc.stop(bassStartTime + loopDuration / 4);
      
      this.bgmOscillators.push(osc);
    });

    // 播放旋律
    melodyPattern.forEach((freq, index) => {
      const melodyStartTime = now + index * beatDuration;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, melodyStartTime);
      
      // 短促的音符
      gain.gain.setValueAtTime(0, melodyStartTime);
      gain.gain.linearRampToValueAtTime(0.1, melodyStartTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, melodyStartTime + beatDuration * 0.7);
      
      osc.connect(gain);
      gain.connect(this.bgmGainNode!);
      
      osc.start(melodyStartTime);
      osc.stop(melodyStartTime + beatDuration);
      
      this.bgmOscillators.push(osc);
    });

    // 添加节奏（鼓点）- 使用噪声
    for (let i = 0; i < 16; i++) {
      const drumTime = now + i * beatDuration;
      
      // Kick (低频噪声)
      if (i % 4 === 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, drumTime);
        osc.frequency.exponentialRampToValueAtTime(50, drumTime + 0.1);
        
        gain.gain.setValueAtTime(0.2, drumTime);
        gain.gain.exponentialRampToValueAtTime(0.01, drumTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.bgmGainNode!);
        
        osc.start(drumTime);
        osc.stop(drumTime + 0.1);
        
        this.bgmOscillators.push(osc);
      }
      
      // Hi-hat (高频噪声)
      if (i % 2 === 1) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(8000, drumTime);
        
        gain.gain.setValueAtTime(0.03, drumTime);
        gain.gain.exponentialRampToValueAtTime(0.01, drumTime + 0.05);
        
        osc.connect(gain);
        gain.connect(this.bgmGainNode!);
        
        osc.start(drumTime);
        osc.stop(drumTime + 0.05);
        
        this.bgmOscillators.push(osc);
      }
    }

    // 清理已完成的振荡器
    const cleanupTime = (loopDuration + 0.5) * 1000; // 转换为毫秒
    setTimeout(() => {
      this.bgmOscillators = this.bgmOscillators.filter((osc) => {
        try {
          // 尝试访问属性，如果已停止会抛出错误
          osc.frequency.value;
          return true;
        } catch {
          return false;
        }
      });
    }, cleanupTime);

    // 循环播放
    this.bgmLoopTimeout = window.setTimeout(() => {
      if (this.bgmIsPlaying && this.musicEnabled) {
        this.playBGMLoop(ctx);
      }
    }, loopDuration * 1000);
  }
}

// 创建全局音效管理器实例
export const audioManager = new AudioManager();
