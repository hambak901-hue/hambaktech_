const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function makeReq(path, method, body, cookies = []) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (cookies.length) {
      reqHeaders['Cookie'] = cookies.map(c => c.split(';')[0]).join('; ');
    }
    if (data) {
      reqHeaders['Content-Length'] = Buffer.byteLength(data);
    }
    const resCookies = [...cookies];
    const req = https.request('https://business.hambaktech.com.ng' + path, {
      agent,
      method,
      headers: reqHeaders
    }, (res) => {
      if (res.headers['set-cookie']) {
        resCookies.push(...res.headers['set-cookie']);
      }
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(b), cookies: resCookies });
        } catch {
          resolve({ status: res.statusCode, raw: b, cookies: resCookies });
        }
      });
    });
    if (data) req.write(data);
    req.end();
  });
}

async function setPassword(email, targetPassword) {
  let loginRes = await makeReq('/api/auth/login', 'POST', {
    credential: email,
    password: targetPassword
  });
  if (loginRes.status === 200) {
    console.log('[OK] ' + email + ' already has target password.');
    return;
  }

  loginRes = await makeReq('/api/auth/login', 'POST', {
    credential: email,
    password: 'Password123#Dummy!'
  });
  if (loginRes.status !== 200) {
    console.log('[FAIL] Could not login as ' + email + ': ' + (loginRes.data?.message || loginRes.raw));
    return;
  }

  const pwRes = await makeReq('/api/profile/password', 'POST', {
    currentPassword: 'Password123#Dummy!',
    newPassword: targetPassword
  }, loginRes.cookies);

  if (pwRes.status === 200) {
    console.log('[UPDATED] ' + email + ' password updated.');
  } else {
    console.log('[ERR] ' + email + ' update failed: ' + (pwRes.data?.message || pwRes.raw));
  }
}

async function run() {
  const accounts = [
    ['customer@hambaktech.com.ng', 'Admin@123456'],
    ['student@hambaktech.com.ng', 'Admin@123456'],
    ['agent@hambaktech.com.ng', 'Admin@123456'],
    ['corporate@hambaktech.com.ng', 'Admin@123456'],
    ['staff@hambaktech.com.ng', 'Admin@123456'],
    ['manager@hambaktech.com.ng', 'Admin@123456'],
    ['superadmin@hambaktech.com.ng', 'Admin@123456'],
    ['hambak901@gmail.com', 'Admin@123456'],
  ];

  for (const [em, pw] of accounts) {
    await setPassword(em, pw);
  }
}

run();
