const express = require('express');
const router = express.Router();
const https = require('https');

// API密钥
const API_KEYS = {
  amap: 'f82dbd3f01c1f3622f964dd2deb99ccc',
  tencent: 'UYFBZ-FPQKL-YSAPN-MGEZB-RQ3AF-Q7BSW'
};

// 判断是否为国内坐标
function isChinaCoordinate(lat, lng) {
  return lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135;
}

// 查询高德API
function queryAmap(lat, lng) {
  return new Promise((resolve, reject) => {
    const url = `https://restapi.amap.com/v3/geocode/regeo?key=${API_KEYS.amap}&location=${lng},${lat}&output=json`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// 查询腾讯API
function queryTencent(lat, lng) {
  return new Promise((resolve, reject) => {
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${API_KEYS.tencent}&get_poi=0`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// 解析高德返回结果
function parseAmapResult(result) {
  if (!result.status || result.status !== '1') {
    return null;
  }
  
  const addrComp = result.regeocode.addressComponent;
  
  // 处理city字段可能为空数组的问题
  let city = addrComp.city || '';
  if (Array.isArray(city)) {
    city = '';
  }
  
  // 如果city为空，且province包含"市"，则从province提取
  if (!city && addrComp.province) {
    if (addrComp.province.includes('市')) {
      city = addrComp.province;
    } else if (addrComp.province.includes('省')) {
      // 省级城市在district中
      city = addrComp.district || '';
    }
  }
  
  return {
    country: addrComp.country || '',
    province: addrComp.province || '',
    city: city,
    district: addrComp.district || '',
    township: addrComp.township || '',
    formatted_address: result.regeocode.formatted_address || ''
  };
}

// 解析腾讯返回结果
function parseTencentResult(result) {
  if (result.status !== 0) {
    return null;
  }
  
  const addrComp = result.result.address_component;
  const formatted_addresses = result.result.formatted_addresses;
  
  return {
    country: addrComp.nation || '',
    province: addrComp.province || '',
    city: addrComp.city || '',
    district: addrComp.district || '',
    township: addrComp.street || '',
    formatted_address: formatted_addresses ? (formatted_addresses.recommend || formatted_addresses.rough || '') : ''
  };
}

// POST /api/geocode/reverse
// 反向地理编码：坐标 → 地址
router.post('/reverse', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '缺少坐标参数'
      });
    }
    
    // 判断是否为国内坐标
    const isChina = isChinaCoordinate(latitude, longitude);
    
    if (!isChina) {
      return res.json({
        success: true,
        data: {
          country: '',
          province: '',
          city: '',
          district: '',
          township: '',
          formatted_address: '',
          message: '暂仅支持国内地点'
        }
      });
    }
    
    // 优先使用高德API
    let result = null;
    let source = 'unknown';
    
    try {
      const amapResult = await queryAmap(latitude, longitude);
      result = parseAmapResult(amapResult);
      source = 'amap';
    } catch (error) {
      console.warn('高德API调用失败:', error.message);
      
      // 降级到腾讯API
      try {
        const tencentResult = await queryTencent(latitude, longitude);
        result = parseTencentResult(tencentResult);
        source = 'tencent';
      } catch (error2) {
        console.error('腾讯API调用失败:', error2.message);
        return res.status(500).json({
          success: false,
          message: '地址解析失败'
        });
      }
    }
    
    if (!result) {
      return res.status(500).json({
        success: false,
        message: '无法解析该坐标'
      });
    }
    
    // 返回结果
    res.json({
      success: true,
      data: {
        ...result,
        latitude,
        longitude,
        source // API来源标识
      }
    });
    
  } catch (error) {
    console.error('逆地理编码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

module.exports = router;

