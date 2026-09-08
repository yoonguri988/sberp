// components/EmployeePicker.js
// 여러 화면(급여 등록, 자원등록 담당자 지정 등)에서 공통으로 쓰는 사원 검색 Select.
// 사원 목록은 emp 모듈(기존 empReducer/empSaga, GET /api/emp)을 그대로 재사용한다.
// emp API는 페이지당 10건 고정이라, 이름을 입력할 때마다(디바운스) 재조회해서 옵션을 채운다.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Select, Spin } from "antd";
import { listEmpRequest } from "../reducers/emp/empReducer";

export default function EmployeePicker({
  value,
  onChange,
  placeholder,
  style,
  disabled,
  allowClear = true,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation("common");
  const { empList, loading } = useSelector((state) => state.emp);
  const timerRef = useRef(null);

  useEffect(() => {
    // 최초 진입 시 기본 목록(최근순 상위 10건) 로드
    dispatch(listEmpRequest({ page: 1 }));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleSearch = (keyword) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dispatch(listEmpRequest({ keyword, page: 1 }));
    }, 300);
  };

  const options = useMemo(
    () =>
      (empList || []).map((e) => ({
        value: e.empId,
        label: t("employeePicker.optionLabel", {
          empName: e.empName,
          deptName: e.deptName || "-",
          posName: e.posName || "-",
          empNo: e.empNo,
        }),
      })),
    [empList, t],
  );

  return (
    <Select
      showSearch
      allowClear={allowClear}
      value={value ?? undefined}
      onChange={onChange}
      onSearch={handleSearch}
      placeholder={placeholder || t("employeePicker.placeholder")}
      filterOption={false}
      notFoundContent={
        loading ? <Spin size="small" /> : t("employeePicker.notFoundContent")
      }
      style={style || { width: "100%" }}
      disabled={disabled}
      options={options}
    />
  );
}
