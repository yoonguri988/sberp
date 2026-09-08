SET DEFINE OFF;

-- ============================================================================
-- final_last_triggers.sql
--
-- 목적: final_last.sql 을 전체 실행한 "이후" 이어 붙여서 실행하는 추가 스크립트입니다.
--       final_last.sql 자체는 건드리지 않고, 거기서 빠져 있던 CREATED_AT/UPDATED_AT
--       (및 그에 준하는 기록일시 컬럼) 자동 채움용 Oracle 트리거만 추가합니다.
--
-- 검토 방법
--   1) final_last.sql의 50개 테이블 전체를 대상으로, CREATED_AT/UPDATED_AT 컬럼이
--      있는 테이블마다 아래 3가지를 확인했습니다.
--        - CREATE TABLE 정의에 DEFAULT SYSDATE가 있는가 (있으면 INSERT 시점은 커버됨)
--        - 이미 그 컬럼을 채워주는 BEFORE INSERT 트리거가 있는가
--        - 이미 그 컬럼을 채워주는 BEFORE UPDATE 트리거가 있는가 (UPDATED_AT는
--          DEFAULT만으로는 "수정 시점 갱신"이 안 되므로 트리거가 반드시 필요)
--   2) 위 3가지 중 하나도 해당되지 않는, 즉 "아무것도 채워주지 않는" 케이스만 골라
--      기존 트리거들과 동일한 스타일(BEFORE INSERT/UPDATE, :NEW.col := SYSDATE,
--      TRG_<테이블>_BI / TRG_<테이블>_BU 명명 규칙)로 트리거를 추가했습니다.
--
-- 트리거를 추가한 12개 테이블 (총 18개 트리거: BEFORE INSERT 11개 + BEFORE UPDATE 7개)
--   APPLICANT                     - CREATED_AT, UPDATED_AT, (요청주신) APCT_DATE
--   APPR_AUTO_DELEGATION          - CREATED_AT
--   APPR_FILE                     - CREATED_AT
--   APPR_FORM_DELEGATION_CONFIG   - CREATED_AT, UPDATED_AT
--   APPR_LINE_REQUEST             - CREATED_AT
--   APPR_LOG                      - CREATED_AT
--   ATTENDANCE                    - CREATED_AT, UPDATED_AT
--   EMAIL_SEND_LOG                - UPDATED_AT (CREATED_AT는 이미 DEFAULT SYSDATE 있어서 제외)
--   HR_AI_CHAT_LOG                - CREATED_AT
--   HR_PLCY_DOC                   - CREATED_AT, UPDATED_AT
--   LEAVE_BALANCE                 - CREATED_AT, UPDATED_AT
--   RECRUIT                       - CREATED_AT, UPDATED_AT
--
-- 참고 - 아래 컬럼들은 이름은 비슷해도 "기록 생성/수정 시각"이 아니라 사용자가
-- 입력하는 실제 업무 데이터라서 트리거 대상에서 의도적으로 제외했습니다.
--   TASK.ACTUAL_START_DATE / ACTUAL_END_DATE       (실제 착수일/종료일 - 사용자 입력값)
--   PROJECT.ACTUAL_START_DATE / ACTUAL_END_DATE    (실제 착수일/종료일 - 사용자 입력값)
--   ATTENDANCE.CHECK_IN / CHECK_OUT, ATT_DATE      (출퇴근 시각/근무일자 - 업무 데이터)
--   APPR_AUTO_DELEGATION/APPR_LINE_REQUEST.PROCESSED_AT, START_DATE, END_DATE
--                                                    (위임/요청 처리 시각 - 업무 로직에서 설정)
--
-- 주의: 이 스크립트는 트리거만 새로 추가합니다. final_last.sql이 이미 적재한
-- 기존 행(예: APPLICANT의 CREATED_AT/UPDATED_AT NULL)은 트리거가 소급 적용되지
-- 않으므로 그대로 NULL로 남아 있습니다. 기존 행까지 채우고 싶으시면 아래
-- UPDATE 문(맨 아래 "선택: 기존 데이터 백필" 섹션, 기본 주석 처리됨)의 주석을
-- 해제해서 함께 실행하시면 됩니다.
-- ============================================================================
--------------------------------------------------------
--  DDL for Trigger TRG_APPLICANT_BI
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_APPLICANT_BI" 
BEFORE INSERT ON applicant
FOR EACH ROW
BEGIN
  :NEW.apct_date := SYSDATE;
  :NEW.created_at := SYSDATE;
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_APPLICANT_BI" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_APPLICANT_BU
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_APPLICANT_BU" 
BEFORE UPDATE ON applicant
FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_APPLICANT_BU" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_APPR_AUTO_DELEGATION_BI
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_APPR_AUTO_DELEGATION_BI" 
BEFORE INSERT ON appr_auto_delegation
FOR EACH ROW
BEGIN
  :NEW.created_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_APPR_AUTO_DELEGATION_BI" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_APPR_FILE_BI
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_APPR_FILE_BI" 
BEFORE INSERT ON appr_file
FOR EACH ROW
BEGIN
  :NEW.created_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_APPR_FILE_BI" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_APPR_FORM_DELEG_CFG_BI
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_APPR_FORM_DELEG_CFG_BI" 
BEFORE INSERT ON appr_form_delegation_config
FOR EACH ROW
BEGIN
  :NEW.created_at := SYSDATE;
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_APPR_FORM_DELEG_CFG_BI" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_APPR_FORM_DELEG_CFG_BU
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_APPR_FORM_DELEG_CFG_BU" 
BEFORE UPDATE ON appr_form_delegation_config
FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_APPR_FORM_DELEG_CFG_BU" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_APPR_LINE_REQUEST_BI
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_APPR_LINE_REQUEST_BI" 
BEFORE INSERT ON appr_line_request
FOR EACH ROW
BEGIN
  :NEW.created_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_APPR_LINE_REQUEST_BI" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_APPR_LOG_BI
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_APPR_LOG_BI" 
BEFORE INSERT ON appr_log
FOR EACH ROW
BEGIN
  :NEW.created_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_APPR_LOG_BI" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_ATTENDANCE_BI
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_ATTENDANCE_BI" 
BEFORE INSERT ON attendance
FOR EACH ROW
BEGIN
  :NEW.created_at := SYSDATE;
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_ATTENDANCE_BI" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_ATTENDANCE_BU
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_ATTENDANCE_BU" 
BEFORE UPDATE ON attendance
FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_ATTENDANCE_BU" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_EMAIL_SEND_LOG_BU
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_EMAIL_SEND_LOG_BU" 
BEFORE UPDATE ON email_send_log
FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_EMAIL_SEND_LOG_BU" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_HR_AI_CHAT_LOG_BI
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_HR_AI_CHAT_LOG_BI" 
BEFORE INSERT ON hr_ai_chat_log
FOR EACH ROW
BEGIN
  :NEW.created_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_HR_AI_CHAT_LOG_BI" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_HR_PLCY_DOC_BI
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_HR_PLCY_DOC_BI" 
BEFORE INSERT ON hr_plcy_doc
FOR EACH ROW
BEGIN
  :NEW.created_at := SYSDATE;
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_HR_PLCY_DOC_BI" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_HR_PLCY_DOC_BU
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_HR_PLCY_DOC_BU" 
BEFORE UPDATE ON hr_plcy_doc
FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_HR_PLCY_DOC_BU" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_LEAVE_BALANCE_BI
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_LEAVE_BALANCE_BI" 
BEFORE INSERT ON leave_balance
FOR EACH ROW
BEGIN
  :NEW.created_at := SYSDATE;
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_LEAVE_BALANCE_BI" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_LEAVE_BALANCE_BU
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_LEAVE_BALANCE_BU" 
BEFORE UPDATE ON leave_balance
FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_LEAVE_BALANCE_BU" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_RECRUIT_BI
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_RECRUIT_BI" 
BEFORE INSERT ON recruit
FOR EACH ROW
BEGIN
  :NEW.created_at := SYSDATE;
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_RECRUIT_BI" ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_RECRUIT_BU
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "SBERP"."TRG_RECRUIT_BU" 
BEFORE UPDATE ON recruit
FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSDATE;
END;

/
ALTER TRIGGER "SBERP"."TRG_RECRUIT_BU" ENABLE;

-- ============================================================================
-- 확인용 쿼리 (선택 실행)
-- ============================================================================
-- SELECT trigger_name, table_name, triggering_event, status
--   FROM user_triggers
--  WHERE trigger_name IN (
--    'TRG_APPLICANT_BI','TRG_APPLICANT_BU',
--    'TRG_APPR_AUTO_DELEGATION_BI',
--    'TRG_APPR_FILE_BI',
--    'TRG_APPR_FORM_DELEG_CFG_BI','TRG_APPR_FORM_DELEG_CFG_BU',
--    'TRG_APPR_LINE_REQUEST_BI',
--    'TRG_APPR_LOG_BI',
--    'TRG_ATTENDANCE_BI','TRG_ATTENDANCE_BU',
--    'TRG_EMAIL_SEND_LOG_BU',
--    'TRG_HR_AI_CHAT_LOG_BI',
--    'TRG_HR_PLCY_DOC_BI','TRG_HR_PLCY_DOC_BU',
--    'TRG_LEAVE_BALANCE_BI','TRG_LEAVE_BALANCE_BU',
--    'TRG_RECRUIT_BI','TRG_RECRUIT_BU'
--  )
--  ORDER BY table_name, triggering_event;
-- 18건, 전부 STATUS = 'ENABLED' 이어야 정상입니다.

-- ============================================================================
-- 선택: 기존 데이터 백필 (final_last.sql로 이미 들어간 행의 NULL 값을 지금 시각으로 채움)
-- 필요하실 때만 주석 해제해서 실행하세요. (신규 실행분엔 영향 없음 - 트리거가 이미 처리)
-- ============================================================================
-- UPDATE "SBERP"."APPLICANT" SET CREATED_AT = SYSDATE WHERE CREATED_AT IS NULL;
-- UPDATE "SBERP"."APPLICANT" SET UPDATED_AT = SYSDATE WHERE UPDATED_AT IS NULL;
-- COMMIT;