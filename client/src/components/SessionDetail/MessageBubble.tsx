import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('yml', yaml);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('md', markdown);
import type { ParsedMessage, ToolRequest } from '../../api/client.ts';
import { RelativeTime } from '../shared/RelativeTime.tsx';

interface Props {
  message: ParsedMessage;
}

const TOOL_STYLES: Record<string, { dot: string; label: string; border: string }> = {
  bash:          { dot: 'bg-blue-400',   label: 'text-blue-400',   border: 'border-blue-400/30' },
  edit:          { dot: 'bg-yellow-400', label: 'text-yellow-400', border: 'border-yellow-400/30' },
  view:          { dot: 'bg-purple-400', label: 'text-purple-400', border: 'border-purple-400/30' },
  read:          { dot: 'bg-purple-400', label: 'text-purple-400', border: 'border-purple-400/30' },
  write:         { dot: 'bg-orange-400', label: 'text-orange-400', border: 'border-orange-400/30' },
  task:          { dot: 'bg-green-400',  label: 'text-green-400',  border: 'border-green-400/30' },
  task_complete: { dot: 'bg-green-400',  label: 'text-green-400',  border: 'border-green-400/30' },
  read_agent:    { dot: 'bg-green-400',  label: 'text-green-400',  border: 'border-green-400/30' },
  ask_user:      { dot: 'bg-pink-400',   label: 'text-pink-400',   border: 'border-pink-400/30' },
  report_intent: { dot: 'bg-gray-400',   label: 'text-gray-400',   border: 'border-gray-400/30' },
};

const DEFAULT_TOOL_STYLE = { dot: 'bg-gh-accent', label: 'text-gh-accent', border: 'border-gh-accent/30' };

function AskUserBlock({ tool }: { tool: ToolRequest }) {
  const args = tool.arguments as {
    // old format
    question?: string;
    choices?: string[];
    allow_freeform?: boolean;
    // new format
    message?: string;
    requestedSchema?: {
      properties?: Record<string, { enum?: string[]; title?: string; type?: string }>;
      required?: string[];
    };
  };

  // Normalise to a single question string and choices array
  const question = args.question ?? args.message ?? '';
  const choices: string[] = args.choices ??
    Object.values(args.requestedSchema?.properties ?? {}).flatMap(p => p.enum ?? []);

  const rawAnswer = tool.result?.content ?? '';
  // result.content is prefixed with "User selected: " or "User responded: "
  const answer = rawAnswer.replace(/^User (?:selected|responded):\s*/i, '');
  const isPending = !rawAnswer && !tool.error;

  return (
    <div className={`rounded-lg border ${isPending ? 'border-pink-400/40 bg-pink-400/5' : 'border-pink-400/20 bg-gh-bg'} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-pink-400/20">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-pink-400" />
        <span className="text-pink-400 font-medium text-xs">Question</span>
        {isPending && (
          <span className="ml-auto text-xs text-pink-400/70 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            Waiting for response
          </span>
        )}
      </div>

      {/* Question */}
      {question && (
        <p className="px-3 py-2.5 text-sm text-gh-text leading-relaxed whitespace-pre-wrap">
          {question}
        </p>
      )}

      {/* Choices */}
      {choices.length > 0 && (
        <div className="px-3 pb-2.5 flex flex-col gap-1.5">
          {choices.map((choice, i) => {
            const isSelected = answer === choice;
            return (
              <div
                key={i}
                className={`flex items-start gap-2.5 rounded-md px-3 py-2 text-sm border transition-colors
                  ${isSelected
                    ? 'border-pink-400/50 bg-pink-400/10 text-gh-text'
                    : answer
                      ? 'border-gh-border/50 bg-gh-surface/50 text-gh-muted'
                      : 'border-gh-border bg-gh-surface text-gh-text'
                  }`}
              >
                <span className={`flex-shrink-0 w-5 h-5 rounded-full border text-xs flex items-center justify-center font-mono mt-0.5
                  ${isSelected ? 'border-pink-400 bg-pink-400/20 text-pink-400' : 'border-gh-border text-gh-muted'}`}>
                  {isSelected ? '✓' : String.fromCharCode(65 + i)}
                </span>
                <span className="leading-relaxed">{choice}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Freeform answer */}
      {answer && !choices.includes(answer) && (
        <div className="px-3 pb-2.5">
          <div className="flex items-start gap-2 rounded-md px-3 py-2 border border-pink-400/30 bg-pink-400/5 text-sm text-gh-text">
            <span className="text-pink-400 text-xs font-medium flex-shrink-0 mt-0.5">Answer</span>
            <span className="text-gh-text leading-relaxed">{answer}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const AGENT_TYPE_LABELS: Record<string, string> = {
  'explore':                    'Explore',
  'general-purpose':            'General',
  'Plan':                       'Plan',
  'claude-code-guide':          'Guide',
  'code-review':                'Code Review',
  'code-reviewer':              'Code Review',
};

const AGENT_TYPE_COLORS: Record<string, { dot: string; label: string; border: string; section: string; pulse: string }> = {
  'code-review':   { dot: 'bg-sky-400',   label: 'text-sky-400',   border: 'border-sky-400/30',   section: 'text-sky-400/60',   pulse: 'bg-sky-400' },
  'code-reviewer': { dot: 'bg-sky-400',   label: 'text-sky-400',   border: 'border-sky-400/30',   section: 'text-sky-400/60',   pulse: 'bg-sky-400' },
};

const DEFAULT_AGENT_COLORS = { dot: 'bg-green-400', label: 'text-green-400', border: 'border-green-400/30', section: 'text-green-400/60', pulse: 'bg-green-400' };


function TaskBlock({ tool }: { tool: ToolRequest }) {
  const isReadAgent = tool.name === 'read_agent';
  const args = tool.arguments as {
    // task args
    agent_type?: string;
    taskDescription?: string;
    prompt?: string;
    mode?: string;
    // read_agent args
    agent_id?: string;
    wait?: boolean;
  };
  // normalise: task uses args.description, read_agent uses args.agent_id
  const rawArgs = tool.arguments as Record<string, unknown>;
  const agentDescription: string | undefined = isReadAgent
    ? (args.agent_id)
    : (rawArgs.description as string | undefined);

  const result = tool.result?.detailedContent ?? tool.result?.content;
  const hasError = !!tool.error;

  const agentType = rawArgs.agent_type as string | undefined;
  const agentLabel = isReadAgent
    ? 'Read'
    : (agentType ? (AGENT_TYPE_LABELS[agentType] ?? agentType) : 'Agent');

  const colors = AGENT_TYPE_COLORS[agentType ?? ''] ?? DEFAULT_AGENT_COLORS;
  const isDone = !!result || hasError;

  return (
    <details className={`rounded border ${hasError ? 'border-gh-attention/30' : colors.border} bg-gh-bg text-xs group`}>
      <summary className="px-3 py-2 cursor-pointer list-none flex items-center gap-2 hover:bg-white/5 transition-colors">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasError ? 'bg-gh-attention' : isDone ? colors.dot : `${colors.pulse} animate-pulse`}`} />

        {/* Agent type badge */}
        <span className={`font-mono font-medium text-xs px-1.5 py-0.5 rounded ${hasError ? 'text-gh-attention' : colors.label}`}
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          {agentLabel}
        </span>

        {/* Sub-agent indicator */}
        {(isReadAgent || tool.name === 'task') && (
          <span className="text-xs text-gh-muted/50 font-mono">sub-agent</span>
        )}

        {/* Description / agent_id */}
        {agentDescription && (
          <span className="text-gh-muted truncate">{agentDescription}</span>
        )}

        {/* Mode badge */}
        {args.mode && args.mode !== 'sync' && (
          <span className="ml-auto mr-1 text-gh-muted/40 font-mono">{args.mode}</span>
        )}

        <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"
          className={`${args.mode ? '' : 'ml-auto'} flex-shrink-0 text-gh-muted/50 transition-transform group-open:rotate-90`}>
          <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
        </svg>
      </summary>

      <div className={`border-t ${colors.border} divide-y divide-gh-border/20`}>
        {/* Prompt */}
        {args.prompt && (
          <div>
            <div className={`px-3 py-1 ${colors.section} text-xs font-medium uppercase tracking-wider border-b border-gh-border/30`}>
              Prompt
            </div>
            <pre className="px-3 py-2 overflow-x-auto font-mono text-xs text-gh-muted whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
              {args.prompt}
            </pre>
          </div>
        )}

        {/* Result */}
        {(result || hasError) && (
          <div>
            <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider border-b border-gh-border/30 ${hasError ? 'text-gh-attention/60' : colors.section}`}>
              {hasError ? 'Error' : 'Result'}
            </div>
            <pre className={`px-3 py-2 overflow-x-auto font-mono text-xs whitespace-pre-wrap break-all ${hasError ? 'text-gh-attention' : 'text-gh-muted'}`}>
              {hasError ? `${tool.error!.message} (${tool.error!.code})` : result}
            </pre>
          </div>
        )}
      </div>
    </details>
  );
}

// ── Atlassian (Confluence + Jira) ──────────────────────────────────────────

const ATLASSIAN_META: Record<string, {
  product: 'confluence' | 'jira';
  action: string;
  summary: (args: Record<string, unknown>) => string;
}> = {
  'mcp-atlassian-confluence_get_page':             { product: 'confluence', action: 'Get Page',             summary: (a) => String(a.page_id ?? '') },
  'mcp-atlassian-confluence_get_page_children':    { product: 'confluence', action: 'Get Children',         summary: (a) => `parent ${a.parent_id}` },
  'mcp-atlassian-confluence_create_page':          { product: 'confluence', action: 'Create Page',          summary: (a) => String(a.title ?? '') },
  'mcp-atlassian-confluence_update_page':          { product: 'confluence', action: 'Update Page',          summary: (a) => String(a.title ?? a.page_id ?? '') },
  'mcp-atlassian-confluence_search':               { product: 'confluence', action: 'Search',               summary: (a) => String(a.query ?? '') },
  'mcp-atlassian-jira_get_issue':                  { product: 'jira',       action: 'Get Issue',            summary: (a) => String(a.issue_key ?? '') },
  'mcp-atlassian-jira_get_issue_development_info': { product: 'jira',       action: 'Dev Info',             summary: (a) => String(a.issue_key ?? '') },
  'mcp-atlassian-jira_get_issue_images':           { product: 'jira',       action: 'Issue Images',         summary: (a) => String(a.issue_key ?? '') },
  'mcp-atlassian-jira_add_comment':                { product: 'jira',       action: 'Add Comment',          summary: (a) => String(a.issue_key ?? '') },
  'mcp-atlassian-jira_download_attachments':       { product: 'jira',       action: 'Download Attachments', summary: (a) => String(a.issue_key ?? '') },
  'mcp-atlassian-jira_search':                     { product: 'jira',       action: 'Search',               summary: (a) => String(a.jql ?? '') },
};

function AtlassianBlock({ tool }: { tool: ToolRequest }) {
  const meta = ATLASSIAN_META[tool.name];
  if (!meta) return <ToolCallBlock tool={tool} />;

  const args = tool.arguments as Record<string, unknown>;
  const isConfluence = meta.product === 'confluence';
  const hasError = !!tool.error;
  const result = tool.result?.detailedContent ?? tool.result?.content;
  const summaryText = meta.summary(args);

  const errorCode = tool.error?.code ?? '';
  const isAborted = errorCode === 'rejected' || errorCode === 'denied' || errorCode === 'aborted';
  const isDone = !!result || hasError;

  // User feedback stripped from denied message e.g. "The user rejected this tool call. User feedback: ..."
  const userFeedback = tool.error?.message.match(/User feedback:\s*(.+)/s)?.[1]?.trim();

  // Colors: Confluence = blue, Jira = indigo, aborted = muted amber, error = red
  const color = isConfluence
    ? { dot: 'bg-blue-400',    label: 'text-blue-400',    border: 'border-blue-400/30',    badge: 'bg-blue-400/10 text-blue-400',    section: 'text-blue-400/60' }
    : { dot: 'bg-indigo-400',  label: 'text-indigo-400',  border: 'border-indigo-400/30',  badge: 'bg-indigo-400/10 text-indigo-400', section: 'text-indigo-400/60' };
  const abortedColor = { dot: 'bg-gh-muted',     label: 'text-gh-muted',     border: 'border-gh-border',         badge: 'bg-gh-muted/10 text-gh-muted',    section: 'text-gh-muted/60' };
  const errorColor   = { dot: 'bg-gh-attention', label: 'text-gh-attention', border: 'border-gh-attention/30',   badge: 'bg-gh-attention/10 text-gh-attention', section: 'text-gh-attention/60' };

  const c = isAborted ? abortedColor : hasError ? errorColor : color;

  return (
    <details className={`rounded border ${c.border} bg-gh-bg text-xs group`}>
      <summary className="px-3 py-2 cursor-pointer list-none flex items-center gap-2 hover:bg-white/5 transition-colors">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDone || isAborted ? c.dot : `${c.dot} animate-pulse`}`} />

        {/* Product badge */}
        <span className={`font-medium text-xs px-1.5 py-0.5 rounded ${c.badge}`}>
          {isConfluence ? 'Confluence' : 'Jira'}
        </span>

        {/* Action */}
        <span className={`font-mono font-medium ${c.label}`}>{meta.action}</span>

        {/* Key / title / query */}
        {summaryText && (
          <span className={`truncate ${isAborted ? 'text-gh-muted/60 line-through' : 'text-gh-muted'}`}>{summaryText}</span>
        )}

        {/* Aborted label */}
        {isAborted && (
          <span className="ml-auto shrink-0 text-gh-muted/50 italic">Aborted by user</span>
        )}

        {!isAborted && (
          <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"
            className="ml-auto flex-shrink-0 text-gh-muted/50 transition-transform group-open:rotate-90">
            <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
          </svg>
        )}
      </summary>

      <div className={`border-t ${c.border} divide-y divide-gh-border/20`}>
        {/* Key args shown as a compact property list */}
        {(() => {
          const displayArgs = Object.entries(args).filter(([k, v]) => k !== 'content' && v != null && String(v) !== '');
          return displayArgs.length > 0 ? (
            <div className="px-3 py-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {displayArgs.map(([k, v]) => (
                <React.Fragment key={k}>
                  <span className={`${c.section} font-medium uppercase tracking-wide text-xs leading-5 whitespace-nowrap`}>{k.replace(/_/g, ' ')}</span>
                  <span className="text-gh-muted font-mono text-xs leading-5 truncate">{String(v)}</span>
                </React.Fragment>
              ))}
            </div>
          ) : null;
        })()}

        {/* Content preview (collapsed) */}
        {typeof args.content === 'string' && args.content && (
          <div>
            <div className={`px-3 py-1 ${c.section} text-xs font-medium uppercase tracking-wider border-b border-gh-border/30`}>Content</div>
            <pre className="px-3 py-2 overflow-x-auto font-mono text-xs text-gh-muted whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
              {args.content.slice(0, 800)}{args.content.length > 800 ? '\n…' : ''}
            </pre>
          </div>
        )}

        {/* User feedback on denied calls */}
        {isAborted && userFeedback && (
          <div className="px-3 py-2 text-gh-muted/70 italic text-xs">
            <span className="text-gh-muted/40 not-italic mr-1">Feedback:</span>{userFeedback}
          </div>
        )}

        {/* Result / error */}
        {(result || (hasError && !isAborted)) && (
          <div>
            <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider border-b border-gh-border/30 ${hasError ? 'text-gh-attention/60' : c.section}`}>
              {hasError ? 'Error' : 'Result'}
            </div>
            <pre className={`px-3 py-2 overflow-x-auto font-mono text-xs whitespace-pre-wrap break-all max-h-64 overflow-y-auto ${hasError ? 'text-gh-attention' : 'text-gh-muted'}`}>
              {hasError ? `${tool.error!.message} (${tool.error!.code})` : result}
            </pre>
          </div>
        )}
      </div>
    </details>
  );
}

const FIGMA_TOOL_META: Record<string, { action: string }> = {
  'figma-get_screenshot':     { action: 'Screenshot' },
  'figma-get_design_context': { action: 'Design Context' },
  'figma-get_metadata':       { action: 'Metadata' },
};

function FigmaBlock({ tool }: { tool: ToolRequest }) {
  const meta = FIGMA_TOOL_META[tool.name] ?? { action: tool.name.replace('figma-', '').replace(/_/g, ' ') };
  const args = tool.arguments as { nodeId?: string; clientLanguages?: string; clientFrameworks?: string; artifactType?: string };
  const nodeId = args.nodeId;
  const hasError = !!tool.error;
  const isDone = !!tool.result || hasError;

  const color = { dot: 'bg-violet-400', label: 'text-violet-400', border: 'border-violet-400/30', section: 'text-violet-400/60', badge: 'bg-violet-400/10 text-violet-400' };

  return (
    <details className={`rounded border ${hasError ? 'border-gh-attention/30' : color.border} bg-gh-bg text-xs group`}>
      <summary className="px-3 py-2 cursor-pointer list-none flex items-center gap-2 hover:bg-white/5 transition-colors">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasError ? 'bg-gh-attention' : isDone ? color.dot : `${color.dot} animate-pulse`}`} />

        {/* Product badge */}
        <span className={`font-medium text-xs px-1.5 py-0.5 rounded ${color.badge}`}>
          Figma
        </span>

        {/* Action */}
        <span className={`font-mono font-medium ${color.label}`}>{meta.action}</span>

        {/* Node ID */}
        {nodeId ? (
          <span className="text-gh-muted font-mono truncate" title={nodeId}>
            #{nodeId}
          </span>
        ) : (
          <span className="text-gh-muted/40 italic">no node</span>
        )}

        {!hasError && (
          <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"
            className="ml-auto flex-shrink-0 text-gh-muted/50 transition-transform group-open:rotate-90">
            <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
          </svg>
        )}
      </summary>

      <div className={`border-t ${color.border} divide-y divide-gh-border/20`}>
        {/* Details */}
        {(args.clientFrameworks || args.clientLanguages || args.artifactType) && (
          <div className="px-3 py-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {args.clientFrameworks && (
              <>
                <span className={`${color.section} font-medium uppercase tracking-wide text-xs leading-5 whitespace-nowrap`}>Frameworks</span>
                <span className="text-gh-muted font-mono text-xs leading-5">{args.clientFrameworks}</span>
              </>
            )}
            {args.clientLanguages && (
              <>
                <span className={`${color.section} font-medium uppercase tracking-wide text-xs leading-5 whitespace-nowrap`}>Languages</span>
                <span className="text-gh-muted font-mono text-xs leading-5">{args.clientLanguages}</span>
              </>
            )}
            {args.artifactType && (
              <>
                <span className={`${color.section} font-medium uppercase tracking-wide text-xs leading-5 whitespace-nowrap`}>Artifact</span>
                <span className="text-gh-muted font-mono text-xs leading-5">{args.artifactType.replace(/_/g, ' ').toLowerCase()}</span>
              </>
            )}
          </div>
        )}

        {/* Result / error */}
        {(tool.result?.content || hasError) && (
          <div>
            <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider border-b border-gh-border/30 ${hasError ? 'text-gh-attention/60' : color.section}`}>
              {hasError ? 'Error' : 'Result'}
            </div>
            <pre className={`px-3 py-2 overflow-x-auto font-mono text-xs whitespace-pre-wrap break-all max-h-48 overflow-y-auto ${hasError ? 'text-gh-attention' : 'text-gh-muted'}`}>
              {hasError ? `${tool.error!.message} (${tool.error!.code})` : tool.result!.content}
            </pre>
          </div>
        )}
      </div>
    </details>
  );
}

function ReasoningBlock({ text }: { text: string }) {
  return (
    <details className="rounded border border-amber-400/20 bg-amber-400/5 text-xs group mb-2">
      <summary className="px-3 py-2 cursor-pointer list-none flex items-center gap-2 hover:bg-amber-400/5 transition-colors">
        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" className="text-amber-400/70 flex-shrink-0">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3H7v-1.5h2V11zm0-3H7c0-2.5 3-2.5 3-4a2 2 0 10-4 0H4a4 4 0 118 0c0 2.3-3 2.5-3 4z"/>
        </svg>
        <span className="text-amber-400/70 font-medium uppercase tracking-wider text-xs">Thinking</span>
        <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"
          className="ml-auto flex-shrink-0 text-amber-400/40 transition-transform group-open:rotate-90">
          <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
        </svg>
      </summary>
      <div className="border-t border-amber-400/15 px-3 py-2.5">
        <p className="text-amber-200/60 text-xs leading-relaxed whitespace-pre-wrap italic">{text}</p>
      </div>
    </details>
  );
}

function ReportIntentBlock({ tool }: { tool: ToolRequest }) {
  const args = tool.arguments as { intent?: string };
  if (!args.intent) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-gray-400/20 bg-gh-bg text-xs text-gh-muted">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-gray-400/60" />
      <span className="italic">{args.intent}</span>
    </div>
  );
}

function EditBlock({ tool }: { tool: ToolRequest }) {
  const args = tool.arguments as { path?: string; old_str?: string; new_str?: string };
  const fileName = args.path?.split('/').pop() ?? args.path ?? 'file';
  const hasError = !!tool.error;

  return (
    <details className={`rounded border ${hasError ? 'border-gh-attention/30' : 'border-yellow-400/30'} bg-gh-bg text-xs group`}>
      <summary className="px-3 py-2 cursor-pointer list-none flex items-center gap-2 hover:bg-white/5 transition-colors">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasError ? 'bg-gh-attention' : 'bg-yellow-400'}`} />
        <span className={`font-mono font-medium text-xs px-1.5 py-0.5 rounded ${hasError ? 'text-gh-attention' : 'text-yellow-400'}`}
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          edit
        </span>
        <span className="text-gh-muted font-mono truncate">{fileName}</span>
        {tool.intentionSummary && (
          <span className="text-gh-muted/70 truncate hidden sm:inline">{tool.intentionSummary}</span>
        )}
        <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"
          className="ml-auto flex-shrink-0 text-gh-muted/50 transition-transform group-open:rotate-90">
          <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
        </svg>
      </summary>

      <div className="border-t border-yellow-400/20">
        {/* Full path */}
        <div className="px-3 py-1.5 font-mono text-gh-muted/60 text-xs border-b border-gh-border/30 truncate">
          {args.path}
        </div>

        {hasError ? (
          <pre className="px-3 py-2 text-gh-attention font-mono text-xs whitespace-pre-wrap break-all">
            {tool.error!.message} ({tool.error!.code})
          </pre>
        ) : (
          <div className="divide-y divide-gh-border/20">
            {/* Removed lines */}
            {args.old_str !== undefined && (
              <div>
                <div className="px-3 py-1 text-xs font-medium text-red-400/60 uppercase tracking-wider bg-red-400/5 border-b border-red-400/10">
                  Removed
                </div>
                <pre className="px-3 py-2 overflow-x-auto font-mono text-xs whitespace-pre-wrap break-all bg-red-400/5 text-red-300/80">
                  {args.old_str.split('\n').map((line, i) => (
                    <span key={i} className="block">
                      <span className="select-none text-red-400/40 mr-2">−</span>{line}
                    </span>
                  ))}
                </pre>
              </div>
            )}
            {/* Added lines */}
            {args.new_str !== undefined && (
              <div>
                <div className="px-3 py-1 text-xs font-medium text-green-400/60 uppercase tracking-wider bg-green-400/5 border-b border-green-400/10">
                  Added
                </div>
                <pre className="px-3 py-2 overflow-x-auto font-mono text-xs whitespace-pre-wrap break-all bg-green-400/5 text-green-300/80">
                  {args.new_str.split('\n').map((line, i) => (
                    <span key={i} className="block">
                      <span className="select-none text-green-400/40 mr-2">+</span>{line}
                    </span>
                  ))}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

function BashBlock({ tool }: { tool: ToolRequest }) {
  const args = tool.arguments as { command?: string; description?: string; mode?: string; initial_wait?: number };
  const output = tool.result?.detailedContent ?? tool.result?.content;
  const hasError = !!tool.error;

  return (
    <details className={`rounded border ${hasError ? 'border-gh-attention/30' : 'border-blue-400/30'} bg-gh-bg text-xs group`}>
      <summary className="px-3 py-2 cursor-pointer list-none flex items-center gap-2 hover:bg-white/5 transition-colors">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasError ? 'bg-gh-attention' : 'bg-blue-400'}`} />
        <span className={`font-mono font-medium text-xs px-1.5 py-0.5 rounded ${hasError ? 'text-gh-attention' : 'text-blue-400'}`}
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          bash
        </span>
        {args.description && (
          <span className="text-gh-muted truncate">{args.description}</span>
        )}
        <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"
          className="ml-auto flex-shrink-0 text-gh-muted/50 transition-transform group-open:rotate-90">
          <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
        </svg>
      </summary>

      <div className={`border-t ${hasError ? 'border-gh-attention/20' : 'border-blue-400/20'}`}>
        {/* Command */}
        <div className="px-3 py-1 text-blue-400/60 text-xs font-medium uppercase tracking-wider border-b border-gh-border/30 flex items-center gap-2">
          <span>Command</span>
          {args.mode && <span className="text-gh-muted/40 normal-case">· {args.mode}</span>}
        </div>
        <pre className="px-3 py-2 overflow-x-auto font-mono text-xs text-blue-200/80 bg-blue-400/5 whitespace-pre-wrap break-all">
          <span className="select-none text-blue-400/40 mr-1">$</span>{args.command}
        </pre>

        {/* Output */}
        {(output || hasError) && (
          <>
            <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider border-t border-b border-gh-border/30 ${hasError ? 'text-gh-attention/60' : 'text-blue-400/60'}`}>
              {hasError ? 'Error' : 'Output'}
            </div>
            <pre className={`px-3 py-2 overflow-x-auto font-mono text-xs whitespace-pre-wrap break-all ${hasError ? 'text-gh-attention' : 'text-gh-muted'}`}>
              {hasError ? `${tool.error!.message} (${tool.error!.code})` : output}
            </pre>
          </>
        )}
      </div>
    </details>
  );
}

function ToolCallBlock({ tool }: { tool: ToolRequest }) {
  const argsStr = JSON.stringify(tool.arguments, null, 2);
  const output = tool.result?.detailedContent ?? tool.result?.content;
  const style = tool.error
    ? { dot: 'bg-gh-attention', label: 'text-gh-attention', border: 'border-gh-attention/30' }
    : (TOOL_STYLES[tool.name] ?? DEFAULT_TOOL_STYLE);

  return (
    <details className={`rounded border ${style.border} bg-gh-bg text-xs group`}>
      <summary className="px-3 py-2 cursor-pointer list-none flex items-center gap-2 hover:bg-white/5 transition-colors">
        {/* Colored dot */}
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />

        {/* Tool name badge */}
        <span className={`font-mono font-medium text-xs px-1.5 py-0.5 rounded ${style.label} bg-current/10`}
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          {tool.name}
        </span>

        {/* Intention summary */}
        {tool.intentionSummary && (
          <span className="text-gh-muted truncate">{tool.intentionSummary}</span>
        )}

        {/* Chevron */}
        <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"
          className="ml-auto flex-shrink-0 text-gh-muted/50 transition-transform group-open:rotate-90">
          <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
        </svg>
      </summary>

      <div className={`border-t ${style.border}`}>
        {/* Input */}
        <div className="px-3 py-1 text-gh-muted/50 text-xs font-medium uppercase tracking-wider border-b border-gh-border/30">
          Input
        </div>
        <pre className="px-3 py-2 overflow-x-auto text-gh-muted font-mono text-xs whitespace-pre-wrap break-all">
          {argsStr}
        </pre>

        {/* Output */}
        {(output || tool.error) && (
          <>
            <div className={`px-3 py-1 text-xs font-medium uppercase tracking-wider border-t border-b border-gh-border/30 ${tool.error ? 'text-gh-attention/60' : 'text-gh-muted/50'}`}>
              {tool.error ? 'Error' : 'Output'}
            </div>
            <pre className={`px-3 py-2 overflow-x-auto font-mono text-xs whitespace-pre-wrap break-all ${tool.error ? 'text-gh-attention' : 'text-gh-muted'}`}>
              {tool.error ? `${tool.error.message} (${tool.error.code})` : output}
            </pre>
          </>
        )}
      </div>
    </details>
  );
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  if (message.role === 'task_complete') {
    return (
      <div className="flex gap-4">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1 bg-gh-active/20 text-gh-active">
          ✓
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="rounded-xl px-5 py-3 text-sm border border-gh-active/30 bg-gh-active/5 text-gh-text min-w-0">
            <div className="text-xs font-semibold text-gh-active mb-2 uppercase tracking-wide">Task complete</div>
            <div className="prose prose-invert prose-sm max-w-none text-gh-text
              [&_p]:my-2 [&_p]:leading-relaxed
              [&_h1]:text-gh-text [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2
              [&_h2]:text-gh-text [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1
              [&_h3]:text-gh-text [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
              [&_ul]:my-2 [&_ul]:pl-4 [&_li]:my-0.5 [&_li]:leading-relaxed
              [&_ol]:my-2 [&_ol]:pl-4
              [&_strong]:text-gh-text [&_strong]:font-semibold
              [&_code]:text-gh-accent [&_code]:bg-gh-bg [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
            ">
              <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
            </div>
          </div>
          <RelativeTime timestamp={message.timestamp} className="text-gh-muted text-xs" />
        </div>
      </div>
    );
  }

  if (isUser) {
    if (!message.content.trim()) return null;
    return (
      <div className="flex gap-3 flex-row-reverse">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 bg-gh-accent/20 text-gh-accent">
          U
        </div>
        <div className="flex flex-col gap-1 items-end max-w-[60%]">
          <div className="rounded-2xl px-4 py-2.5 text-sm bg-gh-accent/10 border border-gh-accent/20 text-gh-text">
            {message.content}
          </div>
          <RelativeTime timestamp={message.timestamp} className="text-gh-muted text-xs px-1" />
        </div>
      </div>
    );
  }

  // AI message — wide bubble
  return (
    <div className="flex gap-4">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1 bg-gh-active/20 text-gh-active">
        AI
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
      <div className="rounded-xl px-5 py-3 text-sm bg-gh-surface border border-gh-border text-gh-text min-w-0">
        {message.reasoning && <ReasoningBlock text={message.reasoning} />}
        {message.content.trim() ? (
          <div className="prose prose-invert prose-sm max-w-none text-gh-text
            [&_p]:my-2 [&_p]:leading-relaxed
            [&_h1]:text-gh-text [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2
            [&_h2]:text-gh-text [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1
            [&_h3]:text-gh-text [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
            [&_ul]:my-2 [&_ul]:pl-4 [&_li]:my-0.5 [&_li]:leading-relaxed
            [&_ol]:my-2 [&_ol]:pl-4
            [&_strong]:text-gh-text [&_strong]:font-semibold
            [&_a]:text-gh-accent [&_a]:no-underline hover:[&_a]:underline
            [&_hr]:border-gh-border [&_hr]:my-4
            [&_blockquote]:border-l-2 [&_blockquote]:border-gh-border [&_blockquote]:pl-3 [&_blockquote]:text-gh-muted
            [&_code]:text-gh-accent [&_code]:bg-gh-bg [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
            [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-sm
            [&_th]:text-left [&_th]:px-3 [&_th]:py-1.5 [&_th]:border [&_th]:border-gh-border [&_th]:bg-gh-surface [&_th]:text-gh-text [&_th]:font-medium
            [&_td]:px-3 [&_td]:py-1.5 [&_td]:border [&_td]:border-gh-border [&_td]:text-gh-muted
          ">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className ?? '');
                  const isBlock = !!match;
                  if (isBlock) {
                    return (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: '0.75rem 0',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          border: '1px solid #30363d',
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </Markdown>
          </div>
        ) : (
          message.toolRequests && message.toolRequests.length > 0 && (
            <span className="text-gh-muted text-xs italic mb-1 block">Using tools…</span>
          )
        )}

        {/* Tool calls */}
        {message.toolRequests && message.toolRequests.length > 0 && (
          <div className="space-y-1">
            {message.toolRequests.map((tool) =>
              tool.name === 'ask_user'
                ? <AskUserBlock key={tool.toolCallId} tool={tool} />
                : tool.name === 'report_intent'
                  ? <ReportIntentBlock key={tool.toolCallId} tool={tool} />
                  : tool.name === 'edit'
                    ? <EditBlock key={tool.toolCallId} tool={tool} />
                    : tool.name === 'bash'
                      ? <BashBlock key={tool.toolCallId} tool={tool} />
                      : (tool.name === 'task' || tool.name === 'task_complete' || tool.name === 'read_agent')
                        ? <TaskBlock key={tool.toolCallId} tool={tool} />
                        : tool.name.startsWith('mcp-atlassian-')
                          ? <AtlassianBlock key={tool.toolCallId} tool={tool} />
                          : tool.name.startsWith('figma-')
                            ? <FigmaBlock key={tool.toolCallId} tool={tool} />
                            : <ToolCallBlock key={tool.toolCallId} tool={tool} />
            )}
          </div>
        )}

        </div>
        <RelativeTime timestamp={message.timestamp} className="text-gh-muted text-xs" />
      </div>
    </div>
  );
}
