# 技術調査と抽出記録

確認日：2026-10-10。採用理由はこの作品の操作と互換性に対する判断であり、「世界最速」「最高品質」を実証したものではない。

## 既存資産から抽出した部分

| 出典 | 採用した構造 | 今回の変更 |
|---|---|---|
| 313-kyonin-kagemaru/game.js | clamp / lerp / 奥行き倍率 ds | src/belt-core.jsに抽出。奥行きを0〜1に正規化 |
| 同上 attack/updatePlayer | 足元zで命中判定、近傍敵への向き補正 | パンチ3技・キック3技、個体別多重ヒット防止、技の残り時間＋160ms入力予約 |
| 同上 updateWaves | waveActive / camLock / 敵全滅で解除 | WaveGateに整理し、画面幅に合わせた6戦闘区間に変更 |
| titans-ui/src/components/Controls/fc-ios-controller.css | 25%操作盤、safe-area、タッチ用CSS | build.pyが原本を読み込んでindex.htmlへ同梱 |
| 同コントローラJS | Pointer Events + setPointerCapture | 入力源別Map、複数指の独立解放、lost/cancel/blur対応を新規実装 |

絵・音・キャラクター・敵AI・戦闘の内容は新規。元ゲームのファイルは変更していない。

## 最新情報と採用判断

1. [WebKit Features for Safari 27.0](https://webkit.org/blog/18325/webkit-features-for-safari-27-0/)
   - 今回の調査ではSafari 27.0の公式更新まで確認。26.0だけを「最新」としない。
   - WebGPUや入力関連の修正が続いている。新しいブラウザにも旧端末にも開けるよう、必須機能と任意機能を分けた。
2. [W3C Pointer Events Level 3](https://www.w3.org/TR/pointerevents3/)
   - 2026-06-30の勧告。pointerrawupdate、高頻度入力、capture、cancel等の仕様を確認。
   - パッド移動は機能検出でpointerrawupdate / pointermoveを選択。攻撃はpointerdownで受け取る。予測座標は攻撃判定には使用しない。
3. [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
   - 描画はディスプレイの更新に合わせ、戦闘更新は1/120秒の固定刻み。120FPS表示を保証する意味ではない。
   - 描画間隔の生値を計測し、処理落ち時は解像度と装飾粒子数を下げる。50ms上限はシミュレーションの追いつき量のみ。
4. [MDN AudioContext baseLatency](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/baseLatency)
   - latencyHint: interactiveはブラウザへの希望値であり、保証ではない。1個のAudioContextをジェスチャで解錠し、SE/BGMを合成。
5. [Safari 26.0 WebGPU導入](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/)
   - WebGPUの普及を確認。ただし本作の少数の2D図形では、導入だけで応答性が上がると断定できない。Canvas2Dを採用し、desynchronizedは任意のヒントに留めた。

## 入力と安全な継続

- 押下表示・攻撃開始・先行入力の確定はイベント内で実行。短く押して離しても失われない。回避は予備動作からキャンセルし、ヒットストップを解除する。
- マルチタッチ、キーと指の混在、片指のみの解放を別々に検査。
- 一時停止とバックグラウンド化で入力を解放。音が利用不可・保存が拒否されても開始可能。
- 外部CDN・画像・音源・フォント・通信は不要。HTML1ファイルを直接開く検査を実施。
- 通常URLは読取用診断スナップショットのみ。?test=1のときだけ戦闘の再現検査用入口を有効にする。

## 再検証するタイミング

操作処理・技の時間・敵AI・画面レイアウトを変更したとき、ブラウザの主要更新が入ったときに、既存ハーネス→個別操作検査→通しプレイ→iPhone実機の順で確認する。無期限の自動監視は今回設定していない。

## 2026-10-11 実装更新

描画方式はCanvas2Dを継続。生成画像はロスレスWebP（主人公・敵）、画質90のWebP（背景）に変換して埋め込み。背景はサイズ・エリア別にCanvasへキャッシュし、入力時はキャッシュを描画。30ポーズの非等間隔な配置に対応する切り出し表と足元基準を用意し、最大の連結シルエットの外接範囲を初回ロード時に算出して隣接ポーズの断片を除外。元画像のピクセルは変更しない。

応答検査は入力イベント内のゲーム状態遷移を直接確認。計測値は物理的なタッチから発光までの遅延ではない。
