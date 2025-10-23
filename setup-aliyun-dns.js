#!/usr/bin/env node
/**
 * 阿里云DNS配置脚本
 * 为FilmTrip项目配置域名解析
 */

const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');

// 阿里云配置（从环境变量读取）
const config = {
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
  endpoint: 'alidns.cn-hangzhou.aliyuncs.com'
};

// 检查配置
if (!config.accessKeyId || !config.accessKeySecret) {
  console.error('❌ 错误: 请设置环境变量 ALIYUN_ACCESS_KEY_ID 和 ALIYUN_ACCESS_KEY_SECRET');
  console.log('\n使用方法:');
  console.log('  ALIYUN_ACCESS_KEY_ID=your_key ALIYUN_ACCESS_KEY_SECRET=your_secret node setup-aliyun-dns.js');
  process.exit(1);
}

// Vercel IP
const VERCEL_IP = '76.76.21.21';

// 要配置的域名记录
const records = [
  { domain: 'imhw.top', rr: 'filmtrip', type: 'A', value: VERCEL_IP, description: 'FilmTrip前端' },
  { domain: 'imhw.top', rr: 'api.filmtrip', type: 'A', value: VERCEL_IP, description: 'FilmTrip后端API' },
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
  console.log('🚀 开始配置FilmTrip域名解析...\n');
  console.log('📋 配置清单:');
  records.forEach(r => {
    console.log(`  - ${r.rr}.${r.domain} (${r.type}) -> ${r.value} [${r.description}]`);
  });

  for (const record of records) {
    try {
      // 查询现有记录
      const existingRecords = await describeDomainRecords(record.domain);
      const existing = existingRecords.find(r => 
        r.RR === record.rr && r.Type === record.type
      );

      if (existing) {
        if (existing.Value === record.value) {
          console.log(`\n✓ 记录 ${record.rr}.${record.domain} 已存在且值正确，跳过`);
        } else {
          // 更新记录
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
  console.log('  前端: http://filmtrip.imhw.top (5-10分钟后生效)');
  console.log('  后端: http://api.filmtrip.imhw.top');
  console.log('\n⏰ DNS记录通常在5-10分钟内生效，请耐心等待...');
  console.log('\n🔐 Vercel会自动配置HTTPS证书，生效后可使用:');
  console.log('  前端: https://filmtrip.imhw.top');
  console.log('  后端: https://api.filmtrip.imhw.top');
}

// 执行
main().catch(error => {
  console.error('\n💥 配置过程出错:', error);
  process.exit(1);
});

