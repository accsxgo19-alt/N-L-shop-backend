Remote access options for this backend

1) Port forwarding on your router (recommended for stable remote access)

- Find your server's local IP (on server machine):

  ```powershell
  ipconfig
  ```

  Look for `IPv4 Address`, e.g. `192.168.1.42`.

- In your router admin page, add a port forwarding rule that maps external port 3000 (TCP) to `192.168.1.42:3000`.
- Check your public IP (from server):

  ```powershell
  curl ifconfig.me
  ```

- Access from anywhere: `http://<YOUR_PUBLIC_IP>:3000` (ensure firewall/router allow it).

Security notes for port forwarding:
- Use a firewall to restrict access where possible.
- Use HTTPS / reverse proxy (nginx) in front of the app for production.
- Keep `ALLOWED_ORIGINS` set to trusted origins (do not use `*`).

2) Ngrok (quick, secure tunnel for testing)

- Install or run via `npx` on the server machine:

  ```powershell
  # one-time (recommended): install ngrok if you have an account
  npm install -g ngrok

  # or use npx without global install
  npx ngrok http 3000
  ```

- Ngrok will print a public HTTPS URL (example `https://abcd-1234.ngrok.io`).
- To allow frontend requests from that origin, set `ALLOWED_ORIGINS` (environment variable) to include the ngrok URL, then restart the server:

  ```powershell
  $env:ALLOWED_ORIGINS = "https://abcd-1234.ngrok.io"
  npm restart
  ```

- Use the ngrok URL to access your site or call APIs from clients on the Internet.

3) Firewall: open port 3000 on Windows server (Admin PowerShell)

```powershell
# allow TCP inbound on port 3000
New-NetFirewallRule -DisplayName "Allow Node 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000

# (optional) allow node.exe program instead of port
New-NetFirewallRule -DisplayName "Allow Node" -Direction Inbound -Action Allow -Program "C:\\Program Files\\nodejs\\node.exe"
```

4) Environment variables and security

- `ALLOWED_ORIGINS`: comma-separated list of allowed origins, e.g. `http://localhost:3000,https://abcd-1234.ngrok.io`.
- `ADMIN_TOKEN`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`: set secure values in environment before starting server.

Example (PowerShell):

```powershell
$env:ALLOWED_ORIGINS = "http://localhost:3000,https://abcd-1234.ngrok.io"
$env:ADMIN_TOKEN = "replace-with-strong-token"
$env:ADMIN_USERNAME = "admin"
$env:ADMIN_PASSWORD = "(secure)"
npm restart
```

5) Quick ngrok usage (recommended for testing remote access):

```powershell
cd backend
# run server in one terminal
npm start
# in another terminal run:
npx ngrok http 3000
# copy the public URL and open it in browser
```

6) Additional production recommendations

- Use HTTPS and a reverse proxy (nginx) or a cloud provider load balancer.
- Put authentication and rate-limiting on sensitive endpoints (already applied for checkout and auth).
- Rotate admin tokens and keep them secret (do not commit to repo).
