<?php
declare(strict_types=1);
namespace HambakTech\Controllers;
use HambakTech\Config\Database;
use HambakTech\Services\Telecom\TelecomProviderInterface;
use HambakTech\Services\Telecom\VtpassAdapter;
use HambakTech\Services\Telecom\VtuNgAdapter;
use HambakTech\Services\WalletService;
use HambakTech\Utils\Response;
use RuntimeException;

final class TelecomController extends BaseController
{
    private WalletService $wallet;
    private array $providers;
    public function __construct(){parent::__construct();$this->wallet=new WalletService();$this->providers=['VTPASS'=>new VtpassAdapter(),'VTU_NG'=>new VtuNgAdapter()];}
    public function providers():void{$this->getAuthUser();$out=[];foreach($this->providers as $code=>$p)$out[]=['code'=>$code,'name'=>$code==='VTPASS'?'VTpass':'VTU.ng','configured'=>$p->configured()];Response::success($out,'Telecom providers retrieved.');}
    private function provider(string $code):TelecomProviderInterface{ $code=strtoupper(trim($code)); if(!isset($this->providers[$code]))throw new RuntimeException('Unsupported telecom provider.',400);return $this->providers[$code]; }
    public function variations():void{$this->getAuthUser();$provider=$this->provider((string)($_GET['provider']??''));$type=strtolower((string)($_GET['type']??'data'));try{Response::success($provider->variations($type,$_GET),'Telecom variations retrieved.');}catch(\Throwable $e){Response::error($e->getMessage(),$e->getCode()>=400&&$e->getCode()<600?$e->getCode():500,'TELECOM_PROVIDER_ERROR');}}
    public function verifyCustomer():void{$this->getAuthUser();$b=$this->getJsonBody();try{$p=$this->provider((string)($b['provider']??''));unset($b['provider']);Response::success($p->verifyCustomer($b),'Customer verification retrieved.');}catch(\Throwable $e){Response::error($e->getMessage(),$e->getCode()>=400&&$e->getCode()<600?$e->getCode():500,'TELECOM_VERIFY_ERROR');}}
    public function purchase():void{
        $u=$this->getAuthUser();$b=$this->getJsonBody();$providerCode=strtoupper(trim((string)($b['provider']??'')));$type=strtolower(trim((string)($b['type']??'')));$amount=(float)($b['amount']??0);
        if(!in_array($type,['airtime','data','electricity','tv'],true)){Response::badRequest('Supported telecom types are airtime, data, electricity and tv.');return;}
        if($amount<=0){Response::badRequest('A positive amount is required.');return;}
        $p=$this->provider($providerCode); if(!$p->configured()){Response::error($providerCode.' is not configured for production use yet.',503,'PROVIDER_NOT_CONFIGURED');return;}
        $requestId='HT'.date('YmdHi').strtoupper(bin2hex(random_bytes(5))); $reference='TEL-'.$requestId;
        $this->wallet->debit($u['id'],$amount,$reference,'TELECOM_'.$type,'Telecom '.$type.' purchase via '.$providerCode);
        $pdo=Database::getConnection();$pdo->prepare('INSERT INTO telecom_transactions (id,user_id,reference,provider,service_type,request_id,amount,status,request_payload,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,NOW(),NOW())')->execute(['tel-'.bin2hex(random_bytes(10)),$u['id'],$reference,$providerCode,$type,$requestId,$amount,'PROCESSING',json_encode($b,JSON_UNESCAPED_SLASHES)]);
        try { unset($b['provider'],$b['type']); $result=$p->purchase($type,$b,$requestId); }
        catch(\Throwable $e){ $pdo->prepare('UPDATE telecom_transactions SET status=?, response_payload=?, updated_at=NOW() WHERE request_id=?')->execute(['FAILED',json_encode(['error'=>$e->getMessage()]),$requestId]); $this->wallet->credit($u['id'],$amount,$reference.'-REFUND','REFUND','Refund for failed telecom '.$type); Response::error($e->getMessage(),$e->getCode()>=400&&$e->getCode()<600?$e->getCode():502,'TELECOM_PURCHASE_ERROR'); return; }
        $status=$this->mapStatus($providerCode,$result);
        try { $pdo->prepare('UPDATE telecom_transactions SET status=?, provider_reference=?, response_payload=?, updated_at=NOW() WHERE request_id=?')->execute([$status,$this->providerReference($providerCode,$result),json_encode($result,JSON_UNESCAPED_SLASHES),$requestId]); } catch(\Throwable $e){ error_log('Telecom transaction persistence failed for '.$requestId.': '.$e->getMessage()); }
        if($status==='FAILED'||$status==='REFUNDED'){$this->wallet->credit($u['id'],$amount,$reference.'-REFUND','REFUND','Refund for failed telecom '.$type);}
        Response::success(['reference'=>$reference,'requestId'=>$requestId,'provider'=>$providerCode,'serviceType'=>$type,'status'=>$status,'providerResponse'=>$this->safeProviderResponse($result)],'Telecom purchase submitted.');
    }
    public function requery():void{$u=$this->getAuthUser();$requestId=trim((string)($_GET['request_id']??''));if($requestId===''){Response::badRequest('request_id is required.');return;}$pdo=Database::getConnection();$s=$pdo->prepare('SELECT * FROM telecom_transactions WHERE request_id=? AND user_id=? LIMIT 1');$s->execute([$requestId,$u['id']]);$tx=$s->fetch();if(!$tx){Response::notFound('Telecom transaction not found.');return;}try{$r=$this->provider($tx['provider'])->requery($requestId);Response::success(['reference'=>$tx['reference'],'requestId'=>$requestId,'status'=>$this->mapStatus($tx['provider'],$r),'providerResponse'=>$this->safeProviderResponse($r)],'Telecom transaction requery completed.');}catch(\Throwable $e){Response::error($e->getMessage(),$e->getCode()>=400&&$e->getCode()<600?$e->getCode():502,'TELECOM_REQUERY_ERROR');}}
    public function vtuWebhook():void{ $raw=file_get_contents('php://input')?:''; $sig=$_SERVER['HTTP_X_SIGNATURE']??''; $pin=(string)\HambakTech\Config\Env::get('VTU_NG_USER_PIN',''); if($pin===''||$sig===''||!hash_equals(hash_hmac('sha256',$raw,$pin),$sig)){http_response_code(403);echo json_encode(['success'=>false,'message'=>'Invalid signature']);return;} $d=json_decode($raw,true);$requestId=(string)($d['request_id']??'');$status=(string)($d['status']??'');if($requestId===''){http_response_code(400);echo json_encode(['success'=>false,'message'=>'Missing request_id']);return;} $pdo=Database::getConnection();$s=$pdo->prepare('SELECT * FROM telecom_transactions WHERE request_id=? LIMIT 1');$s->execute([$requestId]);$tx=$s->fetch();if(!$tx){http_response_code(404);echo json_encode(['success'=>false,'message'=>'Transaction not found']);return;} $new=in_array($status,['completed-api','completed','success'],true)?'SUCCESSFUL':(in_array($status,['refunded','failed'],true)?'REFUNDED':'PROCESSING');$pdo->prepare('UPDATE telecom_transactions SET status=?,provider_reference=?,response_payload=?,updated_at=NOW() WHERE request_id=?')->execute([$new,(string)($d['order_id']??''),$raw,$requestId]);if($new==='REFUNDED'&&$tx['status']!=='REFUNDED')$this->wallet->credit($tx['user_id'],$tx['amount'],$tx['reference'].'-REFUND','REFUND','Provider refund for telecom transaction');http_response_code(200);echo json_encode(['response'=>'success']); }
    private function mapStatus(string $provider,array $r):string{if($provider==='VTU_NG'){ $s=strtolower((string)($r['data']['status']??$r['status']??''));return str_contains($s,'refund')?'REFUNDED':(str_contains($s,'complete')?'SUCCESSFUL':(str_contains($s,'fail')?'FAILED':'PROCESSING')); } $code=(string)($r['code']??$r['response_description']??'');$inner=strtolower((string)($r['content']['transactions']['status']??''));return in_array($inner,['delivered','completed'],true)||$code==='000'?'SUCCESSFUL':(str_contains($inner,'fail')?'FAILED':'PROCESSING');}
    private function providerReference(string $p,array $r):string{return $p==='VTU_NG'?(string)($r['data']['order_id']??''):(string)($r['content']['transactions']['transactionId']??$r['transactionId']??'');}
    private function safeProviderResponse(array $r):array{ $json=json_decode(json_encode($r),true); foreach(['token','pin','password','secret','api_key'] as $k)$this->redact($json,$k); return $json; }
    private function redact(&$v,string $target):void{if(!is_array($v))return;foreach($v as $k=>&$x){if(strtolower((string)$k)===$target)$x='[REDACTED]';else if(is_array($x))$this->redact($x,$target);}}
}
