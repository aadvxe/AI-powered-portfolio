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
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        }}
      >
        <div
            style={{
                fontSize: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
            }}
        >
            👨‍💻
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#000',
            letterSpacing: '-2px',
          }}
        >
          aadvxe's Portfolio
        </div>
        <div style={{ 
            fontSize: 32, 
            color: '#666', 
            marginTop: 10,
            fontWeight: 500 
        }}>
          aadvxe's Personal Portfolio
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
