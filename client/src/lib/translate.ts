export async function translateToArabic(text: string): Promise<string> {
  if (!text || text.trim() === '') {
    return '';
  }

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`,
    );
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }

    return '';
  } catch (error) {
    console.error('Translation error:', error);
    return '';
  }
}
