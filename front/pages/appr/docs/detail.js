import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import moment from "moment";
import {
    message, Descriptions, Button,
    Row, Col, Modal, Form, Input,
    Select, DatePicker, InputNumber, Space,
} from "antd";
import {
    fetchDocDetailRequest, approveDocRequest,
    rejectDocRequest, resetProcessState,
    fetchWriterInfoRequest, fetchDeptTreeRequest, fetchDeptEmpsRequest,
    updateDocRequest, resetUpdateState,
} from "../../../reducers/appr/apprDocReducer";
import {
    createDelegReqRequest, resetCreateStats,
} from "../../../reducers/appr/apprLineDelegationReducer";
import StatusBadge from "../../../components/appr/StatusBadge";
import DeptEmpPicker, { SelectedEmployeeSummary } from "../../../components/appr/DeptEmpPicker";
import PageHeader from "../../../components/appr/PageHeader";

const { Option } = Select;
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function DocDetailPage() {
    const router = useRouter();
    const { docId } = router.query;
    const dispatch = useDispatch();
    const { t } = useTranslation(["appr", "common"]);

    const {
        detailDoc, detailLines, canProcess, canEdit,
        detailLoading, detailError,
        processSubmitting, processError, processSuccess,
        writerInfo, deptTree, deptTreeLoading,
        deptEmps, deptEmpsLoading,
        updateSubmitting, updateError, updateSuccess,
    } = useSelector((state) => state.apprDoc);

    const {
        createSubmitting, createError, createSuccess,
    } = useSelector((state) => state.apprLineDelegation);

    // 위임요청 모달
    const [delegModalOpen, setDelegModalOpen] = useState(false);
    const [selectedDeptId, setSelectedDeptId] = useState(null);
    const [selectedDelegate, setSelectedDelegate] = useState(null);
    const [form] = Form.useForm();

    // 승인/반려 확인 모달
    const [confirmAction, setConfirmAction] = useState(null);

    // 문서 수정
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editSchemaValues, setEditSchemaValues] = useState({});
    const [editDocContent, setEditDocContent] = useState("");

    const LEAVE_TYPE_LABELS = {
        ANNUAL: "연차 (종일)",
        HALF_AM: "오전 반차",
        HALF_PM: "오후 반차",
    };

    // docId가 준비 되면 상세 조회
    useEffect(() => {
        if (!docId) return;
        dispatch(fetchDocDetailRequest({docId}));
    }, [dispatch, docId]);

    // 부서트리 조회 - 본인 정보 필요
    useEffect(() => {
        dispatch(fetchWriterInfoRequest());
    }, [dispatch]);

    useEffect(() => {
        if (writerInfo?.deptId) {
            dispatch(fetchDeptTreeRequest({
                deptId: writerInfo.deptId,
                empId: writerInfo.empId
            }));
        }
    }, [dispatch, writerInfo]);

    const handleDeptSelect = (deptId) => {
        setSelectedDeptId(deptId);
        dispatch(fetchDeptEmpsRequest(deptId));
    }

    // 승인/반려 성공하면 최신 상태로 재조회
    useEffect(() => {
        if (processSuccess) {
            message.success(t("docs.detail.processedMsg"));
            setConfirmAction(null);
            dispatch(fetchDocDetailRequest({docId}));
            dispatch(resetProcessState());
        }
    }, [processSuccess]);

    useEffect(() => {
        if (processError) {
            message.error(processError);
        }
    }, [processError]);

    // 페이지 나갈때 상태 초기화
    useEffect(() => {
        return () => {
            dispatch(resetProcessState());
        };
    }, [dispatch]);

    const handleApprove = () => {
        dispatch(approveDocRequest({docId}));
    };

    const handleReject = () => {
        dispatch(rejectDocRequest({docId}));
    };

    // 스키마 방식 양식인지?
    const isSchemaDoc = !!detailDoc?.forSchema;

    // 스키마 필드 정의 파싱
    const schemaFieldDefs = useMemo(() => {
        if (!isSchemaDoc) return [];
        try {
            return JSON.parse(detailDoc.forSchema).fields || [];
        } catch (e) {
            return [];
        }
    }, [isSchemaDoc, detailDoc]);

    // 스키마는 JSON 형태로 저장 K:V
    const schemaValues = useMemo(() => {
        if (!isSchemaDoc || !detailDoc?.docContent) return {};
        try {
            return JSON.parse(detailDoc.docContent);
        } catch (e) {
            return {};
        }
    }, [isSchemaDoc, detailDoc]);

    // 위임요청 모달 관련

    // 현재 로그인한 사원의 결재 순번 - 대기중(WAI)인 라인이 곧 본인 차례
    // canProcess가 true일 때만 버튼이 보임
    const myLine = detailLines.find((line) => line.linStatus === "WAI");

    // 현재 로그인한 사용자가 이 문서의 기안자인지
    const isDrafter = writerInfo?.empId === detailDoc?.empId;

    // 현재 로그인한 사용자가 결재차례 본인인지
    const isLineOwner = myLine?.empId === writerInfo?.empId;

    useEffect(() => {
        if (createSuccess) {
            message.success(t("docs.detail.delegation.successMsg"))
            setDelegModalOpen(false);
            setSelectedDelegate(null);
            setSelectedDeptId(null);
            form.resetFields();
            dispatch(resetCreateStats());
        }
    }, [createSuccess]);

    useEffect(() => {
        if (createError) {
            message.error(createError);
        }
    }, [createError]);

    const handleDelegSubmit = () => {
        form.validateFields().then((values) => {
            dispatch(createDelegReqRequest({
                linId: myLine.linId,
                newEmpId: selectedDelegate.empId,
                reqReason: values.reqReason,
            }));
        });
    }

    const roleClassMap = {
        APP: "role-app",
        REJ: "role-rej",
        WAI: "role-wai",
        NOT: "role-not",
    };

    // 문서 수정

    const startEdit = () => {
        setEditTitle(detailDoc.docTitle);
        setEditSchemaValues(isSchemaDoc ? {...schemaValues} : {});
        setEditDocContent(isSchemaDoc ? "" : detailDoc.docContent);
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
    };

    const updateEditSchemaValue = (key, value) => {
        setEditSchemaValues((prev) => ({...prev, [key]: value}));
    };

    const renderEditableSchemaField = (field) => {
        const value = editSchemaValues[field.key];
        const onChange = (v) => updateEditSchemaValue(field.key, v);

        switch (field.type) {
            case "textarea":
                return <Input.TextArea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />;
            case "date":
                return (
                    <DatePicker
                        style={{ width: "100%" }}
                        value={value ? moment(value) : null}
                        onChange={(date, dateString) => onChange(dateString)}
                    />
                );
            case "number":
                return <InputNumber style={{ width: "100%" }} value={value} onChange={onChange} />;
            case "select":
                return (
                    <Select value={value} onChange={onChange}>
                        {(field.options || []).map((opt) => (
                            <Option key={opt} value={opt}>
                                {field.key === "leaveType" ? (LEAVE_TYPE_LABELS[opt] || opt) : opt}
                            </Option>
                        ))}
                    </Select>
                );
            default:
                return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
        }
    };

    const handleSaveEdit = () => {
        if (!editTitle.trim()) {
            message.error("문서 제목을 입력해주세요.")
            return;
        }

        const content = isSchemaDoc ? JSON.stringify(editSchemaValues) : editDocContent

        if (!isSchemaDoc && (!editDocContent.trim() || editDocContent === "<p><br></p>")) {
            message.error("문서 내용을 입력해주세요.");
            return;
        }

        dispatch(updateDocRequest({
            docId,
            data: {
                docTitle: editTitle,
                docContent: content,
                docRevision: detailDoc.docRevision,
            },
        }));
    };

    useEffect(() => {
        if (updateSuccess) {
            message.success("문서가 수정되었습니다.");
            setIsEditing(false);
            dispatch(fetchDocDetailRequest({docId}));
            dispatch(resetUpdateState());
        }
    }, [updateSuccess]);

    useEffect(() => {
        if (updateError) {
            message.error(updateError);
            dispatch(resetUpdateState());
        }
    }, [updateError]);

    
    if (detailLoading || !detailDoc) {
        return <div style={{padding: 24}}>{t("common.loadingMsg")}</div>
    }

    if (detailError) {
        return <div style={{padding: 24}}>{detailError}</div>
    }

    return (
        <div className="sb-page">
            <PageHeader
                breadcrumb={[
                    { label: t("common.breadcrumbRoot"), href: "/appr/docs" },
                    { label: t("docs.detail.breadcrumbCurrent") },
                ]}
                title={detailDoc.docTitle}
                actions={<Button onClick={() => router.push("/appr/docs")}>{t("common.backToListBtn")}</Button>}
            />

            <Row gutter={16} style={{marginBottom: 16}}>
                <Col xs={24} md={10}>
                    <div className="sb-card equal-height-card">
                        <div className="sb-card__head">
                            <h2>{t("docs.detail.infoCardTitle")}</h2>
                        </div>
                        <div className="sb-card__body">
                            <div style={{marginBottom: 12}}>
                                <label className="sb-form-label text-soft">{t("docs.detail.drafterLabel")}</label>
                                <div style={{fontWeight: 700}}>{detailDoc.empName}</div>
                            </div>
                            <div style={{marginBottom: 12}}>
                                <label className="sb-form-label text-soft">{t("docs.detail.draftedAtLabel")}</label>
                                <div className="text-soft">{detailDoc.createdAt}</div>
                            </div>
                            <div>
                                <label className="sb-form-label text-soft">{t("docs.detail.statusLabel")}</label>
                                <div style={{display: "flex", alignItems: "center", gap: 12, marginTop: 4}}>
                                    <div><StatusBadge domain="doc" status={detailDoc.docStatus} /></div>
                                    <div style={{display: "flex", alignItems: "center", gap: 4, fontSize: 13}}>
                                        <span style={{fontWeight: 700}}>{t("docs.detail.stepDraft")}</span>
                                        <i className="bi bi-chevron-right text-black-50"/>
                                        <span style={detailDoc.docStatus === "ING" ? {color: "#2563eb", fontWeight: 700} : {color: "#8a93a3"}}>{t("docs.detail.stepReview")}</span>
                                        <i className="bi bi-chevron-right text-black-50"/>
                                        <span style={
                                            detailDoc.docStatus === "APP" ? {color: "#16a34a", fontWeight: 700} :
                                            detailDoc.docStatus === "REJ" ? {color: "#dc2626", fontWeight: 700} : {color: "#8a93a3"}
                                        }>{t("docs.detail.stepComplete")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xs={24} md={14}>
                    <div className="sb-card equal-height-card">
                        <div className="sb-card__head">
                            <h2>{t("docs.detail.lineCardTitle")}</h2>
                        </div>
                        <div className="sb-card__body">
                            <div className="appr-timeline scrollable-timeline">
                                {/* 기안자 */}
                                <div className="appr-timeline__item">
                                    <div className="appr-timeline__avatar role-draft">
                                        {detailDoc.empName?.charAt(0)}
                                    </div>
                                    <div className="appr-timeline__body">
                                        <div className="appr-timeline__name">{detailDoc.empName}</div>
                                        <div className="appr-timeline__time">{detailDoc.createdAt}</div>
                                    </div>
                                    <div className="appr-timeline__status">
                                        <span className="sb-badge sb-badge--gray">{t("docs.detail.draftBadge")}</span>
                                    </div>
                                </div>

                                {/* 결재선 */}
                                {detailLines.map((line) => (
                                    <div className="appr-timeline__item" key={line.linId}>
                                        <div className={`appr-timeline__avatar ${roleClassMap[line.linStatus] || "role-not"}`}>
                                            {line.empName?.charAt(0)}
                                        </div>
                                        <div className="appr-timeline__body">
                                            <div className="appr-timeline__name">{line.empName}</div>
                                            <div className="appr-timeline__pos">{line.posName}</div>
                                            {line.linApproved && (
                                                <div className="appr-timeline__time">{line.linApproved}</div>
                                            )}
                                        </div>
                                        <div className="appr-timeline__status">
                                            <StatusBadge domain="line" status={line.linStatus} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <div className="sb-card" style={{marginBottom: 16}}>
                <div className="sb-card__head">
                    <h2>{t("docs.detail.contentCardTitle")}</h2>
                </div>
                <div className="sb-card__body">
                    {isEditing ? (
                        <Space direction="vertical" style={{width: "100%"}} size={16}>
                            <div>
                                <label className="sb-form-label text-soft">{t("docs.write.docTitleLabel")}</label>
                                <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />
                            </div>

                            {isSchemaDoc ? (
                                <Space direction="vertical" style={{width: "100%"}} size={12}>
                                    {schemaFieldDefs.map((field) => (
                                        <div key={field.key}>
                                            <div style={{marginBottom: 4}}>
                                                {field.label}
                                                {field.required && <span style={{color: "red"}}>*</span>}
                                            </div>
                                            {renderEditableSchemaField(field)}
                                        </div>
                                    ))}
                                </Space>
                    ) : (
                        <ReactQuill
                            theme="snow"
                            value={editDocContent}
                            onChange={setEditDocContent}
                        />
                    )}

                    <div style={{display: "flex", justifyContent: "flex-end", gap: 8}}>
                        <Button onClick={cancelEdit}>{t("docs.write.cancelBtn")}</Button>
                        <Button type="primary" loading={updateSubmitting} onClick={handleSaveEdit}>
                            저장
                        </Button>
                    </div>
                </Space>
            ) : (
                isSchemaDoc ? (
                    schemaFieldDefs.length > 0 ? (
                        <Descriptions bordered column={1} size="small">
                            {schemaFieldDefs.map((field) => (
                                <Descriptions.Item key={field.key} label={field.label}>
                                    {field.key === "leaveType"
                                        ? (LEAVE_TYPE_LABELS[schemaValues[field.key]] || schemaValues[field.key] || "-")
                                        : (schemaValues[field.key] ?? "-")}
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                    ) : (
                        <Descriptions bordered column={1} size="small">
                            {Object.entries(schemaValues).map(([key, value]) => (
                                <Descriptions.Item key={key} label={key}>
                                    {value ?? "-"}
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                    )
                ) : (
                    <div
                        className="approval-document-wrap document-content-area"
                        dangerouslySetInnerHTML={{__html: detailDoc.docContent}}
                    />
                )
            )}
        </div>
    </div>
            {(canEdit && !isEditing) || canProcess || ((isDrafter || isLineOwner) && myLine) ? (
                <div style={{display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 24}}>
                    {canEdit && !isEditing && (                
                            <Button onClick={startEdit}>{t("docs.detail.editBtn")}</Button>
                        )}
                    {(isDrafter || isLineOwner) && myLine && (
                        <Button onClick={() => setDelegModalOpen(true)}>
                            {t("docs.detail.delegateRequestBtn")}
                        </Button>
                    )}
                    {canProcess && (<>
                        <Button danger onClick={() => setConfirmAction("reject")}>
                            {t("docs.detail.rejectBtn")}
                        </Button>
                        <Button type="primary" onClick={() => setConfirmAction("approve")}>
                            {t("docs.detail.approveBtn")}
                        </Button>
                    </>)}
                </div>
            ) : null}

            {/* 승인/반려 확인 모달 */}
            <Modal
                title={confirmAction === "approve" ? t("docs.detail.approveModalTitle") : t("docs.detail.rejectModalTitle")}
                open={confirmAction !== null}
                onCancel={() => setConfirmAction(null)}
                onOk={confirmAction === "approve" ? handleApprove : handleReject}
                confirmLoading={processSubmitting}
                okText={confirmAction === "approve" ? t("docs.detail.approveBtn") : t("docs.detail.rejectBtn")}
                cancelText={t("docs.write.cancelBtn")}
                okButtonProps={{danger: confirmAction === "reject"}}
            >
                <p>
                   {confirmAction === "approve"
                    ? t("docs.detail.approveModalContent")
                    : t("docs.detail.rejectModalContent")
                   }
                </p>
            </Modal>

            {/* 위임/대결 요청 모달 */}
            <Modal
                title={t("docs.detail.delegation.modalTitle")}
                open={delegModalOpen}
                onCancel={() => {
                    setDelegModalOpen(false);
                    setSelectedDelegate(null);
                    setSelectedDeptId(null);
                }}
                onOk={handleDelegSubmit}
                confirmLoading={createSubmitting}
                okText={t("docs.detail.delegation.okText")}
                cancelText={t("docs.write.cancelBtn")}
                okButtonProps={{disabled: !selectedDelegate}}
                width={700}
            >
                <Form form={form} layout="vertical">
                    <DeptEmpPicker
                        deptTree={deptTree}
                        deptTreeLoading={deptTreeLoading}
                        selectedDeptId={selectedDeptId}
                        onSelectDept={handleDeptSelect}
                        deptEmps={deptEmps.filter(
                            (e) => !detailLines.some((line) => line.empId === e.empId)
                        )}
                        deptEmpsLoading={deptEmpsLoading}
                        selectedEmployee={selectedDelegate}
                        onSelectEmployee={setSelectedDelegate}
                        pickerLabel={t("docs.detail.delegation.pickerLabel")}
                    />

                    <SelectedEmployeeSummary
                        employee={selectedDelegate}
                        onClear={() => setSelectedDelegate(null)}
                        label={t("docs.detail.delegation.summaryLabel")}
                    />

                    <Form.Item name="reqReason" label={t("docs.detail.delegation.reasonLabel")}>
                        <Input.TextArea rows={3} placeholder={t("docs.detail.delegation.reasonPlaceholder")}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}