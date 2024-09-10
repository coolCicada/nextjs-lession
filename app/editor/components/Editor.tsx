'use client';
import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// 定义块类型接口
interface Block {
    id: string;
    type: 'header' | 'paragraph';
    text: string;
}

// 处理文本格式化
const formatText = (command: string, value?: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.display = 'inline';
        span.style.cursor = 'text';
        if (command === 'bold') {
            span.style.fontWeight = 'bold';
        } else if (command === 'italic') {
            span.style.fontStyle = 'italic';
        } else if (command === 'underline') {
            span.style.textDecoration = 'underline';
        } else if (command === 'fontSize') {
            span.style.fontSize = `${value}px`;
        }
        range.surroundContents(span);
        console.log('range', range);
    }
};

// 定义块类型工具
const blocks = {
    paragraph: {
        render: (data: Block) => (
            <div
                dangerouslySetInnerHTML={{ __html: data.text }}
                className="prose"
            />
        ),
        edit: (data: Block, onChange: (text: string) => void, ref: React.RefObject<HTMLDivElement>) => (
            <div className="w-full p-2 border rounded">
                <div className="flex space-x-2 mb-2">
                    <button
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => formatText('bold')}
                    >
                        B
                    </button>
                    <button
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => formatText('italic')}
                    >
                        I
                    </button>
                    <button
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => formatText('underline')}
                    >
                        U
                    </button>
                </div>
                <div
                    ref={ref}
                    contentEditable
                    className="w-full h-48 border rounded p-2"
                    dangerouslySetInnerHTML={{ __html: data.text }}
                    onBlur={(e) => setTimeout(() => onChange((e.target as HTMLElement).innerHTML), 100)}
                />
            </div>
        ),
    },
    header: {
        render: (data: Block) => <h1>{data.text}</h1>,
        edit: (data: Block, onChange: (text: string) => void) => (
            <input
                type="text"
                className="w-full p-2 border rounded"
                defaultValue={data.text}
                onBlur={(e) => onChange(e.target.value)}
            />
        ),
    },
};

// 拖拽类型
const ItemType = {
    BLOCK: 'BLOCK',
};

// 拖拽块组件
const DraggableBlock: React.FC<{ block: Block; index: number; moveBlock: (dragIndex: number, hoverIndex: number) => void; isEditing: boolean; setEditingId: (id: string) => void; handleChange: (id: string, text: string) => void }> =
    ({ block, index, moveBlock, isEditing, setEditingId, handleChange }) => {
        const [, ref] = useDrag({
            type: ItemType.BLOCK,
            item: { index },
        });

        const [{ isOver }, drop] = useDrop({
            accept: ItemType.BLOCK,
            // hover(item: { index: number }) {
            //     // if (item.index !== index) {
            //     //     moveBlock(item.index, index);
            //     //     item.index = index;
            //     // }
            // },
            drop: (item: { index: number }) => {
                if (item.index !== index) {
                    moveBlock(item.index, index);
                    item.index = index;
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        });

        const handleClick = () => {
            if (!isEditing) {
                setEditingId(block.id);
            }
        };

        return (
            <div
                ref={(node) => ref(drop(node))}
                className={`mb-4 p-4 bg-white border rounded shadow-sm min-h-[100px] cursor-pointer
                ${isOver ? 'border-blue-500' : 'border-gray-300'}`}
                onClick={handleClick}
            >
                {isEditing && (
                    <div>
                        {blocks[block.type].edit(
                            block,
                            (text) => handleChange(block.id, text),
                            React.createRef<HTMLDivElement>()
                        )}
                    </div>
                )}
                {!isEditing && blocks[block.type].render(block)}
            </div>
        );
    };

// 编辑器组件
const Editor: React.FC = () => {
    const [content, setContent] = useState<Block[]>([
        { id: uuidv4(), type: 'header', text: 'Welcome to Custom Editor!' },
        { id: uuidv4(), type: 'paragraph', text: '<p>Type your <b>content</b> <i>here</i>...</p>' },
    ]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // 处理文本更改
    const handleChange = (id: string, text: string) => {
        setContent(content.map(block =>
            block.id === id ? { ...block, text } : block
        ));
    };

    // 移动块
    const moveBlock = (dragIndex: number, hoverIndex: number) => {
        const updatedContent = [...content];
        const [removed] = updatedContent.splice(dragIndex, 1);
        updatedContent.splice(hoverIndex, 0, removed);
        setContent(updatedContent);
    };

    const handleAddBlock = (type: 'header' | 'paragraph') => {
        setContent([...content, { id: uuidv4(), type, text: '' }]);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="p-4 bg-gray-100 min-h-screen">
                <div className="mb-4">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => handleAddBlock('header')}
                    >
                        Add Header
                    </button>
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
                        onClick={() => handleAddBlock('paragraph')}
                    >
                        Add Paragraph
                    </button>
                </div>

                {content.map((block, index) => (
                    <DraggableBlock
                        handleChange={handleChange}
                        key={block.id}
                        block={block}
                        index={index}
                        moveBlock={moveBlock}
                        isEditing={editingId === block.id}
                        setEditingId={setEditingId}
                    />
                ))}
            </div>
        </DndProvider>
    );
};

export default Editor;
