const bcrypt = require('bcryptjs');

// 测试密码哈希和验证
const password = 'admin123';
const hashedPassword = bcrypt.hashSync(password, 12);

console.log('原始密码:', password);
console.log('哈希密码:', hashedPassword);
console.log('验证结果:', bcrypt.compareSync(password, hashedPassword));

// 测试从数据库读取的哈希
const dbHash = '$2a$12$QTW9uVlFzJaY.D.kqhPFVeQ2vSwRkD7FA6OBcYoVB.vHr19jr59C.';
console.log('数据库哈希:', dbHash);
console.log('数据库验证结果:', bcrypt.compareSync(password, dbHash));
