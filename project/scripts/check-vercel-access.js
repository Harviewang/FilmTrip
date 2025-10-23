#!/usr/bin/env node
/**
 * 检查和修复Vercel项目访问设置
 * 确保项目可以公开访问，不需要登录
 */

const https = require('https');

// 从环境变量读取配置
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

if (!VERCEL_TOKEN) {
  console.log('📌 Vercel Token未配置');
  console.log('\n如何获取Vercel Token:');
  console.log('1. 访问 https://vercel.com/account/tokens');
  console.log('2. 点击 "Create Token"');
  console.log('3. 设置名称和权限');
  console.log('4. 复制token并添加到 project/credentials/secrets.conf');
  console.log('\n然后执行:');
  console.log('  source project/credentials/load-secrets.sh');
  console.log('  node project/scripts/check-vercel-access.js');
  process.exit(0);
}

const projects = ['frontend', 'backend'];

/**
 * 调用Vercel API
 */
function callVercelAPI(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 400) {
            reject(new Error(`API Error: ${parsed.error?.message || 'Unknown error'}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * 获取项目信息
 */
async function getProject(projectName) {
  console.log(`\n🔍 检查项目: ${projectName}`);
  try {
    const project = await callVercelAPI('GET', `/v9/projects/${projectName}`);
    
    console.log(`  名称: ${project.name}`);
    console.log(`  框架: ${project.framework || '未检测'}`);
    console.log(`  公开访问: ${project.publicSource ? '是' : '否'}`);
    console.log(`  密码保护: ${project.passwordProtection ? '是' : '否'}`);
    
    if (project.targets && project.targets.production) {
      console.log(`  生产域名: ${project.targets.production.alias?.[0] || '未配置'}`);
    }
    
    return project;
  } catch (error) {
    console.error(`  ❌ 获取失败: ${error.message}`);
    return null;
  }
}

/**
 * 更新项目设置为公开访问
 */
async function makeProjectPublic(projectName) {
  console.log(`\n🔓 设置项目为公开访问: ${projectName}`);
  try {
    await callVercelAPI('PATCH', `/v9/projects/${projectName}`, {
      publicSource: true,
      passwordProtection: null
    });
    console.log(`  ✅ 设置成功`);
  } catch (error) {
    console.error(`  ❌ 设置失败: ${error.message}`);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 检查Vercel项目访问设置...\n');
  
  for (const projectName of projects) {
    const project = await getProject(projectName);
    
    if (project) {
      // 检查是否需要设置为公开
      if (!project.publicSource || project.passwordProtection) {
        console.log(`  ⚠️  项目不是完全公开的`);
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
          readline.question(`  是否要设置为公开访问? (y/n): `, resolve);
        });
        readline.close();
        
        if (answer.toLowerCase() === 'y') {
          await makeProjectPublic(projectName);
        }
      } else {
        console.log(`  ✅ 项目已设置为公开访问`);
      }
    }
  }
  
  console.log('\n✨ 检查完成！');
  console.log('\n📌 提示:');
  console.log('  - 自定义域名(filmtrip.imhw.top)始终公开可访问');
  console.log('  - Vercel默认域名(.vercel.app)的访问权限由项目设置控制');
  console.log('  - 建议使用自定义域名进行公开分享');
}

main().catch(console.error);

