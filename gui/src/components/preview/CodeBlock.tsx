import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';
import { useTypewriterAnimation } from '../../hooks/useTypewriterAnimation';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  isStreaming?: boolean;
  /** Whether to animate with typewriter effect */
  animateTypewriter?: boolean;
  /** Previous content to start animation from */
  previousContent?: string;
}

function getLanguageClass(type?: string): string {
  if (!type) return 'language-none';
  switch (type) {
    case 'json':
      return 'language-json';
    case 'typescript':
    case 'ts':
    case 'tsx':
      return 'language-typescript';
    case 'javascript':
    case 'js':
    case 'jsx':
      return 'language-javascript';
    case 'markdown':
    case 'md':
      return 'language-markdown';
    case 'css':
      return 'language-css';
    case 'python':
    case 'py':
      return 'language-python';
    default:
      return 'language-none';
  }
}

export function CodeBlock({
  code,
  language,
  className = '',
  isStreaming = false,
  animateTypewriter = false,
  previousContent = '',
}: CodeBlockProps): JSX.Element {
  const codeRef = useRef<HTMLElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Use typewriter animation when enabled
  const { displayedContent, isAnimating } = useTypewriterAnimation(code, {
    enabled: animateTypewriter,
    startFrom: previousContent.length,
    baseCharsPerFrame: 30,
    maxDurationMs: 3000,
  });

  // Content to render: animated content when animating, otherwise full code
  const contentToRender = animateTypewriter ? displayedContent : code;

  // Show cursor when streaming or animating
  const showCursor = isStreaming || isAnimating;

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [contentToRender, language]);

  useEffect(() => {
    if ((isStreaming || isAnimating) && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [contentToRender, isStreaming, isAnimating]);

  return (
    <div className="relative h-full overflow-visible">
      <pre className={`${className} !bg-transparent !overflow-visible`}>
        <code ref={codeRef} className={getLanguageClass(language)}>
          {contentToRender}
        </code>
        {showCursor && <span className="cursor-blink" />}
        <div ref={endRef} />
      </pre>
    </div>
  );
}
