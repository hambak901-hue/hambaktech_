<?php
declare(strict_types=1);
namespace HambakTech\Services\Identity;

use HambakTech\Config\Database;
use HambakTech\Utils\Money;
use HambakTech\Services\WalletService;
use RuntimeException;

final class IdentityVerificationService
{
    private VeripineAdapter $provider;
    private WalletService $wallet;
    public function __construct(?VeripineAdapter $provider=null, ?WalletService $wallet=null) { $this->provider=$provider??new VeripineAdapter(); $this->wallet=$wallet??new WalletService(); }

    public function providerStatus(): array { return ['provider'=>'VERIPINE','configured'=>$this->provider->configured(),'baseUrl'=>$this->provider->configured() ? 'configured' : null]; }

    public function verify(string $type, string $userId, array $input): array
    {
        $map = [
            'NIN_VERIFICATION'=>['path'=>'nin-verification','field'=>'nin','setting'=>'veripine_nin_verification_price'],
            'NIN_PHONE'=>['path'=>'nin-phone','field'=>'phone','setting'=>'veripine_nin_phone_price'],
            'NIN_TRACKING'=>['path'=>'nin-tracking','field'=>'tracking_id','setting'=>'veripine_nin_tracking_price'],
            'NIN_DEMOGRAPHY'=>['path'=>'nin-demography','field'=>null,'setting'=>'veripine_nin_demography_price'],
            'BVN_VERIFICATION'=>['path'=>'bvn-verification','field'=>'bvn','setting'=>'veripine_bvn_verification_price'],
            'BVN_PHONE'=>['path'=>'bvn-phone','field'=>'phone','setting'=>'veripine_bvn_phone_price'],
        ];
        if (!isset($map[$type])) throw new RuntimeException('Unsupported identity operation.', 400);
        $cfg=$map[$type];
        $price=$this->price($cfg['setting']);
        if ($price === null || Money::compare($price,'0')<=0) throw new RuntimeException('This identity service price has not been configured by HambakTech administration.', 503);
        $payload=[];
        if ($cfg['field']) { $value=trim((string)($input[$cfg['field']]??'')); if ($value==='') throw new RuntimeException(strtoupper($cfg['field']).' is required.',400); if(in_array($cfg['field'],['nin','bvn'],true) && !preg_match('/^\d{11}$/',$value)) throw new RuntimeException(strtoupper($cfg['field']).' must be exactly 11 digits.',400); if($cfg['field']==='phone' && !preg_match('/^0\d{10}$/',$value)) throw new RuntimeException('Phone number must be exactly 11 digits and start with 0.',400); $payload[$cfg['field']]=$value; }
        if ($type==='NIN_DEMOGRAPHY') {
            foreach(['firstname','lastname','gender','dob'] as $f){$v=trim((string)($input[$f]??'')); if($v==='') throw new RuntimeException($f.' is required.',400); $payload[$f]=$v;} if(!in_array(strtolower($payload['gender']),['male','female'],true)) throw new RuntimeException('Gender must be male or female.',400); if(!preg_match('/^\d{4}-\d{2}-\d{2}$/',$payload['dob'])) throw new RuntimeException('Date of birth must use YYYY-MM-DD format.',400);
        }
        $payload['consent']=true;
        $reference='IDV-'.strtoupper(bin2hex(random_bytes(7)));
        $this->wallet->debit($userId,$price,$reference,'IDENTITY_VERIFICATION','Veripine '.$type.' verification');
        try {
            $response=$this->provider->request($cfg['path'],'POST',$payload);
        } catch (\Throwable $e) {
            $this->wallet->credit($userId,$price,$reference.'-REFUND','REFUND','Refund for failed Veripine '.$type.' verification');
            throw $e;
        }
        $data=$this->minimize($response['data']??[],$type);
        try { $this->record($userId,$reference,$type,$price,$data); } catch (\Throwable $e) { error_log('Identity verification record persistence failed for '.$reference.': '.$e->getMessage()); }
        return ['reference'=>$reference,'operation'=>$type,'status'=>'SUCCESSFUL','amount'=>$price,'data'=>$data,'message'=>$response['message']??'Verification completed.'];
    }

    public function modification(string $userId,array $input): array
    {
        $service=(string)($input['service_type']??'');
        if ($service!=='nin_name_modification') throw new RuntimeException('Only nin_name_modification is implemented because that is the exact modification payload documented by Veripine. Phone/address modification fields require the provider contract before we expose them.',400);
        $price=$this->price('veripine_nin_modification_price');
        if($price===null||Money::compare($price,'0')<=0) throw new RuntimeException('NIN modification price is not configured.',503);
        $fields=['nin','surname','firstname','phone_number','new_surname','new_firstname']; $payload=[];
        foreach($fields as $f){$v=trim((string)($input[$f]??'')); if($v==='') throw new RuntimeException($f.' is required.',400); $payload[$f]=$v;} if(!preg_match('/^\d{11}$/',$payload['nin'])) throw new RuntimeException('NIN must be exactly 11 digits.',400); if(!preg_match('/^0\d{10}$/',$payload['phone_number'])) throw new RuntimeException('Phone number must be exactly 11 digits and start with 0.',400);
        $payload['service_type']=$service; $payload['consent']=true;
        $reference='NMOD-'.strtoupper(bin2hex(random_bytes(7)));
        $this->wallet->debit($userId,$price,$reference,'NIN_MODIFICATION','Veripine NIN name modification order');
        try { $response=$this->provider->request('nin-modification','POST',$payload); }
        catch(\Throwable $e){$this->wallet->credit($userId,$price,$reference.'-REFUND','REFUND','Refund for failed NIN modification request'); throw $e;}
        $data=$response['data']??[]; try { $this->record($userId,$reference,'NIN_MODIFICATION',$price,['reference_id'=>$data['reference_id']??null,'status'=>$data['status']??'pending']); } catch(\Throwable $e){ error_log('NIN modification record persistence failed for '.$reference.': '.$e->getMessage()); }
        return ['reference'=>$reference,'status'=>'PENDING','amount'=>$price,'data'=>$data];
    }

    public function modificationStatus(string $reference): array { return $this->provider->request('nin-modification-status','GET',['reference_id'=>$reference]); }
    public function balance(): array { return $this->provider->request('balance','GET'); }

    private function price(string $key): ?string { $pdo=Database::getConnection(); $s=$pdo->prepare('SELECT value FROM system_settings WHERE `key`=? LIMIT 1'); $s->execute([$key]); $v=$s->fetchColumn(); return $v===false?null:(string)$v; }
    private function record(string $userId,string $reference,string $operation,string $amount,array $data):void { $pdo=Database::getConnection(); $s=$pdo->prepare('INSERT INTO identity_verifications (id,user_id,reference,provider,operation,amount,status,provider_reference,result_summary,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,NOW(),NOW())'); $providerRef=(string)($data['reference_id']??$data['reportID']??''); $summary=json_encode($this->maskRecursive($data),JSON_UNESCAPED_SLASHES); $s->execute(['idv-'.bin2hex(random_bytes(10)),$userId,$reference,'VERIPINE',$operation,$amount,'SUCCESSFUL',$providerRef,$summary]); }
    private function minimize(array $data,string $type): array { $allowed=$type==='NIN_VERIFICATION'?['firstname','middlename','surname','gender','birthdate','residence_state']:($type==='BVN_VERIFICATION'?['firstname','middlename','lastname','phone','dob','gender','state_of_residence','nationality']:['nin','firstname','surname']); $out=[]; foreach($allowed as $k){if(array_key_exists($k,$data))$out[$k]=$k==='phone'?$this->maskPhone((string)$data[$k]):$data[$k];} if(isset($data['nin']))$out['nin']=$this->maskNumber((string)$data['nin']); if(isset($data['bvn']))$out['bvn']=$this->maskNumber((string)$data['bvn']); return $out; }
    private function maskRecursive(array $data):array { $out=[]; foreach($data as $k=>$v){ if(in_array(strtolower((string)$k),['nin','bvn','phone','telephoneno','photo'],true)){ $out[$k]=strtolower((string)$k)==='photo'?'[REDACTED]':(is_scalar($v)?$this->maskNumber((string)$v):'[REDACTED]'); } else $out[$k]=is_array($v)?$this->maskRecursive($v):$v; } return $out; }
    private function maskNumber(string $v):string { $d=preg_replace('/\D+/','',$v)??''; return strlen($d)>4?'***'.substr($d,-4):'***'; }
    private function maskPhone(string $v):string { return $this->maskNumber($v); }
}
