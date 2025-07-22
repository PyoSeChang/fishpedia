import React, { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TaggableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSubmit?: () => void;
}

const TaggableInput: React.FC<TaggableInputProps> = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  onSubmit
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    console.log('=== TaggableInput Debug ===');
    console.log('입력값:', `"${inputValue}"`);
    console.log('현재 태그들:', tags);
    
    // 스페이스가 입력되었는지 확인
    if (inputValue.endsWith(' ')) {
      const trimmedInput = inputValue.trim();
      console.log('스페이스 감지! 트림된 입력:', `"${trimmedInput}"`);
      
      // #으로 시작하고 2글자 이상인 경우에만 태그로 변환
      if (trimmedInput.startsWith('#') && trimmedInput.length >= 2) {
        const tagName = trimmedInput.substring(1); // # 제거
        console.log('태그로 변환:', `"${tagName}"`);
        
        if (tagName && !tags.includes(tagName)) {
          const newTags = [...tags, tagName];
          setTags(newTags);
          setCurrentInput(''); // 입력 필드 비우기
          
          // 부모에게 태그들만 전달
          const fullValue = newTags.map(tag => `#${tag}`).join(' ');
          console.log('부모에게 전달할 태그들:', `"${fullValue}"`);
          onChange(fullValue);
          return;
        }
      }
      
      // 일반 텍스트 + 스페이스인 경우
      setCurrentInput(trimmedInput + ' ');
      const fullValue = (trimmedInput + ' ') + tags.map(tag => `#${tag}`).join(' ');
      onChange(fullValue.trim());
      return;
    }
    
    // 일반 입력 처리
    setCurrentInput(inputValue);
    const fullValue = inputValue + (inputValue && tags.length > 0 ? ' ' : '') + tags.map(tag => `#${tag}`).join(' ');
    onChange(fullValue.trim());
    console.log('========================');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Backspace' && currentInput === '' && tags.length > 0) {
      // 백스페이스로 마지막 태그 삭제
      const newTags = tags.slice(0, -1);
      setTags(newTags);
      const fullValue = newTags.map(tag => `#${tag}`).join(' ');
      onChange(fullValue);
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
    const fullValue = currentInput + (currentInput && newTags.length > 0 ? ' ' : '') + newTags.map(tag => `#${tag}`).join(' ');
    onChange(fullValue.trim());
  };

  return (
    <div className={`flex flex-wrap items-center border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white ${className}`}>
      {/* 태그들 표시 */}
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 mr-2 mb-1 text-sm bg-blue-100 text-blue-800 rounded-md"
        >
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="ml-1 text-blue-600 hover:text-blue-800"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      
      {/* 입력 필드 */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] border-none outline-none focus:ring-0 bg-transparent"
      />
    </div>
  );
};

export default TaggableInput;