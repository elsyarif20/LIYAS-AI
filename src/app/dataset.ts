export interface DatasetItem {
  keywords: string[];
  response: string;
}

export const DATASET: DatasetItem[] = [
  {
    keywords: ["halo", "hai", "pagi", "siang", "sore", "malam"],
    response: "Halo! Ada yang bisa saya bantu hari ini?"
  },
  {
    keywords: ["siapa", "namamu", "namanya"],
    response: "Nama saya Jarvis Lite, asisten pribadi Anda."
  },
  {
    keywords: ["capek", "lelah", "pusing"],
    response: "Santai aja, pelan-pelan ya. Semua orang punya fase berat. Gas terus! 😄"
  },
  {
    keywords: ["cuaca", "hari ini"],
    response: "Saya tidak punya akses ke internet untuk cek cuaca sekarang, tapi semoga harimu cerah!"
  },
  {
    keywords: ["terima kasih", "makasih"],
    response: "Sama-sama! Senang bisa membantu."
  },
  {
    keywords: ["apa kabar", "kabarnya"],
    response: "Saya baik-baik saja, terima kasih sudah bertanya! Bagaimana dengan Anda?"
  }
];
