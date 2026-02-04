const BASE_URL = "http://127.0.0.1:8000";

export async function predictVoice(file, language) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${BASE_URL}/predict?language=${language}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Prediction failed");
  }

  return response.json();
}
