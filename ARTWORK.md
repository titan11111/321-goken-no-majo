# ビジュアル制作記録 — 2026-10-11

制作方法：組み込み image_gen。CLI/APIへの切り替えなし。ユーザーの参考画像の方向性から、主人公を黒い胴着の重量級に統一。

採用素材は assets/hero.webp（30ポーズ）、assets/enemies.webp（4種×2ポーズ）、assets/scenes.webp（4エリア）。全素材をindex.htmlへ埋め込み。主人公・敵は透過PNGからロスレスWebPへ、背景は画質90のWebPへ形式変換。生成元PNGはCodexのgenerated_imagesに保持。

主人公の並びは完全な等間隔ではなかったため、画像自体は改変せず、描画時の切り出し範囲・足元基準を補正。隣のポーズの断片が混ざらないことを30ポーズの実描画で確認。

## 最終プロンプト

### hero.webp

```text
Game-ready transparent sprite sheet: EXACT 6 columns x 5 rows, 30 full-body poses of the SAME muscular adult male martial artist, always facing RIGHT. Character: rugged bearded dark-haired stone mason, very muscular realistic anatomy, sleeveless torn charcoal-black open-front gi, burgundy belt/sash, ivory wrist/knuckle wraps, loose dark trousers, bare feet. Premium highly detailed painted fantasy game art: believable skin, muscles, tendons, cloth folds and warm amber edge lighting. NO geometric cartoon/chibi style. NO text, no drawn grid, no scenery, no ground shadows, no effects. Transparent background. All equal-size cells, full bodies confined to their cell. Standing ground baseline at 90% of each cell, head around 15%; consistent size, consistent identity. Reserve right side of each cell for extended fists and feet.
30 poses, reading left-to-right each row:
ROW 1: relaxed fighting guard; breathing guard; walk left-foot-forward; walk passing pose; walk right-foot-forward; second walking passing pose.
ROW 2: left jab windup; left jab fully extended right; left jab retraction; right cross windup; right cross fully extended with hips rotated; right cross recovery.
ROW 3: two-hand punch windup fists at ribs; TWO fists extended right together in a deep forward stance; two-hand punch recovery; right front kick knee raised; right front kick fully extended horizontal to right; right front kick retracted knee.
ROW 4: left roundhouse kick knee raised with twist; left roundhouse kick fully extended right, supporting leg pivot; left kick recovery; dropkick crouch takeoff; dropkick airborne knees tucked; dropkick almost horizontal airborne both feet extended right.
ROW 5: dropkick horizontal double-heel impact airborne right; dropkick low crouching landing one hand to ground; rising after landing; forward evasive low running dash; hit reaction guarding chest; two-fist ground slam crouch.
STRICT layout: exactly six separate figures per row, five rows; never overlap cells. Every pose has exactly two anatomically coherent arms and two legs. A usable sprite atlas, not a poster.
```

### enemies.webp

```text
A production TRANSPARENT sprite atlas for a premium hand-painted realistic 2D dark fantasy beat-em-up. EXACTLY FOUR columns and TWO rows, 8 equally sized cells. Landscape canvas 2:1. No grid lines, text, letters, interface, ground, ground shadows, background or scenery. Each cell contains ONE entire full-body character, feet at 92% of cell height, top of head at 12%, coherent scale across both rows, limbs and staff inside its own cell. All characters face SCREEN RIGHT in near-profile three-quarter view, readable silhouette. Realistic detailed painterly fabric, embroidered seams, worn leather, metal edges, natural folds, shadowed faces. Refined game assets, not flat geometric art, not chibi.
Column 1 in both rows: sinister fire wizard wearing deep burgundy hooded robes, tarnished gold piping, thin skeletal gloved fingers, wooden staff topped with a small amber crystal.
Column 2: frost sorcerer in deep indigo and dusty pale-blue hooded robes, silver details, ivory staff with a small icy turquoise crystal.
Column 3: large ward knight mage in blackened steel armor over dark olive robes, broad heavy rectangular kite shield with an engraved turquoise sigil in left arm, short ceremonial mace right hand, enclosed steel hooded helmet.
Column 4: terrifying regal demon sorcerer king, dark flowing black-purple robes, ornate sharp aged gold shoulder armor, long horned golden crown, pallid weathered face in shadow, red garnet details, black staff; strong elaborate silhouette. Human proportions, not oversized head.
Row 1: each of the four characters in a calm threatening combat standing pose, staff/weapon held ready.
Row 2: the SAME corresponding character performing an aggressive casting or attacking pose: fire/frost staffs pointed to the right and free hand stretched right; ward knight thrusting shield right; demon king raising staff and spreading free hand toward right. NO large magical effect to obscure anatomy, tiny crystal light is fine.
Keep costumes, faces and proportions exactly consistent between rows. Lighting: warm amber keylight from upper left and subtle cold edge light. Transparent pixels everywhere except characters. Detailed enough for close-up and large display.
```

### scenes.webp

```text
Production environment atlas for a premium hand-painted 2D belt-scrolling fantasy fighting game. Create a single image split into an EXACT 2 by 2 grid of FOUR full rectangular game environments, no gap, no frame, no letters or UI. Each quadrant is a completely distinct environment seen from the SAME fixed side-on slightly elevated arcade beat-em-up camera, horizon at 57% of quadrant height, unobstructed WALKABLE horizontal floor filling bottom 43%. Highly detailed realistic painted stone, layered atmospheric lighting and convincing tactile textures, refined dark-fantasy concept art; coherent warm amber lights and cool deep shadows, jewel-toned muted palette. NO characters, NO people, NO enemies, NO creatures, NO logos. The playfield floor must be clear and readable, no large foreground blocking objects.
Top left: ancient enchanted forest castle approach, colossal gnarled trees at edges, distant ruined stone arch bridge and crumbling gothic wall, moss, fern edges, teal woodland mist; sun rays warm at upper left, weathered broad flat stone path in foreground.
Top right: medieval castle hall of embers, great ribbed arches, detailed slate block walls, heavy burgundy cloth banners, niches with torches, broad worn stone tiled floor. Golden firelight makes warm pools; moody teal in recesses.
Bottom left: huge forbidden arcane stone gate beneath gothic pointed arches, intricate carved metal door with very subtle turquoise runes, broken pillars along sides, pale cold shafts of light, broad worn cracked slate paving floor.
Bottom right: demon king's throne chamber at the heart of a volcanic citadel, black basalt throne centered at rear with a tall ruby velvet backrest, brass trim and skull ornaments, obsidian pillars, lava glowing far behind the edges, deep crimson banners, dark broad basalt fighting platform floor, ornate worn crimson carpet down center. Restrained orange volcanic reflected lighting, detailed cracks, no explosions.
Every quadrant must be a complete attractive scene edge to edge with continuous level floor, no cropped interface. Detail suitable for a released game, not a flat schematic.
```

## dawn.webp（エンディング背景・2026-10-11）
組み込み image_gen。1280×720 → WebP 品質84（約200KB）。人物なし。道の位置はコード側 `END_PATH` に正規化座標で持つ（絵を差し替えるなら道の座標を取り直す）。

```text
Cinematic ending backdrop ... SUNRISE after the demon king's defeat: broken dark castle far left, huge golden sun breaking over the horizon with god rays, warm village rooftops and a stone bridge in the middle distance, cherry petals, a clear empty weathered stone road filling the bottom 40%. NO characters, NO text, NO UI.
```

## hero-walk.webp（歩行8コマ・2026-10-11改修）

組み込み `image_gen` 使用。既存hero.webpを外見の参照とし、4列×2行の新規歩行シートを生成。背景除去の追加依頼後、RGBAの透明度を確認。1536×1024をcwebp品質88・alpha品質100で変換し、このフォルダのassets/へ保存。実画像の不均一な余白はsrc/art-baked.jsonのwalkFramesで切り出し、腰位置と地面を揃える。立ち・攻撃は従来素材を使用。

生成プロンプト:
```text
Create a NEW production game walk-cycle sprite sheet matching the male hero in the reference (reference only, do not copy its incorrect walk poses). Same muscular bearded black-haired stoneworker, torn sleeveless charcoal martial arts vest and trousers, dark crimson belt, white wrist wraps, bare feet. Detailed hand-painted pixel-art style consistent with reference. Exactly EIGHT full-body sprites arranged in a precise 4 columns x 2 rows equally sized grid, all facing RIGHT in side / slight 3-quarter profile, identical height, same pelvis X center in each cell, same floor baseline. No text, labels, shadows, outlines around cells, or grid lines. Fully transparent background. All limbs within their own cell with generous padding. A biomechanically distinct continuous WALK animation, read left to right top row then bottom: 1 left foot far forward right far back contact, 2 down recoil front knee bent, 3 passing feet together right knee lifting forward, 4 up right knee forward lifted left trailing, 5 right foot far forward left far back contact, 6 down recoil opposite leg, 7 passing feet together left knee lifting, 8 up left knee forward right trailing. The passing frames MUST have feet close together under the torso, clearly unlike wide contact frames. Alternate front/back arms opposite legs. Keep head torso size and costume identical. This is an actual eight-frame loop, not eight repeated wide stances. Output wide sheet 3:2 aspect ratio.
```
最終編集プロンプト:
```text
Remove ALL background from this sprite sheet. Make background true alpha transparent. Preserve all eight characters, same dimensions, positions, detail and poses. No brown color or glow behind sprites, no checkerboard painted into image, no shadows. Strict grid: 4 columns by 2 rows. Keep each character wholly within its own equal cell with at least 16px horizontal transparent padding. This asset must overlay cleanly onto a game scene. Output RGBA transparency.
```


## enemies-women.webp / scenes-journey.webp（2026-10-11拡張）

組み込みimage_genで生成。新規女性3種×3姿勢の透過シートと、街・水路・庭園・禁書庫の4面背景。既存enemies.webp/scenes.webpを絵柄の参照とした。女性素材は隣のキャラクターを切り込まないよう余白を増やす再生成を行い、実画像のアルファ境界を解析してwomenFramesへ保存。WebP品質87（alpha100）／背景品質84。最終保存先はassets/enemies-women.webp、assets/scenes-journey.webp。

### 女性素材・最終編集プロンプト
```text
Repack this SAME nine-sprite sheet into a strict 3x3 equal grid on a square transparent RGBA canvas. Preserve the character identities, costumes, style and three pose types. Make ALL sprites 20 percent smaller to provide substantial transparent padding around EVERY figure and weapon. Each character and entire staff/mace must fit strictly inside its own cell, with 24px clear transparent margin on EVERY side including raised staffs; do not let middle-row fire staff cross into middle-column woman's cell. No overlap between figures. Keep all characters at same scale and ground baseline within each cell. Three columns are red female fire mage, silver-haired female ice mage, female armored knight. Rows idle, casting, hurt. No background, no text, no grid lines.
```
### 追加背景・生成プロンプト
```text
Create FOUR NEW environments matching reference high detail hand-painted dark fantasy belt scrolling beat-em-up backgrounds. EXACT 2x2 atlas, 1536x1024 landscape. Each quadrant a complete scene with no borders, UI, labels or text. Same side-on slightly elevated arcade fighting camera as reference, horizon at 57% of each quadrant, unobstructed horizontal walkable stone foreground occupying bottom 43%. Foreground must be empty so fighters can be drawn later. Top left: PETRIFIED TOWN at dusk, abandoned cobblestone market street, old half timbered houses, broken stall awnings, 3 SMALL stone statues of townspeople in natural daily poses only at rear edges, cold ash, distant castle ominous against amber-gray sky. Top right: UNDERGROUND AQUEDUCT, colossal arches under a castle, blue-green canal behind foreground dry broad stone towpath, wet reflections, chains, water dripping in deep background, turquoise mist, floor empty. Bottom left: MOONLIT GARDEN, castle garden terrace with white roses and overgrown hedges behind stone railing, giant pale moon, gothic spires, violet blue night, silver light pools, broad dry stone terrace empty in foreground. Bottom right: FORBIDDEN LIBRARY, towering ancient bookshelves behind broad empty stone floor, floating books confined to far background, brass astrolabe, warm copper lamps and emerald ward lights, imposing arched vault, clear combat floor. Distinct colour palettes and architecture per quadrant. No alive people, no fighters, no enemies, no monsters, no foreground furniture. Do not repeat reference locations; these are new locations for same world. Painterly detailed premium game art.
```


## 2026-10-12 タイトル画面のキービジュアル

`assets/title-art.webp`（1586×992、約353 KiB）を追加し、タイトル画面の幾何学的な仮背景から差し替えた。Built-in image_genで制作し、暗い城・石工ガルド・紅蓮の魔女・左側のタイトル用余白を一枚にまとめた。作品の既存色である炭色・炎色・古い金色を軸にし、タイトル文字も同じ色へ揃えた。画像データは `index.html` に埋め込み、単体HTMLでも表示する。

主人公・敵・背景・歩行・エンディングは既存の透過スプライトシート／画像を継続使用する。火花、衝撃波、魔法弾など時間や座標で形が変わる演出は、絵へ固定すると動きが失われるためCanvas描画のままにする。

巨人草の固定アイコンも `assets/giant-herb.webp` の透過イラストへ置き換えた。周囲の発光だけは使用中の演出としてCanvasで続ける。


## 2026-10-12 二面背景と石工モード彫像

`assets/stage2-atlas.webp` は雷鳴の見張塔・硝子の炉心・月蝕の聖堂・呪核の間を2×2にまとめた背景。既存の背景切り出し処理で各エリアに割り当て、暗い石・青い嵐・炉の炎・紫の呪い光を共通の色調にした。

`assets/venus-realistic.webp` は石工モードのビーナス用に生成した、全身をローブで覆った大理石彫像。3×3の採掘演出は維持し、彫像の面だけ実写風画像へ差し替えた。画像データは単体HTMLでも動くよう `index.html` に埋め込んでいる。
