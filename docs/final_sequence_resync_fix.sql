SET DEFINE OFF;

-- ============================================================================
-- sequence_resync_fix.sql
--
-- 목적: final_last.sql 을 전체 실행한 "이후"에 이어 붙여서 실행하는 추가
--       스크립트입니다. final_last.sql / final_last_trigger.sql 은 건드리지
--       않고, 시퀀스 START WITH 값이 이미 로딩된 데이터의 PK보다 낮게 잡혀
--       있는 테이블들의 시퀀스만 MAX(PK)+1 기준으로 재동기화합니다.
--
-- 원인 (ORA-00001 on PK_SAL_ACCT 등)
--   final_last.sql은 SAL_ACCT 등 여러 테이블에 ACCT_ID=1~12 처럼 PK를
--   "직접 지정"해서 더미 데이터를 넣습니다. 반면 SAL_ACCT_SEQ는
--   START WITH 1 로 생성되어 있어서, 애플리케이션이 @GeneratedValue로
--   SAL_ACCT_SEQ.NEXTVAL을 호출하면 1부터 다시 나옵니다. 이미 ACCT_ID=1이
--   존재하므로 즉시 PK_SAL_ACCT 유니크 제약 위반(ORA-00001)이 발생합니다.
--
--   final_last.sql 안에 시퀀스 재동기화 로직이 일부 있긴 하지만
--   (SEQ_RECRUIT, SEQ_APPLICANT, SEQ_RESUME, SEQ_RESUME_CHUNK 4개 뿐),
--   아래 15개 테이블/시퀀스는 재동기화가 누락되어 있어 동일한 문제가
--   조만간 다른 테이블에서도 똑같이 터집니다.
--
--   대상 (시퀀스 / 테이블 / PK컬럼 / 로딩된 MAX PK / START WITH):
--     SAL_ACCT_SEQ          SAL_ACCT          ACCT_ID        12   (1)
--     SAL_HIST_SEQ          SAL_HIST          HIST_ID        12   (1)
--     SAL_PAY_SEQ           SAL_PAY           PAY_ID         18   (1)
--     SAL_PAY_ITEM_SEQ      SAL_PAY_ITEM      ITEM_ID       180   (1)
--     SAL_STD_SEQ           SAL_STD           STD_ID         14   (1)
--     SAL_INC_TAX_BRKT_SEQ  SAL_INC_TAX_BRKT  BRKT_ID        10   (1)
--     SAL_POS_ALW_SEQ       SAL_POS_ALW       ALW_ID          5   (1)
--     SAL_MEAL_ALW_PLCY_SEQ SAL_MEAL_ALW_PLCY MEAL_PLCY_ID    3   (1)
--     SAL_RATE_PLCY_SEQ     SAL_RATE_PLCY     RATE_ID         2   (1)
--     SEQ_EMPLOYEE          EMPLOYEE          EMP_ID       9898   (1271)
--     APPR_DOC_SEQ          APPR_DOC          DOC_ID       3334   (1108)
--     SEQ_EMP_POSITION      EMP_POSITION      POS_ID       1018   (1)
--     SEQ_ATTENDANCE        ATTENDANCE        ATT_ID        405   (1)
--     SEQ_LEAVE_BALANCE     LEAVE_BALANCE     BALANCE_ID     12   (1)
--     SEQ_LEAVE_GRANT       LEAVE_GRANT       GRANT_ID       42   (1)
--
--   (APPR_FORM_SEQ / APPR_FORM 은 PK가 FOR_ID+FOR_VERSION 복합키라 이
--   스크립트의 대상에서 제외했습니다. 필요하면 별도로 검토해주세요.)
--
-- 검증: DROP 후 CREATE 하는 대신, 시퀀스 소유 오브젝트/권한을 건드리지
-- 않도록 ALTER SEQUENCE의 INCREMENT 트릭을 사용합니다 (final_last.sql이
-- 이미 쓰는 DROP/CREATE 방식과 동일 결과, GRANT 재설정 불필요).
-- ============================================================================

DECLARE
    PROCEDURE resync_seq(p_seq_name VARCHAR2, p_table VARCHAR2, p_col VARCHAR2) IS
        v_max     NUMBER;
        v_curr    NUMBER;
        v_diff    NUMBER;
    BEGIN
        EXECUTE IMMEDIATE 'SELECT NVL(MAX(' || p_col || '),0) FROM ' || p_table INTO v_max;

        -- 현재 시퀀스 값 확인 (아직 한 번도 NEXTVAL 호출 안 됐으면 CURRVAL 에러 나므로
        -- NEXTVAL 한 번 호출해서 현재값을 얻은 뒤 그만큼 다시 보정)
        EXECUTE IMMEDIATE 'SELECT ' || p_seq_name || '.NEXTVAL FROM dual' INTO v_curr;

        v_diff := (v_max + 1) - (v_curr + 1);
        IF v_diff != 0 THEN
            EXECUTE IMMEDIATE 'ALTER SEQUENCE ' || p_seq_name || ' INCREMENT BY ' || v_diff;
            EXECUTE IMMEDIATE 'SELECT ' || p_seq_name || '.NEXTVAL FROM dual' INTO v_curr;
            EXECUTE IMMEDIATE 'ALTER SEQUENCE ' || p_seq_name || ' INCREMENT BY 1';
        END IF;

        DBMS_OUTPUT.PUT_LINE(RPAD(p_seq_name, 22) || ' -> next nextval will be ' || (v_max + 1));
    END;
BEGIN
    resync_seq('SAL_ACCT_SEQ',          'SAL_ACCT',          'ACCT_ID');
    resync_seq('SAL_HIST_SEQ',          'SAL_HIST',          'HIST_ID');
    resync_seq('SAL_PAY_SEQ',           'SAL_PAY',           'PAY_ID');
    resync_seq('SAL_PAY_ITEM_SEQ',      'SAL_PAY_ITEM',      'ITEM_ID');
    resync_seq('SAL_STD_SEQ',           'SAL_STD',           'STD_ID');
    resync_seq('SAL_INC_TAX_BRKT_SEQ',  'SAL_INC_TAX_BRKT',  'BRKT_ID');
    resync_seq('SAL_POS_ALW_SEQ',       'SAL_POS_ALW',       'ALW_ID');
    resync_seq('SAL_MEAL_ALW_PLCY_SEQ', 'SAL_MEAL_ALW_PLCY', 'MEAL_PLCY_ID');
    resync_seq('SAL_RATE_PLCY_SEQ',     'SAL_RATE_PLCY',     'RATE_ID');
    resync_seq('SEQ_EMPLOYEE',          'EMPLOYEE',          'EMP_ID');
    resync_seq('APPR_DOC_SEQ',          'APPR_DOC',          'DOC_ID');
    resync_seq('SEQ_EMP_POSITION',      'EMP_POSITION',      'POS_ID');
    resync_seq('SEQ_ATTENDANCE',        'ATTENDANCE',        'ATT_ID');
    resync_seq('SEQ_LEAVE_BALANCE',     'LEAVE_BALANCE',     'BALANCE_ID');
    resync_seq('SEQ_LEAVE_GRANT',       'LEAVE_GRANT',       'GRANT_ID');
END;
/

COMMIT;

-- ============================================================================
-- 확인용 쿼리 (선택 실행) - 각 시퀀스의 다음 nextval이 테이블 MAX(PK)+1과
-- 같아야 정상입니다.
-- ============================================================================
-- SELECT 'SAL_ACCT'          tbl, MAX(ACCT_ID)      mx FROM SAL_ACCT
-- UNION ALL SELECT 'EMPLOYEE', MAX(EMP_ID) FROM EMPLOYEE
-- UNION ALL SELECT 'APPR_DOC', MAX(DOC_ID) FROM APPR_DOC;