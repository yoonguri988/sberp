import { Input, Select, Checkbox, Button, Space, Tag } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const FIELD_TYPES = ["text", "textarea", "date", "number", "select"];

// key는 영문, 숫자, 언더바 만 허용
function sanitizeKey(value) {
    return value.replace(/[^a-zA-Z0-9_]/g, "");
}

export default function SchemaFieldEditor({ fields, onChange, readOnly = false }) {
    const { t } = useTranslation("appr");

    const updateField = (index, patch) => {
        const next = fields.map((f, i) => (i === index ? {...f, ...patch} : f));
        onChange(next);
    };

    const removeField = (index) => {
        onChange(fields.filter((_, i) => i !== index));
    };

    const addField = () => {
        onChange([...fields, {key: "", label: "", type: "text", required: false, options: []}]);
    };

    return (
        <div>
            <Space direction="vertical" style={{width: "100%"}} size={12}>
                {fields.map( (field, index) => (
                    <div
                        key={index}
                        style={{border: "1px solid #d9d9d9", borderRadius: 6, padding: 12}}
                    >
                        <Space wrap style={{width: "100%"}}>
                            <div>
                                <div style={{fontSize: 12, marginBottom: 4}}>{t("schemaFieldEditor.labelLabel")}</div>
                                <Input
                                    style={{width: 160}}
                                    value={field.label}
                                    disabled={readOnly}
                                    onChange={(e) => updateField(index, {label: e.target.value})}
                                />
                            </div>

                            <div>
                                <div style={{fontSize: 12, marginBottom: 4}}>{t("schemaFieldEditor.typeLabel")}</div>
                                <Select
                                    style={{width: 120}}
                                    value={field.type}
                                    disabled={readOnly}
                                    onChange={(value) => updateField(index, {type: value})}
                                    options={FIELD_TYPES.map((ft) => ({label: ft, value: ft}))}
                                />
                            </div>

                            <div>
                                <div style={{fontSize: 12, marginBottom: 4}}>{t("schemaFieldEditor.keyLabel")}</div>
                                <Input
                                    style={{width: 160}}
                                    placeholder={t("schemaFieldEditor.keyPlaceholder")}
                                    value={field.key}
                                    disabled={readOnly}
                                    onChange={(e) => updateField(index, {key: sanitizeKey(e.target.value)})}
                                />
                            </div>

                            <div style={{paddingTop: 20}}>
                                <Checkbox
                                    checked={field.required}
                                    disabled={readOnly}
                                    onChange={(e) => updateField(index, {required: e.target.checked})}
                                >
                                    {t("schemaFieldEditor.requiredLabel")}
                                </Checkbox>
                            </div>

                            {!readOnly && (
                            <div style={{paddingTop: 20}}>
                                <Button
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeField(index)}
                                >
                                    {t("schemaFieldEditor.deleteBtn")}
                                </Button>
                            </div>
                            )}
                        </Space>

                        {field.type === "select" && (
                            <div style={{marginTop: 8}}>
                                <div style={{fontSize: 12, marginBottom: 4}}>{t("schemaFieldEditor.optionsLabel")}</div>
                                <Select
                                    mode="tags"
                                    style={{width: "100%"}}
                                    value={field.options || []}
                                    onChange={(options) => updateField(index, {options})}
                                    tokenSeparators={[","]}
                                    disabled={readOnly}
                                />
                            </div>
                        )}   
                    </div>
                ))}
            </Space>

            {!readOnly && (
            <Button
                type="dashed"
                icon={<PlusOutlined/>}
                onClick={addField}
                style={{ marginTop: 12}}
            >
                {t("schemaFieldEditor.addBtn")}
            </Button>
            )}
        </div>
    );
}

// 저장 전 검증
// t: react-i18next의 t 함수를 이벤트 핸들러(JSX 밖)에서 호출하기 위해 인자로 전달받음
export function validateSchemaFields(fields, t) {
    // 필드가 존재하는지 확인
    if (fields.length === 0) {
        return t("schemaFieldEditor.validation.minFields");
    }

    const keys = fields.map( (f) => f.key.trim());

    // key 입력란 비어있는지 확인
    if (keys.some( (k) => k === "")) {
        return t("schemaFieldEditor.validation.keyRequired");
    }

    // key 값 중복 확인
    if (new Set(keys).size !== keys.length) {
        return t("schemaFieldEditor.validation.keyDuplicate")
    }

    return null;
}