# 収支管理アプリ デプロイ手順

## 1. 前提条件

- GitHubアカウント（k.omotegawa@edore-edu.com）
- Vercelアカウント
- Firebaseプロジェクト

---

## 2. GitHubリポジトリの作り直し

現在のリポジトリ `craftbankOmotegawa/shuushi-kanri` を削除して、正しいアカウントで作り直す手順です。

### 2-1. 現在のリポジトリを削除（任意）

1. https://github.com/craftbankOmotegawa/shuushi-kanri にアクセス
2. Settings → 一番下の「Danger Zone」→「Delete this repository」
3. リポジトリ名を入力して削除

### 2-2. 正しいGitHubアカウントでログイン

```bash
# 現在のGitHub CLIのログイン状態を確認
gh auth status

# ログアウト
gh auth logout

# 正しいアカウント（k.omotegawa@edore-edu.com）でログイン
gh auth login
# → GitHub.com を選択
# → HTTPS を選択
# → ブラウザで認証 を選択
# → ブラウザが開くので k.omotegawa@edore-edu.com のアカウントでログイン
```

### 2-3. 新しいリポジトリを作成してプッシュ

```bash
cd ~/shuushi-kanri

# 古いリモートを削除
git remote remove origin

# 新しいリポジトリを作成＆プッシュ
gh repo create shuushi-kanri --public --source=. --push
```

### 2-4. 確認

```bash
# リモートURLを確認（新しいアカウント名になっていればOK）
git remote -v
```

---

## 3. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `shuushi-kanri`）
4. Google Analyticsは任意（オフでOK）

### 3-1. Authentication の設定

1. 左メニュー「Authentication」→「始める」
2. 「ログイン方法」タブ→「メール/パスワード」を有効化

### 3-2. Firestore Database の設定

1. 左メニュー「Firestore Database」→「データベースを作成」
2. 本番モードで開始
3. ロケーション: `asia-northeast1`（東京）を選択
4. セキュリティルールを以下に設定:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3-3. Firebase 設定情報の取得

1. プロジェクト設定（歯車アイコン）→「全般」
2. 「マイアプリ」セクション→「ウェブアプリを追加」（`</>`アイコン）
3. アプリ名を入力して登録
4. 表示される `firebaseConfig` の値をメモ:

```
apiKey: "AIza..."
authDomain: "your-project.firebaseapp.com"
projectId: "your-project-id"
storageBucket: "your-project.appspot.com"
messagingSenderId: "123456789"
appId: "1:123456789:web:abc123"
```

---

## 4. ローカルの環境変数を更新

```bash
# .env.local を編集（Firebase設定情報を貼り付け）
cd ~/shuushi-kanri
```

`.env.local` ファイルの内容を更新:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...実際の値
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

ローカルで動作確認:

```bash
npm run dev
# http://localhost:3000 で確認
```

---

## 5. Vercelへのデプロイ

### 5-1. Vercelアカウントの準備

1. [Vercel](https://vercel.com/) にアクセス
2. 既にログイン中なら、右上のアバター→「Log Out」で一度ログアウト
3. 「Continue with GitHub」をクリック
4. k.omotegawa@edore-edu.com のGitHubアカウントでログイン

### 5-2. プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」
2. 「Import Git Repository」でGitHubリポジトリ `shuushi-kanri` を選択
3. Frameworkは自動検出（Next.js）

### 5-3. 環境変数の設定

「Environment Variables」セクションで以下を全て追加:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebaseの apiKey |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebaseの authDomain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebaseの projectId |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebaseの storageBucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebaseの messagingSenderId |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebaseの appId |

### 5-4. デプロイ

1. 「Deploy」ボタンをクリック
2. ビルド完了を待つ（2-3分）
3. 完了後、表示されるURLでアプリにアクセス可能

### 5-5. Firebase側にVercelドメインを追加

1. Firebase Console → Authentication → Settings → 「承認済みドメイン」
2. Vercelで割り当てられたドメイン（例: `shuushi-kanri-xxx.vercel.app`）を追加

---

## 6. CLI経由でのデプロイ（オプション）

VercelのWeb UIではなくCLIでデプロイしたい場合:

```bash
# Vercel CLIでログイン（アカウント切り替え）
vercel logout
vercel login  # GitHubアカウントを選択

# 既存リンクを削除してリリンク
rm -rf ~/shuushi-kanri/.vercel
cd ~/shuushi-kanri
vercel link

# 環境変数を1つずつ設定（それぞれ値を入力するプロンプトが出る）
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID

# 本番デプロイ
vercel deploy --prod
```

---

## 7. 動作確認

1. デプロイされたURLにアクセス
2. 「新規登録」でアカウントを作成
3. ダッシュボードが表示されれば成功
4. 以下を順番に確認:
   - 取引の登録・編集・削除
   - レポートページでグラフ表示
   - 取引先の登録
   - 請求書の作成 → PDFダウンロード
   - 設定ページでプロフィール保存

---

## トラブルシューティング

### ビルドエラーが出る場合
- Vercelのビルドログを確認（Deployments → 該当デプロイ → Build Logs）
- Node.jsバージョンを確認（Settings → General → Node.js Version を `20.x` に設定）
- 環境変数が全て設定されているか確認

### 認証エラーが出る場合
- Firebase Consoleで「メール/パスワード」認証が有効か確認
- 承認済みドメインにVercelのURLが追加されているか確認
- 環境変数が正しく設定されているか確認

### Firestoreのアクセスエラーが出る場合
- セキュリティルールが正しく設定されているか確認
- Firestoreデータベースが作成されているか確認
