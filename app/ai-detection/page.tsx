"use client";

import { useMemo, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  HeartPulse,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Thermometer,
  Wind,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Result = {
  status?: string;
  reply?: string;
  condition?: string | null;
  ml_prediction?: string | null;
  confidence?: number;
  assessment_status?: string;
  active_features?: string[];
  top_predictions?: {
    disease: string;
    confidence: number;
  }[];
  follow_up_questions?: string[];
  risk?: {
    risk_score?: number;
    risk_level?: string;
    high_risk_symptoms?: string[];
  };
  emergency?: {
    emergency?: boolean;
    severity?: string;
    matched_rules?: string[];
    message?: string;
  };
  edge_ai?: boolean;
  rag_used?: boolean;
};

const symptomOptions = [
  ["fever", "Fever", Thermometer],
  ["cough", "Cough", Activity],
  ["headache", "Headache", Brain],
  ["fatigue", "Fatigue", HeartPulse],
  ["body_ache", "Body ache", Activity],
  ["breathing_difficulty", "Breathing difficulty", Wind],
  ["nausea", "Nausea", Activity],
  ["sore_throat", "Sore throat", Stethoscope],
  ["runny_nose", "Runny nose", Wind],
  ["sneezing", "Sneezing", Activity],
  ["vomiting", "Vomiting", Activity],
  ["dizziness", "Dizziness", Activity],
  ["chest_pain", "Chest pain", HeartPulse],
] as const;

function label(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function score(value = 0) {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

function statusTitle(result: Result) {
  if (result.assessment_status === "high_confidence") {
    return result.condition
      ? "Preliminary assessment available"
      : "Assessment available";
  }

  if (result.assessment_status === "moderate_confidence") {
    return "Preliminary assessment";
  }

  return "More information needed";
}

function statusDescription(result: Result) {
  if (result.assessment_status === "high_confidence") {
    return "The structured AI pipeline found enough information to provide a preliminary assessment.";
  }

  if (result.assessment_status === "moderate_confidence") {
    return "The AI found a possible pattern, but a little more information can improve the assessment.";
  }

  return "We identified some symptoms, but need another detail before giving a more specific assessment.";
}

function normalizeResult(data: any): Result {
  return {
    ...data,
    confidence: Number(data?.confidence || 0),
    active_features: Array.isArray(data?.active_features)
      ? data.active_features
      : [],
    top_predictions: Array.isArray(data?.top_predictions)
      ? data.top_predictions
      : [],
    follow_up_questions: Array.isArray(data?.follow_up_questions)
      ? data.follow_up_questions
      : [],
    risk: data?.risk || {
      risk_level: "LOW",
      risk_score: 0,
      high_risk_symptoms: [],
    },
    emergency: data?.emergency || {
      emergency: false,
      severity: "NORMAL",
      matched_rules: [],
      message: "",
    },
  };
}

export default function AIDetectionPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAI, setShowAI] = useState(false);

  const selectedLabels = useMemo(
    () =>
      symptomOptions
        .filter(([id]) => selected.includes(id))
        .map(([, name]) => name),
    [selected]
  );

  function toggleSymptom(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    );
  }

  async function analyze() {
    if (!selected.length) {
      setError("Please select at least one symptom.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const query = [
      `Symptoms: ${selectedLabels.join(", ")}.`,
      details.trim()
        ? `Additional context: ${details.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    try {
      console.log("AI CHIKITSALYA REQUEST", {
        url: `${API_URL}/predict`,
        query,
      });

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          lang: "en",
        }),
      });

      const text = await response.text();

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("The AI service returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : data?.message || `Prediction failed (${response.status}).`
        );
      }

      const normalized = normalizeResult(data);

      console.log(
        "AI CHIKITSALYA RESPONSE",
        JSON.stringify(normalized, null, 2)
      );

      setResult(normalized);
    } catch (err) {
      console.error("Medical AI request failed:", err);

      if (err instanceof TypeError) {
        setError(
          `AI model service is unavailable. Make sure the Python API is running at ${API_URL}.`
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to reach the AI service."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSelected([]);
    setDetails("");
    setResult(null);
    setError("");
    setShowAI(false);
  }

  const risk = result?.risk?.risk_level || "LOW";
  const emergency = Boolean(result?.emergency?.emergency);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        {!result ? (
          <>
            <section className="mb-8 rounded-3xl border bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI-assisted health screening
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                    Understand your symptoms
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                    Tell us what you are experiencing. AI Chikitsalya
                    performs an initial symptom and safety assessment to
                    help you decide what information to consider next.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Privacy-first
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Step 1
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    What are you experiencing?
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Select everything that applies.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {symptomOptions.map(([id, name, Icon]) => {
                    const active = selected.includes(id);

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleSymptom(id)}
                        className={`rounded-2xl border p-4 text-left transition ${active
                            ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="mt-3 block text-sm font-semibold">
                          {name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-7">
                  <label className="text-sm font-semibold text-slate-900">
                    Tell us more{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="For example: symptoms started 2 days ago, fever is around 101°F..."
                    className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {error && (
                  <div className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={reset}
                    disabled={loading}
                  >
                    Clear
                  </Button>

                  <Button
                    size="lg"
                    onClick={analyze}
                    disabled={loading || !selected.length}
                    className="rounded-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assessing symptoms...
                      </>
                    ) : (
                      <>
                        Start assessment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <div className="space-y-5">
                <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900">
                    How it works
                  </h3>

                  <div className="mt-5 space-y-5">
                    {[
                      [
                        "Symptoms",
                        "Your symptoms are converted into structured features.",
                      ],
                      [
                        "Safety",
                        "The system checks for emergency warning signs.",
                      ],
                      [
                        "Assessment",
                        "The model ranks possible patterns.",
                      ],
                    ].map(([title, text], index) => (
                      <div key={title} className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="rounded-3xl border-amber-200 bg-amber-50 p-5">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                    <p className="text-xs leading-5 text-amber-900">
                      This tool provides health information and decision
                      support. It is not a diagnosis and should not replace
                      professional medical care.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Safety status */}
            <Card
              className={`mb-6 rounded-3xl p-5 shadow-sm ${emergency
                  ? "border-red-300 bg-red-50"
                  : "border-emerald-200 bg-emerald-50"
                }`}
            >
              <div className="flex gap-3">
                {emergency ? (
                  <AlertTriangle className="h-6 w-6 shrink-0 text-red-600" />
                ) : (
                  <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-600" />
                )}

                <div>
                  <p
                    className={`font-bold ${emergency ? "text-red-900" : "text-emerald-900"
                      }`}
                  >
                    {emergency
                      ? "Urgent attention may be required"
                      : `Risk level: ${label(risk)}`}
                  </p>

                  <p
                    className={`mt-1 text-sm ${emergency ? "text-red-800" : "text-emerald-800"
                      }`}
                  >
                    {emergency
                      ? result.emergency?.message ||
                      "Potential emergency warning signs were detected."
                      : "No emergency red flags were detected by the initial safety screen."}
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <div className="space-y-6">
                {/* Main assessment */}
                <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
                  <div className="bg-blue-700 px-6 py-7 text-white md:px-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                      Preliminary assessment
                    </p>

                    <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">
                          {statusTitle(result)}
                        </h1>

                        {(() => {
                          const leadingPrediction =
                            result.top_predictions?.[0];

                          const leadingDisease =
                            leadingPrediction?.disease ||
                            result.condition;

                          const leadingConfidence =
                            leadingPrediction?.confidence ??
                            result.confidence ??
                            0;

                          return leadingDisease ? (
                            <div className="mt-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                                Most likely condition
                              </p>

                              <p className="mt-1 text-xl font-bold text-white md:text-2xl">
                                {leadingDisease}
                              </p>

                              <p className="mt-1 text-sm text-blue-100">
                                Highest model ranking:{" "}
                                {score(leadingConfidence)}%
                              </p>
                            </div>
                          ) : null;
                        })()}
                      </div>

                      <div className="w-fit rounded-2xl bg-white/10 px-4 py-3">
                        <p className="text-[11px] text-blue-100">
                          Highest ranking
                        </p>
                        <p className="text-2xl font-bold">
                          {score(
                            result.top_predictions?.[0]?.confidence ??
                            result.confidence
                          )}%
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 max-w-3xl text-sm leading-6 text-blue-50">
                      {statusDescription(result)}
                    </p>
                  </div>

                  <div className="p-6 md:p-8">
                    {/* Symptoms */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Symptoms detected
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(result.active_features || []).length ? (
                          result.active_features!.map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            >
                              {label(item)}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">
                            No symptoms were confidently recognized.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Next question */}
                    {(result.follow_up_questions || []).length > 0 && (
                      <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-5 md:p-6">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-white p-2 text-blue-600 shadow-sm">
                            <Stethoscope className="h-5 w-5" />
                          </div>

                          <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                              Next question
                            </p>

                            <h2 className="mt-1 text-lg font-bold text-slate-900">
                              {result.follow_up_questions![0]}
                            </h2>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              Answering this can help improve the assessment.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-400"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-400"
                              >
                                No
                              </button>
                              <button
                                type="button"
                                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-400"
                              >
                                Not sure
                              </button>
                            </div>
                          </div>
                        </div>

                        {result.follow_up_questions!.length > 1 && (
                          <div className="mt-5 border-t border-blue-100 pt-4">
                            <p className="text-xs font-semibold text-slate-500">
                              More questions
                            </p>

                            <div className="mt-2 space-y-2">
                              {result.follow_up_questions!
                                .slice(1)
                                .map((question, index) => (
                                  <div
                                    key={`${question}-${index}`}
                                    className="rounded-xl bg-white/70 p-3 text-sm text-slate-700"
                                  >
                                    {index + 2}. {question}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI explanation */}
                    {result.reply && (
                      <div className="mt-8">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-blue-600" />
                          <h2 className="font-bold text-slate-900">
                            AI guidance
                          </h2>
                        </div>

                        <div className="mt-3 rounded-2xl border bg-slate-50 p-5">
                          <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                            {result.reply}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <div className="mt-7 flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
                      <p className="text-xs leading-5 text-slate-500">
                        AI Chikitsalya provides health information and
                        decision support. It does not replace a qualified
                        medical professional.
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={reset}
                    className="rounded-xl"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    New assessment
                  </Button>

                  <Button
                    onClick={() =>
                      (window.location.href = "/doctors")
                    }
                    className="rounded-xl"
                  >
                    Talk to a doctor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Right column */}
              <aside className="space-y-5">
                <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setShowAI((v) => !v)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Technical view
                      </p>
                      <h3 className="mt-1 font-bold text-slate-900">
                        AI assessment details
                      </h3>
                    </div>

                    {showAI ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </button>

                  {showAI && (
                    <div className="mt-5 space-y-3 border-t pt-5">
                      {[
                        [
                          "Symptom analysis",
                          true,
                        ],
                        [
                          "Safety screening",
                          true,
                        ],
                        [
                          "Edge AI",
                          result.edge_ai,
                        ],
                        [
                          "Medical knowledge",
                          result.rag_used,
                        ],
                      ].map(([name, enabled]) => (
                        <div
                          key={String(name)}
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                        >
                          <span className="text-sm text-slate-700">
                            {name}
                          </span>

                          {enabled ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <span className="text-xs text-slate-400">
                              Not used
                            </span>
                          )}
                        </div>
                      ))}

                      <div className="border-t pt-4">
                        <p className="text-xs font-semibold text-slate-400">
                          MODEL SCORE
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                          {score(result.confidence)}%
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Ranking confidence from the structured AI pipeline,
                          not the probability of a medical condition.
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

                {result.top_predictions &&
                  result.top_predictions.length > 0 && (
                    <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        For transparency
                      </p>

                      <h3 className="mt-1 font-bold text-slate-900">
                        Other possible patterns
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        These are internal model rankings, not diagnoses.
                      </p>

                      <div className="mt-5 space-y-4">
                        {result.top_predictions.slice(1, 4).map((item) => (
                          <div key={item.disease}>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-700">
                                {item.disease}
                              </span>
                              <span className="font-semibold text-slate-900">
                                {score(item.confidence)}%
                              </span>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{
                                  width: `${score(item.confidence)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900">
                      Your next step
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    If symptoms persist, worsen, or concern you, consider
                    speaking with a qualified healthcare professional.
                  </p>

                  <Button
                    variant="outline"
                    className="mt-4 w-full rounded-xl"
                    onClick={() =>
                      (window.location.href = "/doctors")
                    }
                  >
                    Find a doctor
                  </Button>
                </Card>
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}