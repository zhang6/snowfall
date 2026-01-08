export interface SnowParticle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
  wobble: number;
  hovered?: boolean;
}

export interface PoemResponse {
  poem: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
}