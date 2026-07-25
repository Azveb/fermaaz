"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function AgronomistPage() {
  const [question, setQuestion] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!question && !imageFile) {
      setError("Sual yazın və ya şəkil yükləyin");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      let imageBase64, imageMimeType;
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
        imageMimeType = imageFile.type;
      }
      const data = await apiFetch("/api/ai/agronomist", {
        method: "POST",
        body: JSON.stringify({ question, imageBase64, imageMimeType }),
      });
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-1">🌱 AI Aqronom</h1>
      <p className="text-sm text-gray-500 mb-5">
        Bitki və ya heyvan sağlamlığı ilə bağlı sualınızı yazın, istəyə bağlı şəkil əlavə edin — AI dərhal analiz edəcək.
      </p>

      <form onSubmit={handleSubmit} className="card p-5 space-y-3">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}
        <textarea
          rows={3}
          placeholder='Məsələn: "Pomidor yarpağı saralır"'
          className="input-field"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <label className="block">
          <span className="text-sm font-medium text-gray-600">Şəkil (istəyə bağlı)</span>
          <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm mt-1" />
        </label>
        {imagePreview && <img src={imagePreview} alt="preview" className="w-full max-h-52 object-contain rounded-xl" />}
        <button disabled={loading} className="btn-primary w-full">{loading ? "Analiz edilir..." : "AI Analiz Et"}</button>
      </form>

      {result && (
        <div className="card p-5 mt-5 space-y-3">
          {result.diagnosis && (
            <div>
              <h2 className="font-bold text-lg">{result.diagnosis}</h2>
              {typeof result.confidencePercent === "number" && (
                <p className="text-xs text-gray-500">Ehtimal: {result.confidencePercent}%</p>
              )}
            </div>
          )}
          {result.summary && <p className="text-gray-700 text-sm">{result.summary}</p>}
          {result.causes?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm">Səbəblər</h3>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {result.causes.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
          {result.treatment?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm">Tövsiyə olunan addımlar</h3>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {result.treatment.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
          {result.recommendedProducts?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm">Tövsiyə olunan məhsullar</h3>
              <p className="text-sm text-gray-600">{result.recommendedProducts.join(", ")}</p>
            </div>
          )}
          {result.needsExpertConsult && (
            <div className="bg-amber-50 rounded-xl p-3 flex items-center justify-between gap-3">
              <p className="text-sm text-amber-800">Real aqronom konsultasiyası tövsiyə olunur.</p>
              <WhatsAppButton message="Salam, AI Aqronomdan bitki xəstəliyi ilə bağlı sizinlə əlaqə saxlamaq istəyirəm." />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
