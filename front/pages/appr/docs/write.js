import dynamic from "next/dynamic";
import moment from "moment";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
    message, Form, Input, Select, Button, Space, List,
    Tag, Divider, DatePicker, InputNumber,
    Card, Row, Col, Modal, Switch, Typography, Spin
} from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import {
    fetchWriterInfoRequest,
    fetchWritableFormsRequest,
    fetchDeptTreeRequest,
    fetchDeptEmpsRequest,
    writeDocRequest,
    resetWriteState,
    fetchFavoriteLinesRequest,
} from "../../../reducers/appr/apprDocReducer";
import PageHeader from "../../../components/appr/PageHeader";
import api from "../../../api/axios";

// react-quill은 SSR이 불가하므로 CSR로 로드
// () => import("react-quill") -> 처음에 로드 하지않고 필요할때 로드
// {ssr: false} -> 서버 렌더링 단계에서는 해당 컴포넌트를 렌더링에서 제외함
const ReactQuill = dynamic( () => import("react-quill"), {ssr: false});
import "react-quill/dist/quill.snow.css";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

export default function DocWritePage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { t } = useTranslation(["appr", "common"]);

    const {
        writerInfo, writerInfoLoading,
        writableForms, writableFormsLoading,
        deptTree, deptTreeLoading,
        deptEmps, deptEmpsLoading,
        writeSubmitting, writeError, writeSuccess,
        favoriteLines, favoriteLinesLoading,
    } = useSelector((state) => state.apprDoc);

    const [docContent, setDocContent] = useState("");
    // { [field.key] : value }
    const [schemaValues, setSchemaValues] = useState({});
    // empId, empName, posName 순서대로
    const [approvers, setApprovers] = useState([]);
    const [selectedDeptId, setSelectedDeptId] = useState(null);
    const [isImportant, setIsImportant] = useState(false);
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [leaveBalanceLoading, setLeaveBalanceLoading] = useState(false);

    // 사용자 라벨
    const LEAVE_TYPE_LABEL_KEYS = {
        ANNUAL: "annual",
        HALF_AM: "halfAm",
        HALF_PM: "halfPm",
    };

    // 부서트리 전체에서 결재 가능한 상급자 총원
    const totalAvaApprovers = useMemo(
        () => deptTree.reduce((sum, d) => sum + (d.empCount || 0), 0),
        [deptTree]
    );

    // 중요문서 결재선인원 조절 
    // 일반 문서는 1명 고정, 중요문서는 원칙상 3명이지만 3명 미만일때
    // 가용 인원만큼만 요구
    const requiredApproverCount = useMemo(() => {
        if (!isImportant) return 1;
        if (deptTree.length === 0) return 3;
        return Math.max(1, Math.min(3, totalAvaApprovers));
    }, [isImportant, deptTree, totalAvaApprovers])

    // 결재선 순서 패널에 보여줄 고정 슬롯
    const approverSlots = useMemo(
        () => Array.from({length: requiredApproverCount}, (_, i) => ({
            slotIndex : i,
            approver: approvers[i] || null     
        })),
        [approvers, requiredApproverCount]
    );

    // 폼에서 선택한 양식 감시
    const formKey = Form.useWatch("formKey", form);

    // 선택된 양식의 원본 데이터 찾기
    const selectedForm = useMemo(
        () => writableForms.find((f) => `${f.forId}-${f.forVersion}` === formKey),
        [writableForms, formKey]
    );

    const isSchemaForm = !!selectedForm?.forSchema;


    // 연차 관련 //

    // 스키마 방식 필드 파싱
    const schemaFieldDefs = useMemo(() => {
        if (!isSchemaForm) return [];
        try {
            return JSON.parse(selectedForm.forSchema).fields || [];
        } catch (e) {
            return [];
        }
    }, [isSchemaForm, selectedForm]);

    // 주말 제외 연차 사용일 계산
    function countBusinessDays(startStr, endStr) {
        if (!startStr || !endStr) return 0;
        const start = moment(startStr);
        const end = moment(endStr);
        if (!start.isValid() || !end.isValid() || end.isBefore(start)) return 0;

        let count = 0;
        const cur = start.clone();
        while (!cur.isAfter(end)) {
            const dow = cur.day(); // 0 일 , 6 토
            if (dow !== 0 && dow !== 6) count++;
            cur.add(1, "day");
        }
        return count;
    }

    // 총 신청 일수 계산
    const leaveDaysCount = useMemo(() => {
        if (selectedForm?.forCategory !== "LEAVE") return null;

        const leaveType = schemaValues.leaveType;
        if (!leaveType) return null;

        if (leaveType === "HALF_AM" || leaveType === "HALF_PM") return 0.5;

        return countBusinessDays(schemaValues.startDate, schemaValues.endDate);
    }, [selectedForm, schemaValues.leaveType, schemaValues.startDate, schemaValues.endDate]);

    // 잔여 연차 조회
    useEffect(() => {
        if (selectedForm?.forCategory !== "LEAVE") {
            setLeaveBalance(null);
            return;
        }

        setLeaveBalanceLoading(true);
        api.get("/api/att/leave/balance/my")
            .then((res) => {
                const currentYear = new Date().getFullYear();
                const current = (res.data || []).find((b) => b.year === currentYear);
                setLeaveBalance(current || null);
            })
            .catch(() => setLeaveBalance(null))
            .finally(() => setLeaveBalanceLoading(false));
    }, [selectedForm]);

    // 연차 관련 //

    // 양식이 바뀌면 이전값 초기화
    useEffect(() => {
        setSchemaValues({});
        setDocContent(selectedForm?.forContent ?? "");
        setApprovers([]);
    }, [formKey]);

    const updateSchemaValue = (key, value) => {
        setSchemaValues((prev) => ({...prev, [key]: value}));
    };

    const renderSchemaField = (field) => {
        const value = schemaValues[field.key];
        const onChange = (v) => updateSchemaValue(field.key, v);

        switch (field.type) {
            case "textarea":
                return <TextArea rows={4} value={value} onChange={(e) => onChange(e.target.value)}/>;
            case "date":
                return (
                    <DatePicker
                        style={{width: "100%"}}
                        value={value ? moment(value) : null}
                        onChange={(date, dateString) => {
                            onChange(dateString);

                            // 반차는 종료일과 시작일이 동일
                            const isHalfDay = schemaValues.leaveType === "HALF_AM" || schemaValues.leaveType === "HALF_PM";
                            if (field.key === "startDate" && isHalfDay) {
                                updateSchemaValue("endDate", dateString);
                            }
                        }}
                    />
                );
            case "number":
                return <InputNumber style={{width: "100%"}} value={value} onChange={onChange}/>;
            case "select":
                return (
                    <Select
                        style={{width: "100%"}}
                        value={value}
                        onChange={(v) => {
                            onChange(v);

                            // 반차 선택시 시작일/종료일을 오늘날짜로 기본 제안
                            if (field.key === "leaveType" && (v === "HALF_AM" || v === "HALF_PM")) {
                                const today = moment().format("YYYY-MM-DD");
                                updateSchemaValue("startDate", today);
                                updateSchemaValue("endDate", today);
                            }
                        }}
                    >
                        {(field.options || []).map((opt) => (
                            <Option key={opt} value={opt}>
                                {field.key === "leaveType" ? t(`docs.write.leaveTypeLabels.${LEAVE_TYPE_LABEL_KEYS[opt] || opt}`, { defaultValue: opt }) : opt}
                            </Option>
                        ))}
                    </Select>
                );
            default:
                return <Input value={value} onChange={(e) => onChange(e.target.value)}/>;
        }
    }

    

    // 초기진입시 작성자 정보 + 사용 가능항 양식 목록 조회
    useEffect(() => {
        dispatch(fetchWriterInfoRequest());
        dispatch(fetchWritableFormsRequest());
    }, [dispatch]);

    // 작성자 정보 로드되면 본인 소속 부서 기준으로 결재선 지정 부서트리 조회
    useEffect(() => {
        if (writerInfo?.deptId) {
            dispatch(fetchDeptTreeRequest({
                deptId: writerInfo.deptId,
                empId: writerInfo.empId
            }));
        }
    }, [dispatch, writerInfo]);

    // 등록 성공하면 목록으로 이동
    useEffect(() => {
        if (writeSuccess) {
            message.success(t("docs.write.successMsg"));
            router.push("/appr/docs");
        }
    }, [writeSuccess]);

    useEffect(() => {
        if (writeError) {
            message.error(writeError);
        }
    }, [writeError]);

    // 페이지 나갈때 상태 초기화
    useEffect(() => {
        return () => {
            dispatch(resetWriteState());
        };
    }, [dispatch]);

    // 결재선 중복 방지

    // 현재 결재자 목록에서 사원 번호만 추출하여 Set객체로 저장
    // Array.includes 보다 Set.has 가 결재자가 많아져도 중복 체크 검사 속도가 빠르다함
    // useMemo -> approvers 배열이 변경될때만 재계산됨
    const approverIdSet = useMemo(() => new Set(approvers.map((a) => a.empId)), [approvers]);

    const addApprover = (person) => {
        // 추가할 대상 (person.empId)이 approverIdSet에 이미 존재하면 메세지띄우고 함수 종료
        if (approverIdSet.has(person.empId)) {
            message.warning(t("docs.write.duplicateApproverWarning"));
            return;
        }
        if (approvers.length >= requiredApproverCount) {
            message.warning(t("docs.write.approverLimitReachedWarning", {count: requiredApproverCount}));
            return;
        }
        setApprovers((prev) => [...prev, person]);
    };

    // 휴직자면 확인 모달창
    const handleAddApprover = (emp) => {
        const person = {
            empId: emp.empId,
            empName: emp.empName,
            posName: emp.posName
        };

        if (emp.empStatus === "휴직") {
            Modal.confirm({
                title: t("docs.write.leaveConfirmTitle"),
                content: t("docs.write.leaveConfirmContent", { empName: emp.empName }),
                okText: t("docs.write.leaveConfirmOk"),
                cancelText: t("docs.write.leaveConfirmCancel"),
                onOk: () => addApprover(person),
            });
            return;
        }
        addApprover(person);
    };

    // 결재자 삭제
    const removeApprover = (empId) => {
        setApprovers((prev) => prev.filter((a) => a.empId !== empId));
    };

    // 결재 순서 변경
    const moveApprover = (index, direction) => {
        setApprovers((prev) => {
            const next = [...prev];
            // 위로 이동시 -1, 아래로 이동시 1
            const target = index + direction;
            // 배열 범위 벗어날경우 기존상태 유지
            if (target < 0 || target >= next.length) return prev;
            // 위치바꾸기
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    }

    // 중요문서 여부 토글 / 초과분 잘라내기
    const handleImportantChange = (checked) => {
        setIsImportant(checked);
        const newRequired = checked
            ? Math.max(1, Math.min(3, totalAvaApprovers || 3))
            : 1;
        setApprovers((prev) => {
            if (prev.length <= newRequired) return prev;
            message.info(t("docs.write.approverAdjustedMsg", { count: newRequired }));
            return prev.slice(0, newRequired);
        })
    }

    // 최고 직급자 예외 처리
    const noApproversAvailable = useMemo(
        () => deptTree.length > 0 && deptTree.every((d) => d.empCount === 0),
        [deptTree]  
    );

    const handleDeptSelect = (deptId) => {
        setSelectedDeptId(deptId);
        dispatch(fetchDeptEmpsRequest(deptId));
    };

    const handleSubmit = (values) => {
        if (approvers.length !== requiredApproverCount) {
            message.error(t("docs.write.approverCountRequired", { count: requiredApproverCount }));
            return;
        }

        let content;

        if (isSchemaForm) {
            // 필수 필드 검증
            const missing = schemaFieldDefs.filter(
                (f) => f.required && (schemaValues[f.key] === undefined || schemaValues[f.key] === "")
            );
            if (missing.length > 0) {
                message.error(t("docs.write.requiredFieldsMissing", { fields: missing.map((f) => f.label).join(", ") }));
                return;
            }
            content = JSON.stringify(schemaValues);
        }
        else {
            if (!docContent.trim()) {
                message.error(t("docs.write.contentRequired"));
                return;
            }
            content = docContent;
        }

        const [forId, forVersion] = values.formKey.split("-");

        const payload = {
            forId: Number(forId),
            forVersion: Number(forVersion),
            docTitle: values.docTitle,
            docContent: content,
            approverEmpIds: approvers.map((a) => a.empId),
        };

        dispatch(writeDocRequest({data: payload}));
    };

    // 결재선 추천
    useEffect(() => {
        if (formKey && writerInfo?.deptId) {
            const [forId] = formKey.split("-");
            dispatch(fetchFavoriteLinesRequest({deptId: writerInfo.deptId, forId: Number(forId)}));
        }
    }, [dispatch, formKey, writerInfo]);

    const applyFavoriteLine = (fav) => {
        setApprovers(fav.approvers.map((a) => ({
            empId: a.empId,
            empName: a.empName,
            posName: a.posName,
        })));
    }

    // 현재 문서에 필요한 결재자 수와 다른 추천은 제외
    const filteredFavoriteLines = useMemo(
        () => favoriteLines.filter((fav) => fav.approvers.length === requiredApproverCount),
        [favoriteLines, requiredApproverCount]
    );

    return (
        <div className="sb-page">
            <PageHeader
                breadcrumb={[
                    { label: t("common.breadcrumbRoot"), href: "/appr/docs" },
                    { label: t("docs.list.breadcrumbCurrent"), href: "/appr/docs" },
                    { label: t("docs.write.breadcrumbCurrent") },
                ]}
                title={t("docs.write.title")}
                subtitle={t("docs.write.subtitle")}
                actions={<Button onClick={() => router.push("/appr/docs")}>{t("common.backToListBtn")}</Button>}
            />

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* 문서 정보 */}
                <div className="sb-card" style={{marginBottom: 16}}>
                    <div className="sb-card__head">
                        <h2>{t("docs.detail.infoCardTitle")}</h2>
                    </div>
                    <div className="sb-card__body">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="formKey"
                                    label={t("docs.write.formSelectLabel")}
                                    rules={[{required: true, message: t("docs.write.formSelectRequired")}]}
                                >
                                    <Select
                                        placeholder={t("docs.write.formSelectPlaceholder")}
                                        loading={writableFormsLoading}
                                    >
                                        {writableForms.map((f) => (
                                            <Option
                                                key={`${f.forId}-${f.forVersion}`}
                                                value={`${f.forId}-${f.forVersion}`}
                                            >
                                                {f.forTitle} (v{f.forVersion})
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="docTitle"
                                    label={t("docs.write.docTitleLabel")}
                                    rules={[{required: true, message: t("docs.write.docTitleRequired")}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px 16px",
                                border: "1px solid #f0f0f0",
                                borderRadius: 6,
                                marginBottom: 24
                            }}
                        >
                            <div>
                                <div style={{fontWeight: 600}}>{t("docs.write.importantTitle")}</div>
                                <div style={{fontSize: 13, color: "rgba(0,0,0,0.45)"}}>
                                    {t("docs.write.importantDesc")}
                                </div>
                            </div>
                            <Switch checked={isImportant} onChange={handleImportantChange}/>
                        </div>
                    </div>
                </div>

                {/* 문서 내용 - 선택한 양식에 따라 동적으로 분기 */}
                {formKey && (
                    <div className="sb-card" style={{marginBottom: 16}}>
                        <div className="sb-card__head">
                            <h2>{t("docs.write.contentLabel")}</h2>
                        </div>
                        <div className="sb-card__body">
                            {isSchemaForm ? (
                                <Space direction="vertical" style={{width: "100%"}} size={12}>
                                    {schemaFieldDefs.filter((field) => {
                                        const isHalfDay = schemaValues.leaveType === "HALF_AM" || schemaValues.leaveType === "HALF_PM";
                                        return !(isHalfDay && field.key === "endDate");
                                    })
                                    .map((field) => (
                                        <div key={field.key}>
                                            <div style={{marginBottom: 4}}>
                                                {field.label}
                                                {field.required && <span style={{color: "red"}}> *</span>}
                                            </div>
                                            {renderSchemaField(field)}
                                        </div>
                                    ))}

                                    {leaveDaysCount !== null && (
                                        <Space style={{width: "100%"}} wrap>
                                            <div
                                                style={{
                                                    padding: "10px 14px",
                                                    borderRadius: 8,
                                                    background: "#e6f4ff",
                                                    border: "1px solid #91caff",
                                                    fontSize: 14,
                                                }}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: t("docs.write.leaveDaysCountLabel", { count: leaveDaysCount }) }} />
                                                {leaveDaysCount === 0 && (
                                                    <span style={{marginLeft: 8, color: "#8a93a3", fontSize: 13}}>
                                                        {t("docs.write.leaveNoWeekdaysHint")}
                                                    </span>
                                                )}
                                            </div>

                                            <div
                                                style={{
                                                    padding: "10px 14px",
                                                    borderRadius: 8,
                                                    background: "#f6ffed",
                                                    border: "1px solid #b7eb8f",
                                                    fontSize: 14,
                                                }}
                                            >
                                                {leaveBalanceLoading ? (
                                                    <Spin size="small"/>
                                                ) : leaveBalance ? (
                                                    <span dangerouslySetInnerHTML={{ __html: t("docs.write.leaveBalanceLabel", { count: leaveBalance.remainingDays }) }} />
                                                ) : (
                                                    <span style={{color: "#8a93a3"}}>{t("docs.write.leaveBalanceUnavailable")}</span>
                                                )}
                                            </div>
                                        </Space>
                                    )}
                                </Space>
                            ) : (
                                <Form.Item label={t("docs.write.contentLabel")}>
                                    <ReactQuill
                                        theme="snow"
                                        value={docContent}
                                        onChange={setDocContent}
                                    />
                                </Form.Item>
                            )}
                        </div>
                    </div>
                )}

                {/* 결재선 지정 */}
                {noApproversAvailable ? (
                    <div className="sb-card" style={{marginBottom: 16}}>
                        <div className="sb-card__body">
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px 20px",
                                    color: "var(--sb-ink-faint)",
                                }}
                            >
                                <i className="bi bi-info-circle" style={{fontSize: 20, display: "block", marginBottom: 8}}/>
                                {t("docs.write.noApproversLine1")}<br/>
                                {t("docs.write.noApproversLine2")}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="sb-card" style={{marginBottom: 16}}>
                        <div className="sb-card__head">
                            <h2>{t("docs.write.lineDivider")}</h2>
                        </div>
                        <div className="sb-card__body">
                            <Text type="secondary" style={{display: "block", marginBottom: 12}}>
                                {isImportant ? t("docs.write.importantHint") : t("docs.write.normalHint")}
                            </Text>
                            {isImportant && requiredApproverCount < 3 && (
                                <span
                                    style={{display: "block", marginBottom: 12, fontSize: 13, color: "#faad14"}}
                                    dangerouslySetInnerHTML={{
                                        __html: t("docs.write.reducedApproverWarning", { count: requiredApproverCount }),
                                    }}
                                />
                            )}
                        {favoriteLinesLoading ? (
                            <Spin size="small" />
                        ) : filteredFavoriteLines.length > 0 && (
                            <Space direction="vertical" style={{width: "100%", marginBottom: 16}}>
                                <Text type="secondary" style={{fontSize: 13}}>{t("docs.write.favoriteLinesLabel")}</Text>
                                <Space wrap>
                                    {filteredFavoriteLines.map((fav) => (
                                        <Button
                                            key={fav.favId}
                                            size="small"
                                            onClick={() => applyFavoriteLine(fav)}
                                        >
                                            {fav.approvers.map((a) => a.empName).join(" → ")}
                                            <span style={{marginLeft: 6, color: "#8a93a3"}}>{t("docs.write.favoriteUseCountSuffix", { count: fav.useCount })}</span>
                                        </Button>
                                    ))}
                                </Space>
                            </Space>
                        )}

                        <Row gutter={16}>
                            {/* 부서 트리 */}
                            <Col xs={24} md={6}>
                                <Card
                                    size="small"
                                    title={t("docs.write.deptCardTitle")}
                                    bodyStyle={{padding: 8}}
                                    className="equal-height-card"
                                >
                                    <div style={{maxHeight: 320, overflowY: "auto"}}>
                                        <List
                                            size="small"
                                            loading={deptTreeLoading}
                                            dataSource={deptTree}
                                            locale={{ emptyText: t("docs.write.deptLoadingMsg")}}
                                            renderItem={(d) => (
                                                <List.Item
                                                    style={{
                                                        cursor: "pointer",
                                                        background: selectedDeptId === d.deptId ? "#e6f6ff" : "transparent"
                                                    }}
                                                    onClick={() => handleDeptSelect(d.deptId)}
                                                >
                                                    {d.deptName} <Tag style={{marginLeft: 8}}>{t("docs.write.empCountSuffix", { count: d.empCount })}</Tag>
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                </Card>
                            </Col>

                            {/* 선택한 부서의 사원 목록 */}
                            <Col xs={24} md={9}>
                                <Card
                                    size="small"
                                    title={t("docs.write.empCardTitle")}
                                    bodyStyle={{padding: 8}}
                                    className="equal-height-card"
                                >
                                    {deptEmpsLoading ? (
                                        <div style={{textAlign: "center", padding: "20px 0"}}>
                                            <Spin size="small"/>
                                        </div>
                                    ) : (
                                        <div className="appr-emp-box">
                                            {deptEmps.length === 0 ? (
                                                <div className="text-muted text-center py-4 small">
                                                    {t("docs.write.selectDeptFirstMsg")}
                                                </div>
                                            ) : (
                                                deptEmps.map((e) => {
                                                    const already = approverIdSet.has(e.empId);
                                                    return (
                                                        <div
                                                            key={e.empId}
                                                            className={"appr-emp-row" + (already ? " disabled" : "")}
                                                            onClick={() => {if (!already) handleAddApprover(e);}}
                                                        >
                                                            <span>
                                                                {e.empName}
                                                                {e.empStatus === "휴직" && (
                                                                    <Tag color="orange" style={{marginLeft: 6}}>{t("docs.write.onLeaveTag")}</Tag>
                                                                )}
                                                            </span>
                                                            <span className="pos-chip">{e.posName}</span>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </Card>
                            </Col>
                            {/* 선택된 결재선 */}
                            <Col xs={24} md={9}>
                                <Card
                                    size="small"
                                    title={t("docs.write.lineOrderCardTitle")}
                                    bodyStyle={{padding: 8}}
                                    className="equal-height-card"
                                >
                                    <div className="appr-slots">
                                    {approverSlots.map((slot) => {
                                            const { slotIndex: index, approver: a} = slot;
                                            const order = index + 1;
                                            return (
                                                <div
                                                    key={index}
                                                    className={"appr-slot" + (a ? " filled" : "")}
                                                >
                                                    <span className="appr-slot__badge">{order}</span>
                                                    {a ? (<>
                                                        <span
                                                            className="appr-slot__body"
                                                            style={{cursor: "pointer"}}
                                                            onClick={() => removeApprover(a.empId)}
                                                        >
                                                            {a.empName}
                                                            <span className="appr-slot__pos">{a.posName}</span>
                                                        </span>
                                                        <Space size={0}>
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={<ArrowUpOutlined/>}
                                                                disabled={index === 0}
                                                                onClick={(e) => {e.stopPropagation(); moveApprover(index, -1);}}
                                                            />
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={<ArrowDownOutlined/>}
                                                                disabled={index === approvers.length - 1}
                                                                onClick={(e) => {e.stopPropagation(); moveApprover(index, 1);}}
                                                            />
                                                        </Space>
                                                    </>) : (
                                                        <span className="appr-slot__body appr-slot__empty">
                                                            {t("docs.write.emptySlotPlaceholder", { order })}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                    })}
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
                )}

                <div style={{display: "flex", justifyContent: "flex-end", gap: 8}}>
                    <Button onClick={() => router.push("/appr/docs")}>{t("docs.write.cancelBtn")}</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={writeSubmitting}
                        disabled={writeSubmitting || noApproversAvailable}
                    >
                        {t("docs.write.submitBtn")}
                    </Button>
                </div>
            </Form>
        </div>
    );
}