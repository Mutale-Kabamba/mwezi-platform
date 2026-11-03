import React from 'react';

// Format inline markdown (bold, italic, code, links)
export const formatInlineText = (text) => {
    if (!text) return '';
    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    // Matches **bold**, *italic*, `code`, [text](url)
    const tokenRegex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`)(.*?)\5|\[(.*?)\]\((.*?)\)/;

    while (remaining) {
        const match = remaining.match(tokenRegex);
        if (!match) {
            parts.push(remaining);
            break;
        }

        const matchIndex = match.index;
        if (matchIndex > 0) {
            parts.push(remaining.substring(0, matchIndex));
        }

        if (match[2] !== undefined) {
            // Bold
            parts.push(
                <strong key={`b-${keyIdx++}`} className="font-bold text-slate-900">
                    {formatInlineText(match[2])}
                </strong>
            );
        } else if (match[4] !== undefined) {
            // Italic
            parts.push(
                <em key={`i-${keyIdx++}`} className="italic text-slate-800">
                    {formatInlineText(match[4])}
                </em>
            );
        } else if (match[6] !== undefined) {
            // Code
            parts.push(
                <code key={`c-${keyIdx++}`} className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[11px] font-mono border border-rose-100">
                    {match[6]}
                </code>
            );
        } else if (match[7] !== undefined && match[8] !== undefined) {
            // Link
            parts.push(
                <a
                    key={`a-${keyIdx++}`}
                    href={match[8]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 underline hover:text-rose-700 font-semibold"
                >
                    {match[7]}
                </a>
            );
        }

        remaining = remaining.substring(matchIndex + match[0].length);
    }

    return parts;
};

export default function MarkdownRenderer({ content, className = '' }) {
    if (!content) return null;

    const lines = content.split('\n');
    const elements = [];
    let currentList = null; // { type: 'ul' | 'ol', items: [] }

    const flushList = () => {
        if (!currentList) return;
        if (currentList.type === 'ul') {
            elements.push(
                <ul key={`ul-${elements.length}`} className="my-2.5 space-y-2 pl-1">
                    {currentList.items.map((item, i) => (
                        <li key={i} className="flex items-start text-xs leading-relaxed text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 mr-2.5 shrink-0" />
                            <span className="flex-1 min-w-0">{formatInlineText(item)}</span>
                        </li>
                    ))}
                </ul>
            );
        } else if (currentList.type === 'ol') {
            elements.push(
                <ol key={`ol-${elements.length}`} className="my-2.5 space-y-2 pl-0.5">
                    {currentList.items.map((item, i) => (
                        <li key={i} className="flex items-start text-xs leading-relaxed text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold flex items-center justify-center shrink-0 mr-2.5 mt-0.5 shadow-2xs">
                                {i + 1}
                            </span>
                            <span className="flex-1 min-w-0">{formatInlineText(item)}</span>
                        </li>
                    ))}
                </ol>
            );
        }
        currentList = null;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
            flushList();
            continue;
        }

        // Headings: ##, ###, ####, #
        const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
        if (headingMatch) {
            flushList();
            const level = headingMatch[1].length;
            const headingText = headingMatch[2];

            if (level === 1) {
                elements.push(
                    <h2
                        key={`h1-${i}`}
                        className="font-heading font-extrabold text-base text-slate-900 mt-4 mb-2 pb-1 border-b border-rose-100"
                    >
                        {formatInlineText(headingText)}
                    </h2>
                );
            } else if (level === 2) {
                elements.push(
                    <h3
                        key={`h2-${i}`}
                        className="font-heading font-bold text-sm text-slate-900 mt-4 mb-2 flex items-center space-x-1.5 pb-1 border-b border-rose-100/60"
                    >
                        <span>{formatInlineText(headingText)}</span>
                    </h3>
                );
            } else if (level === 3) {
                elements.push(
                    <h4
                        key={`h3-${i}`}
                        className="font-heading font-bold text-xs text-rose-700 mt-3 mb-1.5"
                    >
                        {formatInlineText(headingText)}
                    </h4>
                );
            } else {
                elements.push(
                    <h5
                        key={`h4-${i}`}
                        className="font-bold text-xs text-slate-800 mt-2 mb-1"
                    >
                        {formatInlineText(headingText)}
                    </h5>
                );
            }
            continue;
        }

        // Unordered list item: * or - or •
        const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
        if (ulMatch) {
            if (currentList && currentList.type !== 'ul') {
                flushList();
            }
            if (!currentList) {
                currentList = { type: 'ul', items: [] };
            }
            currentList.items.push(ulMatch[1]);
            continue;
        }

        // Ordered list item: 1. or 1)
        const olMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
        if (olMatch) {
            if (currentList && currentList.type !== 'ol') {
                flushList();
            }
            if (!currentList) {
                currentList = { type: 'ol', items: [] };
            }
            currentList.items.push(olMatch[2]);
            continue;
        }

        // Blockquote: >
        const quoteMatch = trimmed.match(/^>\s*(.+)$/);
        if (quoteMatch) {
            flushList();
            elements.push(
                <blockquote
                    key={`quote-${i}`}
                    className="border-l-4 border-rose-400 bg-rose-50/70 p-3.5 my-3 text-xs text-rose-950 font-medium italic rounded-r-2xl leading-relaxed shadow-2xs"
                >
                    {formatInlineText(quoteMatch[1])}
                </blockquote>
            );
            continue;
        }

        // Standard paragraph
        flushList();
        elements.push(
            <p key={`p-${i}`} className="text-xs leading-relaxed text-slate-700 my-2 first:mt-0 last:mb-0">
                {formatInlineText(trimmed)}
            </p>
        );
    }

    flushList();

    return (
        <div className={`space-y-1 font-body text-slate-800 ${className}`}>
            {elements}
        </div>
    );
}
