$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$prefix = 'http://localhost:3000/'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root at $prefix"

$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.htm' = 'text/html; charset=utf-8';
  '.css'  = 'text/css; charset=utf-8';  '.js'  = 'application/javascript; charset=utf-8';
  '.json' = 'application/json; charset=utf-8'; '.svg' = 'image/svg+xml';
  '.png'  = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg';
  '.ico'  = 'image/x-icon'; '.webmanifest' = 'application/manifest+json'
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $res.Headers['Cache-Control'] = 'no-cache'
    $path = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($path -eq '/' -or $path -eq '') { $path = '/index.html' }
    $file = Join-Path $root ($path.TrimStart('/') -replace '/', '\')
    if (Test-Path $file -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $ct = $mime[$ext]; if (-not $ct) { $ct = 'application/octet-stream' }
      $res.ContentType = $ct
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
    $res.OutputStream.Close()
  } catch { }
}
