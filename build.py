from pathlib import Path
root=Path(__file__).resolve().parent
common=(root.parent/'titans-ui/src/components/Controls/fc-ios-controller.css').read_text()
shell=(root/'src/shell.html').read_text()
css=(root/'src/game.css').read_text()
js='\n'.join((root/'src'/name).read_text() for name in ('panel.js','belt-core.js','game.js'))
(root/'index.html').write_text(shell.replace('/* COMMON_CSS */',common).replace('/* GAME_CSS */',css).replace('/* GAME_JS */',js))
print(f'index.html: {(root/"index.html").stat().st_size:,} bytes (standalone)')
