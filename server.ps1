$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:3000/')
$listener.Start()
Write-Host "Serving $root at http://localhost:3000/"

$handler = [scriptblock]::Create(@'
param($ctx, $root)
$mime = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="application/javascript; charset=utf-8"; ".json"="application/json; charset=utf-8"; ".svg"="image/svg+xml"; ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".ico"="image/x-icon"; ".webmanifest"="application/manifest+json" }
try {
  $res = $ctx.Response
  $res.Headers["Cache-Control"] = "no-cache"
  $p = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
  if ($p -eq "/" -or $p -eq "") { $p = "/index.html" }
  $file = Join-Path $root ($p.TrimStart("/") -replace "/", "\")
  if (Test-Path $file -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($file).ToLower()
    $ct = $mime[$ext]; if (-not $ct) { $ct = "application/octet-stream" }
    $res.ContentType = $ct
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $res.StatusCode = 404
    $b = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
    $res.OutputStream.Write($b, 0, $b.Length)
  }
  $res.OutputStream.Close()
} catch {}
'@)

# 요청을 동시에 처리 (단일 스레드 블로킹 방지)
$pool = [RunspaceFactory]::CreateRunspacePool(1, 8)
$pool.Open()

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $ps = [PowerShell]::Create()
  $ps.RunspacePool = $pool
  [void]$ps.AddScript($handler).AddArgument($ctx).AddArgument($root)
  [void]$ps.BeginInvoke()
}
