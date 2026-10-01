const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const required = [
  'php-backend/src/Services/Identity/VeripineAdapter.php',
  'php-backend/src/Services/Identity/IdentityVerificationService.php',
  'php-backend/src/Controllers/IdentityVerificationController.php',
  'php-backend/src/Services/Telecom/VtpassAdapter.php',
  'php-backend/src/Services/Telecom/VtuNgAdapter.php',
  'php-backend/src/Controllers/TelecomController.php',
  'src/app/dashboard/nin/page.tsx',
  'src/app/dashboard/telecom/page.tsx',
  'database/migrations/2026-09-28-identity-telecom.sql',
  'docs/contracts/veripine-contract.md'
];
let pass=0;
for (const file of required) { if(!fs.existsSync(path.join(root,file))) throw new Error(`Missing ${file}`); pass++; }
const checks = [
  [/VERIPINE_API_KEY/, 'Veripine server credential reference'],
  [/VTPASS_SECRET_KEY/, 'VTpass secret credential reference'],
  [/VTU_NG_USER_PIN/, 'VTU.ng webhook secret reference'],
  [/nin-verification/, 'Veripine NIN operation'],
  [/nin-phone/, 'Veripine NIN phone operation'],
  [/nin-tracking/, 'Veripine NIN tracking operation'],
  [/nin-demography/, 'Veripine NIN demographics operation'],
  [/bvn-verification/, 'Veripine BVN operation'],
  [/bvn-phone/, 'Veripine BVN phone operation'],
  [/nin-modification-status/, 'Veripine modification status'],
  [/api\/telecom\/purchase/, 'Telecom backend purchase route'],
  [/hash_hmac\('sha256'/, 'VTU.ng HMAC verification'],
];
const all = required.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
for(const [re,label] of checks){if(!re.test(all)) throw new Error(`Missing check: ${label}`);pass++;}
if(/NEXT_PUBLIC_(VERIPINE|VTPASS|VTU)/.test(fs.readFileSync(path.join(root,'.env.example'),'utf8'))) throw new Error('Provider secrets must not be public env variables');
console.log(`M7 provider static audit: ${pass}/${required.length+checks.length} PASS`);
