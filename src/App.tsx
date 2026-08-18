import { useState } from "react";
import { Shell } from "./components/Shell";
import { UsageNoticeDialog } from "./components/UsageNoticeDialog";
import { CastingPage } from "./pages/CastingPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { QuestionPage } from "./pages/QuestionPage";
import { ResultPage } from "./pages/ResultPage";
import { RevealPage } from "./pages/RevealPage";
import { SamplePreviewPage } from "./pages/SamplePreviewPage";
import type { HistoryEntry, InsightResult, LineRecord, PageKey } from "./types";
import { buildInsightResult, createCoinRound, getBaseLines, getChangedLines } from "./utils/insight";
import { clearHistoryEntries, deleteHistoryEntry, loadHistory, saveHistoryEntry } from "./utils/storage";

const NOTICE_STORAGE_KEY = "yiding-sixty-four-symbols-notice-v1";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>("home");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("事业选择");
  const [lines, setLines] = useState<LineRecord[]>([]);
  const [result, setResult] = useState<InsightResult | undefined>();
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [saved, setSaved] = useState(false);
  const [noticeAccepted, setNoticeAccepted] = useState(() => {
    try {
      return localStorage.getItem(NOTICE_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [noticeOpen, setNoticeOpen] = useState(false);

  const acceptNotice = () => {
    try {
      localStorage.setItem(NOTICE_STORAGE_KEY, "1");
    } catch {
      // Ignore storage failures; the current session can still continue.
    }
    setNoticeAccepted(true);
    setNoticeOpen(false);
  };

  const resetFlow = () => {
    setLines([]);
    setResult(undefined);
    setSaved(false);
  };

  const navigate = (page: PageKey) => {
    if (page === "question") {
      resetFlow();
    }
    setCurrentPage(page);
  };

  const startInsight = () => {
    resetFlow();
    setCurrentPage("casting");
  };

  const createLine = () => {
    setLines((previous) => {
      if (previous.length >= 6) {
        return previous;
      }
      const next = [...previous, createCoinRound(previous.length + 1)];
      if (next.length === 6) {
        setResult(buildInsightResult(next));
      }
      return next;
    });
  };

  const saveEntry = (insightResult: InsightResult) => {
    if (lines.length !== 6 || saved) {
      return;
    }
    const sums = lines.map((line) => line.total);
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      question,
      category,
      createdAt: new Date().toISOString(),
      rounds: lines,
      sums,
      baseLines: getBaseLines(sums),
      changedLines: getChangedLines(sums),
      movingLines: insightResult.hexagramResult.movingLines,
      baseHexagramName: insightResult.hexagramResult.baseHexagramName,
      changedHexagramName: insightResult.hexagramResult.changedHexagramName,
      summary: insightResult.summary,
      result: insightResult,
    };
    setHistory(saveHistoryEntry(entry));
    setSaved(true);
  };

  const revealResult = () => {
    if (lines.length !== 6) {
      return;
    }

    const insightResult = result ?? buildInsightResult(lines);
    if (!result) {
      setResult(insightResult);
    }
    saveEntry(insightResult);
    setCurrentPage("reveal");
  };

  const saveCurrentEntry = () => {
    if (result) {
      saveEntry(result);
    }
  };

  const deleteEntry = (id: string) => {
    setHistory(deleteHistoryEntry(id));
  };

  const clearEntries = () => {
    setHistory(clearHistoryEntries());
  };

  const viewHistoryEntry = (entry: HistoryEntry) => {
    setQuestion(entry.question);
    setCategory(entry.category);
    setLines(entry.rounds);
    setResult(entry.result);
    setSaved(true);
    setCurrentPage("result");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "question":
        return (
          <QuestionPage
            category={category}
            onCategoryChange={setCategory}
            onQuestionChange={setQuestion}
            onStart={startInsight}
            onOpenNotice={() => setNoticeOpen(true)}
            question={question}
          />
        );
      case "casting":
        return <CastingPage lines={lines} onCreateLine={createLine} onReveal={revealResult} />;
      case "reveal":
        return <RevealPage lines={lines} onContinue={() => setCurrentPage("result")} result={result} />;
      case "result":
        return (
          <ResultPage
            lines={lines}
            onNavigate={navigate}
            onSave={saveCurrentEntry}
            question={question}
            result={result}
            saved={saved}
          />
        );
      case "history":
        return <HistoryPage entries={history} onClear={clearEntries} onDelete={deleteEntry} onNavigate={navigate} onView={viewHistoryEntry} />;
      case "preview":
        return <SamplePreviewPage onNavigate={navigate} />;
      case "home":
      default:
        return <HomePage onNavigate={navigate} onOpenNotice={() => setNoticeOpen(true)} />;
    }
  };

  return (
    <>
      <Shell currentPage={currentPage} onNavigate={navigate} onOpenNotice={() => setNoticeOpen(true)}>
        {renderPage()}
      </Shell>
      {!noticeAccepted ? <UsageNoticeDialog initial onAccept={acceptNotice} onClose={() => setNoticeOpen(false)} /> : null}
      {noticeAccepted && noticeOpen ? <UsageNoticeDialog initial={false} onAccept={acceptNotice} onClose={() => setNoticeOpen(false)} /> : null}
    </>
  );
}
