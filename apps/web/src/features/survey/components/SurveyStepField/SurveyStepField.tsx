import Text from "@/components/atoms/Text";
import RatingScale from "@/components/molecules/RatingScale";

import type { SurveyStepField as SurveyStepFieldModel } from "@/features/survey/types";

export type StepAnswerValue = string | number | boolean | string[] | Record<string, string>;

interface SurveyStepFieldProps {
  field: SurveyStepFieldModel;
  value: StepAnswerValue | undefined;
  onChange: (value: StepAnswerValue) => void;
}

const radioOptionClassName =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm hover:bg-gray-50";

export default function SurveyStepField({ field, value, onChange }: SurveyStepFieldProps) {
  switch (field.type) {
    case "SINGLE_CHOICE":
      return (
        <div className="space-y-2">
          {(field.options ?? []).map((option) => (
            <label key={option} className={radioOptionClassName}>
              <input
                type="radio"
                name={field.id}
                checked={value === option}
                onChange={() => onChange(option)}
                className="h-4 w-4"
              />
              {option}
            </label>
          ))}
        </div>
      );

    case "MULTI_CHOICE": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-2">
          {(field.options ?? []).map((option) => (
            <label key={option} className={radioOptionClassName}>
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => {
                  onChange(
                    selected.includes(option)
                      ? selected.filter((item) => item !== option)
                      : [...selected, option]
                  );
                }}
                className="h-4 w-4"
              />
              {option}
            </label>
          ))}
        </div>
      );
    }

    case "SELECT":
      return (
        <select
          value={typeof value === "string" || typeof value === "number" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case "NUMBER":
      return (
        <input
          type="number"
          value={typeof value === "number" ? value : ""}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
        />
      );

    case "BOOLEAN":
      return (
        <div className="flex gap-3">
          {[
            { label: "Sí", val: true },
            { label: "No", val: false },
          ].map(({ label, val }) => (
            <label key={label} className={radioOptionClassName}>
              <input
                type="radio"
                name={field.id}
                checked={value === val}
                onChange={() => onChange(val)}
                className="h-4 w-4"
              />
              {label}
            </label>
          ))}
        </div>
      );

    case "MATRIX": {
      const rows = field.matrixRows ?? [];
      const columns = field.matrixColumns ?? [];
      const matrixValue =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as Record<string, string>)
          : {};

      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-separate border-spacing-y-1 text-sm">
            <thead>
              <tr>
                <th className="text-left font-medium text-gray-500" />
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-2 pb-2 text-center text-xs font-semibold text-gray-500"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row} className="rounded-xl bg-gray-50">
                  <td className="whitespace-nowrap rounded-l-xl px-3 py-3 text-gray-800">
                    {row}
                  </td>
                  {columns.map((column) => (
                    <td key={column} className="px-2 py-3 text-center">
                      <input
                        type="radio"
                        name={`${field.id}-${row}`}
                        checked={matrixValue[row] === column}
                        onChange={() => {
                          onChange({ ...matrixValue, [row]: column });
                        }}
                        className="h-4 w-4"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "SLIDER": {
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      const step = field.step ?? 1;
      const unit = field.unit ?? "";
      const currentValue =
        typeof value === "number" ? value : field.defaultValue ?? min;

      return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <Text variant="body" className="font-bold text-blue-700">
              {currentValue} {unit}
            </Text>
          </div>

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={(event) => onChange(Number(event.target.value))}
            className="mp-slider w-full"
          />

          <div className="mt-1 flex items-center justify-between">
            <Text variant="caption" className="text-gray-400">
              {min} {unit}
            </Text>
            <Text variant="caption" className="text-gray-400">
              {max} {unit}
            </Text>
          </div>
        </div>
      );
    }

    case "RATING":
      return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <RatingScale
            value={typeof value === "number" ? value : 3}
            onChange={(rating) => onChange(rating)}
          />
          <div className="mt-2 flex items-center justify-between">
            <Text variant="caption" className="text-gray-400">
              Muy bajo
            </Text>
            <Text variant="caption" className="text-gray-400">
              Muy alto
            </Text>
          </div>
        </div>
      );

    case "TEXT":
    default:
      return (
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
        />
      );
  }
}
