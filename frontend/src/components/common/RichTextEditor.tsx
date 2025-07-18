import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  onImageUpload?: (file: File) => Promise<string>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '내용을 입력해주세요...',
  height = 400,
  onImageUpload
}) => {
  const editorRef = useRef<any>(null);

  const handleImageUpload = (blobInfo: any, progress: (percent: number) => void): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      if (onImageUpload) {
        const file = blobInfo.blob() as File;
        progress(0);
        
        onImageUpload(file)
          .then((url) => {
            progress(100);
            resolve(url);
          })
          .catch((error) => {
            reject('이미지 업로드에 실패했습니다: ' + error.message);
          });
      } else {
        reject('이미지 업로드 기능이 설정되지 않았습니다.');
      }
    });
  };


  return (
    <Editor
      apiKey="6ub7e3papn39kywlmjg54909y6i42qx7tfmvp7a3v4aqg6nc"
      onInit={(evt, editor) => editorRef.current = editor}
      value={value}
      onEditorChange={(content) => onChange(content)}
      init={{
        height: height,
        menubar: false,
        language: 'ko_KR',
        skin: 'oxide',
        content_css: 'default',
        placeholder: placeholder,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
          'bold italic forecolor backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | image | help',
        content_style: `
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
            font-size: 14px;
            line-height: 1.6;
          }
        `,
        images_upload_handler: onImageUpload ? handleImageUpload : undefined,
        automatic_uploads: true,
        file_picker_types: 'image',
        image_advtab: true,
        image_caption: true,
        image_list: [],
        formats: {
          alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'left' } },
          aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'center' } },
          alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'right' } },
          alignjustify: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'justify' } }
        },
        style_formats: [
          { title: '제목', items: [
            { title: '제목 1', format: 'h1' },
            { title: '제목 2', format: 'h2' },
            { title: '제목 3', format: 'h3' },
            { title: '제목 4', format: 'h4' },
            { title: '제목 5', format: 'h5' },
            { title: '제목 6', format: 'h6' }
          ]},
          { title: '인라인', items: [
            { title: '굵게', icon: 'bold', format: 'bold' },
            { title: '기울임', icon: 'italic', format: 'italic' },
            { title: '밑줄', icon: 'underline', format: 'underline' },
            { title: '취소선', icon: 'strikethrough', format: 'strikethrough' },
            { title: '위첨자', icon: 'superscript', format: 'superscript' },
            { title: '아래첨자', icon: 'subscript', format: 'subscript' },
            { title: '코드', icon: 'code', format: 'code' }
          ]},
          { title: '블록', items: [
            { title: '문단', format: 'p' },
            { title: '인용문', format: 'blockquote' },
            { title: '사전 형식', format: 'pre' }
          ]}
        ],
        font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt 48pt 60pt 72pt 96pt',
        font_family_formats: '맑은 고딕=Malgun Gothic,sans-serif;' +
          '돋움=Dotum,sans-serif;' +
          '굴림=Gulim,sans-serif;' +
          '바탕=Batang,serif;' +
          '궁서=Gungsuh,serif;' +
          'Arial=arial,helvetica,sans-serif;' +
          'Courier New=courier new,courier,monospace;' +
          'Times New Roman=times new roman,times,serif;',
        color_map: [
          '000000', '검정',
          '993300', '진한 주황',
          '333300', '진한 올리브',
          '003300', '진한 초록',
          '003366', '진한 청록',
          '000080', '네이비',
          '333399', '인디고',
          '333333', '짙은 회색',
          '800000', '진한 빨강',
          'FF6600', '주황',
          '808000', '올리브',
          '008000', '초록',
          '008080', '청록',
          '0000FF', '파랑',
          '666699', '회색 파랑',
          '808080', '회색',
          'FF0000', '빨강',
          'FF9900', '호박색',
          '99CC00', '연두',
          '339966', '바다색',
          '33CCCC', '하늘색',
          '3366FF', '연한 파랑',
          '800080', '보라',
          '999999', '연한 회색',
          'FF00FF', '자홍',
          'FFCC00', '금색',
          'FFFF00', '노랑',
          '00FF00', '라임',
          '00FFFF', '아쿠아',
          '00CCFF', '연한 하늘색',
          '993366', '갈색',
          'FFFFFF', '하양',
          'FF99CC', '연한 분홍',
          'FFCC99', '복숭아색',
          'FFFF99', '연한 노랑',
          'CCFFCC', '연한 초록',
          'CCFFFF', '연한 아쿠아',
          '99CCFF', '연한 파랑',
          'CC99FF', '연한 보라'
        ]
      }}
    />
  );
};

export default RichTextEditor;