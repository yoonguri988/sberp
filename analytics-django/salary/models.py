"""
전부 managed=False. 이 앱은 마이그레이션으로 테이블을 만들거나 바꾸지 않는다 —
Spring(JPA)이 이미 소유하고 있는 기존 테이블(back/main/resources 스키마)에 읽기 전용으로 매핑만 한다.

컬럼/테이블명은 back의 엔티티(Employee, Department, SalPay, SalPayItem)와
final_last.sql DDL을 그대로 따랐다.
"""

from django.db import models


class Department(models.Model):
    dept_id = models.IntegerField(primary_key=True, db_column="DEPT_ID")
    dept_name = models.CharField(max_length=100, db_column="DEPT_NAME")
    is_deleted = models.IntegerField(db_column="IS_DELETED", default=0)

    class Meta:
        managed = False
        db_table = "DEPARTMENT"


class Employee(models.Model):
    emp_id = models.IntegerField(primary_key=True, db_column="EMP_ID")
    emp_name = models.CharField(max_length=50, db_column="EMP_NAME")
    emp_status = models.CharField(max_length=10, db_column="EMP_STATUS")
    dept = models.ForeignKey(
        Department, db_column="DEPT_ID", on_delete=models.DO_NOTHING, related_name="employees"
    )

    class Meta:
        managed = False
        db_table = "EMPLOYEE"


class SalPay(models.Model):
    # back의 PaymentStatus enum과 값이 같아야 한다 (PENDING/APPROVED/PAID/REJECTED)
    pay_id = models.IntegerField(primary_key=True, db_column="PAY_ID")
    emp = models.ForeignKey(
        Employee, db_column="EMP_ID", on_delete=models.DO_NOTHING, related_name="payments"
    )
    pay_month = models.DateField(db_column="PAY_MONTH")
    base_sal = models.BigIntegerField(db_column="BASE_SAL")
    allow_total = models.BigIntegerField(db_column="ALLOW_TOTAL")
    dedt_total = models.BigIntegerField(db_column="DEDT_TOTAL")
    net_pay = models.BigIntegerField(db_column="NET_PAY")
    stat = models.CharField(max_length=20, db_column="STAT")

    class Meta:
        managed = False
        db_table = "SAL_PAY"


class SalPayItem(models.Model):
    # back의 SalaryItemCode enum(수당/공제 카탈로그)과 코드값이 같아야 한다
    item_id = models.IntegerField(primary_key=True, db_column="ITEM_ID")
    pay = models.ForeignKey(
        SalPay, db_column="PAY_ID", on_delete=models.DO_NOTHING, related_name="items"
    )
    item_code = models.CharField(max_length=30, db_column="ITEM_CODE")
    amt = models.BigIntegerField(db_column="AMT")

    class Meta:
        managed = False
        db_table = "SAL_PAY_ITEM"
