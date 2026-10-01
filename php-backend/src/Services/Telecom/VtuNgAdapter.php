<?php
declare(strict_types=1);
namespace HambakTech\Services\Telecom;
use HambakTech\Config\Env;
use RuntimeException;
final class VtuNgAdapter implements TelecomProviderInterface
{
    private string $base; private string $user; private string $pass; private string $pin; private ?string $token=null;
    public function __construct(){ $this->base='https://vtu.ng/wp-json'; $this->user=trim((string)Env::get('VTU_NG_USERNAME','')); $this->pass=(string)Env::get('VTU_NG_PASSWORD',''); $this->pin=(string)Env::get('VTU_NG_USER_PIN',''); }
    public function code():string{return 'VTU_NG';} public function configured():bool{return $this->user!==''&&$this->pass!==''&&$this->pin!=='';}
    private function token():string{if(!$this->configured())throw new RuntimeException('VTU.ng API credentials are not configured on the server.',503);$ch=curl_init($this->base.'/jwt-auth/v1/token');curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>30,CURLOPT_POST=>true,CURLOPT_HTTPHEADER=>['Content-Type: application/json'],CURLOPT_POSTFIELDS=>json_encode(['username'=>$this->user,'password'=>$this->pass])]);$raw=curl_exec($ch);$status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE);curl_close($ch);$d=json_decode((string)$raw,true);if($status>=400||!is_array($d)||empty($d['token']))throw new RuntimeException('VTU.ng authentication failed.',502);return $this->token=(string)$d['token'];}
    private function call(string $method,string $path,array $payload=[]):array{$token=$this->token();$ch=curl_init($this->base.'/'.$path);curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>40,CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_HTTPHEADER=>['Accept: application/json','Content-Type: application/json','Authorization: Bearer '.$token]]);if($method!=='GET')curl_setopt($ch,CURLOPT_POSTFIELDS,json_encode($payload));else if($payload)curl_setopt($ch,CURLOPT_URL,$this->base.'/'.$path.'?'.http_build_query($payload));$raw=curl_exec($ch);$status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE);curl_close($ch);$d=json_decode((string)$raw,true);if($status>=400||!is_array($d))throw new RuntimeException((string)($d['message']??'VTU.ng request failed.'),$status>=400?$status:502);if(isset($d['code'])&&$d['code']!=='success')throw new RuntimeException((string)($d['message']??'VTU.ng request failed.'),400);return $d;}
    public function variations(string $type,array $input=[]):array{$path=$type==='data'?'api/v2/variations/data':($type==='tv'?'api/v2/variations/tv':'api/v2/balance');return $this->call('GET',$path,$input);}
    public function verifyCustomer(array $input):array{ $payload=['customer_id'=>(string)($input['customer_id']??$input['billersCode']??''),'service_id'=>(string)($input['service_id']??$input['serviceID']??''),'variation_id'=>(string)($input['variation_id']??$input['meterType']??'')]; return $this->call('POST','api/v2/verify-customer',$payload); }
    public function purchase(string $type,array $input,string $requestId):array{ $map=['airtime'=>'api/v2/airtime','data'=>'api/v2/data','electricity'=>'api/v2/electricity','tv'=>'api/v2/tv']; if(!isset($map[$type]))throw new RuntimeException('Unsupported VTU.ng service.',400);$input['request_id']=$requestId;return $this->call('POST',$map[$type],$input); }
    public function requery(string $requestId):array{return $this->call('POST','api/v2/requery',['request_id'=>$requestId]);}
}
