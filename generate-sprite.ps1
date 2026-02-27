$inputDir = "vanilla-portfolio/assets/techs"
$outputFile = "vanilla-portfolio/assets/techs-sprite.svg"
$files = Get-ChildItem -Path $inputDir -Filter *.svg

$sb = New-Object -TypeName "System.Text.StringBuilder"
[void]$sb.Append('<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">')
[void]$sb.AppendLine()

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $id = $file.BaseName

    # Extract viewBox
    $viewBox = "0 0 24 24" # Default
    if ($content -match 'viewBox=["'']([^"''"]*)["'']') {
        $viewBox = $matches[1]
    } elseif ($file.Name -eq "Firebase_icon.svg") {
         # Fallback for Firebase which uses width/height
         $viewBox = "0 0 140 140"
    }

    # Extract body content inside <svg...> ... </svg>
    # Regex to capture content between opening <svg> tag and closing </svg> tag
    # (?s) enables single-line mode so . matches newlines
    if ($content -match '(?s)<svg[^>]*>(.*)<\/svg>') {
        $body = $matches[1]
        
        # Cleanup: Remove XML declarations and comments
        $body = $body -replace '<\?xml.*?\?>', ''
        $body = $body -replace '<!--.*?-->', ''
        
        # Simple namespacing for IDs to avoid conflicts
        # This is a basic replacement and might need refinement if IDs are used in complex ways, 
        # but works for standard defs/url references.
        
        # Replace id="..." with id="filename-..."
        $body = $body -replace 'id=["'']([^"''"]+)["'']', "id=""$id-`$1"""
        
        # Replace url(#...) with url(#filename-...)
        $body = $body -replace 'url\(#([^)]+)\)', "url(#$id-`$1)"
        
        # Replace xlink:href="#..." with xlink:href="#filename-..."
        $body = $body -replace 'xlink:href=["'']#([^"''"]+)["'']', "xlink:href=""#$id-`$1"""
        
        [void]$sb.Append("<symbol id=""$id"" viewBox=""$viewBox"">")
        [void]$sb.Append($body)
        [void]$sb.Append("</symbol>")
        [void]$sb.AppendLine()
    } else {
        Write-Host "Warning: Could not parse SVG content structure for $($file.Name)"
    }
}

[void]$sb.Append('</svg>')
Set-Content -Path $outputFile -Value $sb.ToString() -Encoding UTF8
Write-Host "Sprite generated at $outputFile"
