import { forwardRef, useImperativeHandle, useRef, useMemo } from "react";
import ReactQuill, { Quill} from "react-quill";
import QuillBetterTable from "quill-better-table";
import { useTranslation } from "react-i18next";
import "react-quill/dist/quill.snow.css";
import "quill-better-table/dist/quill-better-table.css";

// 모듈 등록은 이 파일이 클라이언트에서 처음으로 로드될 때 1회만 실행
Quill.register({ "modules/better-table": QuillBetterTable}, true);

// forwardRef로 감싸서 외부(FormWritePage)에서 표 삽입 버튼을 직접 붙일 수 있게
const QuillTableEditor = forwardRef(function QuillTableEditor({ value, onChange}, ref) {
    const quillRef = useRef(null);
    const { t } = useTranslation("appr");

    // t()를 사용하기 위해 컴포넌트 내부에서 구성 (언어 변경시 메뉴 텍스트도 갱신)
    const modules = useMemo(() => ({
        table: false, // Quill 기본 table 모듈과 충돌 방지
        "better-table": {
            operationMenu: {
                items: {
                    unmergeCells: {text: t("quillTableEditor.unmergeCells")},
                },
            },
        },
        keyboard: {
            bindings: QuillBetterTable.keyboardBindings,
        },
    }), [t]);

    useImperativeHandle(ref, () => ({
        insertTable: (rows = 3, cols = 3) => {
            const editor = quillRef.current?.getEditor();
            const tableModule = editor?.getModule("better-table");
            tableModule?.insertTable(rows, cols);
        },
    }));

    return (
        <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
        />
    );
});

export default QuillTableEditor;