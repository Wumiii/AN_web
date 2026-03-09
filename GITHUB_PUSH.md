# 上传到 GitHub 的步骤

## 1. 在 GitHub 上创建新仓库

1. 打开 https://github.com/new
2. **Repository name**：填写仓库名（如 `an_web` 或 `ai-minute-note`）
3. **Description**（可选）：AI Minute Note 官网落地页
4. 选择 **Public**
5. **不要**勾选 "Add a README file"（本地已有内容）
6. 点击 **Create repository**

## 2. 添加远程仓库并推送

在终端中执行（将 `YOUR_USERNAME` 和 `YOUR_REPO` 替换为你的 GitHub 用户名和仓库名）：

```powershell
cd "c:\Users\Administrator\Desktop\an_web"

# 添加远程仓库（二选一）
# HTTPS:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 或 SSH（若已配置 SSH 密钥）:
# git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git

# 推送到 GitHub（首次推送）
git branch -M main
git push -u origin main
```

## 3. 配置 Git 用户信息（可选）

如需修改提交者信息，可执行：

```powershell
git config user.name "你的GitHub用户名"
git config user.email "你的GitHub邮箱"
```
