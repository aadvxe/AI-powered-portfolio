import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = "aadvxe's Portfolio"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0a0a0a, #1a1a1a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
            style={{
                fontSize: 130,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                borderRadius: '50%',
                width: 250,
                height: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            👨‍💻
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            marginTop: 40,
            backgroundImage: 'linear-gradient(to right, #fff, #aaa)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-2px',
          }}
        >
          aadvxe's Portfolio
        </div>
        <div style={{ 
            fontSize: 32, 
            color: '#a3a3a3', 
            marginTop: 15,
            fontWeight: 500 
        }}>
          AI Engineer • Web Developer • IoT
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
