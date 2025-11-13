#!/usr/bin/env node
/**
 * 阿里云DNS配置脚本 - 配置又拍云CDN域名
 * 为FilmTrip项目配置 img.filmtrip.cn -> 又拍云CDN
 */

const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');

// 从密钥文件读取配置
const path = require('path');
const fs = require('fs');

// 尝试加载密钥文件
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
  console.log('     ALIYUN_ACCESS_KEY_ID=your_key ALIYUN_ACCESS_KEY_SECRET=your_secret node setup-aliyun-cdn-dns.js');
  process.exit(1);
}

// 又拍云CDN CNAME地址（需要在又拍云控制台获取）
// 如果没有配置CNAME，可以使用默认的CDN域名
const UPYUN_CDN_CNAME = process.env.UPYUN_CDN_CNAME || 'filmtrip-dev.test.upcdn.net';

// 又拍云域名验证TXT记录值
const UPYUN_VERIFY_TXT = process.env.UPYUN_VERIFY_TXT || '70605d3b11fe9fb69f87a6efbf35547a';

// 要配置的域名记录
const records = [
  // 步骤1: 添加又拍云域名验证TXT记录（必须先完成验证才能绑定域名）
  { 
    domain: 'filmtrip.cn', 
    rr: 'upyun-verify', 
    type: 'TXT', 
    value: UPYUN_VERIFY_TXT, 
    description: '又拍云域名验证（TXT记录）' 
  },
  // 步骤2: 添加CDN域名CNAME记录（验证通过后）
  { 
    domain: 'filmtrip.cn', 
    rr: 'img', 
    type: 'CNAME', 
    value: UPYUN_CDN_CNAME, 
    description: '又拍云CDN域名（生产环境）' 
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
  console.log(`\n➕ 添加解析记录: ${rr}.${domain} -> ${value}`);
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
  console.log('🚀 开始配置FilmTrip又拍云CDN域名解析...\n');
  console.log('📋 配置清单:');
  records.forEach(r => {
    console.log(`  - ${r.rr}.${r.domain} (${r.type}) -> ${r.value} [${r.description}]`);
  });
  console.log(`\n⚠️  注意: 又拍云CDN CNAME地址: ${UPYUN_CDN_CNAME}`);
  console.log('   如果这个地址不正确，请在又拍云控制台获取正确的CNAME地址');

  for (const record of records) {
    try {
      // 查询现有记录
      const existingRecords = await describeDomainRecords(record.domain);
      const existing = existingRecords.find(r => 
        r.RR === record.rr && r.Type === record.type
      );

      if (existing) {
        if (existing.Value === record.value || existing.Value === `${record.value}.`) {
          console.log(`\n✓ 记录 ${record.rr}.${record.domain} 已存在且值正确，跳过`);
        } else {
          // 更新记录
          console.log(`\n⚠️  记录 ${record.rr}.${record.domain} 已存在，但值不同:`);
          console.log(`    当前值: ${existing.Value}`);
          console.log(`    新值: ${record.value}`);
          await updateDomainRecord(existing.RecordId, record.rr, record.type, record.value);
        }
      } else {
        // 添加新记录
        await addDomainRecord(record.domain, record.rr, record.type, record.value, record.description);
      }
    } catch (error) {
      console.error(`\n❌ 配置 ${record.rr}.${record.domain} 失败: ${error.message}`);
    }
  }

  console.log('\n\n🎉 DNS配置完成！');
  console.log('\n📌 访问地址:');
  records.forEach(r => {
    console.log(`  https://${r.rr}.${r.domain} -> 又拍云CDN`);
  });
  console.log('\n⏰ DNS记录通常在5-10分钟内生效，请耐心等待...');
  console.log('\n📝 后续步骤:');
  console.log('  1. 在又拍云控制台绑定域名 img.filmtrip.cn');
  console.log('  2. 配置SSL证书');
  console.log('  3. 等待DNS生效后测试访问');
}

// 执行
main().catch(error => {
  console.error('\n💥 配置过程出错:', error);
  process.exit(1);
});

