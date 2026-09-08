import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
    message, Form, Input, Switch,
    Button, Descriptions, Tag, Space,
    Popconfirm, Row, Col
 } from "antd";
import {
    fetchFormDetailRequest,
    fetchFormVersionsRequest,
    updateFormRequest,
    deleteFormRequest,
    resetFormState,
} from "../../../reducers/appr/apprFormReducer";
import { checkCode } from "../../../api/appr/apprFormApi";
import SchemaFieldEditor, {validateSchemaFields } from "../../../components/appr/SchemaFieldEditor";
import PageHeader from "../../../components/appr/PageHeader";

// react-quill은 SSR이 불가하므로 CSR로 로드
// () => import("react-quill") -> 처음에 로드 하지않고 필요할때 로드
// {ssr: false} -> 서버 렌더링 단계에서는 해당 컴포넌트를 렌더링에서 제외함
const ReactQuill = dynamic( () => import("react-quill"), {ssr: false});
import "react-quill/dist/quill.snow.css";

export default function FormDetailPage() {

    const router = useRouter();
    const { forId, forVersion } = router.query;
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { t } = useTranslation(["appr", "common"]);

    const {
        detail, detailLoading, detailError,
        versions, versionsLoading,
        submitting, submitError, success,
    } = useSelector((state) => state.apprForm);

    const [editMode, setEditMode] = useState(false);
    const [content, setContent] = useState("");
    const [schemaFields, setSchemaFields] = useState([]);

    // forId/forVersion이 준비되면 상세,버전이력 조회
    useEffect( () => {
        if (!forId || !forVersion) return;
        dispatch(fetchFormDetailRequest({forId, forVersion}));
        dispatch(fetchFormVersionsRequest(forId));
    }, [dispatch, forId, forVersion]);

    // detail 조회되면, forSchema가 있으면 필드 파싱, 없으면 에디터 
    useEffect( () => {
        if (detail) {
            form.setFieldsValue({
                forCode: detail.forCode,
                forTitle: detail.forTitle,
                forStatus: detail.forStatus
            });

            if (detail.forSchema) {
                // schema 파싱
                try {
                    const parsed = JSON.parse(detail.forSchema);
                    setSchemaFields(parsed.fields || []);
                } catch (err) {
                    setSchemaFields([]);
                }
            }
            else {
                setContent(detail.forContent || "");
            }
        }
    }, [detail, form]);

    // 수정 성공하면 수정모드 종료하고 최신 데이터 재조회
    useEffect( () => {
        if (success) {
            message.success(t("forms.detail.updatedMsg"));
            setEditMode(false);
            dispatch(fetchFormDetailRequest({ forId, forVersion}));
            dispatch(fetchFormVersionsRequest(forId));
            dispatch(resetFormState());
        }
    }, [success]);

    useEffect( () => {
        if (submitError) message.error(submitError);
    }, [submitError]);

    // 페이지 나갈때 submit 상태 초기화
    useEffect( () => {
        return () => {
            dispatch(resetFormState());
        };
    }, [dispatch])

    // 양식코드 중복 체크
    const handleCodeCheck = async () => {
        const forCode = form.getFieldValue("forCode");
        if (!forCode) {
            message.warning(t("forms.detail.codeCheckRequiredMsg"));
            return;
        }

        // 본인 forId 는 제외하고 검사
        try {
            const res = await checkCode(forCode, forId);
            if (res.available) {
                message.success(t("forms.detail.codeAvailableMsg"));
            }
            else {
                message.error(t("forms.detail.codeUnavailableMsg"))
            }
        } catch (err) {
            message.error(t("forms.detail.codeCheckErrorMsg"));
        }
    };

    // isSchemaMode는 조회된 원본 기준으로 고정
    const isSchemaMode = detail?.forSchema ? true : false;

    // 양식 수정
    const handleUpdate = (values) => {
        let payload;
        
        if (isSchemaMode) {
            const errorMsg = validateSchemaFields(schemaFields, t);
            if (errorMsg) {
                message.error(errorMsg);
                return;
            }
            payload = {
                ...values,
                forContent: null,
                forSchema: JSON.stringify({ fields: schemaFields}),
            };
        }

        else {
            if (!content.trim()) {
                message.error(t("forms.detail.contentRequired"));
                return;
            }
            payload = {
                ...values,
                forContent: content,
                forSchema: null,
            };
        }

        dispatch(updateFormRequest({forId, forVersion, data: payload}));
    };

    const handleCancelEdit = () => {
        // 편집중 바꾼 값 되돌리기
        form.setFieldsValue({
            forCode: detail.forCode,
            forTitle: detail.forTitle,
            forStatus: detail.forStatus,
        });
        setContent(detail.forContent || "");
        if (detail.forSchema) {
            try {
                setSchemaFields(JSON.parse(detail.forSchema).fields || []);
            } catch (e) {}
        }
        setEditMode(false);
    }

    // 양식 삭제
    const handleDelete = () => {
        dispatch(deleteFormRequest({forId, forVersion}));
        message.success(t("forms.detail.deletedMsg"))
        router.push("/appr/forms");
    };

    // 로딩중 안내
    if (detailLoading || !detail) {
        return <div className="sb-page">{t("common.loadingMsg")}</div>;
    }

    // 오류 안내
    if (detailError) {
        return <div className="sb-page">{detailError}</div>;
    }

    return(
        <div className="sb-page">
            <PageHeader
                breadcrumb={[
                    { label: t("common.breadcrumbRoot"), href: "/appr/forms" },
                    { label: t("forms.detail.breadcrumbForms"), href: "/appr/forms" },
                    { label: t("forms.detail.breadcrumbCurrent") },
                ]}
                title={t("forms.detail.title")}
                subtitle={t("forms.detail.subtitle")}
            />
            
            <Row gutter={[24, 16]}>
                <Col xs={24} md={16}>
                    {/*
                        editMode 여부와 무관하게 폼 마크업은 하나만 존재함.
                        disabled={!editMode}가 Input/Select/Switch에 자동 전파되어
                        뷰 모드일땐 회색 비활성 텍스트로, 편집모드일땐 그대로 입력 가능하게 렌더링됨.
                        (ReactQuill/SchemaFieldEditor는 자동전파 대상이 아니라 readOnly를 직접 연결)
                    */}
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdate}
                        
                    >
                        <Form.Item label={t("forms.detail.companyLabel")}>
                            <Input value={detail.comName} disabled/>
                        </Form.Item>

                        <Form.Item label={t("forms.detail.codeLabel")} required>
                            <Input.Group compact>
                                <Form.Item
                                    name="forCode"
                                    noStyle
                                    rules={[{required: true, message: t("forms.detail.codeRequired")}]}
                                >
                                    <Input
                                        style={{width: "calc(100% - 100px)"}}
                                        disabled={!editMode}
                                    />
                                </Form.Item>
                                <Button
                                    style={{width: 100}}
                                    onClick={handleCodeCheck}
                                    disabled={!editMode}
                                >
                                    {t("forms.detail.codeCheckBtn")}
                                </Button>
                            </Input.Group>
                        </Form.Item>

                        <Form.Item
                            name="forTitle"
                            label={t("forms.detail.titleLabel")}
                            rules={[{required: true, message: t("forms.detail.titleRequired")}]}
                        >
                            <Input
                                disabled={!editMode}
                            />
                        </Form.Item>

                        <Form.Item
                            name="forStatus"
                            label={t("forms.detail.activeLabel")}
                            valuePropName="checked"
                        >
                            <Switch
                                disabled={!editMode}
                            />
                        </Form.Item>
                        {isSchemaMode ? (
                            <Form.Item label={t("forms.detail.schemaFieldsLabel")}>
                                <SchemaFieldEditor
                                    fields={schemaFields}
                                    onChange={setSchemaFields}
                                    readOnly={!editMode}
                                />
                            </Form.Item>
                        ) : (
                            <Form.Item label={t("forms.detail.contentLabel")}>
                                <ReactQuill
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    readOnly={!editMode}
                                />
                            </Form.Item>
                        )}

                        <div 
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                flexWrap: "warp",
                                gap: 8,
                                marginTop: 8
                            }}
                        >
                        {editMode ? (
                            <Space wrap>
                                <Button onClick={handleCancelEdit}>{t("forms.detail.cancelBtn")}</Button>
                                <Button type="primary" htmlType="submit" loading={submitting}>
                                    {t("forms.detail.saveBtn")}
                                </Button>
                            </Space>
                        ) : (
                            <Space wrap>
                                <Button onClick={() => router.push("/appr/forms")}>{t("common.backToListBtn")}</Button>
                                <Popconfirm title={t("forms.detail.deleteConfirmTitle")} onConfirm={handleDelete}>
                                    <Button danger>{t("forms.detail.deleteBtn")}</Button>
                                </Popconfirm>
                                <Button type="primary" onClick={() => setEditMode(true)}>
                                    {t("forms.detail.editBtn")}
                                </Button>
                            </Space>
                        )}
                        </div>
                    </Form>
                </Col>

                <Col xs={24} md={8}>
                    <div style={{background: "#fafafa", borderRadius: 8, padding: 16, marginBottom: 16}}>
                        <div style={{fontWeight: 600, marginBottom: 12}}>{t("forms.detail.sideInfoTitle")}</div>
                        <Descriptions4Line label={t("forms.detail.sideInfo.forId")} value={detail.forId}/>
                        <Descriptions4Line label={t("forms.detail.sideInfo.forVersion")} value={detail.forVersion}/>
                        <Descriptions4Line label={t("forms.detail.sideInfo.createdAt")} value={detail.createdAt}/>
                        <Descriptions4Line label={t("forms.detail.sideInfo.updatedAt")} value={detail.updatedAt}/>
                        <div style={{display: "flex", justifyContent: "space-between", padding: "6px 0"}}>
                            <span style={{color: "#888", fontSize: 13}}>{t("forms.detail.sideInfo.usageLabel")}</span>
                            <Tag color={detail.forStatus ? "green" : "default"}>
                                {detail.forStatus ? t("common.statusActive") : t("common.statusInactive")}
                            </Tag>
                        </div>
                    </div>

                    <div style={{background: "#fafafa", borderRadius: 8, padding: 16}}>
                        <div style={{fontWeight: 600, marginBottom: 12}}>{t("forms.detail.versionHistoryTitle")}</div>
                        {versionsLoading ? (
                            <div style={{textAlign: "center", padding: "20px 0", color: "#999", fontSize: 13}}>
                                {t("common.loadingMsg")}
                            </div>
                        ) : versions.length === 0 ? (
                            <div style={{textAlign: "center", padding: "20px 0", color: "#999", fontSize: 13}}>
                                {t("forms.detail.versionHistoryEmpty")}
                            </div>
                        ) : (
                            versions.map((v) => {
                                // 지금 보고있는 버전인지
                                const isCurrent = String(v.forVersion) === String(forVersion);
                                const isDeleted = v.deleted;

                                return (
                                    <div
                                        key={v.forVersion}
                                        onClick={() => {
                                            if (!isCurrent && !isDeleted) {
                                                router.push(`/appr/forms/detail?forId=${v.forId}&forVersion=${v.forVersion}`);
                                            }
                                        }}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "10px 12px",
                                            marginBottom: 6,
                                            borderRadius: 6,
                                            background: isDeleted ? "#fafafa" : isCurrent ? "#e6f4ff" : "#fff",
                                            border: isDeleted ? "1px solid #eee" : isCurrent ? "1px solid #91caff" : "1px solid #eee",
                                            cursor: isCurrent || isDeleted ? "default" : "pointer",
                                        }}
                                    >
                                        <div>
                                            <div style={{fontWeight: 600, fontSize: 13}}>
                                                v{v.forVersion}
                                                {isCurrent && !isDeleted && (
                                                    <Tag color="blue" style={{marginLeft: 6}}>
                                                        {t("forms.detail.currentVersionTag")}
                                                    </Tag>
                                                )}
                                            </div>
                                            <div style={{fontSize: 12, color: "#999", marginTop: 2}}>
                                                {v.createdAt}
                                            </div>
                                        </div>
                                        {isDeleted ? (
                                            <Tag color="red" style={{margin: 0}}>{t("forms.detail.deletedTag")}</Tag>
                                        ) : (
                                            <Tag color={v.forStatus ? "green" : "default"} style={{margin: 0}}>
                                                {v.forStatus ? t("common.statusActive") : t("common.statusInactive")}
                                            </Tag>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
}

// 사이드 패널 라벨-값 한 줄용 작은 헬퍼 컴포넌트
function Descriptions4Line({label, value}) {
    return (
        <div style={{display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee"}}>
            <span style={{color: "#888", fontSize: 13}}>{label}</span>
            <span style={{fontSize: 13}}>{value}</span>
        </div>
    );
}