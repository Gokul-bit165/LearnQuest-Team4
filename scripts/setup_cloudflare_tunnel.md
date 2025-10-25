# Cloudflare Tunnel Setup for LearnQuest

## Step 1: Install Cloudflare Tunnel
1. Download from: https://github.com/cloudflare/cloudflared/releases
2. Extract and add to PATH

## Step 2: Login to Cloudflare
```bash
cloudflared tunnel login
```

## Step 3: Create a Tunnel
```bash
cloudflared tunnel create learnquest
```

## Step 4: Configure the Tunnel
Create a config file at `~/.cloudflared/config.yml`:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: ~/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: learnquest-api.yourdomain.com
    service: http://localhost:8000
  - hostname: learnquest-web.yourdomain.com
    service: http://localhost:3000
  - catch-all: true
    service: http_status:404
```

## Step 5: Run the Tunnel
```bash
cloudflared tunnel run learnquest
```

## Step 6: Update DNS
Add CNAME records in Cloudflare DNS:
- `learnquest-api` → `YOUR_TUNNEL_ID.cfargotunnel.com`
- `learnquest-web` → `YOUR_TUNNEL_ID.cfargotunnel.com`
