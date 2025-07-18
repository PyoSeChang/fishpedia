import React, { useCallback, useMemo, useState } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms, Text } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps, useSlateStatic } from 'slate-react';
import { withHistory } from 'slate-history';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered, 
  Quote, 
  Image 
} from 'lucide-react';

interface SlateRichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  onImageUpload?: (file: File) => Promise<string>;
}

const SlateRichTextEditor: React.FC<SlateRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '내용을 입력해주세요...',
  height = 400,
  onImageUpload
}) => {
  const editor = useMemo(() => withImages(withHistory(withReact(createEditor()))), []);
  const [editorValue, setEditorValue] = useState<Descendant[]>(() => {
    if (value) {
      return parseHtmlToSlate(value);
    }
    return [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ];
  });

  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

  const handleChange = (newValue: Descendant[]) => {
    setEditorValue(newValue);
    const html = serializeSlateToHtml(newValue);
    onChange(html);
  };

  const handleImageUpload = async () => {
    if (!onImageUpload) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const url = await onImageUpload(file);
          insertImage(editor, url);
        } catch (error) {
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    };
    input.click();
  };

  return (
    <div className="border border-gray-300 rounded-md">
      {/* 툴바 */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
        <MarkButton format="bold" icon={Bold} />
        <MarkButton format="italic" icon={Italic} />
        <MarkButton format="underline" icon={Underline} />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <BlockButton format="heading-one" text="H1" />
        <BlockButton format="heading-two" text="H2" />
        <BlockButton format="heading-three" text="H3" />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <BlockButton format="left" icon={AlignLeft} />
        <BlockButton format="center" icon={AlignCenter} />
        <BlockButton format="right" icon={AlignRight} />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <BlockButton format="numbered-list" icon={ListOrdered} />
        <BlockButton format="bulleted-list" icon={List} />
        <BlockButton format="block-quote" icon={Quote} />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        {onImageUpload && (
          <button
            onClick={handleImageUpload}
            className="p-1 hover:bg-gray-100 rounded"
            title="이미지 삽입"
          >
            <Image size={16} />
          </button>
        )}
      </div>

      {/* 에디터 */}
      <div style={{ height: `${height}px` }} className="overflow-y-auto">
        <Slate editor={editor} value={editorValue} onChange={handleChange}>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            className="p-4 min-h-full outline-none"
            spellCheck={false}
          />
        </Slate>
      </div>
    </div>
  );
};

// 마크 버튼 컴포넌트
const MarkButton: React.FC<{ format: string; icon: React.ComponentType<any> }> = ({ format, icon: Icon }) => {
  const editor = useSlateStatic();
  const isActive = isMarkActive(editor, format);
  
  return (
    <button
      className={`p-1 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-200' : ''}`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon size={16} />
    </button>
  );
};

// 블록 버튼 컴포넌트
const BlockButton: React.FC<{ format: string; icon?: React.ComponentType<any>; text?: string }> = ({ format, icon: Icon, text }) => {
  const editor = useSlateStatic();
  const isActive = isBlockActive(editor, format);
  
  return (
    <button
      className={`p-1 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-200' : ''}`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {Icon ? <Icon size={16} /> : <span className="text-sm font-medium">{text}</span>}
    </button>
  );
};

// 엘리먼트 렌더링
const Element: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
  const style: React.CSSProperties = {};
  
  if (element.align) {
    style.textAlign = element.align;
  }

  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote {...attributes} style={style} className="border-l-4 border-gray-300 pl-4 italic">
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul {...attributes} style={style} className="list-disc pl-6">
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 {...attributes} style={style} className="text-2xl font-bold mb-2">
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 {...attributes} style={style} className="text-xl font-bold mb-2">
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 {...attributes} style={style} className="text-lg font-bold mb-2">
          {children}
        </h3>
      );
    case 'list-item':
      return (
        <li {...attributes} style={style}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol {...attributes} style={style} className="list-decimal pl-6">
          {children}
        </ol>
      );
    case 'image':
      return (
        <div {...attributes} className="my-4">
          <div contentEditable={false}>
            <img 
              src={element.url} 
              alt={element.alt || ''}
              className="max-w-full h-auto rounded"
              style={{ display: 'block' }}
            />
          </div>
          {children}
        </div>
      );
    default:
      return (
        <p {...attributes} style={style} className="mb-2">
          {children}
        </p>
      );
  }
};

// 리프 렌더링
const Leaf: React.FC<RenderLeafProps> = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

// 유틸리티 함수들
const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor: Editor, format: string) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n.type === format || n.align === format),
    })
  );

  return !!match;
};

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = ['numbered-list', 'bulleted-list'].includes(format);
  const isAlign = ['left', 'center', 'right'].includes(format);

  if (isAlign) {
    Transforms.setNodes(
      editor,
      { align: isActive ? undefined : format },
      { match: n => Editor.isBlock(editor, n) }
    );
    return;
  }

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ['numbered-list', 'bulleted-list'].includes(n.type),
    split: true,
  });

  const newProperties: Partial<SlateElement> = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };

  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const withImages = (editor: Editor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element);
  };

  return editor;
};

const insertImage = (editor: Editor, url: string) => {
  const image = { type: 'image', url, children: [{ text: '' }] };
  Transforms.insertNodes(editor, image);
};

// HTML 파싱 및 직렬화 (간단한 구현)
const parseHtmlToSlate = (html: string): Descendant[] => {
  // 간단한 HTML 파싱 - 실제로는 더 복잡한 파싱이 필요
  if (!html || html.trim() === '') {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }
  
  // 기본적으로 HTML을 텍스트로 변환
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  return [{ type: 'paragraph', children: [{ text: textContent }] }];
};

const serializeSlateToHtml = (nodes: Descendant[]): string => {
  return nodes.map(node => serialize(node)).join('');
};

const serialize = (node: any): string => {
  if (Text.isText(node)) {
    let text = node.text;
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    return text;
  }

  const children = node.children.map((n: any) => serialize(n)).join('');
  const style = node.align ? ` style="text-align: ${node.align}"` : '';

  switch (node.type) {
    case 'block-quote':
      return `<blockquote${style}>${children}</blockquote>`;
    case 'bulleted-list':
      return `<ul${style}>${children}</ul>`;
    case 'heading-one':
      return `<h1${style}>${children}</h1>`;
    case 'heading-two':
      return `<h2${style}>${children}</h2>`;
    case 'heading-three':
      return `<h3${style}>${children}</h3>`;
    case 'list-item':
      return `<li${style}>${children}</li>`;
    case 'numbered-list':
      return `<ol${style}>${children}</ol>`;
    case 'image':
      return `<img src="${node.url}" alt="${node.alt || ''}" style="max-width: 100%; height: auto;" />`;
    default:
      return `<p${style}>${children}</p>`;
  }
};

export default SlateRichTextEditor;