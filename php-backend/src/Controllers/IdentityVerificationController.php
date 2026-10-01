<?php
declare(strict_types=1);
namespace HambakTech\Controllers;
use HambakTech\Services\Identity\IdentityVerificationService;
use HambakTech\Utils\Response;
use RuntimeException;

final class IdentityVerificationController extends BaseController
{
    private IdentityVerificationService $service;
    public function __construct(?IdentityVerificationService $service=null){parent::__construct();$this->service=$service??new IdentityVerificationService();}
    public function status():void{Response::success($this->service->providerStatus(),'Identity provider status retrieved.');}
    public function verify():void{ $u=$this->getAuthUser(); $b=$this->getJsonBody(); try{ $op=strtoupper(trim((string)($b['operation']??''))); $result=$this->service->verify($op,$u['id'],$b); Response::success($result,'Identity verification completed.'); }catch(\Throwable $e){Response::error($e->getMessage(),$e->getCode()>=400&&$e->getCode()<600?$e->getCode():500,'IDENTITY_PROVIDER_ERROR');} }
    public function modification():void{$u=$this->getAuthUser();$b=$this->getJsonBody();try{Response::success($this->service->modification($u['id'],$b),'NIN modification order submitted.',201);}catch(\Throwable $e){Response::error($e->getMessage(),$e->getCode()>=400&&$e->getCode()<600?$e->getCode():500,'NIN_MODIFICATION_ERROR');}}
    public function modificationStatus():void{$this->getAuthUser();$ref=trim((string)($_GET['reference_id']??''));if($ref===''){Response::badRequest('reference_id is required.');return;}try{Response::success($this->service->modificationStatus($ref),'Modification status retrieved.');}catch(\Throwable $e){Response::error($e->getMessage(),$e->getCode()>=400&&$e->getCode()<600?$e->getCode():500,'NIN_MODIFICATION_STATUS_ERROR');}}
    public function balance():void{$this->requireRoles(['super_admin','admin','staff']);try{Response::success($this->service->balance(),'Veripine provider balance retrieved.');}catch(\Throwable $e){Response::error($e->getMessage(),$e->getCode()>=400&&$e->getCode()<600?$e->getCode():500,'VERIPINE_BALANCE_ERROR');}}
}
