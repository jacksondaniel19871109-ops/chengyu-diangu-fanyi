Add-Type -AssemblyName System.IO.Compression

function Get-DocxLines([string]$Path) {
  $stream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  try {
    $archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Read, $false)
    try {
      $entry = $archive.GetEntry('word/document.xml')
      $reader = [System.IO.StreamReader]::new($entry.Open())
      try { [xml]$xml = $reader.ReadToEnd() } finally { $reader.Dispose() }
    } finally { $archive.Dispose() }
  } finally { $stream.Dispose() }
  $ns = [System.Xml.XmlNamespaceManager]::new($xml.NameTable)
  $ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
  return @($xml.SelectNodes('//w:p', $ns) | ForEach-Object {
    (($_.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.'#text' }) -join '').Trim()
  } | Where-Object { $_ })
}

function Is-English([string]$Text) { return (($Text -replace '[^A-Za-z]', '').Length -ge 8) }
function Is-Label([string]$Text) { return $Text -match '^\s*[【\[]?(原文|今译|英译)(?:[一二三四五六七八九十\d]+)?[】\]：:]*' }
function Add-Value($Section, [string]$Kind, [string]$Value) { if ($Value) { $Section.$Kind += $Value } }

$root = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $root 'data'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$stories = foreach ($file in Get-ChildItem -LiteralPath $root -Filter '*.docx' | Sort-Object Name) {
  $lines = Get-DocxLines $file.FullName
  $titleZhIndex = -1
  for ($i = 0; $i -lt [Math]::Min($lines.Count, 8); $i++) {
    if ($lines[$i] -match '[\p{IsCJKUnifiedIdeographs}]' -and -not (Is-Label $lines[$i]) -and $lines[$i] -notmatch '^[-—－]{2}') { $titleZhIndex = $i; break }
  }
  if ($titleZhIndex -lt 0) { $titleZhIndex = 0 }
  $titleZh = $lines[$titleZhIndex]
  $titleEnIndex = -1
  for ($i = 0; $i -lt [Math]::Min($lines.Count, 12); $i++) {
    $candidate = $lines[$i]
    if ($i -ne $titleZhIndex -and (Is-English $candidate) -and $candidate.Length -lt 100 -and $candidate -notmatch '^(Notes|Note)[:：]?$') { $titleEnIndex = $i; break }
  }
  if ($titleEnIndex -lt 0) {
    for ($i = 0; $i -lt ($lines.Count - 1); $i++) {
      if ($lines[$i] -match '^\s*[【\[]?英译[】\]：:]*\s*$' -and (Is-English $lines[$i + 1]) -and $lines[$i + 1].Length -lt 100) { $titleEnIndex = $i + 1; break }
    }
  }
  $titleEn = if ($titleEnIndex -ge 0) { $lines[$titleEnIndex] } else { '' }
  $hasLabels = @($lines | Where-Object { Is-Label $_ }).Count -gt 0
  $section = [ordered]@{ heading = ''; original = @(); modern = @(); english = @(); notes = @() }
  $sections = @($section)
  $kind = if ($hasLabels) { 'notes' } else { 'original' }
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($i -eq $titleZhIndex -or $i -eq $titleEnIndex) { continue }
    $line = $lines[$i]
    if ($line -match '^\s*(第[一二三四五六七八九十\d]+部分|[IVXLC]+[-－]?\d+)[:：]?\s*$') {
      if ($section.original.Count -or $section.modern.Count -or $section.english.Count -or $section.notes.Count) {
        $section = [ordered]@{ heading = $Matches[1]; original = @(); modern = @(); english = @(); notes = @() }
        $sections += $section
      } else { $section.heading = $Matches[1] }
      continue
    }
    if ($line -match '^\s*[【\[]?(原文|今译|英译)([一二三四五六七八九十\d]*)[】\]：:]*\s*(.*)$') {
      $base = switch ($Matches[1]) { '原文' { 'original' } '今译' { 'modern' } '英译' { 'english' } }
      if ($Matches[2]) {
        if ($section.original.Count -or $section.modern.Count -or $section.english.Count) { $section = [ordered]@{ heading = "第$($Matches[2])则"; original = @(); modern = @(); english = @(); notes = @() }; $sections += $section }
      }
      $kind = $base
      Add-Value $section $kind $Matches[3]
      continue
    }
    if ($line -match '^[-—－]{2}' -or $line -match '^(Notes?|注释)[:：]?$') { $kind = 'notes'; Add-Value $section $kind $line; continue }
    if (-not $hasLabels) { $kind = if (Is-English $line) { 'english' } else { 'original' } }
    Add-Value $section $kind $line
  }
  [ordered]@{ id = [IO.Path]::GetFileNameWithoutExtension($file.Name); titleZh = $titleZh; titleEn = $titleEn; sourceFile = $file.Name; sections = $sections }
}
$json = $stories | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText((Join-Path $outputDirectory 'stories.json'), $json, [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $outputDirectory 'stories.js'), "window.STORIES = $json;", [Text.UTF8Encoding]::new($false))
Write-Host "已生成 $($stories.Count) 篇语料：data/stories.json"

