#!/usr/bin/env node
/**
 * 阿里云DNS配置脚本 - 配置Vercel自定义域名
 * 为FilmTrip项目配置 dbdog.com -> Vercel
 */

const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

// 从密钥文件读取配置
const secretsFile = path.join(__dirname, 'project/credentials/secrets.conf');
if (fs.existsSync(secretsFile)) {
  const secrets = fs.readFileSync(secretsFile, 'utf8');
  secrets.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

const config = {
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
  endpoint: 'alidns.cn-hangzhou.aliyuncs.com'
};

// 检查配置
if (!config.accessKeyId || !config.accessKeySecret) {
  console.error('❌ 错误: 请设置环境变量 ALIYUN_ACCESS_KEY_ID 和 ALIYUN_ACCESS_KEY_SECRET');
  console.log('\n使用方法:');
  console.log('  1. 在 project/credentials/secrets.conf 中配置密钥');
  console.log('  2. 或在环境变量中设置:');
  console.log('     ALIYUN_ACCESS_KEY_ID=your_key ALIYUN_ACCESS_KEY_SECRET=your_secret node setup-vercel-domain-dns.js');
  process.exit(1);
}

// Vercel CNAME地址（需要在Vercel控制台获取）
// 如果使用CNAME方式，值通常是: cname.vercel-dns.com
// 如果使用A记录，值通常是: 76.76.21.21
const VERCEL_CNAME = process.env.VERCEL_CNAME || 'cname.vercel-dns.com';
const VERCEL_IP = process.env.VERCEL_IP || '76.76.21.21';

// 要配置的域名记录
const records = [
  // 方式1: 使用CNAME记录（推荐）
  { 
    domain: 'dbdog.com', 
    rr: '@', 
    type: 'CNAME', 
    value: VERCEL_CNAME, 
    description: 'Vercel主域名（CNAME）' 
  },
  // 方式2: 使用A记录（备选）
  // { 
  //   domain: 'dbdog.com', 
  //   rr: '@', 
  //   type: 'A', 
  //   value: VERCEL_IP, 
  //   description: 'Vercel主域名（A记录）' 
  // },
  // www子域名（可选）
  { 
    domain: 'dbdog.com', 
    rr: 'www', 
    type: 'CNAME', 
    value: VERCEL_CNAME, 
    description: 'Vercel www子域名（CNAME）' 
  },
];

/**
 * 生成阿里云API签名
 */
function sign(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map(key => {
    return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
  }).join('&');
  
  const stringToSignWithMethod = `GET&${encodeURIComponent('/')}&${encodeURIComponent(stringToSign)}`;
  const signature = crypto.createHmac('sha1', secret + '&').update(stringToSignWithMethod).digest('base64');
  
  return signature;
}

/**
 * 调用阿里云API
 */
function callAliyunApi(action, params = {}) {
  return new Promise((resolve, reject) => {
    const commonParams = {
      Format: 'JSON',
      Version: '2015-01-09',
      AccessKeyId: config.accessKeyId,
      SignatureMethod: 'HMAC-SHA1',
      Timestamp: new Date().toISOString(),
      SignatureVersion: '1.0',
      SignatureNonce: Math.random().toString(),
      Action: action,
      ...params
    };

    const signature = sign(commonParams, config.accessKeySecret);
    commonParams.Signature = signature;

    const queryString = querystring.stringify(commonParams);
    const url = `https://${config.endpoint}/?${queryString}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.Code) {
            reject(new Error(`API错误: ${result.Code} - ${result.Message}`));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 查询域名解析记录
 */
async function describeDomainRecords(domain) {
  console.log(`\n🔍 查询域名 ${domain} 的解析记录...`);
  try {
    const result = await callAliyunApi('DescribeDomainRecords', {
      DomainName: domain
    });
    return result.DomainRecords?.Record || [];
  } catch (error) {
    console.error(`❌ 查询失败: ${error.message}`);
    return [];
  }
}

/**
 * 添加域名解析记录
 */
async function addDomainRecord(domain, rr, type, value, description) {
  console.log(`\n➕ 添加解析记录: ${rr === '@' ? domain : `${rr}.${domain}`} -> ${value}`);
  try {
    const result = await callAliyunApi('AddDomainRecord', {
      DomainName: domain,
      RR: rr,
      Type: type,
      Value: value,
      TTL: 600
    });
    console.log(`✅ 添加成功! 记录ID: ${result.RecordId}`);
    return result;
  } catch (error) {
    console.error(`❌ 添加失败: ${error.message}`);
    throw error;
  }
}

/**
 * 更新域名解析记录
 */
async function updateDomainRecord(recordId, rr, type, value) {
  console.log(`\n🔄 更新解析记录ID ${recordId}: ${rr} -> ${value}`);
  try {
    const result = await callAliyunApi('UpdateDomainRecord', {
      RecordId: recordId,
      RR: rr,
      Type: type,
      Value: value,
      TTL: 600
    });
    console.log(`✅ 更新成功!`);
    return result;
  } catch (error) {
    console.error(`❌ 更新失败: ${error.message}`);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始配置dbdog.com域名指向Vercel...\n');
  console.log('📋 配置清单:');
  records.forEach(r => {
    const fullDomain = r.rr === '@' ? r.domain : `${r.rr}.${r.domain}`;
    console.log(`  - ${fullDomain} (${r.type}) -> ${r.value} [${r.description}]`);
  });
  console.log(`\n⚠️  注意: Vercel CNAME地址: ${VERCEL_CNAME}`);
  console.log('   如果这个地址不正确，请在Vercel控制台获取正确的CNAME地址');
  console.log('\n📝 Vercel域名配置步骤:');
  console.log('   1. 在Vercel项目设置中添加域名: dbdog.com');
  console.log('   2. Vercel会显示需要配置的DNS记录');
  console.log('   3. 使用本脚本配置DNS记录');

  for (const record of records) {
    try {
      // 查询现有记录
      const existingRecords = await describeDomainRecords(record.domain);
      const existing = existingRecords.find(r => 
        r.RR === record.rr && r.Type === record.type
      );

      if (existing) {
        if (existing.Value === record.value || existing.Value === `${record.value}.`) {
          console.log(`\n✓ 记录 ${record.rr === '@' ? record.domain : `${record.rr}.${record.domain}`} 已存在且值正确，跳过`);
        } else {
          // 更新记录
          console.log(`\n⚠️  记录 ${record.rr === '@' ? record.domain : `${record.rr}.${record.domain}`} 已存在，但值不同:`);
          console.log(`    当前值: ${existing.Value}`);
          console.log(`    新值: ${record.value}`);
          await updateDomainRecord(existing.RecordId, record.rr, record.type, record.value);
        }
      } else {
        // 添加新记录
        await addDomainRecord(record.domain, record.rr, record.type, record.value, record.description);
      }
    } catch (error) {
      console.error(`\n❌ 配置 ${record.rr === '@' ? record.domain : `${record.rr}.${record.domain}`} 失败: ${error.message}`);
    }
  }

  console.log('\n\n🎉 DNS配置完成！');
  console.log('\n📌 访问地址:');
  records.forEach(r => {
    const fullDomain = r.rr === '@' ? r.domain : `${r.rr}.${r.domain}`;
    console.log(`  https://${fullDomain} -> Vercel部署`);
  });
  console.log('\n⏰ DNS记录通常在5-10分钟内生效，请耐心等待...');
  console.log('\n📝 后续步骤:');
  console.log('  1. 在Vercel控制台添加域名 dbdog.com');
  console.log('  2. 等待DNS生效后，Vercel会自动配置SSL证书');
  console.log('  3. 测试访问 https://dbdog.com');
}

// 执行
main().catch(error => {
  console.error('\n💥 配置过程出错:', error);
  process.exit(1);
});

