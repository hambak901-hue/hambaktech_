<?php
declare(strict_types=1);
namespace HambakTech\Services\Telecom;
use HambakTech\Config\Env;
use RuntimeException;
final class VtpassAdapter implements TelecomProviderInterface
{
    private string $base; private string $api; private string $public; private string $secret;
    public function __construct(){ $live=Env::getBool('VTPASS_LIVE',false); $this->base=rtrim($live?'https://vtpass.com/api/':'https://sandbox.vtpass.com/api/','/'); $this->api=trim((string)Env::get('VTPASS_API_KEY','')); $this->public=trim((string)Env::get('VTPASS_PUBLIC_KEY','')); $this->secret=trim((string)Env::get('VTPASS_SECRET_KEY','')); }
    public function code():string{return 'VTPASS';} public function configured():bool{return $this->api!==''&&$this->public!==''&&$this->secret!=='';}
    private function call(string $method,string $path,array $payload=[]):array{if(!$this->configured())throw new RuntimeException('VTpass API is not configured on the server.',503);$ch=curl_init($this->base.'/'.$path);$h=['Accept: application/json','Content-Type: application/json','api-key: '.$this->api,($method==='GET'?'public-key: ':'secret-key: ').($method==='GET'?$this->public:$this->secret)];curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>40,CURLOPT_CONNECTTIMEOUT=>10,CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_HTTPHEADER=>$h]);if($method!=='GET')curl_setopt($ch,CURLOPT_POSTFIELDS,json_encode($payload));else if($payload)curl_setopt($ch,CURLOPT_URL,$this->base.'/'.$path.'?'.http_build_query($payload));$raw=curl_exec($ch);$status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE);$err=curl_error($ch);curl_close($ch);if($raw===false)throw new RuntimeException('VTpass connection failed: '.$err,502);$data=json_decode($raw,true);if(!is_array($data))throw new RuntimeException('VTpass returned invalid JSON.',502);if($status>=400)throw new RuntimeException((string)($data['response_description']??$data['message']??'VTpass request failed.'),$status);return $data;}
    public function variations(string $type,array $input=[]):array{if($type==='data'||$type==='tv')return $this->call('GET','service-variations',['serviceID'=>$input['serviceID']??'']);return $this->call('GET','services',['identifier'=>$type]);}
    public function verifyCustomer(array $input):array{return $this->call('POST','merchant-verify',['serviceID'=>$input['serviceID'],'billersCode'=>$input['billersCode'],'type'=>$input['type']??null]);}
    public function purchase(string $type,array $input,string $requestId):array{ $serviceId=(string)($input['serviceID']??''); $payload=['request_id'=>$requestId,'serviceID'=>$serviceId,'phone'=>(string)($input['phone']??''),'amount'=>(int)($input['amount']??0),'billersCode'=>(string)($input['billersCode']??''),'variation_code'=>(string)($input['variationCode']??''),'subscription_type'=>(string)($input['subscriptionType']??'')]; foreach(['phone','amount','billersCode','variation_code','subscription_type'] as $k)if($payload[$k]===''||$payload[$k]===0)unset($payload[$k]); return $this->call('POST','pay',$payload); }
    public function requery(string $requestId):array{return $this->call('POST','requery',['request_id'=>$requestId]);}
}
