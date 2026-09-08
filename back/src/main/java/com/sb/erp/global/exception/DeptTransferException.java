package com.sb.erp.global.exception;


/*
* 부서 해체(사원 이관) 처리 중 실패 시, "어떤 대상 때문에 실패했는지"를 담아
* 트랜잭션 전체 롤백과 함께 사용자에게 원인을 알려주기 위한 커스텀 예외.
*/
public class DeptTransferException extends RuntimeException {
	private static final long serialVersionUID = 1L;
	 
    private final String errorCode;
 
    public DeptTransferException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
 
    public DeptTransferException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
 
    public String getErrorCode() {
        return errorCode;
    }
}
