
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYjU1MzhiNC0wYjQyLTRmZDUtODRmMi1iZTlkODk5ODg5OWUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY3NjQ4OTA4LCJleHAiOjE3NzAxODEyMDB9.0JxpmNtj73pkVx5243BtxxuWuixKKlE7zETmC2VOaV4';
const BASE_URL = 'https://n8n.ftp-co.com/api/v1';

export const fetchWorkflows = async () => {
  try {
    const response = await fetch(`${BASE_URL}/workflows?limit=5`, {
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) throw new Error('خطا در دریافت لیست گردش‌کارها');
    return await response.json();
  } catch (error) {
    console.error(error);
    return { data: [] };
  }
};

export const triggerAction = async (action: string) => {
  // در اینجا می‌توان یک وب‌هوک خاص برای عملیات سروری تعریف کرد
  // فعلاً به عنوان شبیه‌سازی یک درخواست POST ارسال می‌کنیم
  console.log(`Triggering server action: ${action}`);
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1500));
};
