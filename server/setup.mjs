#!/usr/bin/env node

/**
 * 支付宝沙箱环境一键配置脚本
 * 运行: node server/setup.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║        支付宝沙箱环境 - 一键配置助手                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // Step 1: 检查 RSA 密钥
  const privateKeyPath = path.join(__dirname, 'keys', 'app_private_key.pem');
  const publicKeyPath = path.join(__dirname, 'keys', 'app_public_key.pem');

  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    console.log('>> 未检测到 RSA 密钥，正在生成...');
    const { execSync } = await import('child_process');
    fs.mkdirSync(path.join(__dirname, 'keys'), { recursive: true });
    execSync(`openssl genrsa -out "${privateKeyPath}" 2048`);
    execSync(`openssl rsa -in "${privateKeyPath}" -pubout -out "${publicKeyPath}"`);
    console.log('>> RSA 密钥已生成!\n');
  }

  // 读取并显示公钥
  const publicKey = fs.readFileSync(publicKeyPath, 'utf-8');
  // 提取纯公钥内容（去掉 header/footer）
  const publicKeyContent = publicKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  第 1 步：登录支付宝开放平台');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('  请在浏览器中打开以下地址（用支付宝扫码登录）：');
  console.log('');
  console.log('    https://open.alipay.com');
  console.log('');
  console.log('  登录后，点击左侧菜单中的「沙箱」进入沙箱环境');
  console.log('  或直接访问: https://open.alipay.com/develop/sandbox/app');
  console.log('');

  await ask('  [ 按 Enter 继续... ]');
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  第 2 步：配置应用公钥');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('  在沙箱页面找到「应用信息」→「开发信息」→「接口加签方式」');
  console.log('  点击「设置/查看」，选择「公钥」模式');
  console.log('  将以下公钥内容复制粘贴进去：');
  console.log('');
  console.log('  ┌─────────────── 复制以下内容 ───────────────┐');
  console.log(`  ${publicKeyContent}`);
  console.log('  └────────────────────────────────────────────┘');
  console.log('');
  console.log('  设置成功后，页面会显示「支付宝公钥」，请复制它。');
  console.log('');

  await ask('  [ 按 Enter 继续... ]');
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  第 3 步：填写配置信息');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // 读取现有 .env 配置
  const envPath = path.join(rootDir, '.env');
  let existingEnv = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
      if (match) existingEnv[match[1].trim()] = match[2];
    });
  }

  const appId = await ask(`  请输入沙箱 APPID (页面上直接复制): `);
  if (!appId) {
    console.log('\n  ❌ APPID 不能为空，请重新运行脚本\n');
    rl.close();
    return;
  }

  const alipayPublicKey = await ask(`  请粘贴支付宝公钥 (一长串字符): `);
  if (!alipayPublicKey) {
    console.log('\n  ❌ 支付宝公钥不能为空，请重新运行脚本\n');
    rl.close();
    return;
  }

  // 写入 .env
  const envContent = [
    `# Gemini AI`,
    `GEMINI_API_KEY="${existingEnv.GEMINI_API_KEY || 'MY_GEMINI_API_KEY'}"`,
    `APP_URL="${existingEnv.APP_URL || 'MY_APP_URL'}"`,
    ``,
    `# 支付宝沙箱配置`,
    `ALIPAY_APP_ID="${appId}"`,
    `ALIPAY_GATEWAY="https://openapi-sandbox.dl.alipaydev.com/gateway.do"`,
    `ALIPAY_PUBLIC_KEY="${alipayPublicKey}"`,
    `ALIPAY_NOTIFY_URL="http://localhost:3001/api/payment/notify"`,
    ``,
  ].join('\n');

  fs.writeFileSync(envPath, envContent);

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  配置完成!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('  .env 文件已保存，包含以下配置：');
  console.log(`    ALIPAY_APP_ID = ${appId}`);
  console.log(`    ALIPAY_PUBLIC_KEY = ${alipayPublicKey.substring(0, 20)}...`);
  console.log('');
  console.log('  接下来请运行以下命令启动服务：');
  console.log('');
  console.log('    终端1: npm run server   (启动支付后端)');
  console.log('    终端2: npm run dev      (启动前端)');
  console.log('');
  console.log('  或一键启动:');
  console.log('    npm run dev:all');
  console.log('');
  console.log('  然后在商店页面选择商品，选择「支付宝」支付，');
  console.log('  用沙箱版支付宝App扫描二维码即可测试支付！');
  console.log('');
  console.log('  沙箱支付宝App下载：在沙箱页面底部「沙箱工具」中下载');
  console.log('  (仅支持 Android)');
  console.log('');

  rl.close();
}

main().catch(err => {
  console.error('配置出错:', err.message);
  rl.close();
  process.exit(1);
});
