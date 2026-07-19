import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShield } from "react-icons/fi";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import SurveyCard from "@/features/survey/components/SurveyCard";
import { SURVEY_CATALOG } from "@/features/survey/mocks/surveyCatalog.mock";
import { getMockCompletion } from "@/features/survey/utils/surveyCompletionStore";
import { getMySurveyResponses } from "@/services/survey.service";

type SurveyTab = "AVAILABLE" | "COMPLETED" | "HISTORY";

const TABS: { key: SurveyTab; label: string }[] = [
  { key: "AVAILABLE", label: "Disponibles" },
  { key: "COMPLETED", label: "Completadas" },
  { key: "HISTORY", label: "Historial" },
];

interface CompletionEntry {
  surveyId: string;
  title: string;
  completedAt: string;
}

export default function SurveyCatalogList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SurveyTab>("AVAILABLE");
  const [realCompletedAt, setRealCompletedAt] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    getMySurveyResponses()
      .then((responses) => {
        if (isMounted) {
          setRealCompletedAt(responses.map((response) => response.submittedAt));
        }
      })
      .catch(() => {
        // Sin historial real disponible — se sigue mostrando el catálogo.
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const completions = useMemo<CompletionEntry[]>(() => {
    const entries: CompletionEntry[] = [];

    for (const survey of SURVEY_CATALOG) {
      if (survey.isMocked) {
        const record = getMockCompletion(survey.id);
        if (record) {
          entries.push({
            surveyId: survey.id,
            title: survey.title,
            completedAt: record.completedAt,
          });
        }
      } else {
        for (const submittedAt of realCompletedAt) {
          entries.push({ surveyId: survey.id, title: survey.title, completedAt: submittedAt });
        }
      }
    }

    return entries.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [realCompletedAt]);

  const completedSurveyIds = new Set(completions.map((entry) => entry.surveyId));

  const visibleSurveys =
    activeTab === "COMPLETED"
      ? SURVEY_CATALOG.filter((survey) => completedSurveyIds.has(survey.id))
      : SURVEY_CATALOG;

  return (
    <div className="space-y-6">
      <div>
        <Heading as="h3" className="text-gray-900">
          Encuestas
        </Heading>
        <Text variant="small" className="mt-2 text-gray-600">
          Participa en encuestas para ayudarnos a conocerte mejor y mejorar tu
          experiencia académica.
        </Text>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
            }}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "HISTORY" ? (
        <div className="space-y-3">
          {completions.length === 0 ? (
            <Text variant="small" className="text-gray-500">
              Todavía no completaste ninguna encuesta.
            </Text>
          ) : (
            completions.map((entry, index) => (
              <div
                key={`${entry.surveyId}-${index}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <Text variant="small" className="font-medium text-gray-800">
                  {entry.title}
                </Text>
                <Text variant="caption" className="text-gray-400">
                  {new Date(entry.completedAt).toLocaleString("es-EC", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </Text>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleSurveys.length === 0 ? (
            <Text variant="small" className="text-gray-500">
              No hay encuestas completadas todavía.
            </Text>
          ) : (
            visibleSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                isCompleted={completedSurveyIds.has(survey.id)}
                onStart={() => {
                  navigate(`/student/survey/${survey.id}`);
                }}
              />
            ))
          )}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <FiShield size={16} className="mt-0.5 shrink-0 text-blue-700" />
        <Text variant="caption" className="text-blue-800">
          Tu participación es confidencial y nos ayuda a ofrecerte un mejor
          acompañamiento.
        </Text>
      </div>
    </div>
  );
}
